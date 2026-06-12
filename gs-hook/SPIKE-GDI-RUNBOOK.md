# Spike GDI — Runbook build & test (go/no-go)

Obiettivo: verificare end-to-end che `gs-hook.dll` venga iniettata dall'app nel
processo di un gioco **GDI** reale e che la sorgente GDI (livello L2) si attivi e
intercetti testo.

Architettura scelta: **dual-arch**. La DLL e l'injector helper sono compilati sia
x64 sia x86 (Win32); il backend rileva il bitness del target e usa la coppia
giusta.

---

## 0. Prerequisiti

- Windows x64
- Visual Studio 2022 (o Build Tools) con toolset C++ **x64 e x86**
- CMake ≥ 3.20 nel PATH
- Node + toolchain Tauri già funzionanti (`npm run tauri:dev` parte)
- [DebugView](https://learn.microsoft.com/sysinternals/downloads/debugview)
  (opzionale: i log finiscono comunque su file)

---

## 1. Build dual-arch della DLL + injector

Dalla root del repo, in PowerShell:

```powershell
.\gs-hook\build-all.ps1
```

Cosa fa: configura e builda `gs-hook` per `x64` e `Win32`, poi copia gli
artefatti in:

```
src-tauri\resources\gs-hook\x64\gs-hook.dll
src-tauri\resources\gs-hook\x64\gs-injector.exe
src-tauri\resources\gs-hook\x86\gs-hook.dll
src-tauri\resources\gs-hook\x86\gs-injector.exe
```

> Questi path sono già referenziati in `tauri.conf.json → bundle.resources`, così
> finiscono accanto all'eseguibile nel bundle.

---

## 2. Avvia l'app

```powershell
npm run tauri:dev
```

> **Nota dev:** il backend cerca le risorse in
> `<cartella-exe>\resources\gs-hook\<arch>\`. In `tauri dev` l'exe è in
> `src-tauri\target\debug\`. Se l'injection segnala *"DLL gs-hook non trovata in
> …"*, copia lì le risorse:
> ```powershell
> Copy-Item -Recurse -Force src-tauri\resources\gs-hook src-tauri\target\debug\resources\
> ```
> Il messaggio d'errore stampa sempre il path esatto cercato, quindi è
> auto-diagnosticante.

---

## 3. Scegli un target GDI ed eseguilo

Target GDI classici (testo disegnato con `TextOutW`/`ExtTextOutW`/`DrawTextW`):

- RPG Maker 2000/2003 (giochi a **32-bit** → userà la build **x86**)
- Vecchi giochi Win32/MFC
- Un'app GDI di prova a 64-bit per validare anche il path x64

Avvia il gioco e prendi nota del **nome del processo** (es. `Game.exe`).

---

## 4. Inietta dall'app (passando dal gate)

L'injection è esposta come comando Tauri `inject_gs_hook(process_name)`. Per lo
spike puoi invocarlo dalla devtools console del webview:

```js
await window.__TAURI__.core.invoke('inject_gs_hook', { processName: 'Game.exe' })
```

Esiti possibili nel valore di ritorno `{ success, message }`:

- `success: true` → injection riuscita (vedi log DLL al punto 5)
- gate anti-cheat → `"Injection negata dal gate anti-cheat: …"` (atteso se il
  target ha un anti-cheat: è il **blocco rigido** voluto)
- `"Processo … non trovato"` → nome processo errato
- `"DLL/Injector non trovato in …"` → vedi nota dev al punto 2

---

## 5. Verifica i log della DLL (criterio go/no-go)

`gs-hook` logga su **`%TEMP%\gs-hook.log`** (e su `OutputDebugString`, visibile
in DebugView). Override con la env var `GS_HOOK_LOG`.

```powershell
Get-Content -Wait "$env:TEMP\gs-hook.log"
```

### ✅ GO se vedi:

```
[gs-hook] sorgente attiva: <nome sorgente GDI> (livello 2)
```

…ed eventuali righe di testo intercettato dal gioco.

### ⚠️ Parziale:

```
[gs-hook] nessuna sorgente di testo attivabile in questo processo
```

→ DLL iniettata e funzionante (MinHook init OK) ma la sorgente GDI non si è
attivata su quel target: cambia gioco o indaga la sorgente GDI.

### ❌ NO-GO:

- nessun file di log creato → la DLL non è entrata (controlla arch/injector, exit
  code dell'helper nel `message`)
- crash del gioco all'injection → problema nella DLL/hook

---

## Note tecniche

- **Perché un injector helper esterno?** Il backend Tauri è x64. Iniettare in un
  processo a 32-bit richiede l'indirizzo di `LoadLibraryW` del kernel32 *a 32-bit*
  del target, non quello dell'host x64. L'helper, compilato nella stessa arch del
  target, risolve il problema senza WoW64 PE-parsing nel backend.
- **Il gate resta in Rust**, prima dello spawn dell'helper
  (`assert_injection_allowed`). L'helper non contiene logica anti-cheat ed è un
  dettaglio interno: non va mai lanciato a mano bypassando il backend.
- **Artefatti non versionati:** `build-x64/`, `build-x86/` e i binari in
  `resources/gs-hook/**` sono in `.gitignore`; si rigenerano con `build-all.ps1`.
