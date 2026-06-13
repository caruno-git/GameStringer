// gdi-texttest — target GDI di prova per validare l'injection di gs-hook.
//
// MODELLO BACKBUFFER FEDELE A RPG_RT (2026-06-13):
// RPG Maker / RPG_RT (e molte VN) NON ridisegnano il testo a schermo glifo per
// glifo: compongono il frame su un BITMAP OFFSCREEN (back buffer) — dove ogni
// nuovo glifo viene disegnato UNA SOLA VOLTA con ExtTextOutW — e poi BitBltano
// l'intero buffer sulla finestra. BitBlt NON è agganciato dagli hook di testo,
// quindi gs-hook vede ESATTAMENTE la sequenza di glifi nuovi (uno per frame, mai
// ripetuti): nessun doppione, nessuna riga ridisegnata che spezzi il coalescer.
//
// Pipeline qui:
//   - WM_TIMER (45ms): disegna IL SOLO glifo nuovo sul DC offscreen (g_mem) con
//     ExtTextOutW(count=1), avanza la penna, poi InvalidateRect(FALSE) per
//     chiedere un blit.
//   - WM_PAINT: BitBlt g_mem -> finestra. NESSUNA ExtTextOut qui (quindi l'hook
//     non rivede i glifi già disegnati). EndPaint scatta ogni frame → alimenta
//     l'idle-flush del coalescer (chiusura frase a fine typewriter), come avviene
//     col render reale di RPG_RT.
//   - WM_ERASEBKGND: no-op (dipingiamo tutto via blit → niente flicker).
//
// Le 4 righe sono INGLESI e presenti in test-cache.gstc (env GS_HOOK_CACHE).
// Nome processo (per inject_gs_hook): "gdi-texttest.exe".

#include <Windows.h>
#include <cstdio>
#include <cwchar>

static const wchar_t* kBitness =
#if defined(_WIN64)
    L"x64";
#else
    L"x86";
#endif

static const wchar_t* const kLines[] = {
    L"You found a mysterious key!",
    L"A wild slime appears before you.",
    L"The old merchant smiles and says: welcome back, traveler.",
    L"The dragon roars from the mountain.",
};
static const int kNumLines = (int)(sizeof(kLines) / sizeof(kLines[0]));

static const int kMarginX = 20;
static const int kBaseY   = 30;
static const int kLineH   = 40;

// Back buffer offscreen (il "frame" che RPG_RT comporrebbe e poi blitta).
static HDC     g_mem = nullptr;
static HBITMAP g_bmp = nullptr;
static int     g_cw = 0, g_ch = 0;

// Stato typewriter.
static int g_line  = 0;
static int g_pos   = 0;
static int g_penX  = kMarginX;
static int g_phase = 0;   // 0 = TYPING, 1 = HOLD
static int g_hold  = 0;

enum { PHASE_TYPING = 0, PHASE_HOLD = 1 };

// (Ri)crea il back buffer alla dimensione del client e lo pulisce.
static void EnsureBackbuffer(HWND hwnd) {
    RECT rc{};
    GetClientRect(hwnd, &rc);
    const int w = rc.right - rc.left, h = rc.bottom - rc.top;
    if (w <= 0 || h <= 0) return;
    if (g_mem && w == g_cw && h == g_ch) return;

    HDC wdc = GetDC(hwnd);
    if (g_mem) { DeleteDC(g_mem); g_mem = nullptr; }
    if (g_bmp) { DeleteObject(g_bmp); g_bmp = nullptr; }
    g_mem = CreateCompatibleDC(wdc);
    g_bmp = CreateCompatibleBitmap(wdc, w, h);
    SelectObject(g_mem, g_bmp);
    ReleaseDC(hwnd, wdc);
    g_cw = w; g_ch = h;

    // Sfondo + setup testo (come un gioco che configura il suo DC offscreen).
    RECT all{ 0, 0, w, h };
    FillRect(g_mem, &all, (HBRUSH)(COLOR_WINDOW + 1));
    SetBkMode(g_mem, TRANSPARENT);
    SetTextColor(g_mem, RGB(20, 20, 20));
}

static void ClearBackbuffer() {
    if (!g_mem) return;
    RECT all{ 0, 0, g_cw, g_ch };
    FillRect(g_mem, &all, (HBRUSH)(COLOR_WINDOW + 1));
}

// Disegna un glifo sul back buffer e ritorna la sua larghezza.
static int DrawGlyphMem(int x, int y, wchar_t ch) {
    ExtTextOutW(g_mem, x, y, 0, nullptr, &ch, 1, nullptr);
    SIZE sz{};
    GetTextExtentPoint32W(g_mem, &ch, 1, &sz);
    return sz.cx;
}

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
    case WM_CREATE:
        SetTimer(hwnd, 1, 45, nullptr);   // ~22 fps, ritmo typewriter
        return 0;

    case WM_SIZE:
        EnsureBackbuffer(hwnd);
        return 0;

    case WM_ERASEBKGND:
        return 1;   // niente erase: dipingiamo tutto via blit

    case WM_TIMER: {
        EnsureBackbuffer(hwnd);
        if (!g_mem) return 0;

        if (g_phase == PHASE_TYPING) {
            const wchar_t* line = kLines[g_line];
            const int len = (int)wcslen(line);
            const int y = kBaseY + g_line * kLineH;

            if (g_pos < len) {
                // UN solo glifo nuovo sul back buffer (come RPG_RT).
                g_penX += DrawGlyphMem(g_penX, y, line[g_pos]);
                ++g_pos;
            } else if (g_line + 1 < kNumLines) {
                ++g_line;
                g_pos = 0;
                g_penX = kMarginX;
            } else {
                g_phase = PHASE_HOLD;
                g_hold = 45;   // ~2 s in pausa: scatta l'idle-flush sull'ultima riga
            }
        } else { // PHASE_HOLD
            if (--g_hold <= 0) {
                ClearBackbuffer();
                g_line = 0; g_pos = 0; g_penX = kMarginX;
                g_phase = PHASE_TYPING;
            }
        }

        // Chiede il blit del frame (il glifo va a schermo via BitBlt in WM_PAINT).
        InvalidateRect(hwnd, nullptr, FALSE);
        return 0;
    }

    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hwnd, &ps);
        EnsureBackbuffer(hwnd);
        if (g_mem)
            BitBlt(hdc, 0, 0, g_cw, g_ch, g_mem, 0, 0, SRCCOPY); // unhooked
        EndPaint(hwnd, &ps);   // → Hook_EndPaint → idle-flush del coalescer
        return 0;
    }

    case WM_DESTROY:
        KillTimer(hwnd, 1);
        if (g_mem) { DeleteDC(g_mem); g_mem = nullptr; }
        if (g_bmp) { DeleteObject(g_bmp); g_bmp = nullptr; }
        PostQuitMessage(0);
        return 0;
    }
    return DefWindowProcW(hwnd, msg, wParam, lParam);
}

int WINAPI wWinMain(HINSTANCE hInst, HINSTANCE, LPWSTR, int nCmdShow) {
    const wchar_t* cls = L"GsHookGdiTestWnd";

    WNDCLASSW wc = {};
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hInst;
    wc.hCursor       = LoadCursor(nullptr, IDC_ARROW);
    wc.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    wc.lpszClassName = cls;
    RegisterClassW(&wc);

    wchar_t title[128];
    std::swprintf(title, 128, L"gs-hook GDI typewriter test (%s) - PID %lu",
                  kBitness, GetCurrentProcessId());

    HWND hwnd = CreateWindowExW(
        0, cls, title, WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 720, 280,
        nullptr, nullptr, hInst, nullptr);
    if (!hwnd) return 1;

    ShowWindow(hwnd, nCmdShow);
    UpdateWindow(hwnd);

    MSG msg;
    while (GetMessage(&msg, nullptr, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }
    return (int)msg.wParam;
}
