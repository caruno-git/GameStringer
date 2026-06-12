//
// gs_overlay_ipc.cpp — implementazione del canale overlay fire-and-forget.
//
#include "gs_overlay_ipc.h"
#include <Windows.h>
#include <mutex>
#include <string>
#include <vector>

namespace gs {
namespace overlay {
namespace {

std::mutex   g_mutex;
HANDLE       g_pipe = INVALID_HANDLE_VALUE;
std::wstring g_lastSent; // dedup di righe consecutive identiche (anti-spam overlay)

// UTF-16 → UTF-8.
std::string ToUtf8(const std::wstring& w) {
    if (w.empty()) return std::string();
    int n = WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(),
                                nullptr, 0, nullptr, nullptr);
    std::string out((size_t)n, '\0');
    WideCharToMultiByte(CP_UTF8, 0, w.c_str(), (int)w.size(),
                        out.data(), n, nullptr, nullptr);
    return out;
}

// Escape minimale di una stringa per inserirla in un valore JSON.
void AppendJsonEscaped(std::string& dst, const std::string& s) {
    for (char c : s) {
        switch (c) {
            case '"':  dst += "\\\""; break;
            case '\\': dst += "\\\\"; break;
            case '\b': dst += "\\b";  break;
            case '\f': dst += "\\f";  break;
            case '\n': dst += "\\n";  break;
            case '\r': dst += "\\r";  break;
            case '\t': dst += "\\t";  break;
            default:
                if ((unsigned char)c < 0x20) {
                    char buf[8];
                    wsprintfA(buf, "\\u%04x", (unsigned char)c);
                    dst += buf;
                } else {
                    dst += c;
                }
        }
    }
}

// Tenta una connessione NON bloccante alla pipe dell'overlay. true se connesso.
bool EnsureConnected() {
    if (g_pipe != INVALID_HANDLE_VALUE) return true;
    HANDLE h = CreateFileW(kPipeName, GENERIC_WRITE, 0, nullptr,
                           OPEN_EXISTING, 0, nullptr);
    if (h == INVALID_HANDLE_VALUE) return false; // server assente → drop
    g_pipe = h;
    return true;
}

} // namespace

void Send(const std::wstring& original, const std::wstring& translated) {
    std::lock_guard<std::mutex> lock(g_mutex);

    // Anti-spam: il render ridisegna la stessa riga ogni frame → evita di
    // reinviare una riga identica alla precedente (l'overlay mostra già quella).
    const std::wstring key = original + L'\x01' + translated;
    if (key == g_lastSent) return;

    if (!EnsureConnected()) return;

    // Costruisci il payload JSON.
    std::string json = "{\"type\":\"overlay\",\"original\":\"";
    AppendJsonEscaped(json, ToUtf8(original));
    json += "\",\"translated\":\"";
    AppendJsonEscaped(json, ToUtf8(translated));
    json += "\"}";

    // Frame: [4 byte LE lunghezza][payload].
    const uint32_t len = (uint32_t)json.size();
    std::vector<uint8_t> frame(sizeof(uint32_t) + json.size());
    memcpy(frame.data(), &len, sizeof(uint32_t));
    memcpy(frame.data() + sizeof(uint32_t), json.data(), json.size());

    DWORD written = 0;
    if (WriteFile(g_pipe, frame.data(), (DWORD)frame.size(), &written, nullptr)) {
        g_lastSent = key; // marca come inviata SOLO se la scrittura è riuscita
    } else {
        // Server sparito o pipe rotta → chiudi, si riconnetterà al prossimo invio.
        CloseHandle(g_pipe);
        g_pipe = INVALID_HANDLE_VALUE;
    }
}

void Shutdown() {
    std::lock_guard<std::mutex> lock(g_mutex);
    if (g_pipe != INVALID_HANDLE_VALUE) {
        CloseHandle(g_pipe);
        g_pipe = INVALID_HANDLE_VALUE;
    }
}

} // namespace overlay
} // namespace gs
