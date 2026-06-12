//
// source_unity_mono.cpp — Livello 1, sorgente per giochi Unity con runtime Mono.
//
// Incapsula come ITextSource l'hook su mono_string_new / mono_string_new_utf16
// già presente in unity-translator-dll/src/main.cpp. La logica di filtro
// (lunghezza, path/codice, lettere) è portata qui invariata.
//
// NB: i giochi Unity IL2CPP NON usano mono.dll → questa sorgente non si attiva,
// e tocca a source_unity_il2cpp.cpp (TODO) o ai livelli inferiori.
//
#include "text_source.h"
#include <Windows.h>
#include <MinHook.h>
#include <mutex>

namespace gs {
namespace {

// ─── Tipi Mono minimi (opachi) ───────────────────────────────────────────────
struct MonoDomain;
struct MonoString;
using mono_string_new_t       = MonoString* (*)(MonoDomain*, const char*);
using mono_string_new_utf16_t = MonoString* (*)(MonoDomain*, const wchar_t*, int);

mono_string_new_t       Original_mono_string_new       = nullptr;
mono_string_new_utf16_t Original_mono_string_new_utf16 = nullptr;
mono_string_new_utf16_t mono_string_new_utf16_fn       = nullptr; // per costruire il risultato

TranslateFn g_translate = nullptr;
std::mutex  g_mutex;

// Euristica: questa stringa è testo da tradurre o roba tecnica (path/codice)?
bool LooksTranslatable(const char* text, size_t len) {
    if (len < 3 || len > 500) return false;
    if (strchr(text, '/') || strchr(text, '\\') || strchr(text, '{') || strchr(text, '<'))
        return false;
    for (size_t i = 0; i < len && i < 50; i++) {
        char c = text[i];
        if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z')) return true;
    }
    return false;
}

std::wstring Utf8ToWide(const char* text) {
    int wlen = MultiByteToWideChar(CP_UTF8, 0, text, -1, nullptr, 0);
    if (wlen <= 0) return L"";
    std::wstring w(wlen - 1, 0);
    MultiByteToWideChar(CP_UTF8, 0, text, -1, &w[0], wlen);
    return w;
}

MonoString* __cdecl Hook_mono_string_new(MonoDomain* domain, const char* text) {
    if (!g_translate || !text) return Original_mono_string_new(domain, text);
    size_t len = strlen(text);
    if (!LooksTranslatable(text, len)) return Original_mono_string_new(domain, text);

    std::wstring wtext = Utf8ToWide(text);
    if (wtext.empty()) return Original_mono_string_new(domain, text);

    std::wstring translated = g_translate(wtext); // cache+IPC nel core
    if (!translated.empty() && translated != wtext && mono_string_new_utf16_fn) {
        return mono_string_new_utf16_fn(domain, translated.c_str(), (int)translated.length());
    }
    return Original_mono_string_new(domain, text);
}

MonoString* __cdecl Hook_mono_string_new_utf16(MonoDomain* domain, const wchar_t* text, int len) {
    if (!g_translate || !text || len < 3 || len > 500)
        return Original_mono_string_new_utf16(domain, text, len);
    std::wstring wtext(text, len);
    std::wstring translated = g_translate(wtext);
    if (!translated.empty() && translated != wtext) {
        return Original_mono_string_new_utf16(domain, translated.c_str(), (int)translated.length());
    }
    return Original_mono_string_new_utf16(domain, text, len);
}

class UnityMonoSource : public ITextSource {
public:
    const char* Name() const override { return "Unity/Mono"; }
    Level GetLevel() const override { return Level::Engine; }

    bool IsApplicable() const override {
        // Mono runtime presente? (mono-2.0-bdwgc.dll è il nome moderno)
        return GetModuleHandleA("mono-2.0-bdwgc.dll") != nullptr
            || GetModuleHandleA("mono.dll") != nullptr;
    }

    Activation Activate(TranslateFn translate) override {
        HMODULE mono = GetModuleHandleA("mono-2.0-bdwgc.dll");
        if (!mono) mono = GetModuleHandleA("mono.dll");
        if (!mono) return Activation::NotApplicable;

        auto fnNew   = (mono_string_new_t)      GetProcAddress(mono, "mono_string_new");
        auto fnNewU  = (mono_string_new_utf16_t)GetProcAddress(mono, "mono_string_new_utf16");
        if (!fnNew || !fnNewU) return Activation::Failed;

        g_translate            = translate;
        mono_string_new_utf16_fn = fnNewU;

        bool ok = true;
        ok &= MH_CreateHook((LPVOID)fnNew,  (LPVOID)&Hook_mono_string_new,
                            (LPVOID*)&Original_mono_string_new) == MH_OK;
        ok &= MH_CreateHook((LPVOID)fnNewU, (LPVOID)&Hook_mono_string_new_utf16,
                            (LPVOID*)&Original_mono_string_new_utf16) == MH_OK;
        ok &= MH_EnableHook((LPVOID)fnNew)  == MH_OK;
        ok &= MH_EnableHook((LPVOID)fnNewU) == MH_OK;
        return ok ? Activation::Activated : Activation::Failed;
    }

    void Deactivate() override {
        if (Original_mono_string_new)
            MH_DisableHook((LPVOID)Original_mono_string_new);
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::UnityMonoSource);
