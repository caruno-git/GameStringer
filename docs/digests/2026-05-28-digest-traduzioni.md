# 📰 Digest Traduzioni Videogiochi — 28 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 27 Maggio**: **giornata con tre novità**. (1) 🆕 **Anthropic ha rilasciato Claude Opus 4.8 oggi 28/05/2026** (41 giorni dopo 4.7, ciclo più rapido del normale): stesso pricing $5/$25 MTok, fast mode 3× più economico, miglioramenti su agentic coding/reasoning, nuove feature "dynamic workflows" e controllo "effort". Per GameStringer la conseguenza diretta è che la proposta env-var che avevo "Opus 4.7" da ieri va riformulata su `claude-opus-4-8` prima di toccare il codice. (2) Q-Gin ha pubblicato il 26/05 un articolo su *Oblivion Remastered — in arrivo il doppiaggio italiano*: progetto AI-based di **VoiceProjectITA + Throne Project** (non testuale, doppiaggio neurale), interessante come segnale che il dubbing AI ITA sta maturando come categoria di lavoro fan-made. (3) Patch **Unsighted v1.1.4 ITA** (autore Godran65) tracciata come "file più recente" sul catalogo GamesTranslator.it — non datata in maniera univoca ma con visibilità nuova rispetto a ieri. Tool di patching Unity/Unreal a monte invariati. **Gemini 3.5 Flash drift = 8° giorno aperto**, **Claude Opus 4.8 env-var = nuova (giorno 0)**, **5 feed RSS in pending test = 8° giorno**.

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (8° giorno)

Stato invariato dal 22/05. Il modello `gemini-3.5-flash` è GA dal 19/05/2026 (Google I/O 2026), prezzato $1.50/$9.00 per MTok, ~4× più veloce di Gemini 3.1 Pro su benchmark coding/agentic. GameStringer riferisce ancora a generazioni precedenti:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata dal 22/05)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context` (Google ha dichiarato GA `gemini-3.1-flash-lite` il 07/05; il preview `gemini-3.1-flash-lite-preview` viene **spento il 25/05/2026** — questo aggiunge una piccola urgenza: se da qualche parte è hard-coded il preview, può rompersi). Aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima di promuovere il default.

> ⚠️ Da aggiornare contestualmente: `docs/TRANSLATION_INNOVATIONS_2026.md:19` cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google" — promemoria all'8° giorno.
> 🆕 **Verifica veloce richiesta**: grep su `gemini-3.1-flash-lite-preview` in `lib/ai/**` e `lib/ocr/**` per essere sicuri che nessun identifier preview sia ancora referenziato (l'endpoint preview è in shutdown da 3 giorni).
>
> ✅ **Verifica eseguita 28/05 (auto)**: nessuna occorrenza di `*-preview` in `lib/**` o `src-tauri/**` (`*.ts|*.tsx|*.js|*.rs`). Nessuna bonifica necessaria su questo fronte.

### 🆕 Claude Opus 4.8 — opportunità fresca (giorno 0, rilasciato 28/05/2026)

**Cambio di rotta vs ieri**: la proposta era estendere l'env-var con `claude-opus-4-7`. Oggi Anthropic ha rilasciato **Opus 4.8** (41 giorni dopo 4.7), quindi va riformulata su `claude-opus-4-8`. Punti chiave:

- **Pricing invariato**: $5/$25 per MTok (uguale a 4.7 e 4.6) — bump senza impatto economico.
- **Fast mode 3× più economico** rispetto ai modelli precedenti — rilevante per Lore Assistant in modalità "premium" e Vision/OCR su asset complessi.
- **Capability nuove non urgenti per GameStringer**: "dynamic workflows" (multi-subagent) e controllo "effort" sono pensate per agentic coding/Claude Code, non strettamente per pipeline batch di traduzione/post-edit. Si possono ignorare in prima implementazione.
- **Benchmark**: 69.2% SWE-Bench Pro, batte GPT-5.5 e Gemini 3.1 Pro a parità di costo. Non determinante per il dominio "traduzione stringhe" ma utile per Lore Assistant.

**Proposta operativa aggiornata**: estendere la logica env già presente per `claude-sonnet-4-6` per consentire `claude-opus-4-8` come opzione "premium". Sonnet 4.6 resta default (a meno che non esca anche un nuovo Sonnet a breve). **Nota deprecation invariata**: `claude-sonnet-4` e `claude-opus-4` legacy si spengono il **15/06/2026** — GameStringer non li usa più direttamente, ma vale un grep nei test/snapshot prima di metà giugno.

> ℹ️ La proposta "Opus 4.7" tracciata dal 22/05 al 27/05 va considerata **superata** prima ancora di essere implementata: usare direttamente l'identifier `claude-opus-4-8`.

### 🟡 DeepL Translation Memory + Spoken Terms — valutazione ancora pendente

(Invariato vs 27/05) Translation Memory API live (params `translation_memory_id` + `translation_memory_threshold`), Spoken Terms GA dal 07/05, Voice API GA dal 15/04. **Novità (minore)**: il changelog DeepL ha aggiunto la capability **speech-to-speech** sul Voice API (TTS dell'audio tradotto nella stessa sessione WebSocket). Non rilevante per il flusso testuale attuale di GameStringer; archiviato per eventuali iterazioni future.

### ✅ Drift versioni tool Unity / Unreal — zero drift (giorno 8 consecutivo)

| Componente | In progetto | Upstream latest | Stato |
|---|---|---|---|
| XUnity.AutoTranslator (BepInEx) | `v5.6.1` (`unity_patcher.rs:35`) | `v5.6.1` (19/04/2026) | ✅ |
| XUnity.AutoTranslator (BepInEx IL2CPP) | `v5.6.1` (`unity_patcher.rs:38`) | `v5.6.1` | ✅ |
| XUnity.AutoTranslator (IPA) | `v5.6.1` (`unity_patcher.rs:21`) | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` (`unity_patcher.rs:10–11`) | `v5.4.23.4` | ✅ |
| BepInEx 5 Legacy | `v5.4.11` (`unity_patcher.rs:14–15`) | `v5.4.11` | ✅ |
| BepInEx 6 Mono | `v6.0.0-pre.2` (`unity_patcher.rs:25,27`) | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 IL2CPP | `v6.0.0-pre.2` (`unity_patcher.rs:30–31`) | `v6.0.0-pre.2` | ✅ |
| IPA (Illusion) | `3.4.1` (`unity_patcher.rs:18`) | `3.4.1` | ✅ |
| UnrealLocres | `v1.1.1` | `v1.1.1` (24/10/2025) | ✅ |
| MelonLoader | n/a (non integrato) | `v0.7.3` (14/05/2026) | ➖ (roadmap) |

> 🟢 **Conferma 8° giorno**: nessuna `v6.0.0-pre.3` di BepInEx, nessuna `v5.6.2` o `v5.7` di XUnity, nessuna `v0.7.4` di MelonLoader. La build "bleeding edge" #755 resta l'ultima del branch BE; segnali confusi tra fonti su data esatta (27/01 vs 07/03) — non rilevante: BE è esplicitamente sconsigliato per GameStringer.

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta forte oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano `enabled: false` in attesa di test in app: **8° giorno consecutivo di pending**. Questo è ormai l'unico task arretrato cronico — andrebbe chiuso entro la fine della settimana per evitare bit rot delle URL.

Candidata di ieri ancora valida:

- `languagepack_it` → `https://www.languagepack.it/feed/` — sito WordPress LPI, sezione "Notizie" attiva. Pre-test richiesto: `curl -I https://www.languagepack.it/feed/`. Priorità più alta dei 5 già aggiunti se l'obiettivo è copertura attiva di nuove patch ITA + tool di gestione lingue.

Candidate riprese (invariate):

- `qgin` → `https://www.q-gin.info/feed/` (WordPress, RSS quasi certo). Conferma del fatto che Q-Gin pubblica con cadenza pluri-settimanale rilevante (oggi nuovo pezzo su Oblivion Remastered AI dubbing) suggerisce di promuoverla in cima alla short-list.
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`
- `sadnescity` → `https://www.sadnescity.it/` (no RSS noto, da verificare)

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 22–28 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~28 mag 2026 | **Unsighted v1.1.4** (Steam) | Patch ITA — file più recente nel catalogo GamesTranslator (autore Godran65) | GamesTranslator.it |
| 26 mag 2026 | **Oblivion Remastered** (doppiaggio AI) | Annuncio progetto VoiceProjectITA + Throne Project (dubbing AI ITA in lavorazione, no ETA) | Q-Gin |
| 24 mag 2026 | Real Robots Final Attack (PS1) | Patch ITA completata | RomHack Plaza |
| 20 mag 2026 | **Magicraft** (Roguelike) | Aggiornamento patch ITA (CaramellaGTX) | GamesTranslator.it |
| ~15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it / Nexus |
| ~maggio 2026 | The Ascent + 3 DLC (Vox Italica) | Pubblicata su NexusMods | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | AppendDisc + Mission 00 + sub filmati | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa RickTM + Grandpa Theobald | romhacking.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA (>5.200 frasi nuove) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (TurinaR) | GamesTranslator.it |

> 🟡 **Una sola novità "fresca" verificabile in 24h**: l'apparizione di **Unsighted v1.1.4** come file più recente sul catalogo GamesTranslator.it (autore Godran65). Data esatta di upload da confermare manualmente — il portale non espone timestamp pubblici ovvi.
> 🆕 **Segnale macro**: l'attivismo di **VoiceProjectITA** (già autori di un controverso doppiaggio AI di Starfield) si estende a Oblivion Remastered. Trend da monitorare: il dubbing AI ITA potrebbe diventare uno step "post-patch testo" nei prossimi 6–12 mesi.
> ℹ️ Verifiche manuali ribadite (immutate): data esatta patch *The Ascent* (Vox Italica) su NexusMods; conferma timestamp esatto patch Unsighted ITA.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Ottavo giorno post-rilascio.** Nessuna nuova nota.
- **Oblivion Remastered** — versione ufficiale ha **testi/UI/sub ITA** ma **doppiaggio solo EN**. Da qui la nicchia di mercato per il progetto AI dub fan-made di VoiceProjectITA citato sopra. *(non è "ufficiale ITA aggiunto", ma è il contesto di una novità di oggi.)*
- *Nessun altro nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` | stabile (branch `v5-lts`) | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | build #755 | inizio 2026 (sconsigliata) | n/a | ➖ |
| UnrealLocres | `v1.1.1` | 24/10/2025 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ |
| MelonLoader Installer | `v4.3.0` | 14/05/2026 | n/a | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL — Voice API | endpoint REST + WebSocket (+ speech-to-speech) | 15/04 + agg. 27–28/05/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Manuale |
| DeepL — Spoken Terms | vocabolario custom | 07/05/2026 (GA) | non usato | 💡 Idea per voice futuro |
| DeepL — Translation Memory API | `translation_memory_id` + threshold | live 2026 | non usata | 💡 Idea |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` ($1.50/$9.00 MTok, ~4×) | 19/05/2026 (I/O 2026) | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 8° giorno** |
| Gemini 3.1 Flash-Lite | GA | 07/05/2026 | già integrato (chain `long_context`) | ✅ |
| Gemini 3.1 Flash-Lite Preview | endpoint **spento il 25/05/2026** | shutdown | da verificare se referenziato in codice | ⚠️ Da grep |
| **Claude Opus 4.8** 🆕 | `claude-opus-4-8` ($5/$25 MTok, fast 3× cheaper) | **28/05/2026** (oggi) | non offerto come scelta env | 🆕 Opportunità (giorno 0) |
| Claude Opus 4.7 | `claude-opus-4-7` ($5/$25 MTok) | 16/04/2026 (GA) | non offerto — **superato da 4.8 prima di essere integrato** | ➖ Skip |
| Claude Sonnet 4.6 | stabile | 17/02/2026 | `claude-sonnet-4-6` parametrizzato | ✅ |
| Claude Sonnet 4 / Opus 4 (legacy) | **retirement 15/06/2026** | deprecation in corso | non usati direttamente | ℹ️ Bonifica test/snapshot |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (identifier da verificare) | ⚠️ Manuale |
| LPI-Hub (Language Pack Italia) | desktop community ITA | rilasciato 27/01/2026 | — | ℹ️ Benchmark UX |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **8 giorni**, priorità massima fra i task manuali.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- ~~**Grep `gemini-3.1-flash-lite-preview`** in `lib/ai/**` e `lib/ocr/**` — l'endpoint preview è spento dal 25/05~~ → **eseguito 28/05, nessuna occorrenza**.
- **Data esatta patch *The Ascent* ITA** (Vox Italica) su NexusMods.
- **Data esatta patch Unsighted v1.1.4 ITA** (Godran65) — non timestamp-ata in modo pubblico univoco.
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **Endpoint DeepL Translation Memory**: il client REST in `lib/ai/deepl*` supporta `translation_memory_id`? Se sì, valutare attivazione opzionale.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- **Stato live** patch *Blue Prince DC* e *Cyberpunk 2077 Phantom Liberty DC* — non ricontrollati oggi.
- Aggiungere `claude-opus-4-8` (non più 4.7) come scelta env opzionale.
- Bonifica eventuali riferimenti residui a `claude-sonnet-4` / `claude-opus-4` (retirement 15/06/2026).
- **Aggiungere `languagepack_it` e/o `qgin` ai feed** prima dei 5 già pending? Decisione strategica (~5 min).
- **Studio UX di LPI-Hub** per eventuale feature "Watch & Re-Patch" in GameStringer (idea da archivio).
- **Test RSS WordPress** per `https://www.languagepack.it/feed/` e `https://www.q-gin.info/feed/` prima di proporli operativamente.
- **Monitorare progetto VoiceProjectITA** (dubbing AI ITA Oblivion) — non è feature GameStringer, ma è categoria adiacente da osservare.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator — v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [BepInEx — Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [MelonLoader v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres — Releases](https://github.com/akintos/UnrealLocres/releases)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [Language Pack Italia — Home](https://www.languagepack.it/)
- [Q-Gin — Home](https://www.q-gin.info/)
- [Q-Gin — Oblivion Remastered doppiaggio italiano (26/05/2026)](https://www.q-gin.info/oblivion-remastered-in-arrivo-il-doppiaggio-italiano/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Q-Gin — The Ascent ITA (Vox Italica)](https://www.q-gin.info/e-disponibile-la-traduzione-italiana-di-the-ascent-grazie-al-team-vox-italica/)
- [Q-Gin — Language Pack Italia Hub](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Gemini API — Release notes / Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini API — Interactions Breaking Changes (Mag 2026)](https://ai.google.dev/gemini-api/docs/interactions-breaking-changes-may-2026)
- [Gemini 3.5 Flash — Google I/O 2026 (HotHardware)](https://hothardware.com/news/google-io-2026-gemini-35-flash-ai-search-and-more)
- [Claude — Release Notes (Releasebot)](https://releasebot.io/updates/anthropic/claude)
- [Anthropic Release Timeline (hidekazu-konishi)](https://hidekazu-konishi.com/entry/anthropic_claude_model_release_timeline.html)
- [Anthropic — Introducing Claude Opus 4.8 (28/05/2026)](https://www.anthropic.com/news/claude-opus-4-8)
- [Axios — Anthropic releases new model, Opus 4.8](https://www.axios.com/2026/05/28/anthropic-opus-release-mythos)
- [TechCrunch — Opus 4.8 with dynamic workflow tool](https://techcrunch.com/2026/05/28/anthropic-releases-opus-4-8-with-new-dynamic-workflow-tool/)
- [GitHub Changelog — Opus 4.8 GA for Copilot](https://github.blog/changelog/2026-05-28-claude-opus-4-8-is-generally-available-for-github-copilot/)
- [DeepL — Roadmap & Release notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL Voice API — Press Release](https://www.deepl.com/en/press-release/deepl_launches_voice_api_for_real_time_speech_transcription_and_translation)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [NexusMods — Blue Prince Director's Cut ITA](https://www.nexusmods.com/blueprince/mods/18)
- [NexusMods — The Ascent Italian Translation (All DLCs)](https://www.nexusmods.com/theascent/mods/33)
- [PCGW — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Ctrl+Trad — itch.io](https://ctrltrad.itch.io/)
- [Ctrl+Trad — The Valiant ITA (itch event)](https://itch.io/event/35692032)
- [Ctrl+Trad — Demeo X D&D Battlemarked ITA (itch event)](https://itch.io/event/36049637)
