//
// source_gdi_glyph.cpp — Livello 2 (UNIVERSALE), sorgente GDI per ESTRAZIONE.
//
// Molti engine (RPG Maker/RPG_RT, gran parte delle visual novel) NON disegnano
// il testo con ExtTextOutW/DrawTextW: chiedono a GDI il BITMAP del singolo glifo
// con GetGlyphOutlineW e lo blittano da sé sulla propria superficie. Il hook su
// ExtTextOutW resta quindi muto. Questa sorgente aggancia GetGlyphOutlineW e
// ricostruisce la frase dalla SEQUENZA di caratteri richiesti (in ordine di
// lettura), un carattere per chiamata.
//
// LIMITE ARCHITETTURALE (onesto): da qui NON si può sostituire in-place. Il
// gioco ha già deciso quanti glifi disegnare e dove; non possiamo iniettare una
// traduzione di lunghezza diversa al livello del singolo glifo. Questa sorgente
// alimenta la modalità "in tempo reale / overlay" (estrai → traduci → mostra
// altrove), come fa Textractor. La sostituzione permanente resta agli hook
// per-engine (L1) e a ExtTextOut/DrawText (caso "stringa per chiamata").
//
// Spike: in log-only ricostruisce e logga le frasi (e la loro traduzione) →
// risponde "riusciamo a ricostruire testo leggibile dalle richieste di glifo?".
//
// CAVEAT: se il gioco CACHEA i bitmap dei glifi, GetGlyphOutlineW viene chiamato
// solo per i glifi NUOVI/non in cache → una riga con caratteri ripetuti può
// arrivare con buchi. È un limite noto di questo approccio (vale anche per
// Textractor). Per il test usiamo un target che chiede ogni glifo una volta.
//
#include "text_source.h"
#include "gs_log.h"
#include "gs_overlay_ipc.h"
#include <Windows.h>
#include <MinHook.h>
#include <string>
#include <mutex>
#include <chrono>
#include <cwctype>

namespace gs {
namespace {

TranslateFn g_translate = nullptr;

// Estrazione/diagnostica: questa sorgente non sostituisce in-place (impossibile
// a livello di glifo) → logga sempre la frase ricostruita e, se disponibile, la
// sua traduzione. TODO: inoltrarla a GameStringer via IPC per l'overlay.
constexpr bool kGlyphOutlineLogOnly = true;

// ─── Coalescer per-tempo (GetGlyphOutlineW non dà x/y) ───────────────────────
// I caratteri arrivano uno per chiamata, in ordine di lettura. Senza coordinate
// uniamo per CONTIGUITÀ TEMPORALE sullo stesso DC: un gap > kMaxGapMs o un
// cambio di DC chiude la riga.
class GlyphCoalescer {
public:
    // Aggiunge un carattere. Se la riga precedente si chiude, ritorna true e
    // mette in `closed` la frase completa.
    bool Add(HDC dc, wchar_t ch, std::wstring& closed) {
        std::lock_guard<std::mutex> lock(m_mutex);
        const auto now = Clock::now();

        bool closedPrev = false;
        if (!m_buf.empty()) {
            const long ageMs =
                (long)std::chrono::duration_cast<std::chrono::milliseconds>(now - m_lastTime).count();
            const bool tooOld = ageMs > kMaxGapMs;
            const bool sameDc = (dc == m_dc);
            if (tooOld || !sameDc) {
                closed = m_buf;
                m_buf.clear();
                closedPrev = !closed.empty();
            }
        }

        m_dc = dc;
        m_buf += ch;
        m_lastTime = now;
        return closedPrev;
    }

    bool Flush(std::wstring& closed) {
        std::lock_guard<std::mutex> lock(m_mutex);
        if (m_buf.empty()) return false;
        closed = m_buf;
        m_buf.clear();
        return true;
    }

private:
    using Clock = std::chrono::steady_clock;
    static constexpr long kMaxGapMs = 80; // gap temporale → riga diversa

    std::mutex   m_mutex;
    std::wstring m_buf;
    HDC          m_dc = nullptr;
    Clock::time_point m_lastTime{};
};

GlyphCoalescer g_coalescer;

// Emette una riga ricostruita: log + traduzione + inoltro all'overlay (IPC).
void EmitClosedLine(const std::wstring& line) {
    if (line.empty()) return;
    LogLineW(L"[gs-hook/GLYPH] LINEA: " + line + L"\n");
    std::wstring translated = line;
    if (g_translate) {
        std::wstring t = g_translate(line);
        if (!t.empty()) {
            translated = t;
            if (t != line) {
                LogLineW(L"[gs-hook/GLYPH] TRAD: " + line + L" -> " + t + L"\n");
            }
        }
    }
    // Inoltro fire-and-forget a GameStringer per l'overlay in tempo reale.
    // Se l'app non è in ascolto, viene scartato senza bloccare il render thread.
    overlay::Send(line, translated);
}

// ─── Hook su GetGlyphOutlineW ────────────────────────────────────────────────
using GetGlyphOutlineW_t = DWORD (WINAPI*)(HDC, UINT, UINT, LPGLYPHMETRICS,
                                           DWORD, LPVOID, const MAT2*);
GetGlyphOutlineW_t Original_GetGlyphOutlineW = nullptr;

DWORD WINAPI Hook_GetGlyphOutlineW(HDC hdc, UINT uChar, UINT fuFormat,
                                   LPGLYPHMETRICS lpgm, DWORD cbBuffer,
                                   LPVOID lpvBuffer, const MAT2* lpmat2) {
    // GGO_GLYPH_INDEX: uChar è un indice di glifo, NON un carattere → non utile
    // per ricostruire testo. Lo lasciamo passare senza catturarlo.
    if (!(fuFormat & GGO_GLYPH_INDEX)) {
        const wchar_t ch = (wchar_t)uChar;
        if (ch < 0x20) {
            // Carattere di controllo (newline/tab…) → chiude la riga corrente.
            std::wstring closed;
            if (g_coalescer.Flush(closed)) EmitClosedLine(closed);
        } else {
            std::wstring closed;
            if (g_coalescer.Add(hdc, ch, closed) && !closed.empty()) {
                EmitClosedLine(closed);
            }
        }
    }
    // Estrazione pura: non alteriamo MAI il bitmap restituito al gioco.
    return Original_GetGlyphOutlineW(hdc, uChar, fuFormat, lpgm, cbBuffer,
                                     lpvBuffer, lpmat2);
}

class GdiGlyphSource : public ITextSource {
public:
    const char* Name() const override { return "GDI/GetGlyphOutline (estrazione)"; }
    Level GetLevel() const override { return Level::Rasterization; }

    bool IsApplicable() const override {
        return GetModuleHandleA("gdi32.dll") != nullptr; // praticamente sempre
    }

    Activation Activate(TranslateFn translate) override {
        HMODULE gdi = GetModuleHandleA("gdi32.dll");
        if (!gdi) return Activation::NotApplicable;
        g_translate = translate;

        auto pGgo = GetProcAddress(gdi, "GetGlyphOutlineW");
        if (pGgo &&
            MH_CreateHook((LPVOID)pGgo, (LPVOID)&Hook_GetGlyphOutlineW,
                          (LPVOID*)&Original_GetGlyphOutlineW) == MH_OK &&
            MH_EnableHook((LPVOID)pGgo) == MH_OK) {
            return Activation::Activated;
        }
        return Activation::Failed;
    }

    void Deactivate() override {
        if (Original_GetGlyphOutlineW)
            MH_DisableHook((LPVOID)Original_GetGlyphOutlineW);
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::GdiGlyphSource);
