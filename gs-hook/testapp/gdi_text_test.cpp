// gdi-texttest — target GDI di prova per validare l'injection di gs-hook.
//
// Apre una finestra e, a ogni WM_PAINT, disegna testo con le API GDI classiche
// che la sorgente L2 di gs-hook intercetta:
//   - TextOutW
//   - ExtTextOutW
//   - DrawTextW
//
// Un timer da 500 ms invalida la finestra, così il testo viene ridisegnato in
// continuazione: dopo l'injection dovresti vedere le righe intercettate nel log
// (%TEMP%\gs-hook.log).
//
// Volutamente minimale: nessuna dipendenza, nessun anti-cheat. Serve solo a
// fornire un bersaglio GDI deterministico, identico su x64 e x86 (il backend
// sceglie la coppia DLL/injector in base al bitness di QUESTO processo).
//
// Nome processo (per inject_gs_hook): "gdi-texttest.exe".

#include <Windows.h>
#include <cstdio>
#include <cwchar>

static int g_tick = 0;

static const wchar_t* kBitness =
#if defined(_WIN64)
    L"x64";
#else
    L"x86";
#endif

LRESULT CALLBACK WndProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam) {
    switch (msg) {
    case WM_CREATE:
        // ~2 ridisegni al secondo: genera traffico GDI continuo per il hook.
        SetTimer(hwnd, 1, 500, nullptr);
        return 0;

    case WM_TIMER:
        ++g_tick;
        InvalidateRect(hwnd, nullptr, TRUE);
        return 0;

    case WM_PAINT: {
        PAINTSTRUCT ps;
        HDC hdc = BeginPaint(hwnd, &ps);

        SetBkMode(hdc, TRANSPARENT);
        SetTextColor(hdc, RGB(20, 20, 20));

        wchar_t line1[256];
        std::swprintf(line1, 256,
                      L"gs-hook GDI test  [%s]  PID=%lu  tick=%d",
                      kBitness, GetCurrentProcessId(), g_tick);

        // 1) TextOutW — il caso più diretto.
        TextOutW(hdc, 20, 20, line1, (int)std::wcslen(line1));

        // 2) ExtTextOutW — variante con opzioni.
        const wchar_t* line2 = L"ExtTextOutW: dialogo di prova del gioco.";
        ExtTextOutW(hdc, 20, 50, ETO_OPAQUE, nullptr, line2,
                    (UINT)std::wcslen(line2), nullptr);

        // 3) DrawTextW — usato spesso per testo formattato/in box.
        RECT rc = { 20, 80, 560, 140 };
        wchar_t line3[256];
        std::swprintf(line3, 256,
                      L"DrawTextW: questa riga viene ridisegnata di continuo "
                      L"(tick %d). Inietta gs-hook e controlla il log.",
                      g_tick);
        DrawTextW(hdc, line3, -1, &rc, DT_WORDBREAK | DT_NOPREFIX);

        // 4) Paragrafo multi-riga reso a mano con TextOutW su righe consecutive
        //    (stesso margine sinistro X=20, passo verticale 20px). Simula un gioco
        //    che disegna una battuta su piu righe: il coalescer deve UNIRLE in una
        //    sola frase grazie al merge verticale.
        const wchar_t* p1 = L"Paragrafo multi-riga: questa battuta";
        const wchar_t* p2 = L"prosegue su righe consecutive";
        const wchar_t* p3 = L"e va unita in una sola frase.";
        TextOutW(hdc, 20, 150, p1, (int)std::wcslen(p1));
        TextOutW(hdc, 20, 170, p2, (int)std::wcslen(p2));
        TextOutW(hdc, 20, 190, p3, (int)std::wcslen(p3));

        // 5) Testo INGLESE per validare la SOSTITUZIONE en→it: con una cache
        //    pre-seedata (env GS_HOOK_CACHE) gs-hook deve ridisegnare l'ITALIANO.
        //    Stringhe statiche (niente tick) = match esatto in cache.
        const wchar_t* en1 = L"You found a mysterious key!";
        ExtTextOutW(hdc, 20, 230, 0, nullptr, en1,
                    (UINT)std::wcslen(en1), nullptr);

        RECT rcEn = { 20, 260, 560, 330 };
        const wchar_t* en2 =
            L"The old merchant smiles and says: welcome back, traveler.";
        DrawTextW(hdc, en2, -1, &rcEn, DT_WORDBREAK | DT_NOPREFIX);

        EndPaint(hwnd, &ps);
        return 0;
    }

    case WM_DESTROY:
        KillTimer(hwnd, 1);
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
    std::swprintf(title, 128, L"gs-hook GDI test (%s) - PID %lu",
                  kBitness, GetCurrentProcessId());

    HWND hwnd = CreateWindowExW(
        0, cls, title, WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT, 620, 430,
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
