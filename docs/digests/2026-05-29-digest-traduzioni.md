# 📰 Digest Traduzioni Videogiochi — 29 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 28 Maggio**: **giornata tranquilla, nessuna novità verificabile nelle ultime 24h.** Tool Unity/Unreal a monte invariati (XUnity `v5.6.1`, BepInEx `v6.0.0-pre.2`, UnrealLocres `v1.1.1`, MelonLoader ~`v0.7.3`). Nessun nuovo modello Anthropic dopo Opus 4.8 (28/05): **Claude Sonnet 4.8 ancora non annunciato**, Sonnet 4.6 resta il default sensato. Nessuna nuova patch ITA emersa rispetto al catalogo già tracciato (Unsighted v1.1.4 resta il file più recente su GamesTranslator). I task aperti scorrono di un giorno: **Gemini 3.5 Flash drift = 9° giorno**, **Claude Opus 4.8 env-var = giorno 1**, **5 feed RSS in pending test = 9° giorno**.

---

## 🔥 Azione consigliata per GameStringer

### 🔴 Drift Gemini 3.5 Flash — STILL OPEN (9° giorno)

Stato invariato dal 22/05. `gemini-3.5-flash` è GA dal 19/05/2026 (Google I/O 2026), $1.50/$9.00 per MTok, ~4× più veloce di Gemini 3.1 Pro. GameStringer riferisce ancora a generazioni precedenti:

```
lib/ai/ai-translate-direct.ts          → gemini-2.0-flash, gemini-3.1-flash-lite
lib/ai/ai-post-edit.ts                 → gemini-2.0-flash
lib/ocr/vision-translate.ts            → gemini-2.0-flash
lib/lore-assistant.ts                  → gemini-2.0-flash
lib/ai/smart-content-router.ts         → gemini-2.0-flash
```

**Proposta operativa (immutata)**: introdurre `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`, mantenere `gemini-3.1-flash-lite` come opzione esplicita nel preset `long_context`. Aggiornare `lib/translation/chain-presets.ts` e `language-mappings.ts:124`. Smoke test su 50 stringhe prima di promuovere il default. Allineare anche `docs/TRANSLATION_INNOVATIONS_2026.md:19` (cita ancora Gemini 3.1 come "il nuovo modello"). Verifica `*-preview` già eseguita il 28/05: nessuna occorrenza residua, nessuna bonifica necessaria.

### 🟡 Claude Opus 4.8 — opportunità aperta (giorno 1, rilasciato 28/05/2026)

Confermato: Opus 4.8 è l'ultimo modello Anthropic, `claude-opus-4-8`, $5/$25 per MTok (invariato vs 4.7/4.6), fast mode $10/$50, context 1M, hybrid reasoning. **Nessun Sonnet 4.8** annunciato: Sonnet 4.6 resta il default corretto.

**Proposta operativa**: estendere la logica env già presente per `claude-sonnet-4-6` per consentire `claude-opus-4-8` come opzione "premium" (Lore Assistant / Vision-OCR su asset complessi). Usare direttamente l'identifier `claude-opus-4-8` (la vecchia proposta "Opus 4.7" è superata). **Promemoria deprecation**: `claude-sonnet-4` e `claude-opus-4` legacy si spengono il **15/06/2026** — GameStringer non li usa più direttamente, ma vale un grep nei test/snapshot prima di metà giugno.

### 🟡 DeepL Translation Memory + Spoken Terms — valutazione ancora pendente

(Invariato) Translation Memory API live (`translation_memory_id` + `translation_memory_threshold`), Spoken Terms GA dal 07/05, Voice API GA dal 15/04 (+ speech-to-speech aggiunto a fine maggio). Non rilevante per il flusso testuale attuale; archiviato per iterazioni future.

### ✅ Drift versioni tool Unity / Unreal — zero drift (9° giorno consecutivo)

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
| MelonLoader | n/a (non integrato) | `v0.7.3` (~14/05/2026) | ➖ (roadmap) |

> 🟢 **Conferma 9° giorno**: nessuna `v6.0.0-pre.3` di BepInEx, nessuna `v5.6.2`/`v5.7` di XUnity verificata su GitHub/Thunderstore/SourceForge. Sulla data esatta MelonLoader 0.7.x permane una piccola ambiguità tra fonti (0.7.2 vs 0.7.3 a metà maggio) — irrilevante: MelonLoader non è integrato in GameStringer.

---

## 📡 Proposte fonti RSS

**Nessuna nuova proposta forte oggi.** Le 5 fonti aggiunte il 20/05 (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe` — `lib/news-feeds.ts:115–119`) restano `enabled: false` in attesa di test in app: **9° giorno consecutivo di pending**. È l'unico task arretrato cronico — da chiudere per evitare bit rot delle URL.

Candidate riprese (invariate, da pre-testare con `curl -I`):

- `languagepack_it` → `https://www.languagepack.it/feed/` (WordPress LPI, alta priorità per copertura nuove patch ITA + gestione lingue).
- `qgin` → `https://www.q-gin.info/feed/` (WordPress, RSS quasi certo; cadenza pluri-settimanale).
- `rulesless` → `https://letraduzionidirulesless.wordpress.com/feed/`
- `sadnescity` → `https://www.sadnescity.it/` (no RSS noto, da verificare).

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 23–29 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~28 mag 2026 | **Unsighted v1.1.4** (Steam) | Patch ITA — file più recente nel catalogo GamesTranslator (autore Godran65) | GamesTranslator.it |
| 26 mag 2026 | **Oblivion Remastered** (doppiaggio AI) | Annuncio progetto VoiceProjectITA + Throne Project (dubbing AI ITA in lavorazione, no ETA) | Q-Gin |
| 24 mag 2026 | Real Robots Final Attack (PS1) | Patch ITA completata | RomHack Plaza |
| 20 mag 2026 | **Magicraft** (Roguelike) | Aggiornamento patch ITA (CaramellaGTX) | GamesTranslator.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA "versione 2026 DC" (frames + final puzzle) | GamesTranslator.it / NexusMods |

> 🟢 **Nessuna nuova patch ITA emersa nelle ultime 24h.** Il catalogo è invariato rispetto al digest del 28/05 — Unsighted v1.1.4 resta l'ultimo file con visibilità nuova. Voci storiche più vecchie (Ace Combat 3 v4.0, Mizzurna Falls, Racing Lagoon, The Ascent/Vox Italica, IMPETUM, Card Artisan) restano nell'archivio del digest del 28/05; non ripetute qui perché non aggiornate.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026 (Sabotage Studio): localizzazione ITA ufficiale per gioco principale + DLC *Throes of the Watchmaker*. **Nono giorno post-rilascio**, nessuna nuova nota.
- **Oblivion Remastered** — versione ufficiale con testi/UI/sub ITA ma doppiaggio solo EN (contesto del progetto AI-dub fan-made di VoiceProjectITA). Nessun aggiornamento.
- *Nessun nuovo annuncio ufficiale ITA tracciabile nelle ultime 24h.* (Europa Universalis 5 continua ad alimentare il dibattito sulla localizzazione ITA in articoli d'opinione, ma senza annuncio ufficiale.)

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` | stabile (`v5-lts`) | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| UnrealLocres | `v1.1.1` | 24/10/2025 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` (~14/05/2026) | metà maggio 2026 | n/a (non integrato) | ➖ |
| **Gemini 3.5 Flash** | `gemini-3.5-flash` ($1.50/$9.00 MTok, ~4×) | 19/05/2026 (I/O 2026) | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded in 5 file** | 🔴 **Drift — 9° giorno** |
| Gemini 3.1 Flash-Lite | GA | 07/05/2026 | già integrato (chain `long_context`) | ✅ |
| **Claude Opus 4.8** | `claude-opus-4-8` ($5/$25 MTok, fast $10/$50, ctx 1M) | 28/05/2026 | non offerto come scelta env | 🟡 Opportunità (giorno 1) |
| Claude Sonnet 4.8 | **non annunciato** | — | — | ➖ Nessun segnale |
| Claude Sonnet 4.6 | stabile | 17/02/2026 | `claude-sonnet-4-6` parametrizzato | ✅ |
| Claude Sonnet 4 / Opus 4 (legacy) | **retirement 15/06/2026** | deprecation in corso | non usati direttamente | ℹ️ Bonifica test/snapshot |
| DeepL — Voice / Spoken Terms / TM API | REST + WebSocket, vocab custom, TM | GA mag 2026 | parzialmente integrato | ⚠️ Manuale / 💡 Idee |
| OpenAI GPT-5.x | corrente 2026 | — | `openai` provider (identifier da verificare) | ⚠️ Manuale |

---

## 📝 Cose NON verificate (da controllare manualmente)

- **Test in app dei 5 feed RSS** aggiunti il 20/05 → pendente da **9 giorni**, priorità massima fra i task manuali.
- **Schema JSON `gemini-3.5-flash`**: round-trip su 50 stringhe + diff vs `gemini-2.0-flash` prima del bump default. Allineamento regex parser di `ai-translate-direct.ts` (`responseText.match(/\[[\s\S]*\]/)`).
- **Aggiungere `claude-opus-4-8`** come scelta env opzionale (premium); estendere la logica esistente di `claude-sonnet-4-6`.
- **Bonifica** eventuali riferimenti residui a `claude-sonnet-4` / `claude-opus-4` nei test/snapshot (retirement 15/06/2026).
- **`docs/TRANSLATION_INNOVATIONS_2026.md` linea 19** cita ancora Gemini 3.1 come "il nuovo modello" — aggiornare al bump 3.5.
- **Data esatta patch Unsighted v1.1.4 ITA** (Godran65) — non timestamp-ata in modo pubblico univoco.
- **Identifier OpenAI in uso** (`gpt-4o`? `gpt-5`? `gpt-5.x`?) — non indagato.
- **Endpoint DeepL Voice / Translation Memory** attualmente usati in GameStringer — da grep manuale.
- **Monitorare progetto VoiceProjectITA** (dubbing AI ITA Oblivion) — categoria adiacente, non feature GameStringer.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator — v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [UnrealLocres — Releases](https://github.com/akintos/UnrealLocres/releases)
- [Language Pack Italia — Home](https://www.languagepack.it/)
- [Q-Gin — Tag traduzione italiana](https://www.q-gin.info/argomento/traduzione-italiana/)
- [Q-Gin — Oblivion Remastered doppiaggio italiano (26/05/2026)](https://www.q-gin.info/oblivion-remastered-in-arrivo-il-doppiaggio-italiano/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Gemini API — Release notes / Changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Gemini 3.5 Flash — Google I/O 2026 (TechCrunch)](https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/)
- [Anthropic — Claude Opus 4.8 (28/05/2026, Coursiv)](https://coursiv.io/blog/claude-opus-4-8)
- [Claude — Release Notes (Releasebot)](https://releasebot.io/updates/anthropic/claude)
- [Claude Sonnet 4.8 — stato (Codersera)](https://codersera.com/blog/claude-sonnet-4-8-release-date-whats-new-2026/)
- [DeepL — Roadmap & Release notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [Games Translator — Home](https://www.gamestranslator.it/index.php)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [NexusMods — Blue Prince Director's Cut ITA](https://www.nexusmods.com/blueprince/mods/18)
- [PCGW — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
