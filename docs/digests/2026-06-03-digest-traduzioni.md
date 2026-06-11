# 🎮 Digest Traduzioni Videogiochi — 3 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Altra giornata tranquilla. **Nessun drift di versione**: tutti i tool restano allineati (XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2, IPA 3.4.1, MelonLoader 0.7.3 non hard-coded). Una novità ITA databile nella finestra: **Anno 2205** (traduzione amatoriale completa pubblicata il 31 maggio su GamesTranslator.it). Nessun nuovo annuncio di localizzazione ufficiale. Sul fronte LLM, segnalazione (da verificare) di **Gemini 3.1 Pro** in testa al WMT25 e **Claude Opus 4.7** indicato come più forte sul testo letterario.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs`:

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ Invariato |
| 21, 35, 38 | `XUNITY_*` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |

> XUnity.AutoTranslator resta a **5.6.1** (nessuna release più recente su GitHub; ultima del 19/04/2026). BepInEx 6 stabile ancora non pubblicato: solo pre-release `6.0.0-pre.2` + bleeding-edge (ultimo build noto ~755, 07/03/2026; i build > 6.0.0-be.697 introdurranno breaking change verso il primo v6 stabile). Nessun motivo di muoversi dai pin attuali.

**Spunto opzionale (debito tecnico interno, non novità esterna):** resta in piedi il task già annotato nei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`. Diventa più interessante se si vuole agganciare la nuova generazione Gemini 3.x (vedi sezione tool/LLM).

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza` già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, oggi raggiungibili: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian, 2duerighe — vale la pena testarne il parsing in app.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. GamesTranslator.it resta la fonte ITA più viva (vedi sotto), ma il feed `?type=core_File&...&format=rss` continua a essere bloccato lato app — da valutare se un proxy server-side risolverebbe.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **31 mag 2026** | **Anno 2205** | Traduzione ITA **completa** (EN→IT), patch non invasiva | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |
| ~1 giu 2026 | Titan Quest II (Early Access) | Traduzione ITA in test, feedback in corso | GamesTranslator.it |
| 20 mag 2026 | Magicraft (v1.2.23 Steam) | Traduzione ITA aggiornata | GamesTranslator.it |
| 11 mag 2026 | Blue Prince (Director's Cut) | Traduzione ITA ~99,9%, aggiornata | NexusMods / Steam |

> **Anno 2205** è la novità ITA chiaramente *nuova* di questo digest (non presente in quello del 2 giugno). **Little Witch in the Woods** è la patch della finestra precedente (1 giu). **Titan Quest II** è in Early Access: traduzione ancora in test, non definitiva. RomHack Plaza nella settimana non ha esposto nuove patch ITA databili (solo titoli retro NES/SNES già archiviati, autore GiAnMMV).

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio rispetto ai digest precedenti. Restano:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma.

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ Allineato |
| BepInEx 6 | 6.0.0-pre.2 (pre-release) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (14/05/2026) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | nessuna nuova release | n/a | ➖ Nessuna novità |
| UnityEx | nessuna novità databile | n/a | ➖ Nessuna novità |

**Provider LLM (segnalazioni da verificare):** un comparativo 2026 indica **Gemini 3.1 Pro** in testa al benchmark WMT25 (subentrato a Gemini 2.5 Pro), prezzo ~$2/M token input, e **Claude Opus 4.7** come più forte sul testo letterario/tone-sensitive. **DeepL** ha annunciato *DeepL Voice-to-Voice* (16/04/2026) con early access "DeepL Voice for Meetings" previsto per giugno 2026 — non rilevante per la traduzione di stringhe di gioco. Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido; se confermata la disponibilità di Gemini 3.x, il refactor del modello hard-coded (vedi sezione Azione) diventerebbe il modo più pulito per agganciarlo senza scrivere nuovo codice di provider.

---

## 📝 Cose non verificate / da controllare manualmente

- **Anno 2205**: confermare su GamesTranslator.it l'esatto stato (completa, versione gioco testata) e la piattaforma. Indicato come "completa, patch non invasiva" ma da spuntare a mano.
- **Gemini 3.1 Pro / Claude Opus 4.7**: i nomi modello e i risultati WMT25 provengono da articoli comparativi di terze parti (pasqualepillitteri.it, intlpull.com) — verificare la disponibilità reale via API ufficiale prima di pinnarli nel progetto.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **BepInEx 6 stabile**: continuare a monitorare — quando esce la prima v6 stabile sarà il momento di valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be) · [v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [Games Translator (home)](https://www.gamestranslator.it/) · [Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali/comments)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Best AI Translator 2026 — DeepL/ChatGPT/Claude/Gemini (Pillitteri)](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison) · [LLM Translation Benchmark 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [DeepL Voice-to-Voice (Gigazine)](https://gigazine.net/gsc_news/en/20260417-deepl-voice-to-voice/)
