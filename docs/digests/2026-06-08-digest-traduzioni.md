# 🎮 Digest Traduzioni Videogiochi — 8 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Altra giornata tranquilla, in continuità con il 7 giugno. **Nessun drift di versione**: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / Legacy 5.4.11, IPA 3.4.1 restano allineati agli upstream. Una novità ITA concreta: **Trails in the Sky 1st Chapter** — traduzione ITA completa al 100% aggiornata il 6 giugno (Steam/GOG, post-update K03). Sul fronte industria, segnale interessante per la feature di traduzione live: **thatgamecompany ha integrato l'API DeepL in Sky: Children of the Light** per tradurre le chat di gioco in tempo reale. Nessun nuovo annuncio di localizzazione ITA ufficiale. Fronte RSS invariato.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs` (versioni estratte con Grep, confrontate con le release GitHub odierne):

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ Invariato |
| 21 | `XUNITY_IPA_URL` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |
| 35, 38 | `XUNITY_URL` / `XUNITY_IL2CPP_URL` | `5.6.1` | 5.6.1 | ✅ Allineato |

> XUnity.AutoTranslator resta a **5.6.1** (ultima release GitHub 19/04/2026, nessuna successiva). BepInEx 6 stabile ancora non pubblicato: l'ultima `pre` è `6.0.0-pre.2`, i bleeding-edge sono a `6.0.0-be.755` (07/03/2026) e i build > `be.697` introducono breaking change verso la prima v6 stabile, quindi i pin attuali restano la scelta corretta. Nessun motivo di muovere le versioni.

**Spunto opzionale (ispirazione, non drift):** thatgamecompany ha integrato l'**API DeepL** direttamente in *Sky: Children of the Light* per tradurre le chat dei giocatori in tempo reale (scelta della traduzione diretta invece del pivot via inglese, per preservare le sfumature). È esattamente il caso d'uso "live translation" che GameStringer copre lato XUnity/OCR: vale come conferma di mercato e come spunto se in futuro si volesse posizionare la traduzione real-time come feature di punta. Nessuna azione di codice richiesta.

**Spunto opzionale (debito tecnico interno, già annotato):** resta valido il task dei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza`, già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, da ritestare in app: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian, 2duerighe.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. GamesTranslator.it resta la fonte ITA più viva ma il feed continua a essere bloccato lato app — resta da valutare un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 6 giu 2026 | **Trails in the Sky 1st Chapter** | **NOVITÀ** — traduzione ITA completa al 100% con revisione completa; aggiornata dopo gli update K03 (Steam `1.1.37157.K03` / GOG, testata su Steam v1.06) | Steam Guide / GamesTranslator.it |
| 4 giu 2026 | Blood.West | Aggiornamento patch ITA a **v4.6.2** (Steam); lavoro ancora in corso — *da confermare a mano* | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | Traduzione ITA pubblicata (CoccoLoco); segnalazioni di frasi ancora in inglese — patch in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | Traduzione ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |

> **Unica voce genuinamente nuova oggi: Trails in the Sky 1st Chapter** (aggiornamento del 6 giugno post-patch K03). Le altre righe sono riportate per continuità settimanale ed erano già nei digest precedenti. RomHack Plaza espone solo titoli retro ITA già archiviati (EarthBound Beginnings, Adventure Island III, Battle City, Final Fight 3, Yu-Gi-Oh! Forbidden Memories, Zelda OoT Master Quest — tutti by GiAnMMV, non databili in finestra). Lato Steam ("Traduzioni Italiane Amatoriali") nessuna nuova pubblicazione databile oltre a Trails.

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio di localizzazione ITA ufficiale rispetto ai digest precedenti.

- **Sky: Children of the Light (thatgamecompany)** — integrazione dell'**API DeepL** per la traduzione in tempo reale delle chat in-game (non è una localizzazione ITA del gioco in sé, ma un caso industriale rilevante di AI translation live). Da monitorare come trend.
- **First Playable 2026** a Firenze (10–12 giugno) — possibile contesto per annunci di localizzazione ITA nei prossimi giorni; da monitorare.
- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Summer Game Fest 2026** (5 giu): lo strascico di reveal continua a **non produrre annunci ITA-specifici** in finestra.

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ Allineato |
| BepInEx 6 | 6.0.0-pre.2 (pre-release; BE a be.755) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | v1.1.1 (nessuna nuova release) | n/a | ➖ Nessuna novità |
| UnityEx | nessuna novità databile | n/a | ➖ Nessuna novità |

**Provider LLM (segnalazioni da verificare):** quadro invariato. I comparativi 2026 continuano a indicare **Gemini 3.1 Pro** in testa ai benchmark generalisti (~$2/M token input) e forte sui task multimodali (PDF, screenshot, video). **DeepL** resta forte su lingue europee e UI strings — confermato dall'adozione in *Sky: Children of the Light*. **Claude** indicato tra i migliori per contenuti letterari/tone-sensitive (i comparativi oggi citano la linea **Claude Opus 4.7** per l'approvazione dei traduttori professionisti — *nota: ieri alcune fonti citavano Opus 4.8, variabilità tra articoli, da verificare via API*). Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido.

---

## 📝 Cose non verificate / da controllare manualmente

- **Trails in the Sky 1st Chapter**: confermare su GamesTranslator.it / guida Steam la copertura reale (100%?) e la compatibilità con l'ultima build K03 prima di considerarla stabile.
- **Blood.West v4.6.2**: confermare se l'aggiornamento è completo o ancora in lavorazione, e la versione del gioco testata.
- **Luna Abyss**: confermare lo stato reale (dialoghi ancora in inglese segnalati) prima di considerarla completa.
- **Nomi modello LLM (Claude Opus 4.7 vs 4.8 / Gemini 3.1 Pro)**: discrepanze tra articoli comparativi — verificare le stringhe modello reali via API ufficiale prima di pinnarle nel progetto.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **First Playable 2026 (10–12 giu)**: controllare a mano nei prossimi giorni eventuali annunci di localizzazione ITA.
- **BepInEx 6 stabile**: continuare a monitorare — al primo rilascio v6 stabile valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases/) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [Games Translator (home)](https://www.gamestranslator.it/) · [Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Trails in the Sky — Guida Traduzione ITA (Steam/GOG)](https://steamcommunity.com/sharedfiles/filedetails/?id=3401457584)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali)
- [Sky: Children of the Light adotta DeepL per la traduzione in-game (Aitoolsbee)](https://aitoolsbee.com/news/in-game-translation-powers-sky-as-thatgamecompany-adopts-deepl/)
- [Best AI Translator 2026 (Pillitteri)](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison) · [AI Updates Today — June 2026 (llm-stats)](https://llm-stats.com/llm-updates)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
