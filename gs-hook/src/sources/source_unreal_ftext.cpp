//
// source_unreal_ftext.cpp — Livello 1, sorgente per giochi Unreal Engine.
//
// Incapsula come ITextSource l'hook su FText::ToString: quando UE converte un
// FText (testo localizzabile) nella sua FString, intercettiamo la stringa
// risultante e la sostituiamo con la traduzione. È il punto più "alto" e pulito
// per UE — molto meglio del GDI/OCR — perché vediamo la frase intera, già
// decodificata, prima che venga renderizzata.
//
// Porting completato riusando il core di unreal-translator (incluso da gs-hook
// via CMake): `UE::Patterns::*` (firme byte di FText::ToString) e
// `GSTranslator::Utils::PatternScan` vivono in ../unreal-translator/hook-dll e
// NON sono duplicati qui.
//
// LIMITI NOTI:
//   • I pattern UE4.2x / UE5 sono **x64** (prefissi REX.W "48 ..."): per i (rari)
//     giochi UE a 32-bit non agganciano → Activate ritorna Failed → fallback L2.
//   • Sostituzione in-place SOLO se la traduzione entra nel buffer già allocato
//     da UE (FString::ArrayMax). Espanderlo richiede l'allocatore UE
//     (FMemory::Realloc) → TODO.
//
#include "text_source.h"
#include "ue_types.h"   // UE::FString, UE::FText, UE::Patterns::FText_ToString_*
#include "utils.h"      // GSTranslator::Utils::PatternScan
#include "gs_log.h"     // log unificato gs-hook (%TEMP%\gs-hook.log)
#include <Windows.h>
#include <MinHook.h>
#include <string>
#include <cwctype>

namespace gs {
namespace {

TranslateFn g_translate = nullptr;

using FText_ToString_t = UE::FString* (__fastcall*)(const UE::FText*, UE::FString*);
FText_ToString_t Original_FText_ToString = nullptr;

// Hook su FText::ToString. `out` è la FString che UE riempie col testo: dopo aver
// lasciato lavorare l'originale, leggiamo il testo, lo traduciamo e lo
// riscriviamo in-place nel buffer di UE (se ci sta).
UE::FString* __fastcall Hook_FText_ToString(const UE::FText* self, UE::FString* out) {
    UE::FString* result = Original_FText_ToString(self, out);

    if (g_translate && result && result->Data && result->Len() > 0) {
        std::wstring original(result->Data, result->Len());

        // Salta stringhe troppo corte o che sembrano codice/identificatori
        // (path "::", commenti "//") — riduce traffico inutile al translator.
        if (original.size() > 2 &&
            original.find(L"::") == std::wstring::npos &&
            original.find(L"//") == std::wstring::npos) {

            std::wstring t = g_translate(original);
            if (!t.empty() && t != original) {
                // In-place SOLO se la traduzione (incluso il NUL) entra nel buffer
                // già allocato da UE. Altrimenti la lasciamo invariata: scrivere
                // oltre ArrayMax corromperebbe l'heap di UE.
                if (static_cast<int32_t>(t.size() + 1) <= result->ArrayMax) {
                    wcscpy_s(result->Data, static_cast<size_t>(result->ArrayMax), t.c_str());
                    result->ArrayNum = static_cast<int32_t>(t.size() + 1); // include il NUL
                    LogLineW(L"[gs-hook/UE] SUBST: " + original + L" -> " + t + L"\n");
                } else {
                    LogLineW(L"[gs-hook/UE] (non sostituita: buffer UE troppo piccolo) "
                             + original + L"\n");
                }
            }
        }
    }

    return result;
}

class UnrealFTextSource : public ITextSource {
public:
    const char* Name() const override { return "Unreal/FText"; }
    Level GetLevel() const override { return Level::Engine; }

    bool IsApplicable() const override {
        // Segnali UE economici (nessun hook qui, solo detection):
        //  1) nome del modulo principale: i build "Shipping" di UE si chiamano
        //     tipicamente <Game>-Win64-Shipping.exe; gli editor contengono UE4/UE5.
        wchar_t exe[MAX_PATH] = {0};
        if (GetModuleFileNameW(nullptr, exe, MAX_PATH)) {
            std::wstring p(exe);
            for (auto& c : p) c = static_cast<wchar_t>(towlower(c));
            if (p.find(L"shipping") != std::wstring::npos ||
                p.find(L"ue4")      != std::wstring::npos ||
                p.find(L"ue5")      != std::wstring::npos ||
                p.find(L"unreal")   != std::wstring::npos) {
                return true;
            }
        }
        //  2) DLL tipiche dei build con engine in DLL / editor.
        return GetModuleHandleA("UnrealEditor-Core.dll") != nullptr
            || GetModuleHandleA("UE4Editor-Core.dll")    != nullptr;
    }

    Activation Activate(TranslateFn translate) override {
        g_translate = translate;

        // MinHook è già inizializzato dal dllmain di gs-hook: qui solo Create+Enable.
        HMODULE game = GetModuleHandleA(nullptr);
        if (!game) return Activation::Failed;

        // Pattern-scan di FText::ToString: provo prima UE5, poi UE4.2x. PatternScan
        // e i pattern sono riusati dal core (niente duplicazione delle firme).
        const char* patterns[] = {
            UE::Patterns::FText_ToString_UE5,
            UE::Patterns::FText_ToString_UE427,
        };
        uintptr_t addr = 0;
        for (const char* pat : patterns) {
            addr = GSTranslator::Utils::PatternScan(game, pat);
            if (addr) break;
        }
        if (!addr) {
            LogLineA("[gs-hook/UE] FText::ToString non trovato (pattern x64 UE4.2x/UE5)\n");
            return Activation::Failed; // → il dllmain scende a L2 (GDI)
        }

        if (MH_CreateHook(reinterpret_cast<LPVOID>(addr),
                          reinterpret_cast<LPVOID>(&Hook_FText_ToString),
                          reinterpret_cast<LPVOID*>(&Original_FText_ToString)) != MH_OK ||
            MH_EnableHook(reinterpret_cast<LPVOID>(addr)) != MH_OK) {
            LogLineA("[gs-hook/UE] hook FText::ToString fallito (MinHook)\n");
            return Activation::Failed;
        }

        LogLineW(L"[gs-hook/UE] hook FText::ToString installato\n");
        return Activation::Activated;
    }

    void Deactivate() override {
        if (Original_FText_ToString)
            MH_DisableHook(reinterpret_cast<LPVOID>(Original_FText_ToString));
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::UnrealFTextSource);
