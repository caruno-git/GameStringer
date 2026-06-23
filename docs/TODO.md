# 📋 TODO.md - GameStringer Development Tasks

> Ultimo aggiornamento: 23 Giugno 2026 — v1.10.2

---

## 🎯 RELEASE v2.0 — IL FLUSSO HERO

> **La promessa:** l'utente trascina la cartella di un gioco, preme **un pulsante**, e ottiene il gioco tradotto nella sua lingua. Tutto il resto della app (multi-LLM, glossario, voci, OCR, texture) sono *ingredienti* di questo piatto, non feature a sé.

### ⭐ "Un pulsante. Traduci il gioco."

**Principio di progetto — leggere prima di toccare codice:**
"Un pulsante" è la promessa *all'utente*, non magia universale. Sotto, la app **riconosce il motore** del gioco e instrada all'estrattore/ripacker giusto. L'utente vede un click; noi supportiamo **un motore alla volta, reso perfetto su un set curato di giochi**. Niente lotteria runtime, niente "test su un milione di giochi": si testa la *pipeline* su 4-5 titoli per motore.

**Esito audit (17/06/2026): la pipeline NON è da costruire — esiste già.** Router motore (`engine_detector.rs`, 48 motori), rilevamento, estrazione, generazione traduzione e il "pulsante" (`startAutoTranslate()` in `components/game-detail-client.tsx`) sono **tutti implementati**. Esistono 12 patcher file-based con test su fixture (vedi `docs/ENGINE-COVERAGE.md`). Il lavoro per la release **non è scrivere la pipeline, è collaudarla sul gioco reale e renderla impeccabile su UN motore.**

**Motore scelto per primo: Ren'Py** (confermato 17/06). Pipeline completa: `detect_renpy_game` → `extract_all_renpy_strings` → `generate_renpy_translation` → `save/load_renpy_translations`, già instradata in `startAutoTranslate()` (righe ~489-503). Perché Ren'Py come hero:
- **Output nativo, non invasivo**: `generate_renpy_translation` genera i blocchi `translate` nel sistema ufficiale di Ren'Py (cartella `tl/`) → niente ripacking di archivi, il gioco carica la traduzione nativamente.
- **Più solido**: 82 test su fixture (vs 23 di RPG Maker) → meno rischio per arrivare a "perfetto".
- **Pulito**: nessuna contaminazione OCR (RPG Maker classico dirotta su live OCR; Ren'Py no).
- **Domanda alta**: enorme scena di fan-translation di visual novel (DDLC, Katawa Shoujo, VA-11 Hall-A…).

- [x] **Audit di ciò che esiste già in casa** — *Fatto 17/06.* Pipeline Ren'Py completa in codice (detect → extract → generate → save). Gap reale = collaudo end-to-end + UX, non implementazione.
- [ ] **Collaudo end-to-end su gioco reale** — Nessuno dei 12 patcher è mai stato provato su un gioco vero start-to-finish ("Testato" = solo fixture, vedi nota in ENGINE-COVERAGE.md). Prendere un gioco Ren'Py reale, passarlo dal pulsante alla cartella `tl/` tradotta, verificare il risultato in gioco. Qui escono i bug veri (encoding, font CJK, stringhe interpolate, tag testo).
- [ ] **Verifica aggancio glossario / multi-LLM / voci personaggio** — Confermare che `startAutoTranslate()` per Ren'Py usi davvero auto-glossario + voci personaggio per la coerenza di tono (non solo traduzione riga-per-riga).
- [ ] **UX "un pulsante" rifinita** — Il pulsante esiste; renderlo l'esperienza-hero: stato chiaro, progress, output traduzione pronta, messaggio onesto sui motori non supportati.
- [ ] **QA su set curato** — 4-5 giochi Ren'Py reali tradotti end-to-end e verificati. Questo è il criterio di "hero pronto".

### 🚦 Gate di release (bloccanti)

- [ ] **3 gate CI verdi** — `tsc` (type-check) + ESLint + test devono passare.
- [ ] **Suite test 466 verde / 0 rossa** — Nessuna regressione.
- [ ] **Definizione di "fatto" per l'hero** — L'hero è pronto quando i 4-5 titoli del set curato passano end-to-end senza intervento manuale.

---

## 🌍 Localizzazione UI (11 lingue)

> Stato 23/06/2026 — copertura quasi piena su tutte le lingue. Guardia anti-regressione: `__tests__/lib/i18n-locale-integrity.test.ts` (chiavi allineate a `it.json`, zero leftover oltre baseline). Sorgenti: `lib/i18n/locales/<lang>.json` (~4.414 stringhe per lingua).

Stato per lingua:

- [x] **it** — lingua sorgente (100%)
- [x] **en** — 100%
- [x] **ru** — completata (issue #47, chiusa): ~97% cirillico, 0 residui italiani
- [x] **es / fr / de / pt / pl** — completate (EN→lingua, ~3.800 stringhe). Residui in baseline = cognati corretti identici all'italiano (es. "Sistema", "Data", "Tipo", "Tema", "Formato", "Temperatura", "Lista", "Legenda")
- [x] **ja / zh / ko** — completate (EN→lingua). ~80% caratteri nativi; il resto sono nomi propri, sigle e numeri (normale per UI CJK)

Manutenzione (ricorrente):

- [ ] Ogni nuova feature: aggiungere le nuove chiavi a **tutte e 11** le lingue, non solo a `it.json` — altrimenti il test `i18n-locale-integrity` fallisce (chiavi mancanti).
- [ ] Release: `scripts/release-all.js` (step 5) scrive il changelog i18n **solo in italiano** se manca una API key di traduzione → tradurre poi `changelog.vX_Y_Z` nelle altre 10 lingue (come fatto per v1.10.2).
- [ ] I "leftover italiani" residui in baseline (es/pt/fr/pl) sono cognati legittimi, **non** errori: non forzare traduzioni innaturali solo per azzerare il contatore.

---

## 🧊 POST-RELEASE — Roadmap motori

> Ogni nuovo motore è un traguardo a sé, con la stessa logica condizionale dell'item MelonLoader. Non "supporto 1000 giochi" — "supporto Ren'Py, poi RPG Maker, poi Unity…".

- [ ] **RPG Maker MV/MZ** — Secondo motore (il nome che fa marketing: To the Moon, OMORI, Yume Nikki…). Pipeline già completa (`detect_rpgmaker_game` → `extract_all_rpgmaker_strings` → `apply_rpgmaker_translations`), 23 test su fixture. Stesso lavoro di Ren'Py: collaudo end-to-end + UX. ⚠️ Scoping: RPG Maker *classico* (RPG_RT 2000/2003) è dirottato su **live OCR** in `game-detail-client.tsx` (~1552-1580) → l'hero va limitato a MV/MZ, con messaggio onesto sul classico invece del dirottamento silenzioso.
- [ ] **Unity** — *Attenzione: non partire da qui.* XUnity.AutoTranslator fa già traduzione a runtime via BepInEx → rischio di duplicare l'overlay live. IL2CPP / asset bundle sono complessi. Valutare solo dopo che l'hero RPG Maker è blindato.
- [ ] **Unreal Engine** — Estrazione/ripacking da `.pak`/`.locres`. Più complesso, dopo Unity.
- [ ] **MelonLoader come alternativa BepInEx IL2CPP** — Solo se arrivano ≥3 segnalazioni utente di giochi Unity IL2CPP dove `BepInEx v6.0.0-pre.2 IL2CPP` non aggancia. Richiede: nuove URL in `src-tauri/src/commands/unity_patcher.rs` (partire da MelonLoader `v0.7.3` (14 mag 2026, ultima stabile) + Il2CppInterop `1.5.1-ci.845`), build XUnity.AutoTranslator compatibile MelonLoader (probabile fork community come `sevenl72/XUnity.AutoTranslator` — verificare versione e manutenzione), logica di scelta loader nella UI "Gestisci patch", path installazione `Mods/` invece di `BepInEx/plugins/`. Stima: 1–2 giornate + QA su 3–4 giochi reali.

---

## 🔬 LABS — Fuoco d'artificio

> Demo che fanno cadere la mascella. Non bloccano la release; vivono in Labs perché più rischiose sulla qualità.

- [ ] **Fandub AI** — Generare una traccia doppiata del gioco con voci di personaggio coerenti. Infra già presente (Whisper → traduzione → TTS + profili voce). Rischio qualità su timing/voci → Labs, non flusso-hero.

---

## 💭 IDEE / FORSE (condizione-gated)

> Legittime ma non azionabili ora. Restano visibili senza occupare la strada. Da promuovere solo quando scatta una condizione reale.

- [ ] **Store PlayStation / Nintendo eShop** — Supporto store console, se fattibile.
- [ ] **Espandere Database Nomi** — Più giochi popolari per tutti gli store.
- [ ] **Real-time Collaboration** — Traduzione collaborativa in tempo reale.
- [ ] **Cloud Sync** — Sincronizzazione cloud per traduzioni e impostazioni.
- [ ] **Mobile Companion** — App mobile per gestione remota.
- [ ] **Plugin System** — Sistema di plugin per estensioni di terze parti.
- [ ] **Metriche aspirazionali** — `<3s startup`, `<100MB memory`, `99% uptime`, `<1s translation`. Da trattare come obiettivi solo dopo aver *misurato* un punto di partenza.

---

## 🧪 Verifica minore (non bloccante)

- [ ] **Test GUI runtime OCR live** — Overlay OCR L3 / RPG Maker classico e fallback "Traduzione live OCR" verificati solo staticamente. *Non è più il flusso-hero* (intestabile a runtime, non differenziante). Resta come verifica opportunistica quando capita un gioco a portata di mano.
- [x] **Community chat — diagnosi chiusa (17 giu 2026)** — NESSUN fix DB necessario: DB sano (817/817 profili, password bcrypt allineate, trigger `handle_new_user` ok). Il sintomo "mostra Accedi" era l'outage del backend del 15 giu (522/timeout), ora rientrato. Ritoccato solo il client (riconoscimento "utente esiste" esteso al 500 transitorio + commento corretto).
- [x] **Revisione traduzione UI greca** — `el.json` rivisto (17 giu 2026): struttura allineata, 0 mismatch placeholder, frasi greche corrette; tradotte le ultime label descrittive residue, mantenuti brand/nomi prodotto/formati.

---

## 📚 Documentazione

- [ ] **Blocco 4 User Guide** — Prossimo blocco di feature AI da documentare (se presenti).
- [ ] **Tradurre docs tecnici** — `API_REFERENCE.md`, `TROUBLESHOOTING.md`, `ARCHITETTURA.md` in EN.

---

## ✅ RECENTEMENTE COMPLETATO (Marzo 2026)

### 🤖 Feature AI Avanzate — Documentazione Completa

Tutte le 11 guide utente (IT, EN, ES, FR, DE, PT, JA, KO, ZH, RU, PL) aggiornate con 12 sezioni AI:

**Blocco 1** — Feature AI Core:

- ✅ Confronto Multi-LLM (3+ provider in parallelo, selezione automatica)
- ✅ Punteggio Qualità Live (Fluency, Accuracy, Consistency, Style)
- ✅ Profili Voce Personaggio (8 preset, personalità, speech patterns)
- ✅ Pipeline Traduzione Vocale (Whisper → Traduzione → TTS)

**Blocco 2** — OCR & Traduzione Avanzata:

- ✅ OCR Multi-Engine (OneOCR, PaddleOCR, RapidOCR, Tesseract + fallback)
- ✅ Retro-Game OCR (preset 8-bit/16-bit/DOS, preprocessing dedicato)
- ✅ Adaptive MT (correzioni umane, few-shot learning, feedback loop)
- ✅ Batch Folder Translator (scansione ricorsiva, multi-formato, TM, QA)

**Blocco 3** — Traduzione Specializzata & Glossario:

- ✅ Traduttore Offline (Ollama, HY-MT 1.5, TranslateGemma, Qwen 3, 14 lingue)
- ✅ Manga/Comic Translator (balloon detection, OCR, inpainting, font matching)
- ✅ Texture Translator (DDS/PNG/TGA, region detection, stile preservato)
- ✅ Auto-Glossario (estrazione LLM, 3 tier, 11 categorie, prompt injection)

### 🧹 Pulizia Progetto (Marzo 2026)

- ✅ **7 docs spostati in archive/** — Report implementazione superati
- ✅ **20 file temporanei eliminati da scripts/** — Fix/debug/inserimento una-tantum
- ✅ **8 file obsoleti eliminati dalla root** — README_OLD, bug report, landing page duplicate, script utility
- ✅ **Script verifica aggiornato** — `scripts/verify-ai-advanced.py` verifica 12 sezioni × 11 guide

### 🚀 Ottimizzazione Performance e Libreria

- **Guard globalThis**: Eliminati doppi fetch causati da React 18 StrictMode.
- **Cache IndexedDB e In-Memory**: Cache con TTL 5-15 min per copertine, date, lingue.
- **Zero HTTP Calls per Scan**: `scan_all_steam_games_fast` solo dati locali, eliminando 1600+ richieste.
- **Deduplicazione Fetch**: Fixati doppi download su SteamGridDB.
- **Internazionalizzazione**: Supporto completo 11 lingue UI.

### 🎮 Store & Supporto

- **Microsoft Store / Xbox Game Pass**: Scanner completo (`xbox.rs`).
- **Epic Games Parser**: Filtro basato su `categories`.
- **Steam Family Sharing**: Integrazione `steam_family_*` via file ACF.
- **GOG Galaxy**: Supporto completo (v1.4.1).

### 🐛 Bug Fix

- **Memory Usage**: List view virtualizzata (`Virtuoso`), fix closure stale.
- **Cache Corruption**: Recovery automatico JSON corrotto.
- **CI/CD**: Fix compilazione Rust cross-platform, stub frontend per cargo check.

---

## 📚 ARCHIVIO SUCCESSI CORE (2025)

*Task fondazionali già stabili.*

- **Architettura Full-Stack**: Tauri v2 + Next.js + Rust bridge.
- **Sistema Injection (Injekt)**: Multi-processo, anti-cheat bypass (7+ sistemi), hook pooling.
- **Motori OCR & ML**: Tesseract/WindowsOCR/EasyOCR, fallback asincroni, ML scoring.
- **Integrazioni API**: Cloudflare/Akamai per immagini, HowLongToBeat, traduzione multilingua.
- **Tooling Rust**: Stabilizzazione compilatore, fix massivi binari Tauri, memory audit.

---

## 🔧 SETUP DEVELOPMENT

### 📋 Prerequisiti

- **Rust Toolchain** — `stable` (via `rustup`)
- **Node.js 18+** — Ambiente Node.js aggiornato
- **Tauri CLI v2** — `cargo install tauri-cli`
- **Git Hooks** — Pre-commit hooks configurati in `.githooks/`

### 🚀 Comandi Utili

```bash
# Sviluppo
npm run tauri:dev          # Avvia app in modalità sviluppo
npm run dev                # Solo frontend (per debug UI)
npm run build:tauri        # Build produzione

# Testing
npm run test               # Test suite completa
npm run test:rust          # Test solo backend Rust
npm run test:frontend      # Test solo frontend

# Verifica documentazione
python scripts/verify-ai-advanced.py  # Verifica 12 sezioni × 11 guide

# Maintenance
npm run lint               # Check codice TS/JS
npm run format             # Formatta codice
cargo update               # Aggiorna dipendenze Rust
cargo clippy               # Linting codice Rust
```

## 📝 NOTE SVILUPPO

### 🎯 Principi Guida

1. **Traduzione First** — Ogni feature deve supportare l'obiettivo principale di traduzione
2. **Performance** — Ottimizzazione continua per responsività
3. **Sicurezza** — Crittografia e protezione dati utente
4. **Usabilità** — UI intuitiva e accessibile

### 🔍 Aree di Attenzione

- **Memory Management** — Monitoraggio continuo uso memoria
- **Cross-Platform** — Compatibilità Windows/Linux/macOS
- **Backward Compatibility** — Supporto versioni precedenti

---

## 📞 CONTATTI SVILUPPO

**Repository**: <https://github.com/rouges78/GameStringer>
**Issues**: Utilizzare GitHub Issues per bug report
**Discussions**: GitHub Discussions per feature request

---

*Questo TODO.md viene aggiornato regolarmente. Controllare sempre la versione più recente.*
