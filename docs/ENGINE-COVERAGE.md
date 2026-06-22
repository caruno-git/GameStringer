# Matrice copertura engine × stato

> Generata il 2026-06-14 · HEAD `8bd22fb2` · classificazione **solo su evidenza dura** (codice nel repo).

## Metodologia

Lo stato di ogni engine è derivato **esclusivamente** da fatti verificabili nel
codice, non da stime. I tre segnali usati:

1. **Comandi registrati** — numero di `#[tauri::command]` di quel modulo presenti
   nell'`invoke_handler` di `src-tauri/src/main.rs` (= l'engine è raggiungibile
   dall'app).
2. **Test unitari** — numero di `#[test]` / `#[tokio::test]` nel modulo Rust
   (Vitest dove indicato).
3. **Aggancio auto-pipeline** — routing esplicito in `startAutoTranslate()`
   (`components/game-detail-client.tsx`) o pulsante UI dedicato.

### Legenda stato

| Stato | Criterio (evidenza dura) |
|-------|--------------------------|
| ✅ **Testato** | Registrato **e** suite di test Rust sostanziale che esercita parsing/patch su fixture |
| 🟡 **Registrato, non testato** | Raggiungibile dall'app ma **0 test unitari** (tipico dei moduli runtime WinAPI) |
| ⚪ **Non agganciato / WIP** | Modulo presente nel sorgente ma **0 comandi** registrati |

> ⚠️ **Limite della classificazione.** "Testato" significa che il parser/patcher
> è coperto da test su fixture — **non** garantisce il funzionamento end-to-end
> sul gioco reale (font, encoding, varianti di formato, anti-cheat). È la prova
> più forte disponibile in repo, non un collaudo sul campo.

---

## Patcher file-based (parsing/patch su file del gioco)

| Engine | Modulo | Comandi | Test | Stato |
|--------|--------|:------:|:----:|-------|
| Unity (file/asset patcher) | `unity_patcher` | 11 | 122 | ✅ Testato |
| Danganronpa | `danganronpa_patcher` | 25 | 93 (+1 Vitest) | ✅ Testato |
| CRI Middleware (Persona/Yakuza/Tales…) | `cri_patcher` | 5 | 87 | ✅ Testato |
| Visionaire Studio 5 | `visionaire_patcher` | 5 | 83 | ✅ Testato |
| Ren'Py | `renpy_patcher` | 7 | 82 | ✅ Testato |
| GameMaker | `gamemaker_patcher` | 5 | 77 | ✅ Testato |
| Bethesda (BSA/BA2/ESP) | `bethesda_patcher` | 6 | 54 | ✅ Testato |
| Wolf RPG | `wolfrpg_patcher` | 8 | 51 | ✅ Testato |
| TyranoScript | `tyranoscript_patcher` | 5 | 49 | ✅ Testato |
| Godot (PCK) | `godot_patcher` | 5 | 46 | ✅ Testato |
| Unreal (file patcher) | `unreal_patcher` | 9 | 42 | ✅ Testato |
| RPG Maker (MV/MZ file-based) | `rpgmaker_patcher` | 9 | 23 | ✅ Testato |

RPG Maker ha inoltre routing esplicito in `startAutoTranslate()`: i giochi
RPG_RT classici (2000/2003, senza stringhe estraibili) vengono instradati alla
**traduzione live OCR** invece che al patch file-based.

### Universal Injector (auto-detect dispatcher, file-based)

| Funzione | Modulo | Comandi | Test | Stato |
|----------|--------|:------:|:----:|-------|
| Auto-detect engine + setup traduzione | `universal_injector` | 3 | 0 | 🟡 Registrato, non testato |

Tool cross-engine raggiungibile da `/injector` (sidebar gruppo Patcher). Espone
`detect_game_engine`, `inject_translation_hook`, `list_translatable_files`. È
**puro filesystem e cross-platform** (niente WinAPI: rileva l'engine dai file su
disco e prepara cartelle/config di traduzione), quindi non rientra nei moduli
runtime Windows-only né passa dal gate anti-cheat. Mancano test unitari su
fixture per la rilevazione engine.

---

## Ecosistema Unity / Unreal aggiuntivo

| Engine/Funzione | Modulo | Comandi | Test | Stato |
|-----------------|--------|:------:|:----:|-------|
| Unreal localization | `unreal_localization` | 12 | 0 | 🟡 Registrato, non testato |
| Unity bundle | `unity_bundle` | 8 | 0 | 🟡 Registrato, non testato |
| Unity localization | `unity_localization` | 6 | 0 | 🟡 Registrato, non testato |
| Unity .assets manager | `unity_assets` | 6 | 0 | 🟡 Registrato, non testato |
| Unity asset injector (runtime) | `unity_asset_injector` | 3 | 0 | 🟡 Registrato, non testato |
| Unity injector (runtime) | `unity_injector` | 3 | 0 | 🟡 Registrato, non testato |
| Unreal IoStore | `unreal_iostore` | 2 | 0 | 🟡 Registrato, non testato |
| Unity CSV | `unity_csv` | 1 | 0 | 🟡 Registrato, non testato |

---

## Runtime injection / overlay (Windows-only)

Per natura questi moduli agiscono sul processo in esecuzione (WinAPI), quindi non
sono coperti da test unitari su fixture. Su Linux esistono solo come stub
(vedi `platform_stubs.rs` e `scripts/check-linux-stubs.py`).

| Funzione | Modulo | Comandi | Test | Stato |
|----------|--------|:------:|:----:|-------|
| OCR runtime / overlay | `ocr_translator` | 24 | 12 | 🟡 Preprocessing testato; capture/overlay no |
| Memory injection | `injekt` | 14 | 0 | 🟡 Registrato, non testato |
| Anti-cheat gate | `anti_cheat` | 6 | 14 | 🟡 Logica gate testata; scan WinAPI no |
| Screen capture | `screen_capture` | 5 | 0 | 🟡 Registrato, non testato |
| Context injection | `context_injection` | 5 | 0 | 🟡 Registrato, non testato |
| UE translator (hook DLL) | `ue_translator` | 7 | 0 | 🟡 Registrato, non testato |
| Auto-hook scanner | `auto_hook` | 1 | 0 | 🟡 Registrato, non testato |
| GS-Hook injector (spike GDI) | `gs_hook_injector` | 1 | 0 | 🟡 Registrato, non testato |

L'infrastruttura OCR (start_ocr_translator / overlay) è completa e già agganciata
per RPG Maker classico. La **pipeline di preprocessing** (upscale nearest-neighbor,
contrasto, threshold, invert, dithering, denoise, sharpen, auto-detect palette) è
ora coperta da 12 test deterministici su fixture in-memory in
`src-tauri/src/ocr_translator/retro_preprocessor.rs` (valori esatti, non solo
dimensioni). Restano non testati la cattura schermo e l'overlay (WinAPI) e il
binding Tesseract, non riproducibili in CI.

**Gate anti-cheat** — la logica safety-critical (matching firme note, aggregazione
rischio, fail-closed, policy di compatibilità) è ora estratta in funzioni pure e
coperta da 14 test in `src-tauri/src/anti_cheat.rs`. Resta non testato lo scan
WinAPI vero (`get_running_processes` / `get_process_modules`), non riproducibile
in CI. Da questo commit la CI esegue `cargo test` sul job **check-windows**
(prima girava solo `cargo check`), **limitato ai suite validati** (`anti_cheat`,
`retro_preprocessor`): l'intera suite Rust (~1100 test, inclusi i patcher mai
girati in CI) non è ancora pulita e verrà gateata solo dopo la bonifica.

---

## Moduli ausiliari (supporto, non engine)

| Funzione | Modulo | Comandi | Test | Stato |
|----------|--------|:------:|:----:|-------|
| Video extractor (VMD/BIK/USM…) | `video_extractor` | 10 | 18 | ✅ Testato |
| Audio patcher | `audio_patcher` | 3 | 19 | ✅ Testato |
| Export PO/POT universale | `po_export` | 4 | 5 | ✅ Testato (leggero) |

---

## Gap noti (engine senza modulo dedicato)

Per onestà comparativa, engine diffusi **non** ancora coperti da un modulo
dedicato in `src-tauri/src/commands`: KiriKiri/KAG, Naninovel, NScripter,
Live Maker, SRPG Studio. (Alcuni titoli potrebbero comunque ricadere sotto OCR
runtime o injection generica, ma senza un patcher file-based specifico.)

---

## Come rigenerare

I conteggi provengono da:

- Comandi: `generate_handler![...]` in `src-tauri/src/main.rs`
- Test: `grep -c '#\[test\]\|#\[tokio::test\]'` sui moduli in `src-tauri/src/commands`
- Auto-pipeline: `startAutoTranslate()` in `components/game-detail-client.tsx`

Aggiornare questa matrice quando si aggiunge un engine (ricordando la regola di
progetto: agganciare sempre in `startAutoTranslate()`).
