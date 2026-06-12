#pragma once
//
// gs_log.h — logging minimale per gs-hook (spike e oltre).
//
// Scrive OGNI riga su DUE destinazioni:
//   1. OutputDebugString  → visibile in DebugView (Sysinternals)
//   2. un file di testo    → cattura facile dei log dello spike, anche senza
//                            DebugView aperto e anche se il gioco crasha.
//
// Il file è UTF-8, in append, in %TEMP%\gs-hook.log (override con la env var
// GS_HOOK_LOG, es. GS_HOOK_LOG=C:\temp\gs.log). Apertura/chiusura per riga: è
// lento ma robusto (nessun buffer perso su crash) e per uno spike va benissimo.
//
// Header-only e tutto `inline`: nessuna modifica al CMake, nessun problema ODR.
//
#include <Windows.h>
#include <string>
#include <mutex>
#include <cstdio>
#include <cstring>

namespace gs {

inline std::mutex& LogMutex() {
    static std::mutex m;
    return m;
}

// Path del file di log, calcolato una sola volta.
inline const std::wstring& LogFilePath() {
    static const std::wstring path = [] {
        // 1) override esplicito via env var GS_HOOK_LOG
        wchar_t override_buf[MAX_PATH] = {0};
        DWORD n = GetEnvironmentVariableW(L"GS_HOOK_LOG", override_buf, MAX_PATH);
        if (n > 0 && n < MAX_PATH) {
            return std::wstring(override_buf, n);
        }
        // 2) default: %TEMP%\gs-hook.log
        wchar_t tmp[MAX_PATH] = {0};
        DWORD t = GetTempPathW(MAX_PATH, tmp);
        std::wstring p = (t > 0 && t < MAX_PATH) ? std::wstring(tmp, t) : std::wstring(L".\\");
        p += L"gs-hook.log";
        return p;
    }();
    return path;
}

inline void LogAppendUtf8(const char* bytes, size_t len) {
    std::lock_guard<std::mutex> lock(LogMutex());
    FILE* f = nullptr;
    if (_wfopen_s(&f, LogFilePath().c_str(), L"ab") == 0 && f) {
        fwrite(bytes, 1, len, f);
        fclose(f);
    }
}

// Logga una riga wide (la riga dovrebbe già includere il '\n' finale).
inline void LogLineW(const std::wstring& line) {
    OutputDebugStringW(line.c_str());
    int len = WideCharToMultiByte(CP_UTF8, 0, line.c_str(), (int)line.size(),
                                  nullptr, 0, nullptr, nullptr);
    if (len <= 0) return;
    std::string utf8((size_t)len, '\0');
    WideCharToMultiByte(CP_UTF8, 0, line.c_str(), (int)line.size(),
                        &utf8[0], len, nullptr, nullptr);
    LogAppendUtf8(utf8.data(), utf8.size());
}

// Logga una riga ASCII/narrow (la riga dovrebbe già includere il '\n' finale).
inline void LogLineA(const char* msg) {
    if (!msg) return;
    OutputDebugStringA(msg);
    LogAppendUtf8(msg, std::strlen(msg));
}

} // namespace gs
