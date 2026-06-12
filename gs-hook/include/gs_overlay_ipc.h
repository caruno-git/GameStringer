#pragma once
//
// gs_overlay_ipc.h — canale IPC DEDICATO per la modalità "in tempo reale/overlay".
//
// Le sorgenti di sola ESTRAZIONE (es. GDI/GetGlyphOutline, che non possono
// sostituire in-place) inoltrano qui le frasi catturate + la loro traduzione.
// GameStringer le riceve e le mostra in un overlay.
//
// PERCHÉ UN CANALE SEPARATO dal core IPC (ipc.cpp):
//   - è FIRE-AND-FORGET: niente request/response bloccante (il core, se connesso,
//     fa un round-trip sincrono che bloccherebbe il render thread del gioco);
//   - è write-only dalla DLL, su una pipe distinta (`GameStringerOverlay`), così
//     attivarlo NON cambia il comportamento di GSTranslator::Translate();
//   - connessione LAZY al primo invio: l'ordine di avvio DLL/GameStringer non conta.
//
// Wire format (semplice, parsabile da Rust e da un server di test):
//   [4 byte LE = lunghezza N del payload][N byte UTF-8 JSON]
//   payload = {"type":"overlay","original":"…","translated":"…"}
//
#include <string>

namespace gs {
namespace overlay {

constexpr const wchar_t* kPipeName = L"\\\\.\\pipe\\GameStringerOverlay";

// Invia una riga catturata all'overlay. Fire-and-forget: se GameStringer non è
// in ascolto, l'invio viene semplicemente scartato (nessun blocco, nessun errore).
void Send(const std::wstring& original, const std::wstring& translated);

// Chiude la pipe (allo shutdown della DLL).
void Shutdown();

} // namespace overlay
} // namespace gs
