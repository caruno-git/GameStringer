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

namespace gs {
namespace {

TranslateFn g_translate = nullptr;

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
            const bool sameLine =
                dc == m_dc &&
                std::abs(y - m_y) <= kYTolerancePx &&            // stessa altezza
                x >= m_lastRight - kXOverlapPx &&                 // continua a destra
                x <= m_lastRight + kXGapPx;                       // senza salti grandi
            const bool tooOld =
                std::chrono::duration_cast<std::chrono::milliseconds>(now - m_lastTime).count()
                > kMaxGapMs;
            if (!sameLine || tooOld) {
                flushed = TakeBuffer();
                closedPrev = !flushed.empty();
            }
        }

        if (m_buf.empty()) { m_dc = dc; m_y = y; m_startX = x; }
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
    static constexpr int  kYTolerancePx = 3;    // glifi sulla stessa riga
    static constexpr int  kXOverlapPx   = 4;    // tolleranza kerning/overlap
    static constexpr int  kXGapPx       = 24;   // gap max prima di "nuova parola/colonna"
    static constexpr long kMaxGapMs     = 80;   // gap temporale → riga diversa

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

// MODALITÀ SPIKE: se true, NON sostituiamo il testo nel gioco — logghiamo solo
// le frasi ricostruite su OutputDebugString. È il primo, sicuro esperimento.
// Quando il coalescer è validato, si passa a sostituzione reale.
constexpr bool kSpikeLogOnly = true;

void OnFragment(HDC dc, int x, int y, const std::wstring& fragment) {
    if (fragment.empty()) return;
    std::wstring closedLine;
    if (g_coalescer.Add(dc, x, y, fragment, closedLine) && !closedLine.empty()) {
        if (kSpikeLogOnly) {
            LogLineW(L"[gs-hook/GDI] FRASE: " + closedLine + L"\n");
        } else if (g_translate) {
            std::wstring t = g_translate(closedLine);
            (void)t; // TODO(post-spike): sostituzione in-place del testo disegnato
        }
    }
}

// ─── Hook su ExtTextOutW ─────────────────────────────────────────────────────
using ExtTextOutW_t = BOOL (WINAPI*)(HDC, int, int, UINT, const RECT*,
                                     LPCWSTR, UINT, const INT*);
ExtTextOutW_t Original_ExtTextOutW = nullptr;

BOOL WINAPI Hook_ExtTextOutW(HDC hdc, int x, int y, UINT options, const RECT* rect,
                             LPCWSTR str, UINT count, const INT* dx) {
    if (str && count > 0) {
        OnFragment(hdc, x, y, std::wstring(str, count));
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
            // DrawText passa spesso una frase intera → flush immediato.
            std::wstring whole(str, len);
            if (kSpikeLogOnly) {
                LogLineW(L"[gs-hook/GDI] DRAWTEXT: " + whole + L"\n");
            }
        }
    }
    return Original_DrawTextW(hdc, str, count, rect, format);
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
