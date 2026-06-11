# 📰 Digest Traduzioni Videogiochi — 24 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 23 Maggio**: **giornata estremamente tranquilla** (domenica). Zero nuove release upstream per i tool Unity (XUnity 5.6.1, BepInEx 5.4.23.4 / 6.0.0-pre.2, MelonLoader 0.7.3, UnrealLocres 1.1.1 — tutto invariato). Sul fronte ITA, **nessuna nuova patch tracciata nelle ultime 24h** dalle fonti standard (Q-Gin, GamesTranslator, romhacking.it, RomHack Plaza). L'unica novità marginale è la conferma che **MelonLoader Installer 4.3.0** è uscito il 14/05 con cambio packaging macOS (DMG anziché ZIP) — irrilevante per Windows. La **drift Gemini 3.5 Flash** segnalata dal 22/05 è **STILL OPEN** (4° giorno consecutivo).

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (4° giorno)

Nessun cambio sul codice dal 22/05. Il drift è documentato in dettaglio nei digest del 22 e 23 maggio. Stato attuale (grep ripetuto, zero modifiche):

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata da ieri)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context`, aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima del default.

**Aggiornamento dalle ricerche odierne**: confermato che 3.5 Flash è ora disponibile anche nell'app Gemini consumer e in AI Mode globalmente (20/05/2026), e che secondo benchmark indipendenti gira ~4× più veloce di Claude Opus 4.7 e GPT-5.5. Per RPG con script lunghi è il vincitore meccanico assoluto del rapporto velocità/costo (vedi `TRANSLATION_INNOVATIONS_2026.md`).

> ⚠️ Da aggiornare contestualmente: `docs/TRANSLATION_INNOVATIONS_2026.md:19` cita ancora "Gemini 3.1 Flash-Lite è il nuovo modello Google" — promemoria ribadito.

### ✅ Drift versioni tool Unity — zero drift

| Componente | In progetto | Upstream latest | Stato |
|---|---|---|---|
| XUnity.AutoTranslator (BepInEx) | `v5.6.1` (`unity_patcher.rs:35`) | `v5.6.1` (19/04/2026) | ✅ |
| XUnity.AutoTranslator (BepInEx IL2CPP) | `v5.6.1` (`unity_patcher.rs:38`) | `v5.6.1` | ✅ |
| XUnity.AutoTranslator (IPA) | `v5.6.1` (`unity_patcher.rs:21`) | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` (`unity_patcher.rs:10–11`) | `v5.4.23.4` (master last commit 24/04/2026) | ✅ |
| BepInEx 5 Legacy | `v5.4.11` (`unity_patcher.rs:14–15`) | `v5.4.11` | ✅ |
| BepInEx 6 Mono | `v6.0.0-pre.2` (`unity_patcher.rs:25,27`) | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 IL2CPP | `v6.0.0-pre.2` (`unity_patcher.rs:30–31`) | `v6.0.0-pre.2` | ✅ |
| IPA (Illusion) | `3.4.1` (`unity_patcher.rs:18`) | `3.4.1` | ✅ |
| UnrealLocres | `v1.1.1` | `v1.1.1` (nessuna release 2026) | ✅ |
| MelonLoader | n/a (non integrato) | `v0.7.3` (14/05/2026) | ➖ (roadmap) |
| MelonLoader Installer | n/a | `v4.3.0` (14/05/2026) — solo cambio packaging macOS | ➖ |

Note: BepInEx 6.0.0-pre.3 **non** è ancora uscito. Bleeding-edge build #755 del 07/03/2026 — non consigliata per produzione.

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano in attesa di test in app: **4° giorno consecutivo di pending**. È il singolo task manuale più in arretrato della settimana.

**Candidate riprese (low priority, sempre `enabled: false` di default)**:

- `languagepack_it` → `https://www.languagepack.it/feed/`
- `qgin` → `https://www.q-gin.info/feed/`
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/` (sito tutt'ora attivo, confermato da ricerca odierna)
- `sadnescity` → `https://www.sadnescity.it/` (storico team di traduzioni, no RSS noto — da verificare)

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 18–24 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 20 mag 2026 | (collezione GamesTranslator) | Ultimo aggiornamento generale catalogo | GamesTranslator.it |
| 16 mag 2026 | (collezione GamesTranslator) | Una traduzione 100% completa con revisione DLC in corso | GamesTranslator.it |
| ~15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 (più micro-update sopra 1.7.1 senza changelog Steam — re-upload pacchetti immagini il 15/05) | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it |
| ~maggio 2026 | The Ascent + 3 DLC (team Vox Italica) | Pubblicata su NexusMods. Riportata dal 23/05 | Q-Gin / NexusMods |
| ~maggio 2026 | Ace Combat 3 (PS1) — Patch ITA v4.0 | AppendDisc + Mission 00 + sottotitoli ITA filmati esclusivi. Riportata dal 23/05 | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa RickTM + Grandpa Theobald. Riportata dal 23/05 | romhacking.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA (>5.200 frasi nuove, >4.000 eliminate dopo update 30/04) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata | GamesTranslator.it |

> ⚠️ **Vera novità rispetto a ieri**: **NESSUNA**. Le ultime 24h non hanno introdotto patch ITA tracciabili dalle fonti standard. Domenica fisiologicamente silenziosa. La tabella sopra è riportata per continuità con il digest del 23/05 — non sono comparsi nuovi item.

> ℹ️ Verifica manuale ribadita: data esatta della patch *The Ascent* (Vox Italica) su NexusMods (`https://www.nexusmods.com/theascent/mods/33`, campo "Last updated").

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Quarto giorno post-rilascio, copertura stampa ormai consolidata.** Nessuna novità nelle 24h.
- *Nessun nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` | stabile (LTS branch `v5-lts`) | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | build #755 | 07/03/2026 (non raccomandata) | n/a | ➖ |
| UnrealLocres | `v1.1.1` | nessuna release 2026 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ Roadmap condizionata |
| MelonLoader Installer | `v4.3.0` | 14/05/2026 — cambio packaging macOS (DMG) | n/a | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL Voice API | `v1/voice/realtime` + *Spoken Terms* GA 07/05/2026 | 02/02/2026 / 07/05/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Manuale |
| **Gemini 3.5 Flash** | **`gemini-3.5-flash`** ($1.50/$9 1M, 65k output, 1M input, ~4× più veloce di Opus 4.7 e GPT-5.5) | **19/05/2026 (I/O 2026)** | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 4° giorno** |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (chain `long_context`) | ✅ (tenere come "low-cost") |
| Claude (Anthropic) | `claude-sonnet-4-6` | 17/02/2026 | `claude-sonnet-4-6` parametrizzato via env | ✅ Risolto 22/05 |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (identifier specifico da verificare) | ⚠️ Manuale |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **4 giorni** (priorità massima fra i task manuali).
- **Data esatta patch The Ascent ITA** (Vox Italica) su NexusMods — Q-Gin non riporta data univoca.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- **Endpoint DeepL Voice attualmente usato in GameStringer**: legacy o `v1/voice/realtime`? Da grep manuale.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non indagato.
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- Stato live patch **Blue Prince DC** e **Cyberpunk 2077 Phantom Liberty DC** — non ricontrollati oggi (nessun motivo di dubitare).
- Test alternativo: provare `https://letraduzionidirulesless.wordpress.com/feed/` (sito tutt'ora attivo, WordPress = RSS quasi certo). Potenziale candidato `enabled: true` se passa il test CORS.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator — v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/bepinex/bepinex/releases)
- [BepInEx — Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [MelonLoader Installer — Releases](https://github.com/LavaGang/MelonLoader.Installer/releases)
- [MelonLoader — v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres — Releases](https://github.com/akintos/UnrealLocres/releases)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [Gemini 3.5 Flash — yourlifeupdated review](https://www.yourlifeupdated.net/news/gemini-3-5-flash-google-io-benchmark-novita)
- [Gemini 3.5 Flash — howtechismade](https://www.howtechismade.com/news/gemini-3-5-flash-e-ufficiale-piu-veloce-intelligente-e-promette-una-migliore-programmazione-e-agenti/)
- [Gemini 3.5 Flash — gomoot](https://gomoot.com/gemini-3-5-flash-il-modello-veloce-di-google-che-batte-il-flagship-gemini-3-1-pro/)
- [Gemini Omni 3.5 Flash app — tuttoandroid](https://www.tuttoandroid.net/news/2026/05/20/gemini-omni-3-5-flash-disponibili-in-app-1154508/)
- [LLM Translation Benchmark 2026 — intlpull](https://intlpull.com/blog/llm-translation-quality-benchmark-2026)
- [The Best AI Translator of 2026 — pasqualepillitteri](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison)
- [Gemini 3.5 Flash vs GPT-5.5 vs Claude vs DeepSeek (2026)](https://www.buildfastwithai.com/blogs/gemini-3-5-flash-vs-gpt-5-5-claude-deepseek-2026)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [OldGamesItalia — Traduzioni](https://www.oldgamesitalia.net/traduzioni)
- [SadNES cITy — Traduzioni](https://www.sadnescity.it/traduzioni.php)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/il-nuovo-dlc-di-sea-of-stars-throes-of-the-watchmaker-introduce-la-localizzazione-italiana/)
- [Q-Gin — The Ascent ITA (Vox Italica)](https://www.q-gin.info/e-disponibile-la-traduzione-italiana-di-the-ascent-grazie-al-team-vox-italica/)
- [NexusMods — The Ascent Italian Translation (All DLCs)](https://www.nexusmods.com/theascent/mods/33)
- [PCGW — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
