# 📰 Digest Traduzioni Videogiochi — 23 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 22 Maggio**: giornata tranquilla. **Zero nuove release upstream** per i tool Unity (XUnity 5.6.1, BepInEx 5.4.23.4 / 6.0.0-pre.2, MelonLoader 0.7.3, UnrealLocres 1.1.1 tutti invariati). La **drift Gemini 3.5 Flash → `gemini-2.0-flash` / `gemini-3.1-flash-lite`** segnalata ieri resta aperta — nessun grep del codice rivela modifiche dal digest del 22 maggio (5 file ancora con identifier vecchi). Sul fronte traduzioni ITA, **The Ascent + DLC** localizzato dal team **Vox Italica** è la sola novità di rilievo rispetto al digest precedente; il resto delle fonti italiane (Q-Gin, GamesTranslator, romhacking.it) non riportano patch nuove nelle ultime 24h.

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (ribadita da ieri)

Il bump a `gemini-3.5-flash` rimane il drift più impattante. Nessuna modifica al codice dal 22/05 — verifica con grep:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

Conferme aggiuntive dalla ricerca odierna su `gemini-3.5-flash`:

- **Pricing GA**: $1.50 input / $9 output per 1M token (standard tier), context caching e batch disponibili (≈ 50% sconto).
- **Output token**: 65.536 (vs 8.192 di 2.0 Flash, **8×**). Utile per i long-script RPG.
- **Context window**: 1.048.576 input token (invariato vs 2.0 / 3.1).
- **Stato**: GA dal **19/05/2026** in Gemini API (Google AI Studio), Antigravity, Gemini Enterprise.

**Implicazione concreta per GameStringer**: con 65k token di output il chain preset `long_context` (`lib/translation/chain-presets.ts:55`) può adesso processare batch ~8× più grandi in una singola call. Vale la pena rivedere anche `BATCH_SIZE` / chunking dell'orchestrator dopo il bump.

**Proposta operativa identica a ieri** (sotto allineata allo stile del bump Anthropic già in produzione):

1. Aggiungere env var `NEXT_PUBLIC_GEMINI_MODEL` (default `gemini-3.5-flash`) e leggere nei 5 siti hard-coded sopra.
2. Tenere `gemini-3.1-flash-lite` esplicito nel preset `long_context` come opzione "low-cost/long-context".
3. Aggiornare `lib/translation/chain-presets.ts` (`creative`, `precision` linee 73/91) per mettere `gemini-3.5` in testa, e `language-mappings.ts:124` per la nuova label `'Google Gemini 3.5 Flash (Frontier)'`.
4. **Smoke test**: 50 stringhe → verifica che il regex `responseText.match(/\[[\s\S]*\]/)` in `ai-translate-direct.ts` regga (3.5 dovrebbe essere *più* obbediente di 2.0 ma vale lo step di QA).

> ⚠️ Side-effect documentale: `docs/TRANSLATION_INNOVATIONS_2026.md` linea 19 cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google". Da aggiornare contestualmente al bump 3.5.

### ✅ Drift versioni tool Unity — nessun drift (stato invariato vs 22/05)

| Componente | In progetto | Upstream latest | Stato |
|---|---|---|---|
| XUnity.AutoTranslator (BepInEx) | `v5.6.1` (`unity_patcher.rs:35,38`) | `v5.6.1` (19/04/2026) | ✅ |
| XUnity.AutoTranslator (IPA) | `v5.6.1` (`unity_patcher.rs:21`) | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` (`unity_patcher.rs:10–11`) | `v5.4.23.4` | ✅ |
| BepInEx 5 Legacy | `v5.4.11` (`unity_patcher.rs:14–15`) | `v5.4.11` | ✅ |
| BepInEx 6 Mono | `v6.0.0-pre.2` (`unity_patcher.rs:25,27`) | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 IL2CPP | `v6.0.0-pre.2` (`unity_patcher.rs:30–31`) | `v6.0.0-pre.2` | ✅ |
| IPA (Illusion) | `3.4.1` (`unity_patcher.rs:18`) | `3.4.1` | ✅ |
| UnrealLocres | `v1.1.1` | `v1.1.1` (nessuna release 2026) | ✅ |
| MelonLoader | `n/a` (non integrato) | `v0.7.3` (14/05/2026) | ➖ (roadmap condizionata, vedi `TODO.md`) |

Nessuna nuova release dal 22/05. BepInEx 6.0.0-pre.3 **non** è ancora uscito (solo bleeding-edge builds 2026-02-24/2026-01-27).

---

## 📡 Proposte fonti RSS

Nessuna nuova proposta oggi. **Test pendente da 3 giorni** sulle 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`).

> ℹ️ **Promemoria delicato**: lo screening RSS di OldGamesItalia potrebbe essere sterile per design — un risultato di ricerca odierno conferma che il sito è in "letargo", con aggiornamenti rari e pause lunghe. Probabilmente il feed `forum/index.php?app=core&module=global&section=rss&type=forums&id=1` funziona (è un Invision Forum standard) ma genererà pochi item — non è un problema della config, è il sito.

**Candidate riprese da ieri (low priority, sempre `enabled: false`)**:

- `languagepack_it` → `https://www.languagepack.it/feed/`
- `qgin` → `https://www.q-gin.info/feed/`
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 17–23 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **maggio 2026** | **The Ascent + 3 DLC** | **NUOVA**: rilascio iniziale del team **Vox Italica** (10 persone, traduzione + revisione + test). Solo PC, distribuita via NexusMods. Neon Giant non ha mai risposto alla richiesta di integrazione ufficiale. | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | NUOVA da ieri: include traduzione AppendDisc, Mission 00, menu + sottotitoli ITA per filmati esclusivi | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa da RickTM + Grandpa Theobald (2 anni di lavoro) | romhacking.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it |
| 15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata | GamesTranslator.it |

> ⚠️ **Vera novità rispetto a ieri**: solo **The Ascent + DLC** (Vox Italica). Il resto è riportato per continuità ma è già stato segnalato nei digest 20–22 maggio. Il flusso pubblico delle community ITA è stato leggero nelle 24h.

> ℹ️ Verifica manuale: la data esatta di pubblicazione della patch *The Ascent* su NexusMods non è confermata dalla ricerca odierna (l'articolo Q-Gin non è datato in modo univoco). Possibile che sia il **principale annuncio della settimana** ma vale un controllo `https://www.nexusmods.com/theascent/mods/33` per la timestamp "Last updated".

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. Stabile, nessuna novità nelle 24h. Coverage continua su Q-Gin, GamingTalker, GameSource, Multiplayer.it, Everyeye.
- *Nessun nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ Aggiornato |
| BepInEx 5 | `v5.4.23.4` | stabile | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | builds 2026-02-24 / 2026-01-27 | non consigliata | n/a | ➖ |
| UnrealLocres | `v1.1.1` | nessuna release 2026 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ Roadmap condizionata |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL Voice API | `v1/voice/realtime` GA + *Spoken Terms* customization GA 07/05/2026 | 02/02/2026 base / 07/05 spoken-terms | DeepL integrato (endpoint da verificare) | ⚠️ Verifica manuale |
| **Gemini 3.5 Flash** | **`gemini-3.5-flash`** ($1.50/$9 1M, 65k output, 1M input) | **19/05/2026 (I/O 2026)** | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — STILL OPEN** |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (chain `long_context`) | ✅ (mantenere come "low-cost") |
| Claude (Anthropic) | `claude-sonnet-4-6` | 17/02/2026 | `claude-sonnet-4-6` parametrizzato via env | ✅ Risolto 22/05 |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (modello specifico da verificare) | ⚠️ Verifica manuale |

> 📌 Nota: la finestra di output 8× più grande di `gemini-3.5-flash` (65k vs 8k) può ridurre meccanicamente il numero di chiamate API in batch RPG; pre-bump vale la pena revisitare `BATCH_SIZE` nell'orchestrator `lib/ai/`.

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da 3 giorni. È il singolo task manuale che genera più attesa.
- **Data esatta patch The Ascent ITA** (Vox Italica) su NexusMods — l'articolo Q-Gin non riporta la data. Controllare `https://www.nexusmods.com/theascent/mods/33`.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Indicativamente identico ma servirà allineare il regex parser di `ai-translate-direct.ts`.
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** ancora cita Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- Stato live patch Blue Prince DC e Cyberpunk 2077 Phantom Liberty DC — non verificate live oggi (non ci sono motivi per dubitare ma non sono state ricontrollate).

---

## Fonti

- [Google — Gemini 3.5 Flash blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [MarkTechPost — Google Introduces Gemini 3.5 Flash at I/O 2026](https://www.marktechpost.com/2026/05/20/google-introduces-gemini-3-5-flash-at-i-o-2026-a-faster-and-cheaper-model-for-ai-agents-and-coding/)
- [TokenMix — Gemini 3.5 Flash $1.50/$9 API pricing](https://tokenmix.ai/blog/gemini-3-5-pro-release-date-google-io-2026)
- [Gemini API Docs — Models](https://ai.google.dev/gemini-api/docs/models)
- [Anthropic — Claude Sonnet 4.6](https://www.anthropic.com/news/claude-sonnet-4-6)
- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator — v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/bepinex/bepinex/releases)
- [MelonLoader — v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [DeepL — Voice API + Spoken Terms changelog](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL — Voice-to-voice press release](https://www.deepl.com/en/press-release/deepl-unveils-real-time-spoken-translation-breaking-the-next-language-barrier-with-voice-to-voice)
- [Q-Gin — The Ascent ITA (Vox Italica)](https://www.q-gin.info/e-disponibile-la-traduzione-italiana-di-the-ascent-grazie-al-team-vox-italica/)
- [NexusMods — The Ascent Italian Translation (All DLCs)](https://www.nexusmods.com/theascent/mods/33)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/il-nuovo-dlc-di-sea-of-stars-throes-of-the-watchmaker-introduce-la-localizzazione-italiana/)
- [Q-Gin — Language Pack Italia Hub tool](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Language Pack Italia](https://www.languagepack.it/)
- [Steam — Blue Prince Italian translation discussion](https://steamcommunity.com/app/1569580/discussions/0/830458962613714632/)
- [Viaggiamo.it — Vox Italica + The Ascent](https://www.viaggiamo.it/la-traduzione-italiana-di-the-ascent-un-passo-avanti-per-i-giocatori-pc/)
