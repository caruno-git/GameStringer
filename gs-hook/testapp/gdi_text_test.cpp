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

        RECT rcEn = { 20, 260, 560, 320 };
        const wchar_t* en2 =
            L"The old merchant smiles and says: welcome back, traveler.";
        DrawTextW(hdc, en2, -1, &rcEn, DT_WORDBREAK | DT_NOPREFIX);

        // 6) Riga INGLESE disegnata GLIFO-PER-GLIFO: una ExtTextOutW per carattere
        //    (count=1), avanzando X a mano. Simula gli engine (RPG Maker, VN…) che
        //    blittano un glifo alla volta. gs-hook deve COALESCERE i glifi, e col
        //    suppress-and-redraw ridisegnare la frase TRADOTTA (en->it).
        const wchar_t* en3 = L"A wild slime appears before you.";
        {
            int gx = 20;
            const int gy = 340;
            for (const wchar_t* c = en3; *c; ++c) {
                ExtTextOutW(hdc, gx, gy, 0, nullptr, c, 1, nullptr);
                SIZE sz{};
                GetTextExtentPoint32W(hdc, c, 1, &sz);
                gx += sz.cx;
            }
        }

        // 7) Riga resa SOLO via GetGlyphOutlineW + blit manuale del bitmap del
        //    glifo: NESSUNA chiamata a TextOut/ExtTextOut. Simula fedelmente gli
        //    engine (RPG Maker/RPG_RT, molte VN) che chiedono il bitmap di ogni
        //    glifo e lo disegnano da sé. La sorgente GDI/GetGlyphOutline deve
        //    ricostruire la frase dalla sequenza di caratteri richiesti.
        const wchar_t* en4 = L"The dragon roars from the mountain.";
        {
            MAT2 mat{};
            mat.eM11.value = 1;            // matrice identità (no trasformazione)
            mat.eM22.value = 1;
            static BYTE gbuf[64 * 64];     // ampio per font UI normali
            const COLORREF tc = RGB(20, 20, 20);
            int penX = 20;
            const int baselineY = 392;     // baseline della riga
            for (const wchar_t* pc = en4; *pc; ++pc) {
                GLYPHMETRICS gm{};
                DWORD n = GetGlyphOutlineW(hdc, *pc, GGO_GRAY8_BITMAP, &gm,
                                           sizeof(gbuf), gbuf, &mat);
                if (n != GDI_ERROR && gm.gmBlackBoxX > 0 && gm.gmBlackBoxY > 0) {
                    const UINT pitch = (gm.gmBlackBoxX + 3) & ~3u; // righe a 4 byte
                    const int ox = penX + gm.gmptGlyphOrigin.x;
                    const int oy = baselineY - gm.gmptGlyphOrigin.y;
                    for (UINT row = 0; row < gm.gmBlackBoxY; ++row) {
                        for (UINT col = 0; col < gm.gmBlackBoxX; ++col) {
                            int a = gbuf[row * pitch + col]; // 0..64
                            if (a <= 0) continue;
                            if (a > 64) a = 64;
                            int r = (255 * (64 - a) + GetRValue(tc) * a) / 64;
                            int g = (255 * (64 - a) + GetGValue(tc) * a) / 64;
                            int b = (255 * (64 - a) + GetBValue(tc) * a) / 64;
                            SetPixel(hdc, ox + (int)col, oy + (int)row, RGB(r, g, b));
                        }
                    }
                }
                penX += gm.gmCellIncX ? gm.gmCellIncX : 8; // avanzamento del glifo
            }
        }

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
        CW_USEDEFAULT, CW_USEDEFAULT, 620, 520,
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
