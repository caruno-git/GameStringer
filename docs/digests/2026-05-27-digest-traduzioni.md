# 📰 Digest Traduzioni Videogiochi — 27 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 26 Maggio**: **giornata piatta**. Nessuna nuova release di tool a monte (XUnity 5.6.1, BepInEx 5.4.23.4, BepInEx 6.0.0-pre.2, MelonLoader 0.7.3, UnrealLocres 1.1.1 — invariati). Nessuna nuova patch ITA verificabile nelle ultime 24h (Real Robots Final Attack del 24/05 resta l'ultima conferma). **Gemini 3.5 Flash drift = 7° giorno aperto**, **Claude Opus 4.7 non ancora esposto come scelta env = 6° giorno aperto**, **5 feed RSS in pending test = 7° giorno**. Promemoria operativi tutti invariati: oggi è una giornata in cui chiudere uno dei task aperti ha più valore di qualsiasi nuova integrazione.

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (7° giorno)

Stato invariato dal 22/05. Il modello `gemini-3.5-flash` è GA dal 19/05/2026 (Google I/O 2026), prezzato $1.50/$9.00 per MTok, ~4× più veloce di Gemini 3.1 Pro su benchmark coding/agentic. GameStringer riferisce ancora a generazioni precedenti:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata dal 22/05)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context` (Google ha rilasciato `gemini-3.1-flash-lite` GA il 07/05 — vale come opzione "low-cost" stabile), aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima di promuovere il default.

> ⚠️ Da aggiornare contestualmente: `docs/TRANSLATION_INNOVATIONS_2026.md:19` cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google" — promemoria al 7° giorno.

### 🟡 Claude Opus 4.7 — proposta env-var ancora aperta (6° giorno)

(Invariato vs 26/05) Opus 4.7 GA dal 16/04, stesso pricing di 4.6 ($5/$25 MTok). La logica env già presente per `claude-sonnet-4-6` va estesa per consentire `claude-opus-4-7` come opzione "premium" su Lore Assistant e Vision/OCR. Sonnet 4.6 resta default. Nessuna nuova evidenza Anthropic oggi che imponga di toccare il codice prima del bump Gemini.

### 🟡 DeepL Translation Memory + Spoken Terms — valutazione ancora pendente

(Invariato vs 26/05) Translation Memory API live (params `translation_memory_id` + `translation_memory_threshold`), Spoken Terms GA dal 07/05, Voice API GA dal 15/04. Da ieri il changelog DeepL ha aggiunto `speech_to_text_milliseconds` all'endpoint `/v2/admin/developer-keys/limits` per controllo per-key del Voice — solo rilevante se in futuro si attiva il Voice in GameStringer. Nessuna azione richiesta oggi.

### ✅ Drift versioni tool Unity / Unreal — zero drift (giorno 7 consecutivo)

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

> 🟢 **Conferma 7° giorno**: nessuna `v6.0.0-pre.3` di BepInEx (ultima BE build #755 del 27/01/2026 ancora ferma), nessuna `v5.6.2` o `v5.7` di XUnity, nessuna `v0.7.4` di MelonLoader.

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta forte oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano `enabled: false` in attesa di test in app: **7° giorno consecutivo di pending**. Diventa l'unico task manuale arretrato in modo cronico.

Candidata di ieri ancora valida:

- `languagepack_it` → `https://www.languagepack.it/feed/` — sito WordPress di LPI, sezione "Notizie" attiva. Pre-test richiesto: `curl -I https://www.languagepack.it/feed/`. Da considerare con priorità più alta dei 5 già aggiunti se l'obiettivo è copertura attiva di nuove patch ITA.

Candidate riprese (invariate):

- `qgin` → `https://www.q-gin.info/feed/` (WordPress, RSS quasi certo)
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`
- `sadnescity` → `https://www.sadnescity.it/` (no RSS noto, da verificare)

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 21–27 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 24 mag 2026 | Real Robots Final Attack (PS1) | Patch ITA completata | RomHack Plaza |
| 20 mag 2026 | (collezione GamesTranslator) | Ultimo aggiornamento generale catalogo | GamesTranslator.it |
| ~15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it / Nexus |
| ~maggio 2026 | The Ascent + 3 DLC (Vox Italica) | Pubblicata su NexusMods | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | AppendDisc + Mission 00 + sub filmati | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa RickTM + Grandpa Theobald | romhacking.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA (>5.200 frasi nuove) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (TurinaR) | GamesTranslator.it |

> 🟡 **Nessuna novità verificabile nelle ultime 24h**. Real Robots Final Attack (PS1) resta la più recente conferma (24/05). Le ricerche su RomHack Plaza, Q-Gin e GamesTranslator.it non hanno restituito nuovi articoli datati 26-27 maggio.
> ℹ️ Verifiche manuali ribadite (immutate): data esatta patch *The Ascent* (Vox Italica) su NexusMods.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Settimo giorno post-rilascio.** Nessuna novità nelle 24h.
- *Nessun nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` | stabile (branch `v5-lts`) | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | build #755 | 27/01/2026 (sconsigliata) | n/a | ➖ |
| UnrealLocres | `v1.1.1` | 24/10/2025 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ |
| MelonLoader Installer | `v4.3.0` | 14/05/2026 | n/a | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL — Voice API GA | endpoint REST + WebSocket | 15/04/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Manuale |
| DeepL — Spoken Terms | vocabolario custom | 07/05/2026 (GA) | non usato | 💡 Idea per voice futuro |
| DeepL — Translation Memory API | `translation_memory_id` + threshold | live 2026 | non usata | 💡 Idea |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` ($1.50/$9.00 MTok, ~4×) | 19/05/2026 (I/O 2026) | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 7° giorno** |
| Gemini 3.1 Flash-Lite | GA | 07/05/2026 | già integrato (chain `long_context`) | ✅ |
| **Claude Opus 4.7** | `claude-opus-4-7` ($5/$25 MTok) | 16/04/2026 (GA) | non offerto come scelta env | 🟡 Opportunità |
| Claude Sonnet 4.6 | stabile | 17/02/2026 | `claude-sonnet-4-6` parametrizzato | ✅ |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (identifier da verificare) | ⚠️ Manuale |
| LPI-Hub (Language Pack Italia) | desktop community ITA | rilasciato 27/01/2026 | — | ℹ️ Benchmark UX |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **7 giorni**, priorità massima fra i task manuali.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- **Data esatta patch *The Ascent* ITA** (Vox Italica) su NexusMods.
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **Endpoint DeepL Translation Memory**: il client REST in `lib/ai/deepl*` supporta `translation_memory_id`? Se sì, valutare attivazione opzionale.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- **Stato live** patch *Blue Prince DC* e *Cyberpunk 2077 Phantom Liberty DC* — non ricontrollati oggi.
- Aggiungere `claude-opus-4-7` come scelta env opzionale.
- **Aggiungere `languagepack_it` ai feed** prima dei 5 già pending? Decisione strategica (~5 min).
- **Studio UX di LPI-Hub** per eventuale feature "Watch & Re-Patch" in GameStringer (idea da archivio).
- **Test RSS WordPress** per `https://www.languagepack.it/feed/` prima di proporla operativamente.

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
- [Language Pack Italia Hub — Annuncio](https://www.languagepack.it/notizie/language-pack-italia-hub/)
- [Language Pack Italia Hub — Download](https://languagepack.it/download/lpi-hub/)
- [Q-Gin — Language Pack Italia Hub](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Gemini 3.5 Flash — Google I/O 2026 (HotHardware)](https://hothardware.com/news/google-io-2026-gemini-35-flash-ai-search-and-more)
- [Gemini 3.5 Flash — MarkTechPost](https://www.marktechpost.com/2026/05/20/google-introduces-gemini-3-5-flash-at-i-o-2026-a-faster-and-cheaper-model-for-ai-agents-and-coding/)
- [Gemini API — Release notes / Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Claude Opus 4.7 — Anthropic Release Notes](https://releasebot.io/updates/anthropic/claude)
- [DeepL — Roadmap & Release notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL Voice API — Press Release](https://www.deepl.com/en/press-release/deepl_launches_voice_api_for_real_time_speech_transcription_and_translation)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Q-Gin — The Ascent ITA (Vox Italica)](https://www.q-gin.info/e-disponibile-la-traduzione-italiana-di-the-ascent-grazie-al-team-vox-italica/)
- [NexusMods — Blue Prince Director's Cut ITA](https://www.nexusmods.com/blueprince/mods/18)
- [NexusMods — The Ascent Italian Translation (All DLCs)](https://www.nexusmods.com/theascent/mods/33)
- [PCGW — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Ctrl+Trad — itch.io](https://ctrltrad.itch.io/)
