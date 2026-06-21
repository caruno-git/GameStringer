# Checklist Collaudo End-to-End — Flusso Hero Ren'Py

> Gate di release v2.0 (vedi `docs/TODO.md`): l'hero è "pronto" quando 4-5 giochi
> Ren'Py reali passano end-to-end senza intervento manuale. Questa checklist
> serve a fare quel collaudo e a far emergere i bug veri (encoding, font, tag,
> interpolazione, dialoghi vs menu vs UI).
>
> Pipeline sotto test: pulsante hero `startAutoTranslate` → `runRenpyTranslation`
> (`lib/renpy-translate.ts`) → `extract_all_renpy_strings` → `offline_translate_batch_context`
> (Ollama, glossario + voce) → `generate_renpy_translation` (`src-tauri/.../renpy_patcher.rs`).

## 0. Prerequisiti

- [ ] **Ollama in esecuzione** con almeno un modello adatto installato (default `gemma4:e4b`; override via localStorage `gs_renpy_model`). Verifica: l'app non deve mostrare "Ollama non è in esecuzione".
- [ ] **Build dell'app** aggiornata con le ultime modifiche (`npm run tauri:dev` o build).
- [ ] **Gate CI verdi** prima del collaudo: `cd src-tauri ; cargo test --lib` (atteso: `renpy_patcher` 89 + `context_tests` 3 verdi) e `npx tsc --noEmit` (0 errori).
- [ ] **Gioco Ren'Py reale** disponibile, preferibilmente piccolo e in inglese per il primo giro (poche centinaia di stringhe). Tenere a portata anche **una VN più grande** e **una con testo non-latino** per i casi limite.
- [ ] **Backup della cartella del gioco** (o copia di lavoro): il flusso scrive in `game/tl/<lang>/` ma è bene poter ripartire pulito.

## 1. Setup del caso di test

- [ ] Annotare: titolo gioco, versione Ren'Py, n° file `.rpy`, lingua sorgente, lingua target (`it` di default).
- [ ] Confermare che il gioco parte **non tradotto** prima del test (stato di riferimento).
- [ ] Cartella `game/tl/` assente o vuota per `<lang>` (parti da zero; vedi §7 per il resume).

## 2. Esecuzione dal pulsante hero

- [ ] Aprire il dettaglio del gioco → motore rilevato come **Ren'Py**.
- [ ] Premere il pulsante hero ("STRING IT!" / Traduci).
- [ ] Seguire i toast di progresso nell'ordine atteso: **estrazione → carico glossario → traduzione N/M (ripresa salvata) → genero i file tl/ → Tradotto: X/Y**.
- [ ] Il toast finale riporta `X/Y stringhe` e, se presente, `(glossario: N termini)`.
- [ ] Nessun errore "Ollama avviato?" o eccezioni in console.

## 3. Verifica dei file generati (`game/tl/<lang>/`)

- [ ] Esiste `gamestringer_say_filter.rpy` (dialoghi/narrazione/menu via filtro runtime).
- [ ] Dentro il filtro: blocco `init 1900 python:`, dizionario `__gs_tl = { ... }`, gating `renpy.game.preferences.language == __gs_lang`, e `config.say_menu_text_filter = __gs_say_filter`.
- [ ] Esistono i file `*_<lang>.rpy` con blocco `translate <lang> strings:` per il **testo UI** delle screen (coppie `old`/`new`).
- [ ] Le **chiavi** del dizionario corrispondono al testo runtime (niente doppio escape: `\"` singolo, non `\\\"`).
- [ ] I **placeholder** Ren'Py nelle traduzioni sono intatti: tag `{...}`, interpolazione `[var]`, escape `\n`/`\t` (non devono risultare tradotti o rotti dal masking).

## 4. Verifica in gioco (la prova del nove)

- [ ] Avviare il gioco → menu lingue → **selezionare la lingua tradotta**.
- [ ] **Dialoghi**: i `say` dei personaggi appaiono tradotti (è il caso che il vecchio formato `old/new` NON copriva).
- [ ] **Narrazione**: le righe senza personaggio sono tradotte.
- [ ] **Scelte di menu**: le opzioni sono tradotte.
- [ ] **UI/screen**: pulsanti e label tradotti (preferenze, salva/carica, ecc.).
- [ ] **Interpolazione**: una riga con `[player_name]`/`[var]` mostra il valore corretto a runtime (placeholder non tradotto).
- [ ] **Tag testo**: `{b}`, `{i}`, `{color=#...}`, `{w}` continuano a funzionare (formattazione/timing preservati).
- [ ] **Tornando alla lingua originale**, il gioco mostra di nuovo il testo originale (il filtro è gated su `preferences.language`).

## 5. Casi limite / robustezza

- [ ] **Encoding**: gioco con accenti/caratteri speciali nei dialoghi → resi correttamente (UTF-8, niente `Ã¨` ecc.).
- [ ] **Virgolette nei dialoghi**: una riga con `\"...\"` resa correttamente in gioco.
- [ ] **Stringhe multilinea** / triple-quote: tradotte senza rompere l'a-capo.
- [ ] **Filtro preesistente**: se il gioco definisce già un `config.say_menu_text_filter`, il nostro lo **concatena** (testo non in dizionario passa al filtro originale) — verificare che non rompa funzioni del gioco.
- [ ] **CJK / non-latino** (giro separato): senza registrazione font dedicata il testo tradotto in cinese/giapponese/coreano può apparire come tofu □□□. Annotare come limite noto (font CJK è il prossimo task).

## 6. Glossario + voce personaggio

- [ ] Con un **glossario** popolato per il gioco (termini locked/synced): i nomi/termini chiave appaiono **coerenti** e i `doNotTranslate` restano invariati.
- [ ] Senza glossario: il flusso procede comunque (toast senza conteggio termini).
- [ ] **Voce**: righe dello stesso personaggio mantengono un registro coerente (effetto del contesto `character` passato all'LLM). Valutazione qualitativa su 2-3 personaggi.

## 7. Checkpoint / resume

- [ ] Esiste `gs_renpy_progress_<lang>.json` nella cartella del gioco dopo il run.
- [ ] **Interrompere** un job lungo a metà (chiusura), poi **rilanciare**: riparte dalle stringhe mancanti (il toast riprende da N>0, non da 0).
- [ ] A fine job, le traduzioni parziali salvate sono coerenti con i file `tl/` finali.

## 8. Criteri di PASS (gate hero)

- [ ] Dialoghi + narrazione + menu + UI **tutti tradotti in gioco**, senza intervento manuale.
- [ ] Nessun placeholder/tag rotto, nessun crash all'avvio del gioco tradotto.
- [ ] Resume funzionante.
- [ ] Ripetuto con esito positivo su **4-5 giochi Ren'Py reali** (set curato) → hero pronto.

## 9. Se fallisce — cosa annotare

Per ogni problema: titolo gioco, file `.rpy` e riga, stringa originale, output atteso vs ottenuto, e in quale fase (estrazione / traduzione / generazione / runtime). Allegare l'estratto rilevante di `game/tl/<lang>/gamestringer_say_filter.rpy` o del `*_<lang>.rpy`. Casi tipici da sorvegliare: stringhe non estratte (parser), placeholder mangiati (masking), chiavi che non combaciano (escape/de-escape), dialoghi non sostituiti (gating lingua o filtro non agganciato).
