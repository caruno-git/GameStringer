//
// source_unreal_ftext.cpp — Livello 1, sorgente per giochi Unreal Engine.
//
// Incapsula come ITextSource l'hook su FText::ToString già presente in
// unreal-translator/hook-dll/src/hooks.cpp (pattern-scan per UE4.27 / UE5).
//
// Qui lasciamo lo scheletro dell'integrazione: il pattern-scan vero e i tipi
// UE (FString/FText) vivono già in unreal-translator/hook-dll/include/ue_types.h
// e possono essere riusati. Marcato come porting da completare per non
// duplicare i pattern in due punti.
//
#include "text_source.h"
#include <Windows.h>
#include <MinHook.h>

namespace gs {
namespace {

TranslateFn g_translate = nullptr;

// FString UE = { wchar_t* Data; int32 Count; int32 Max; } (layout TArray<TCHAR>)
// Definizione minima per leggere/scrivere il testo. Vedi ue_types.h per i
// dettagli completi (allocator, ecc.).
struct FString {
    wchar_t* Data;
    int32_t  Count;
    int32_t  Max;
};
struct FText { void* opaque; };

using FText_ToString_t = FString* (__fastcall*)(const FText*, FString*);
FText_ToString_t Original_FText_ToString = nullptr;

FString* __fastcall Hook_FText_ToString(const FText* self, FString* out) {
    FString* result = Original_FText_ToString(self, out);
    if (g_translate && result && result->Data && result->Count > 2) {
        std::wstring original(result->Data, result->Count - 1); // -1 per il NUL
        std::wstring translated = g_translate(original);
        // TODO(porting): per sostituire in-place servono Alloc/realloc dell'FString
        // tramite l'allocatore UE (FMemory::Realloc) o un pool gestito da noi —
        // riusare la logica già presente in unreal-translator/hook-dll/src/hooks.cpp.
        (void)translated;
    }
    return result;
}

class UnrealFTextSource : public ITextSource {
public:
    const char* Name() const override { return "Unreal/FText"; }
    Level GetLevel() const override { return Level::Engine; }

    bool IsApplicable() const override {
        // Heuristica: presenza dei moduli UE tipici.
        return GetModuleHandleA("UE4Editor-Core.dll") != nullptr
            || GetModuleHandleW(nullptr) != nullptr; // raffinare con pattern di ue_types.h
    }

    Activation Activate(TranslateFn translate) override {
        g_translate = translate;
        // TODO(porting): pattern-scan di FText::ToString per la versione UE
        // rilevata (logica in hooks.cpp::FindPattern + GetFTextToStringPattern).
        // uintptr_t addr = FindPattern(...);
        // MH_CreateHook((LPVOID)addr, &Hook_FText_ToString, &Original_FText_ToString);
        // MH_EnableHook((LPVOID)addr);
        return Activation::Failed; // finché il porting del pattern-scan non è completato
    }

    void Deactivate() override {
        if (Original_FText_ToString)
            MH_DisableHook((LPVOID)Original_FText_ToString);
    }
};

} // namespace
} // namespace gs

GS_REGISTER_SOURCE(gs::UnrealFTextSource);
