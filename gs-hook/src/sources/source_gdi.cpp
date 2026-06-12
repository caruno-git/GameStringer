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

// ─── Contesto di disegno catturato per ridisegnare la riga tradotta ──────────
// Nel caso GLIFO-PER-GLIFO non possiamo sostituire al volo: i glifi originali
// verrebbero disegnati prima di conoscere la frase. Soluzione: SOPPRIMIAMO i
// glifi (non chiamiamo l'Original), e quando la riga si chiude RIDISEGNIAMO una
// sola volta la stringa tradotta nel punto del primo glifo, ripristinando
// font/colori/allineamento catturati allora.
struct DrawCtx {
    HDC      dc        = nullptr;
    int      x         = 0;
    int      y         = 0;
    UINT     options   = 0;
    HFONT    font      = nullptr;
    COLORREF textColor = 0;
    COLORREF bkColor   = 0;
    int      bkMode    = 0;
    UINT     align     = 0;
};

// ─── Coalescer di frammenti di testo ─────────────────────────────────────────
// Bufferizza i frammenti che sembrano appartenere alla stessa riga logica.
class LineCoalescer {
public:
    // Aggiunge un frammento col suo contesto di disegno. Ritorna true se questo
    // frammento ha "chiuso" la riga precedente: in tal caso `closedText` contiene
    // la frase completa e `closedCtx` il contesto del PRIMO glifo di quella riga
    // (dc/x/y/font/colori), per poterla ridisegnare tradotta nel punto giusto.
    bool Add(const DrawCtx& ctx, const std::wstring& fragment,
             std::wstring& closedText, DrawCtx& closedCtx) {
        std::lock_guard<std::mutex> lock(m_mutex);
        const auto now = Clock::now();

        bool closedPrev = false;
        if (!m_buf.empty()) {
            const long ageMs =
                (long)std::chrono::duration_cast<std::chrono::milliseconds>(now - m_lastTime).count();
            const bool tooOld = ageMs > kMaxGapMs;
            const bool sameDc = (ctx.dc == m_ctx.dc);

            // (a) stessa riga: frammento che continua orizzontalmente a destra.
            const bool sameLine =
                sameDc &&
                std::abs(ctx.y - m_ctx.y) <= kYTolerancePx &&     // stessa altezza
                ctx.x >= m_lastRight - kXOverlapPx &&              // continua a destra
                ctx.x <= m_lastRight + kXGapPx;                    // senza salti grandi

            // (b) riga successiva dello STESSO paragrafo (word-wrap): Y maggiore di
            //     ~una riga, riparte dallo stesso margine sinistro → unisci.
            const int dy = ctx.y - m_ctx.y;
            const bool nextLineSameParagraph =
                kMergeWrappedLines && sameDc && !tooOld &&
                dy > kYTolerancePx &&
                dy <= kLineHeightMaxPx &&
                std::abs(ctx.x - m_startX) <= kXLeftMarginTolPx;

            if (sameLine && !tooOld) {
                m_buf += fragment;                                // continua la riga
                m_lastRight = ctx.x + EstimateWidthPx(ctx.dc, fragment);
                m_lastTime  = now;
                return false;
            }
            if (nextLineSameParagraph) {
                if (!m_buf.empty() && m_buf.back() != L' ') m_buf += L' ';
                m_buf += fragment;                                // unisci riga wrappata
                m_startX = ctx.x;
                m_lastRight = ctx.x + EstimateWidthPx(ctx.dc, fragment);
                m_lastTime  = now;
                return false;
            }

            // Altrimenti: la riga precedente è chiusa. Emetti testo + contesto.
            closedText = m_buf;
            closedCtx  = m_ctx;
            m_buf.clear();
            closedPrev = !closedText.empty();
        }

        // Nuova riga: cattura il contesto del PRIMO glifo (serve a ridisegnare).
        m_ctx    = ctx;
        m_startX = ctx.x;
        m_buf += fragment;
        m_lastRight = ctx.x + EstimateWidthPx(ctx.dc, fragment);
        m_lastTime  = now;
        return closedPrev;
    }

    // Forza la chiusura della riga corrente (es. dentro EndPaint, a fine frame).
    bool Flush(std::wstring& closedText, DrawCtx& closedCtx) {
        std::lock_guard<std::mutex> lock(m_mutex);
        if (m_buf.empty()) return false;
        closedText = m_buf;
        closedCtx  = m_ctx;
        m_buf.clear();
        m_lastRight = 0;
        return true;
    }

private:
    using Clock = std::chrono::steady_clock;

    // Parametri tarati nello spike (cuore dell'euristica):
    static constexpr int  kYTolerancePx     = 3;    // glifi sulla stessa riga
    static constexpr int  kXOverlapPx       = 4;    // tolleranza kerning/overlap
    static constexpr int  kXGapPx           = 24;   // gap max prima di "nuova parola/colonna"
    static constexpr long kMaxGapMs         = 80;   // gap temporale → riga diversa
    // Merge verticale (righe wrappate dello stesso paragrafo):
    static constexpr bool kMergeWrappedLines = true; // unisci righe wrappate in 1 frase
    static constexpr int  kLineHeightMaxPx   = 28;   // dy max tra riga e riga successiva
    static constexpr int  kXLeftMarginTolPx  = 12;   // la riga dopo riparte ~stesso margine X

    int EstimateWidthPx(HDC dc, const std::wstring& s) {
        SIZE sz{0, 0};
        if (dc && GetTextExtentPoint32W(dc, s.c_str(), (int)s.size(), &sz)) return sz.cx;
        return (int)s.size() * 8; // fallback grossolano
    }

    std::mutex   m_mutex;
    std::wstring m_buf;
    DrawCtx      m_ctx;             // contesto del primo glifo della riga corrente
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

// SUPPRESS-AND-REDRAW per il caso glifo-per-glifo: i frammenti (singoli glifi /
// pezzi non sostituibili da soli) non vengono disegnati subito; quando la riga
// si chiude, ridisegniamo una sola volta la frase TRADOTTA (o l'originale se la
// traduzione manca, così il testo non sparisce mai). Richiede l'hook su EndPaint
// per chiudere l'ultima riga del frame. Ininfluente in modalità log-only.
constexpr bool kGlyphSuppressRedraw = true;

// Solo i frammenti CORTI (firma glifo-per-glifo: di norma 1 carattere per
// chiamata, 2 per surrogati/combinazioni) vengono soppressi e ricostruiti. Le
// chiamate con stringhe più lunghe sono "intere per chiamata": se in cache le
// gestisce il path per-chiamata (SUBST), altrimenti si disegnano normalmente —
// niente soppressione inutile, blast radius minimo.
constexpr UINT kMaxSuppressFragmentChars = 2;

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

// ─── Tipi e puntatori agli originali (servono già a RedrawClosedLine) ────────
using ExtTextOutW_t = BOOL (WINAPI*)(HDC, int, int, UINT, const RECT*,
                                     LPCWSTR, UINT, const INT*);
ExtTextOutW_t Original_ExtTextOutW = nullptr;

// Ridisegna una riga CHIUSA: traduce e disegna UNA SOLA VOLTA la stringa
// (tradotta se in cache, altrimenti l'originale → il testo non sparisce mai) nel
// punto del primo glifo, ripristinando font/colori/allineamento catturati.
void RedrawClosedLine(const std::wstring& src, const DrawCtx& c) {
    if (src.empty() || !c.dc) return;
    std::wstring out = src;
    if (g_translate && LooksSubstitutable(src)) {
        std::wstring t = g_translate(src);
        if (!t.empty()) out = t;
    }
    const bool subst = (out != src);
    LogLineW((subst ? L"[gs-hook/GDI] SUBST(glyph): "
                    : L"[gs-hook/GDI] REDRAW(glyph): ")
             + src + (subst ? (L" -> " + out) : std::wstring()) + L"\n");

    HGDIOBJ  oldFont  = c.font ? SelectObject(c.dc, c.font) : nullptr;
    int      oldMode  = SetBkMode(c.dc, c.bkMode);
    COLORREF oldText  = SetTextColor(c.dc, c.textColor);
    COLORREF oldBk    = SetBkColor(c.dc, c.bkColor);
    UINT     oldAlign = SetTextAlign(c.dc, c.align & ~TA_UPDATECP); // disegna a X assoluta

    // La guardia evita che il NOSTRO redraw venga ri-catturato dal hook.
    ++g_inDrawText;
    Original_ExtTextOutW(c.dc, c.x, c.y, c.options & ~(ETO_PDY | ETO_OPAQUE),
                         nullptr, out.c_str(), (UINT)out.size(), nullptr);
    --g_inDrawText;

    SetTextAlign(c.dc, oldAlign);
    SetBkColor(c.dc, oldBk);
    SetTextColor(c.dc, oldText);
    SetBkMode(c.dc, oldMode);
    if (oldFont) SelectObject(c.dc, oldFont);
}

// SUPPRESS-AND-REDRAW (glifo-per-glifo): bufferizza il frammento SENZA disegnarlo;
// quando la riga si chiude, ridisegna la riga tradotta una sola volta.
BOOL CoalesceAndSuppress(const DrawCtx& ctx, const std::wstring& frag) {
    std::wstring closedText;
    DrawCtx      closedCtx;
    if (g_coalescer.Add(ctx, frag, closedText, closedCtx) && !closedText.empty()) {
        RedrawClosedLine(closedText, closedCtx);
    }
    return TRUE; // glifo soppresso: riapparirà (tradotto) alla chiusura riga
}

// Path di sola DIAGNOSTICA (coalescer in log-only): ricostruisce la frase e la
// logga, senza toccare il rendering.
void OnFragmentDiag(const DrawCtx& ctx, const std::wstring& fragment) {
    if (fragment.empty()) return;
    std::wstring closedText;
    DrawCtx      closedCtx;
    if (g_coalescer.Add(ctx, fragment, closedText, closedCtx) && !closedText.empty()) {
        LogLineW(L"[gs-hook/GDI] FRASE: " + closedText + L"\n");
    }
}

// Cattura il contesto GDI corrente (font/colori/allineamento) per ridisegnare
// fedelmente la riga tradotta nel punto del primo glifo.
DrawCtx CaptureCtx(HDC hdc, int x, int y, UINT options) {
    DrawCtx c;
    c.dc        = hdc;
    c.x         = x;
    c.y         = y;
    c.options   = options;
    c.font      = (HFONT)GetCurrentObject(hdc, OBJ_FONT);
    c.textColor = GetTextColor(hdc);
    c.bkColor   = GetBkColor(hdc);
    c.bkMode    = GetBkMode(hdc);
    c.align     = GetTextAlign(hdc);
    return c;
}

// ─── Hook su ExtTextOutW ─────────────────────────────────────────────────────
BOOL WINAPI Hook_ExtTextOutW(HDC hdc, int x, int y, UINT options, const RECT* rect,
                             LPCWSTR str, UINT count, const INT* dx) {
    // ETO_GLYPH_INDEX: `str` contiene indici di glifo, NON caratteri → non toccare.
    if (str && count > 0 && g_inDrawText == 0 && !(options & ETO_GLYPH_INDEX)) {
        std::wstring s(str, count);

        // (1) Sostituzione per-chiamata: caso "stringa intera per chiamata".
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

        // (2) Frammenti corti (glifo-per-glifo): soppressione + redraw a chiusura.
        DrawCtx ctx = CaptureCtx(hdc, x, y, options);
        if (!kSpikeLogOnly && g_translate && kGlyphSuppressRedraw &&
            count <= kMaxSuppressFragmentChars) {
            return CoalesceAndSuppress(ctx, s);
        }
        // (3) Diagnostica del coalescer (solo in modalità log-only). In modalità
        //     sostituzione le stringhe intere senza hit in cache cadono qui e si
        //     disegnano normalmente sotto.
        if (kSpikeLogOnly) OnFragmentDiag(ctx, s);
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

// ─── Hook su EndPaint (user32) ───────────────────────────────────────────────
// A fine frame chiude l'ULTIMA riga ancora bufferizzata e la ridisegna tradotta:
// i suoi glifi sono stati soppressi e non sono ancora a schermo. Il DC di
// disegno (ps->hdc, == quello catturato nei frammenti) è ancora valido qui,
// prima che EndPaint lo rilasci.
using EndPaint_t = BOOL (WINAPI*)(HWND, const PAINTSTRUCT*);
EndPaint_t Original_EndPaint = nullptr;

BOOL WINAPI Hook_EndPaint(HWND hwnd, const PAINTSTRUCT* ps) {
    if (!kSpikeLogOnly && g_translate && kGlyphSuppressRedraw) {
        std::wstring closedText;
        DrawCtx      closedCtx;
        if (g_coalescer.Flush(closedText, closedCtx) && !closedText.empty()) {
            RedrawClosedLine(closedText, closedCtx);
        }
    }
    return Original_EndPaint(hwnd, ps);
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

        HMODULE user32 = GetModuleHandleA("user32.dll");
        auto pExt  = GetProcAddress(gdi, "ExtTextOutW");
        auto pDraw = GetProcAddress(user32, "DrawTextW");
        auto pEnd  = GetProcAddress(user32, "EndPaint");

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
        // EndPaint: serve a chiudere/ridisegnare l'ultima riga soppressa del frame
        // (suppress-and-redraw glifo-per-glifo). Non incide sull'attivazione.
        if (pEnd &&
            MH_CreateHook((LPVOID)pEnd, (LPVOID)&Hook_EndPaint,
                          (LPVOID*)&Original_EndPaint) == MH_OK) {
            MH_EnableHook((LPVOID)pEnd);
        }
        return any ? Activation::Activated : Activation::Failed;
    }

    void Deactivate() override {
        if (Original_ExtTextOutW) MH_DisableHook((LPVOID)Original_ExtTextOutW);
        if (Original_DrawTextW)   MH_DisableHook((LPVOID)Original_DrawTextW);
        if (Original_EndPaint)    MH_DisableHook((LPVOID)Original_EndPaint);
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::GdiSource);
