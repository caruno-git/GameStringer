//
// dllmain.cpp — orchestratore di gs-hook (Universal Text Interception Framework).
//
// All'iniezione nel processo del gioco:
//   1. inizializza MinHook + IPC verso GameStringer + il translator (cache/IPC)
//   2. crea tutte le sorgenti registrate, ordinate per livello (L1 → L2 → L3)
//   3. attiva la PRIMA sorgente applicabile per livello:
//        - se una sorgente L1 (per-engine) si attiva, ci fermiamo lì (è la migliore)
//        - altrimenti scende a L2 (GDI/DirectWrite/FreeType, universale)
//        - altrimenti L3 (OCR-fusion)
//   4. riporta a GameStringer quale livello è attivo (per l'UI: "permanente"
//      vs "in tempo reale").
//
// Il translate-bridge (g_TranslateBridge) collega le sorgenti al core di
// traduzione: cache locale → IPC verso l'app se manca. Il core vive nei moduli
// generici translator.cpp / cache.cpp / ipc.cpp riusati da unreal-translator.
//
#include "text_source.h"
#include <Windows.h>
#include <MinHook.h>
#include <vector>
#include <string>

// Dichiarazioni del core generico (definite in translator.cpp/ipc.cpp riusati).
// Adattare i namespace a quelli reali del core in fase di build.
namespace gscore {
    bool InitCore(const wchar_t* targetLang, const wchar_t* sourceLang);
    void ShutdownCore();
    std::wstring Translate(const std::wstring& original); // cache + IPC
}

namespace {

std::vector<std::unique_ptr<gs::ITextSource>> g_active;

// Bridge passato a ogni sorgente: punto unico verso cache/IPC del core.
std::wstring TranslateBridge(const std::wstring& original) {
    return gscore::Translate(original);
}

void LogA(const char* msg) { OutputDebugStringA(msg); }

DWORD WINAPI MainThread(LPVOID) {
    Sleep(3000); // attendi il caricamento del gioco

    if (MH_Initialize() != MH_OK) { LogA("[gs-hook] MinHook init FAILED\n"); return 1; }

    // Lingue: in produzione arrivano da GameStringer via IPC/config. Default qui.
    gscore::InitCore(L"it", L"en");

    auto sources = gs::SourceRegistry::Instance().CreateAllSorted();

    int activatedLevel = 0;
    for (auto& src : sources) {
        if (!src->IsApplicable()) continue;

        // Una volta attivato un livello, non scendiamo più in basso: L1 batte L2
        // batte L3. (Più sorgenti dello STESSO livello possono coesistere, es.
        // GDI + DirectWrite insieme a L2.)
        if (activatedLevel != 0 &&
            static_cast<int>(src->GetLevel()) > activatedLevel) {
            continue;
        }

        auto res = src->Activate(&TranslateBridge);
        if (res == gs::Activation::Activated) {
            char buf[160];
            sprintf_s(buf, "[gs-hook] sorgente attiva: %s (livello %d)\n",
                      src->Name(), static_cast<int>(src->GetLevel()));
            LogA(buf);
            activatedLevel = static_cast<int>(src->GetLevel());
            g_active.push_back(std::move(src));
        }
    }

    if (activatedLevel == 0) {
        LogA("[gs-hook] nessuna sorgente di testo attivabile in questo processo\n");
    }
    // TODO: notificare a GameStringer via IPC il livello attivo (per l'UI).
    return 0;
}

DWORD WINAPI CleanupThread(LPVOID) {
    for (auto& src : g_active) src->Deactivate();
    g_active.clear();
    MH_DisableHook(MH_ALL_HOOKS);
    MH_Uninitialize();
    gscore::ShutdownCore();
    return 0;
}

} // namespace

BOOL APIENTRY DllMain(HMODULE hModule, DWORD reason, LPVOID) {
    switch (reason) {
        case DLL_PROCESS_ATTACH:
            DisableThreadLibraryCalls(hModule);
            CreateThread(nullptr, 0, MainThread, nullptr, 0, nullptr);
            break;
        case DLL_PROCESS_DETACH:
            CreateThread(nullptr, 0, CleanupThread, nullptr, 0, nullptr);
            break;
    }
    return TRUE;
}
