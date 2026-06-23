# Checklist Collaudo End-to-End — Flusso Hero RPG Maker MV/MZ

> Secondo motore hero (vedi `docs/TODO.md`). Marketing: To the Moon, OMORI, Yume Nikki (NB: Yume Nikki
> è RPG Maker **classico** → OCR, non questo flusso). "Pronto" quando 4-5 giochi **MV/MZ** reali passano
> end-to-end senza intervento manuale.
>
> Pipeline sotto test: pulsante hero `startAutoTranslate` → branch MV/MZ → `runRpgmakerTranslation`
> (`lib/rpgmaker-translate.ts`) → `detect_rpgmaker_game` (solo MV/MZ) → `extract_all_rpgmaker_strings`
> → `offline_translate_batch_context` (Ollama, **glossario**, no voce) → per file: `save_file_with_backup`
> + `apply_rpgmaker_translations` **in place**. Avanzamento nel **pannello stepper**.
>
> ⚠️ **Invasivo**: i JSON di `data/` (o `www/data/`) vengono SOVRASCRITTI. Per ogni file modificato si crea
> un backup ripristinabile in `data/.gamestringer_backups/` (`restore_backup`). Tieni comunque una copia del gioco.

## 0. Prerequisiti

- [ ] **Ollama in esecuzione** con un modello adatto (default `gemma4:e4b`; override `gs_rpgmaker_model`).
- [ ] **Build app** aggiornata. **Gate CI verdi**: `cd src-tauri ; cargo test --lib` (`rpgmaker_patcher` 23 verdi) e `npx tsc --noEmit` (0 errori).
- [ ] **Gioco RPG Maker MV/MZ reale** (data in `data/` o `www/data/`, file `.json`). Per il primo giro uno piccolo/in inglese.
- [ ] **Copia di backup del gioco** (oltre al backup automatico per-file).

## 1. Scoping (MV/MZ vs classico)

- [ ] Aprire il dettaglio gioco → motore **RPG Maker** rilevato.
- [ ] Per un gioco **classico** (RPG_RT 2000/2003): il pulsante mostra il **messaggio onesto** ("non supportato file-based, usa OCR") + azione **"Apri OCR"**, NON il dirottamento silenzioso. (Regressione issue scoping.)
- [ ] Per un gioco **MV/MZ**: parte la pipeline file-based (sotto).

## 2. Esecuzione dal pulsante hero (MV/MZ)

- [ ] Il **pulsante** si disabilita + spinner + `Traduzione N/M` (no doppio-click).
- [ ] Il **pannello stepper** mostra: 🔍 Rilevamento → 📂 Estrazione → 📖 Glossario → ✨ Traduzione AI (N/M) → 💾 Backup + applica ai file.
- [ ] A fine job il pannello mostra il **risultato**: % successo, durata, `X/Y stringhe`, `N file`, glossario se presente.
- [ ] Nessun errore "Ollama avviato?" né eccezioni in console.

## 3. Verifica dei file + backup

- [ ] Esiste `data/.gamestringer_backups/` con le copie timestamp dei file modificati.
- [ ] I file `data/*.json` modificati sono **JSON validi** (l'app non deve crashare al lancio).
- [ ] Solo i file con stringhe sono stati toccati (gli altri restano invariati).
- [ ] Checkpoint `gs_rpgmaker_progress_<lang>.json` presente nella cartella del gioco.

### 3b. Validazione automatica (oggettiva)

```
node scripts/validate-rpgmaker.js "<percorso gioco>" <lang>
# es: node scripts/validate-rpgmaker.js "C:/Games/ToTheMoon" it
```

- [ ] Riporta: JSON validi (0 corrotti), **backup presente**, stringhe tradotte dal checkpoint, **codici `\C[n]`/`%d` rotti = 0**.
- [ ] **ESITO: ✅ PASS**.

## 4. Verifica in gioco (la prova del nove)

- [ ] Avviare il gioco → **dialoghi/eventi, menu, oggetti/skill, testi di sistema** appaiono tradotti.
- [ ] **Codici di controllo** intatti: `\C[n]` (colore), `\V[n]` (variabile), `\N[n]` (nome attore), `\I[n]` (icona), `\.`/`\|`/`\!` (timing) funzionano.
- [ ] **Nomi/termini** coerenti col glossario (oggetti, skill, personaggi).
- [ ] Nessun glitch di a-capo / overflow nelle finestre messaggio.

## 5. Casi limite / robustezza

- [ ] **Encoding**: accenti/caratteri speciali resi correttamente (UTF-8).
- [ ] **MZ vs MV**: provare entrambe le versioni (struttura data leggermente diversa).
- [ ] **www/data** (build deploy MV) vs **data** (editor): la pipeline trova la cartella giusta.
- [ ] **Resume**: interrompere un job lungo, rilanciare → riparte dalle stringhe mancanti (checkpoint).
- [ ] **Ripristino**: `restore_backup` (o copia da `.gamestringer_backups`) riporta il gioco all'originale.

## 6. Criteri di PASS (gate hero)

- [ ] `node scripts/validate-rpgmaker.js` → **PASS** (JSON validi, backup presente, 0 codici rotti).
- [ ] Testi tradotti in gioco senza intervento manuale; nessun crash; codici intatti.
- [ ] Resume + ripristino funzionanti.
- [ ] Ripetuto con esito positivo su **4-5 giochi MV/MZ reali** (set curato) → hero MV/MZ pronto.

## 7. Se fallisce — cosa annotare

Titolo gioco, versione (MV/MZ), file `data/*.json` e percorso JSON, stringa originale, atteso vs ottenuto, fase (detect / estrazione / traduzione / apply / runtime). Casi tipici: stringhe non estratte (parser eventi), codici `\C[n]` rotti dalla traduzione (validati e scartati: compaiono come non tradotte), JSON corrotto dall'apply (segnalare subito), data dir errata (`data` vs `www/data`).
