//
// source_gdi.cpp — Livello 2 (UNIVERSALE), sorgente GDI. ⭐ Il pezzo innovativo.
//
// Aggancia ExtTextOutW / DrawTextW / TextOutW in gdi32.dll. Moltissimi engine
// diversi (vecchi, custom, middleware, alcuni RPG Maker, tool, emulatori) e gran
// parte della UI Win32 passano da qui SENZA saperlo: un solo hook → tanti giochi.
//
// IL PROBLEMA DURO (e il senso dello spike): il testo spesso NON arriva come
// frase intera. Arriva a pezzi — parola per parola, a volte glifo per glifo —
// con chiamate ravvicinate nello spazio (stesso DC, X crescente, stessa Y).
// Per tradurre la FRASE e non la lettera serve un COALESCER: bufferizza i
// frammenti contigui, e quando la riga è "chiusa" (cambio Y, gap temporale,
// flush forzato) traduce l'intera stringa ricostruita.
//
// Questo file è lo SCHELETRO del coalescer: la struttura c'è, gli euristici di
// chiusura riga sono i parametri da tarare nello spike. È volutamente
// conservativo (di default NON sostituisce, solo logga le frasi ricostruite),
// così il primo test è SICURO: serve a rispondere "il coalescer ricostruisce
// frasi pulite da un gioco reale?". Se sì → idea #1 confermata.
//
#include "text_source.h"
#include "gs_log.h"
#include <Windows.h>
#include <MinHook.h>
#include <string>
#include <vector>
#include <mutex>
#include <chrono>
#include <cwctype>

namespace gs {
namespace {

TranslateFn g_translate = nullptr;

// Guardia di rientranza: DrawTextW (user32) rende il testo chiamando ExtTextOutW
// UNA VOLTA PER RIGA VISIVA del word-wrap. Senza questa guardia, il contenuto di
// DrawText verrebbe catturato due volte: intero dal hook DrawTextW e a pezzi
// (spezzato per riga) dal hook ExtTextOutW. Mentre siamo dentro DrawTextW
// ignoriamo le ExtTextOutW interne. È thread_local perché DrawText rende in modo
// sincrono sul thread chiamante.
thread_local int g_inDrawText = 0;

// ─── Coalescer di frammenti di testo ─────────────────────────────────────────
// Bufferizza i frammenti che sembrano appartenere alla stessa riga logica.
class LineCoalescer {
public:
    // Aggiunge un frammento disegnato a (x, y) con un certo handle DC.
    // Ritorna true se questo frammento ha "chiuso" la riga precedente (cioè
    // prima di accodarlo abbiamo riconosciuto la fine di una frase): in tal
    // caso `flushed` contiene la frase completa appena chiusa.
    bool Add(HDC dc, int x, int y, const std::wstring& fragment, std::wstring& flushed) {
        std::lock_guard<std::mutex> lock(m_mutex);
        const auto now = Clock::now();

        bool closedPrev = false;
        if (!m_buf.empty()) {
            const long ageMs =
                (long)std::chrono::duration_cast<std::chrono::milliseconds>(now - m_lastTime).count();
            const bool tooOld = ageMs > kMaxGapMs;
            const bool sameDc = (dc == m_dc);

            // (a) stessa riga: frammento che continua orizzontalmente a destra.
            const bool sameLine =
                sameDc &&
                std::abs(y - m_y) <= kYTolerancePx &&            // stessa altezza
                x >= m_lastRight - kXOverlapPx &&                 // continua a destra
                x <= m_lastRight + kXGapPx;                       // senza salti grandi

            // (b) riga successiva dello STESSO paragrafo: il word-wrap manda la riga
            //     dopo a Y maggiore di ~una riga, ripartendo dallo stesso margine
            //     sinistro. La uniamo con uno spazio invece di chiudere la frase.
            const int dy = y - m_y;
            const bool nextLineSameParagraph =
                kMergeWrappedLines && sameDc && !tooOld &&
                dy > kYTolerancePx &&
                dy <= kLineHeightMaxPx &&
                std::abs(x - m_startX) <= kXLeftMarginTolPx;

            if (sameLine && !tooOld) {
                m_buf += fragment;                                // continua la riga
                m_lastRight = x + EstimateWidthPx(dc, fragment);
                m_lastTime  = now;
                return false;
            }
            if (nextLineSameParagraph) {
                if (!m_buf.empty() && m_buf.back() != L' ') m_buf += L' ';
                m_buf += fragment;                                // unisci riga wrappata
                m_y = y; m_startX = x;
                m_lastRight = x + EstimateWidthPx(dc, fragment);
                m_lastTime  = now;
                return false;
            }

            // Altrimenti: la frase precedente è chiusa.
            flushed = TakeBuffer();
            closedPrev = !flushed.empty();
        }

        // Nuova frase (buffer vuoto o appena flushato).
        m_dc = dc; m_y = y; m_startX = x;
        m_buf += fragment;
        m_lastRight = x + EstimateWidthPx(dc, fragment);
        m_lastTime  = now;
        return closedPrev;
    }

    // Forza la chiusura della riga corrente (es. a fine frame / EndPaint).
    std::wstring Flush() {
        std::lock_guard<std::mutex> lock(m_mutex);
        return TakeBuffer();
    }

private:
    using Clock = std::chrono::steady_clock;

    // Parametri da TARARE nello spike (sono il cuore dell'esperimento):
    static constexpr int  kYTolerancePx     = 3;    // glifi sulla stessa riga
    static constexpr int  kXOverlapPx       = 4;    // tolleranza kerning/overlap
    static constexpr int  kXGapPx           = 24;   // gap max prima di "nuova parola/colonna"
    static constexpr long kMaxGapMs         = 80;   // gap temporale → riga diversa
    // Merge verticale (righe wrappate dello stesso paragrafo):
    static constexpr bool kMergeWrappedLines = true; // unisci righe wrappate in 1 frase
    static constexpr int  kLineHeightMaxPx   = 28;   // dy max tra riga e riga successiva
    static constexpr int  kXLeftMarginTolPx  = 12;   // la riga dopo riparte ~stesso margine X

    std::wstring TakeBuffer() {
        std::wstring out;
        out.swap(m_buf);
        m_lastRight = 0;
        // trim spazi multipli ridondanti
        return out;
    }

    int EstimateWidthPx(HDC dc, const std::wstring& s) {
        SIZE sz{0, 0};
        if (dc && GetTextExtentPoint32W(dc, s.c_str(), (int)s.size(), &sz)) return sz.cx;
        return (int)s.size() * 8; // fallback grossolano
    }

    std::mutex   m_mutex;
    std::wstring m_buf;
    HDC          m_dc        = nullptr;
    int          m_y         = 0;
    int          m_startX    = 0;
    int          m_lastRight = 0;
    Clock::time_point m_lastTime{};
};

LineCoalescer g_coalescer;

// MODALITÀ:
//   true  → log-only: NON sostituisce, logga solo le frasi ricostruite
//           (l'esperimento sicuro iniziale, usato per tarare il coalescer).
//   false → SOSTITUZIONE REALE: traduce e ridisegna in-place (più log delle
//           sostituzioni effettuate, così il comportamento resta osservabile).
// Validato il coalescer, siamo passati a false.
constexpr bool kSpikeLogOnly = false;

// Euristica: vale la pena tradurre questa stringa? Evita di mandare al
// translator singoli glifi, numeri puri o punteggiatura (che il word-render
// emette spessissimo). Richiede ≥2 caratteri e almeno una lettera.
bool LooksSubstitutable(const std::wstring& s) {
    if (s.size() < 2) return false;
    for (wchar_t c : s) {
        if (iswalpha(c)) return true;
    }
    return false;
}

// Path di sola DIAGNOSTICA (coalescer): ricostruisce la frase dai frammenti e
// la logga. In modalità sostituzione la riscrittura in-place avviene per-chiamata
// negli hook (caso "stringa intera per chiamata"); qui restano i casi
// FRAMMENTATI (glifo-per-glifo) che non possiamo ancora riscrivere in-place
// perché i glifi originali sono già stati disegnati nelle singole ExtTextOutW.
// TODO: suppress-and-redraw per il caso glifo-per-glifo.
void OnFragment(HDC dc, int x, int y, const std::wstring& fragment) {
    if (fragment.empty()) return;
    std::wstring closedLine;
    if (g_coalescer.Add(dc, x, y, fragment, closedLine) && !closedLine.empty()) {
        if (kSpikeLogOnly) {
            LogLineW(L"[gs-hook/GDI] FRASE: " + closedLine + L"\n");
        } else if (g_translate) {
            std::wstring t = g_translate(closedLine);
            if (!t.empty() && t != closedLine) {
                LogLineW(L"[gs-hook/GDI] (frammentata, non sostituita) " +
                         closedLine + L" -> " + t + L"\n");
            }
        }
    }
}

// ─── Hook su ExtTextOutW ─────────────────────────────────────────────────────
using ExtTextOutW_t = BOOL (WINAPI*)(HDC, int, int, UINT, const RECT*,
                                     LPCWSTR, UINT, const INT*);
ExtTextOutW_t Original_ExtTextOutW = nullptr;

BOOL WINAPI Hook_ExtTextOutW(HDC hdc, int x, int y, UINT options, const RECT* rect,
                             LPCWSTR str, UINT count, const INT* dx) {
    // ETO_GLYPH_INDEX: `str` contiene indici di glifo, NON caratteri → non toccare.
    if (str && count > 0 && g_inDrawText == 0 && !(options & ETO_GLYPH_INDEX)) {
        std::wstring s(str, count);

        // Sostituzione per-chiamata: caso "stringa intera per chiamata".
        if (!kSpikeLogOnly && g_translate && LooksSubstitutable(s)) {
            std::wstring t = g_translate(s);
            if (!t.empty() && t != s) {
                LogLineW(L"[gs-hook/GDI] SUBST(ExtTextOut): " + s + L" -> " + t + L"\n");
                // L'array `dx` (avanzamenti per-glifo) vale per la stringa
                // ORIGINALE: con un testo di lunghezza diversa non è più valido
                // → passiamo nullptr (e togliamo ETO_PDY, che lo presuppone).
                return Original_ExtTextOutW(hdc, x, y, options & ~ETO_PDY, rect,
                                            t.c_str(), (UINT)t.size(), nullptr);
            }
        }

        // Altrimenti: diagnostica/coalescer (log-only o frammenti non sostituibili).
        OnFragment(hdc, x, y, s);
    }
    return Original_ExtTextOutW(hdc, x, y, options, rect, str, count, dx);
}

// ─── Hook su DrawTextW (di solito frasi/paragrafi interi, più facile) ────────
using DrawTextW_t = int (WINAPI*)(HDC, LPCWSTR, int, LPRECT, UINT);
DrawTextW_t Original_DrawTextW = nullptr;

int WINAPI Hook_DrawTextW(HDC hdc, LPCWSTR str, int count, LPRECT rect, UINT format) {
    if (str) {
        int len = (count < 0) ? (int)wcslen(str) : count;
        if (len > 0) {
            // DrawText passa di solito una frase/paragrafo intero → caso ideale.
            std::wstring whole(str, len);
            if (kSpikeLogOnly) {
                LogLineW(L"[gs-hook/GDI] DRAWTEXT: " + whole + L"\n");
            } else if (g_translate && LooksSubstitutable(whole)) {
                std::wstring t = g_translate(whole);
                if (!t.empty() && t != whole) {
                    LogLineW(L"[gs-hook/GDI] SUBST(DrawText): " + whole + L" -> " + t + L"\n");
                    // Disegna il testo TRADOTTO. `g_translate` è deterministico,
                    // quindi anche l'eventuale chiamata con DT_CALCRECT (misura)
                    // riceve la stessa stringa → layout coerente col disegno.
                    // La guardia sopprime le ExtTextOutW interne del word-wrap,
                    // evitando che il nostro hook ritraduca il già-tradotto.
                    ++g_inDrawText;
                    int r = Original_DrawTextW(hdc, t.c_str(), (int)t.size(), rect, format);
                    --g_inDrawText;
                    return r;
                }
            }
        }
    }
    // Guardia: sopprime le ExtTextOutW interne generate dal word-wrap di DrawText.
    ++g_inDrawText;
    int result = Original_DrawTextW(hdc, str, count, rect, format);
    --g_inDrawText;
    return result;
}

class GdiSource : public ITextSource {
public:
    const char* Name() const override { return "GDI (ExtTextOutW/DrawTextW)"; }
    Level GetLevel() const override { return Level::Rasterization; }

    bool IsApplicable() const override {
        return GetModuleHandleA("gdi32.dll") != nullptr; // praticamente sempre
    }

    Activation Activate(TranslateFn translate) override {
        HMODULE gdi = GetModuleHandleA("gdi32.dll");
        if (!gdi) return Activation::NotApplicable;
        g_translate = translate;

        auto pExt  = GetProcAddress(gdi, "ExtTextOutW");
        auto pDraw = GetProcAddress(GetModuleHandleA("user32.dll"), "DrawTextW");

        bool any = false;
        if (pExt &&
            MH_CreateHook((LPVOID)pExt, (LPVOID)&Hook_ExtTextOutW,
                          (LPVOID*)&Original_ExtTextOutW) == MH_OK &&
            MH_EnableHook((LPVOID)pExt) == MH_OK) {
            any = true;
        }
        if (pDraw &&
            MH_CreateHook((LPVOID)pDraw, (LPVOID)&Hook_DrawTextW,
                          (LPVOID*)&Original_DrawTextW) == MH_OK &&
            MH_EnableHook((LPVOID)pDraw) == MH_OK) {
            any = true;
        }
        return any ? Activation::Activated : Activation::Failed;
    }

    void Deactivate() override {
        if (Original_ExtTextOutW) MH_DisableHook((LPVOID)Original_ExtTextOutW);
        if (Original_DrawTextW)   MH_DisableHook((LPVOID)Original_DrawTextW);
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::GdiSource);
