#pragma once
//
// GameStringer — Universal Text Interception Framework (UTIF)
// text_source.h — interfaccia plugin per ogni "sorgente di testo" + registry.
//
// Idea: invece di una DLL per engine, UNA DLL (gs-hook) con un registry di
// sorgenti. Ogni sorgente sa intercettare il testo in un punto preciso:
//   - Livello 1 (per-engine):  Unity/Mono, Unity/IL2CPP, Unreal/FText ...
//   - Livello 2 (universale):  GDI, DirectWrite, FreeType ...
//   - Livello 3 (pavimento):   OCR-fusion (timing dallo swapchain)
//
// Aggiungere il supporto a un nuovo engine = scrivere una classe ITextSource
// e chiamare GS_REGISTER_SOURCE(). Niente altro da toccare.
//
#include <string>
#include <vector>
#include <memory>
#include <cstdint>

namespace gs {

// Livello a cui opera la sorgente. L'orchestratore prova prima L1, poi L2, poi
// L3: usa il livello più alto (numero più basso) che riesce ad attivarsi.
enum class Level : int {
    Engine        = 1,  // per-engine, preciso e veloce
    Rasterization = 2,  // GDI/DirectWrite/FreeType, universale
    OcrFusion     = 3,  // ultimo: timing hook + OCR
};

// Esito dell'attivazione di una sorgente nel processo corrente.
enum class Activation {
    NotApplicable,  // questo engine/API non è presente in questo gioco
    Activated,      // hook installati con successo
    Failed,         // applicabile ma l'installazione hook è fallita
};

// Funzione che la sorgente chiama quando ha catturato del testo originale e
// vuole la traduzione. Ritorna la stringa tradotta (o l'originale se non
// disponibile). È implementata dal core (translator.cpp) e iniettata nella
// sorgente all'attivazione, così le sorgenti non dipendono da cache/IPC.
using TranslateFn = std::wstring (*)(const std::wstring& original);

// Interfaccia che ogni sorgente di testo implementa.
class ITextSource {
public:
    virtual ~ITextSource() = default;

    // Nome leggibile, per log e UI ("Unity/Mono", "GDI", ...).
    virtual const char* Name() const = 0;

    // Livello operativo (vedi enum Level).
    virtual Level GetLevel() const = 0;

    // È applicabile a QUESTO processo? (es. Mono: esiste mono.dll? GDI: sempre.)
    // Deve essere economica: nessun hook qui, solo detection.
    virtual bool IsApplicable() const = 0;

    // Installa gli hook. `translate` è il callback verso il core.
    // Va chiamata solo se IsApplicable() ha restituito true.
    virtual Activation Activate(TranslateFn translate) = 0;

    // Rimuove gli hook (chiamata allo shutdown).
    virtual void Deactivate() = 0;
};

// ───────────────────────────── Registry ─────────────────────────────────────
// Le sorgenti si auto-registrano a load-time della DLL tramite GS_REGISTER_SOURCE.
class SourceRegistry {
public:
    static SourceRegistry& Instance();

    // Registra una factory. Chiamata dai costruttori statici (load-time).
    using Factory = std::unique_ptr<ITextSource> (*)();
    void Register(Factory factory);

    // Crea tutte le sorgenti registrate, ordinate per livello crescente.
    std::vector<std::unique_ptr<ITextSource>> CreateAllSorted();

private:
    std::vector<Factory> m_factories;
};

// Helper di auto-registrazione: dichiara una variabile statica che, costruita
// a load-time, registra la factory della sorgente.
struct AutoRegister {
    explicit AutoRegister(SourceRegistry::Factory f) {
        SourceRegistry::Instance().Register(f);
    }
};

// Macro da usare in fondo a ogni file source_*.cpp:
//   GS_REGISTER_SOURCE(UnityMonoSource);
#define GS_REGISTER_SOURCE(ClassName)                                          \
    static std::unique_ptr<::gs::ITextSource> ClassName##_factory() {          \
        return std::make_unique<ClassName>();                                  \
    }                                                                          \
    static ::gs::AutoRegister ClassName##_autoreg(&ClassName##_factory)

} // namespace gs
