# 📰 Digest Traduzioni Videogiochi — 26 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 25 Maggio**: **martedì con UNA novità concreta in più rispetto a ieri**: emerge **Language Pack Italia Hub (LPI-Hub)**, programma desktop gratuito della community LPI per gestire installazione e aggiornamento delle traduzioni ITA — è simil-concorrenza diretta a GameStringer dal lato distribuzione (non traduzione), interessante come benchmark UX. Sul fronte ITA: **Real Robots Final Attack (PS1)** patch ITA completata su RomHack Plaza il 24/05/2026 (nuova rispetto a ieri). Sul fronte tool: **zero drift** — XUnity 5.6.1, BepInEx 5.4.23.4, BepInEx 6.0.0-pre.2, MelonLoader 0.7.3 (14/05), UnrealLocres 1.1.1 (24/10/2025) tutti invariati. **Gemini 3.5 Flash drift = 6° giorno aperto**. **5 feed RSS in pending test = 6° giorno**. DeepL **Spoken Terms** sono passati GA il 07/05 (planning rispettato, conferma da changelog).

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (6° giorno)

Stato invariato dal 22/05. Grep odierno sul codice → zero modifiche:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata dal 22/05)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context`, aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima del default.

> ⚠️ Da aggiornare contestualmente: `docs/TRANSLATION_INNOVATIONS_2026.md:19` cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google" — promemoria ribadito (6° giorno).

### 🟠 NUOVO — Considerare integrazione DeepL Translation Memory + Spoken Terms

DeepL ha consolidato la propria pipeline 2026 e oggi è chiaro che vale almeno una valutazione:

- **Translation Memory API** già disponibile (parametri `translation_memory_id` + `translation_memory_threshold`, endpoint `GET /v3/translation_memories`). Caso d'uso GameStringer: garantire coerenza terminologica nei progetti lunghi (specie RPG e Visual Novel), in alternativa o accanto alla term-base interna.
- **Spoken Terms** (vocabolario custom per nomi propri/termini di franchise) GA dal 07/05/2026 — utile se in futuro si vorrà fare doppiaggio assistito da DeepL Voice.
- **Voice API GA** confermata dal 15/04/2026.

**Azione consigliata**: ~30 min di valutazione + grep di `lib/ai/deepl*` per capire se il client REST attuale supporta già i nuovi parametri o se serve un upgrade del client. Nessuna fretta operativa.

### 🟡 NUOVO — Benchmark UX con LPI-Hub (Language Pack Italia Hub)

LPI ha rilasciato il proprio **hub desktop** per scaricare/attivare/aggiornare traduzioni dal database LPI senza passare dal sito. Funzionalità chiave dichiarate (da `languagepack.it/notizie/language-pack-italia-hub/`):

1. Download + attivazione delle patch ITA in pochi click
2. Gestione automatica degli aggiornamenti del gioco (re-applica la patch dopo update)
3. Restore dei file originali sostituiti dalla patch (rollback)
4. Check automatico aggiornamenti traduzioni

Non è un concorrente diretto di GameStringer (che traduce, non distribuisce), ma copre il **punto debole post-traduzione** che oggi in GameStringer è manuale: rilevare quando il gioco viene aggiornato e re-applicare la patch. **Idea**: studiare l'UX di LPI-Hub come riferimento per un'eventuale futura feature "Watch & Re-Patch" in GameStringer.

### 🟡 Claude Opus 4.7 → considerare uso per task complessi

(Invariato vs 25/05) Opus 4.7 GA dal 16/04. Estendere la logica env-var già usata per `claude-sonnet-4-6` per consentire `claude-opus-4-7` come opzione "premium" per Lore assistant e Vision/OCR. Lasciare Sonnet 4.6 come default. **Aggiornamento**: pricing confermato $5 / $25 per MTok (input/output) — stesso di 4.6, switch indolore.

> ℹ️ **Claude Sonnet 4.8 non è ufficiale**: nessun annuncio Anthropic al 26/05 (verificato sui release-notes ufficiali). Non integrare modelli non rilasciati.

### ✅ Drift versioni tool Unity / Unreal — zero drift (giorno 6 consecutivo)

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

> 🟢 **Conferma 6° giorno**: nessuna `v6.0.0-pre.3` di BepInEx, nessuna `v5.6.2` o `v5.7` di XUnity, nessuna `v0.7.4` di MelonLoader. Build bleeding-edge più recente di BepInEx resta #755 (07/03/2026).

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano `enabled: false` in attesa di test in app: **6° giorno consecutivo di pending**. Singolo task manuale più in arretrato, e ormai promemoria perpetuo.

**Nuova candidata da considerare oggi**:

- `languagepack_it` → `https://www.languagepack.it/feed/` — sito WordPress di LPI. Visto il rilascio di LPI-Hub e l'attività editoriale costante (sezione "Notizie" con annunci traduzioni e aggiornamenti), questo feed dovrebbe avere priorità più alta dei 5 già aggiunti se l'obiettivo è la copertura attiva di nuove patch ITA. Verifica RSS WordPress standard prima di aggiungerlo: `curl -I https://www.languagepack.it/feed/`.

Candidate riprese restano invariate:

- `qgin` → `https://www.q-gin.info/feed/` (sito attivo, WordPress, RSS quasi certo)
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`
- `sadnescity` → `https://www.sadnescity.it/` (no RSS noto, da verificare)

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 20–26 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **24 mag 2026** | **Real Robots Final Attack (PS1)** | **Patch ITA completata** | **RomHack Plaza** |
| 20 mag 2026 | (collezione GamesTranslator) | Ultimo aggiornamento generale catalogo | GamesTranslator.it |
| 16 mag 2026 | (collezione GamesTranslator) | Una traduzione 100% completa con revisione DLC in corso | GamesTranslator.it |
| ~15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 (re-upload pacchetti immagini) | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it / Nexus |
| ~maggio 2026 | The Ascent + 3 DLC (team Vox Italica) | Pubblicata su NexusMods | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | AppendDisc + Mission 00 + sub filmati esclusivi | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa RickTM + Grandpa Theobald | romhacking.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA (>5.200 frasi nuove, >4.000 eliminate dopo update 30/04) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (TurinaR) | GamesTranslator.it |

> ✨ **Vera novità rispetto a ieri**: **Real Robots Final Attack (PS1)** patch ITA completa, comparsa su RomHack Plaza il 24/05/2026 (interrotta la serie di 2 giorni di "nessuna novità").
> ℹ️ Verifiche manuali ribadite: data esatta patch *The Ascent* (Vox Italica) su NexusMods.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Sesto giorno post-rilascio.** Nessuna novità nelle 24h.
- *Nessun nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` | stabile (branch `v5-lts`) | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | build #755 | 07/03/2026 (sconsigliata) | n/a | ➖ |
| UnrealLocres | `v1.1.1` | 24/10/2025 (nessuna release 2026) | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ Roadmap condizionata |
| MelonLoader Installer | `v4.3.0` | 14/05/2026 | n/a | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL — Voice API GA | endpoint REST + WebSocket | 15/04/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Manuale |
| **DeepL — Spoken Terms** | **vocabolario custom** | **07/05/2026 (GA)** | **non usato** | 💡 Idea per voice futuro |
| DeepL — Translation Memory API | `translation_memory_id` + threshold | 2026 (live) | non usata | 💡 Idea — vedi sezione 🟠 sopra |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` (~4× più veloce) | 19/05/2026 (I/O 2026) | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 6° giorno** |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (chain `long_context`) | ✅ (tenere come "low-cost") |
| **Claude Opus 4.7** | `claude-opus-4-7` (visual-acuity 98.5%) | 16/04/2026 (GA) — $5/$25 MTok | non offerto come scelta env | 🟡 Opportunità (vedi Azione consigliata) |
| Claude Sonnet 4.6 | corrente stabile | 17/02/2026 | `claude-sonnet-4-6` parametrizzato via env | ✅ Risolto 22/05 |
| Claude Sonnet 4.8 | non ufficiale (solo leak codice) | n/a | n/a | ⛔ Non integrare |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (identifier specifico da verificare) | ⚠️ Manuale |
| **LPI-Hub (Language Pack Italia)** | tool desktop community ITA | 2026 (recente) | — | ℹ️ Benchmark UX, non integrazione |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **6 giorni** (priorità massima fra i task manuali, ormai cronico).
- **Data esatta patch The Ascent ITA** (Vox Italica) su NexusMods — Q-Gin non riporta data univoca.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **NUOVO — Endpoint DeepL Translation Memory**: l'attuale client REST in `lib/ai/deepl*` supporta `translation_memory_id`? Se sì, valutare attivazione opzionale nei progetti GameStringer per coerenza terminologica.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- **Stato live** patch *Blue Prince DC* e *Cyberpunk 2077 Phantom Liberty DC* — non ricontrollati oggi.
- Aggiungere `claude-opus-4-7` come scelta env opzionale (vedi sezione 🟡 sopra).
- **NUOVO — Aggiungere `languagepack_it` ai feed** prima dei 5 già pending? Decisione strategica (~5 min).
- **NUOVO — Studio UX di LPI-Hub** per eventuale feature "Watch & Re-Patch" in GameStringer (non urgente, idea da archivio).

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator — v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [BepInEx — Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [MelonLoader v0.7.3](https://www.nuget.org/packages/LavaGang.MelonLoader)
- [UnrealLocres — Releases](https://github.com/akintos/UnrealLocres/releases)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [Language Pack Italia — Home](https://www.languagepack.it/)
- [Language Pack Italia Hub — Annuncio](https://www.languagepack.it/notizie/language-pack-italia-hub/)
- [Language Pack Italia Hub — Download](https://languagepack.it/download/lpi-hub/)
- [Q-Gin — Language Pack Italia Hub](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Gemini 3.5 Flash — Google AI Developers](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash)
- [Gemini API — Release notes / Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini 3.5 Flash — Google I/O 2026 (HotHardware)](https://hothardware.com/news/google-io-2026-gemini-35-flash-ai-search-and-more)
- [Claude Opus 4.7 — Anthropic](https://www.anthropic.com/news/claude-opus-4-7)
- [Anthropic Release Notes — Maggio 2026](https://releasebot.io/updates/anthropic/claude)
- [DeepL — Roadmap & Release notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL Voice API — Press Release](https://www.deepl.com/en/press-release/deepl_launches_voice_api_for_real_time_speech_transcription_and_translation)
- [DeepL Voice API — Espansione e nuove feature](https://www.deepl.com/en/press-release/deepl-expands-real-time-voice-translation-capabilities-with-new-features-and-upcoming-zoom-integration)
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
