# 🎮 Digest Traduzioni Videogiochi — 2 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla. Nessun drift di versione (tutti i tool restano allineati come ieri). Una sola novità ITA databile nella finestra: **Little Witch in the Woods** (traduzione amatoriale pubblicata l'1 giugno). Nessun nuovo annuncio di localizzazione ufficiale. Provider LLM stabili.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs`:

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ Invariato |
| 21, 35, 38 | `XUNITY_*` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |

> XUnity.AutoTranslator resta a **5.6.1** (nessuna release più recente su GitHub). BepInEx 6 stabile ancora non pubblicato (solo pre-release `6.0.0-pre.2` + bleeding-edge). Nessun motivo di muoversi dai pin attuali.

**Spunto opzionale (non urgente):** resta in piedi il task di codice già annotato — bump dei modelli Gemini hard-coded da `gemini-2.0-flash` a lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`. Non è una novità esterna, è debito tecnico interno.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza` già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Fonti già presenti ma disattivate: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian, 2duerighe — oggi tutte raggiungibili, vale la pena testarne il parsing in app.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. Nota: GamesTranslator.it resta la fonte ITA più viva (vedi sezione sotto) ma il suo feed `?type=core_File&...&format=rss` continua a essere bloccato da CORS lato app — da verificare se un proxy server-side risolverebbe.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **1 giu 2026** | **Little Witch in the Woods** | Traduzione ITA pubblicata (a cura di CaramellaGTX) | GamesTranslator.it |
| ~1 giu 2026 | **Titan Quest II** (Early Access) | Traduzione ITA in test, feedback in corso | GamesTranslator.it |
| 20 mag 2026 | Magicraft | Traduzione ITA aggiornata | GamesTranslator.it |
| 11 mag 2026 | Blue Prince (Director's Cut) | Traduzione ITA ~99,9%, aggiornata | NexusMods / Steam |

> **Little Witch in the Woods** è l'unica patch ITA chiaramente *nuova* nella finestra dei 7 giorni. **Titan Quest II** è in Early Access: la traduzione è ancora in fase di test (non definitiva). RomHack Plaza nella settimana non ha esposto nuove patch ITA databili (solo titoli retro NES/SNES già archiviati).

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio rispetto ai digest precedenti. Restano:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma. [NerdPool — già citato]

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ Allineato |
| BepInEx 6 | 6.0.0-pre.2 (pre-release) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (~14–21/05/2026) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | nessuna nuova release | n/a | ➖ Nessuna novità |

---

## 📝 Cose non verificate / da controllare manualmente

- **Little Witch in the Woods**: confermare su GamesTranslator.it lo stato esatto (completa vs WIP) e la piattaforma testata.
- **Titan Quest II**: è in EA e la traduzione è in test — non darla per completa.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **Provider LLM**: landscape stabile. Conferme: frontier (Claude Opus 4.6, GPT-5) forti su testo narrativo, Gemini competitivo su coppie specifiche, DeepL leader su stringhe corte/UI (e ora integrato in-game da thatgamecompany per Sky — non novità di questa settimana). Il setup GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido. Nessun nuovo elemento operativo oggi.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [Games Translator (home)](https://www.gamestranslator.it/)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali/comments)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Language Pack Italia Hub — Q-Gin](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [LLM Translation Benchmark 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [thatgamecompany adotta DeepL per Sky (Aitoolsbee)](https://aitoolsbee.com/news/in-game-translation-powers-sky-as-thatgamecompany-adopts-deepl/)
