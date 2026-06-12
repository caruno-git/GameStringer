//
// registry.cpp — implementazione del registry delle sorgenti di testo.
//
#include "text_source.h"
#include <algorithm>

namespace gs {

SourceRegistry& SourceRegistry::Instance() {
    // Singleton "Meyers": costruito al primo uso, thread-safe in C++11+.
    static SourceRegistry instance;
    return instance;
}

void SourceRegistry::Register(Factory factory) {
    if (factory) {
        m_factories.push_back(factory);
    }
}

std::vector<std::unique_ptr<ITextSource>> SourceRegistry::CreateAllSorted() {
    std::vector<std::unique_ptr<ITextSource>> sources;
    sources.reserve(m_factories.size());
    for (auto factory : m_factories) {
        if (auto s = factory()) {
            sources.push_back(std::move(s));
        }
    }
    // Ordina per livello crescente: L1 (Engine) prima di L2 (Rasterization)
    // prima di L3 (OcrFusion). L'orchestratore le prova in quest'ordine.
    std::stable_sort(sources.begin(), sources.end(),
        [](const std::unique_ptr<ITextSource>& a,
           const std::unique_ptr<ITextSource>& b) {
            return static_cast<int>(a->GetLevel()) < static_cast<int>(b->GetLevel());
        });
    return sources;
}

} // namespace gs
