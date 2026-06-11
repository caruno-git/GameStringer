# 📰 Digest Traduzioni Videogiochi — 25 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 24 Maggio**: **lunedì altrettanto piatto della domenica**. Nessun cambio upstream sui tool (XUnity 5.6.1 → 19/04, BepInEx 5.4.23.4 stabile, BepInEx 6.0.0-pre.2, MelonLoader 0.7.3 → 14/05, UnrealLocres 1.1.1 → 24/10/2025 — la confidenza sull'assenza di una release 2026 di UnrealLocres ora è alta dopo verifica diretta delle release page). Sul fronte ITA: **nessuna nuova patch tracciabile** nelle 24h dalle fonti standard (Q-Gin, GamesTranslator.it, romhacking.it, RomHack Plaza). **Gemini 3.5 Flash drift = 5° giorno aperto**. **5 feed RSS in pending test = 5° giorno**.

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (5° giorno)

Stato invariato dal 22/05. Grep odierno sul codice → zero modifiche:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata dal 22/05)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context`, aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima del default.

**Aggiornamento dalle ricerche odierne**: confermati i benchmark Google I/O 2026 — `gemini-3.5-flash` mostra Terminal-Bench 2.1 76.2%, GDPval-AA 1656 Elo, MCP Atlas 83.6%, CharXiv 84.2%, throughput ~4× più alto sui token di output rispetto alla generazione precedente. Disponibile via Gemini API in AI Studio + Antigravity. Per RPG con script lunghi resta vincitore del rapporto velocità/costo (vedi `TRANSLATION_INNOVATIONS_2026.md`).

> ⚠️ Da aggiornare contestualmente: `docs/TRANSLATION_INNOVATIONS_2026.md:19` cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google" — promemoria ribadito (5° giorno).

### 🟡 Claude Opus 4.7 → considerare uso per task complessi

Claude Opus 4.7 è GA dal 16/04/2026 (Anthropic): salto significativo su software-engineering e visual-acuity (98.5% vs 54.5% di 4.6). Nel progetto `claude-sonnet-4-6` è già parametrizzato via env (risolto 22/05) → estendere la stessa logica per consentire `claude-opus-4-7` come opzione "premium" per:
- Lore assistant (`lib/lore-assistant.ts`) — task lungo, beneficio reale dal modello più potente
- Vision/OCR (`lib/ocr/vision-translate.ts`) — Opus 4.7 ha visione nettamente migliore

Nessuna azione obbligatoria, ma **vale 10 minuti** di env-var aggiuntiva. Lasciare Sonnet 4.6 come default.

> ℹ️ **Claude Sonnet 4.8 non è ufficiale**: il leak è in giro da settimane, ma al 24/05 Anthropic non ha annunciato nulla. Non integrare modelli non rilasciati.

### ✅ Drift versioni tool Unity / Unreal — zero drift

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
| UnrealLocres | `v1.1.1` | `v1.1.1` (24/10/2025 — nessuna release 2026, verificato direttamente) | ✅ |
| MelonLoader | n/a (non integrato) | `v0.7.3` (14/05/2026) | ➖ (roadmap) |

> 🟢 **Buona notizia ricerca odierna**: nessuna `v6.0.0-pre.3` di BepInEx pubblicata. La build bleeding-edge più recente resta #755 (07/03/2026), non raccomandata.

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano `enabled: false` in attesa di test in app: **5° giorno consecutivo di pending**. Singolo task manuale più in arretrato.

Le candidate riprese restano invariate:

- `languagepack_it` → `https://www.languagepack.it/feed/`
- `qgin` → `https://www.q-gin.info/feed/` (sito attivo, WordPress, RSS quasi certo)
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`
- `sadnescity` → `https://www.sadnescity.it/` (no RSS noto, da verificare)

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 19–25 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 20 mag 2026 | (collezione GamesTranslator) | Ultimo aggiornamento generale catalogo | GamesTranslator.it |
| 16 mag 2026 | (collezione GamesTranslator) | Una traduzione 100% completa con revisione DLC in corso | GamesTranslator.it |
| ~15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 (re-upload pacchetti immagini) | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it |
| ~maggio 2026 | The Ascent + 3 DLC (team Vox Italica) | Pubblicata su NexusMods | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | AppendDisc + Mission 00 + sub filmati esclusivi | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa RickTM + Grandpa Theobald | romhacking.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA (>5.200 frasi nuove, >4.000 eliminate dopo update 30/04) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (TurinaR) | GamesTranslator.it |

> ⚠️ **Vera novità rispetto a ieri**: **NESSUNA** (2° giorno consecutivo di tabella riportata per continuità).
> ℹ️ Verifiche manuali ribadite: data esatta patch *The Ascent* (Vox Italica) su NexusMods.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Quinto giorno post-rilascio.** Nessuna novità nelle 24h.
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
| MelonLoader Installer | `v4.3.0` | 14/05/2026 — cambio packaging macOS (DMG) | n/a | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL — Voice API GA | endpoint REST + WebSocket | 15/04/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Manuale |
| DeepL — Translation Memory API | `translation_memory_id` + threshold | 2026 (live) | non usata | 💡 Idea: per coerenza terminologica nei progetti GameStringer |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` (~4× più veloce, MCP/Terminal-Bench leader) | **19/05/2026 (I/O 2026)** | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 5° giorno** |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (chain `long_context`) | ✅ (tenere come "low-cost") |
| **Claude Opus 4.7** | `claude-opus-4-7` (visual-acuity 98.5%) | 16/04/2026 (GA) | non offerto come scelta env | 🟡 Opportunità (vedi Azione consigliata) |
| Claude Sonnet 4.6 | corrente stabile | 17/02/2026 | `claude-sonnet-4-6` parametrizzato via env | ✅ Risolto 22/05 |
| Claude Sonnet 4.8 | non ufficiale (solo leak codice) | n/a | n/a | ⛔ Non integrare |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (identifier specifico da verificare) | ⚠️ Manuale |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **5 giorni** (priorità massima fra i task manuali).
- **Data esatta patch The Ascent ITA** (Vox Italica) su NexusMods — Q-Gin non riporta data univoca.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **Idea DeepL Translation Memory**: valutare se l'endpoint TM + `translation_memory_id` può sostituire/affiancare la term-base interna per coerenza nei progetti lunghi. Zero codice, solo valutazione (~30 min).
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- **Stato live** patch *Blue Prince DC* e *Cyberpunk 2077 Phantom Liberty DC* — non ricontrollati oggi.
- Aggiungere `claude-opus-4-7` come scelta env opzionale (vedi sezione 🟡 sopra).

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
- [Gemini 3.5 — Google blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [Gemini 3.5 Flash — Model Card DeepMind](https://deepmind.google/models/model-cards/gemini-3-5-flash/)
- [Google I/O 2026 — Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/innovations-from-google-io-26-on-google-cloud)
- [Gemini 3.5 Flash — TechCrunch](https://techcrunch.com/2026/05/19/with-gemini-3-5-flash-google-bets-its-next-ai-wave-on-agents-not-chatbots/)
- [Gemini 3.5 Flash — MarkTechPost](https://www.marktechpost.com/2026/05/20/google-introduces-gemini-3-5-flash-at-i-o-2026-a-faster-and-cheaper-model-for-ai-agents-and-coding/)
- [Gemini API — Release notes / Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Claude Opus 4.7 — Anthropic](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude Opus 4.7 GA — GitHub Changelog](https://github.blog/changelog/2026-04-16-claude-opus-4-7-is-generally-available/)
- [DeepL — Roadmap & Release notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL Voice API — Gilbane](https://gilbane.com/2026/02/deepl-launches-voice-api-for-real-time-speech-transcription-and-translation-for-instant-multilingual-communication/)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [OldGamesItalia — Traduzioni](https://www.oldgamesitalia.net/traduzioni)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Q-Gin — The Ascent ITA (Vox Italica)](https://www.q-gin.info/e-disponibile-la-traduzione-italiana-di-the-ascent-grazie-al-team-vox-italica/)
- [NexusMods — The Ascent Italian Translation (All DLCs)](https://www.nexusmods.com/theascent/mods/33)
- [PCGW — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Ctrl+Trad — itch.io](https://ctrltrad.itch.io/)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
