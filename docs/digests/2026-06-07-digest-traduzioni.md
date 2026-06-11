# 🎮 Digest Traduzioni Videogiochi — 7 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla, in continuità con il 6 giugno. **Nessun drift di versione**: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / Legacy 5.4.11, IPA 3.4.1, MelonLoader 0.7.3 (non scaricato dal progetto) restano allineati agli upstream. Sul fronte ITA nessuna patch genuinamente nuova rispetto a ieri. Nessun nuovo annuncio di localizzazione ITA ufficiale: lo strascico del **Summer Game Fest 2026** (5 giu) continua a non produrre annunci ITA-specifici in finestra; da monitorare **First Playable 2026** a Firenze (10–12 giu). Fronte LLM e RSS invariati.

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

> XUnity.AutoTranslator resta a **5.6.1** (ultima release GitHub 19/04/2026, nessuna successiva). BepInEx 6 stabile ancora non pubblicato: l'ultima `pre` è `6.0.0-pre.2`, mentre i bleeding-edge sono arrivati a `6.0.0-be.755` (07/03/2026) — i build > `6.0.0-be.697` introducono breaking change verso la prima v6 stabile, quindi i pin attuali restano la scelta corretta. Nessun motivo di muovere le versioni.

**Spunto opzionale (debito tecnico interno, non novità esterna):** resta valido il task già annotato nei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`. Utile se in futuro si vorrà agganciare la generazione Gemini 3.x.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza`, già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, da ritestare in app: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. GamesTranslator.it resta la fonte ITA più viva ma il feed continua a essere bloccato lato app — resta da valutare un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 4 giu 2026 | Blood.West | Aggiornamento patch ITA a **v4.6.2** (Steam) segnalato; lavoro indicato ancora in corso — *da confermare a mano* | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | Traduzione ITA pubblicata (CoccoLoco); segnalazioni del 3 giu di frasi ancora in inglese — patch in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | Traduzione ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |
| 31 mag 2026 | Anno 2205 | Traduzione ITA completa (EN→IT), patch non invasiva | GamesTranslator.it |

> **Nessuna patch ITA genuinamente nuova oggi** rispetto al digest del 6 giugno. Le voci sopra sono riportate per continuità settimanale ed erano già nei digest precedenti. RomHack Plaza espone solo titoli retro ITA già archiviati (EarthBound Beginnings, Adventure Island III, Battle City, Final Fight 3, Felix the Cat, Zelda OoT Master Quest — tutti by GiAnMMV, non databili in finestra). Lato Steam (gruppo/curator "Traduzioni Italiane Amatoriali") nessuna nuova pubblicazione databile negli ultimi 7 giorni.

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio rispetto ai digest precedenti.

- **Summer Game Fest 2026** (showcase 5 giu): lo strascico di reveal (Resident Evil Veronica, Final Fantasy VII Revelation, Lords of the Fallen 2, The Wolf Among Us 2, ecc.) continua a **non produrre annunci di localizzazione ITA specifici** in finestra. Da monitorare le schede prodotto man mano che escono con le lingue supportate.
- **First Playable 2026** a Firenze (10–12 giugno) — possibile contesto per annunci di localizzazione ITA nei prossimi giorni; da monitorare.
- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma.

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

**Provider LLM (segnalazioni da verificare):** quadro sostanzialmente invariato. I comparativi 2026 continuano a indicare **Gemini 3.1 Pro** in testa ai benchmark generalisti (~$2/M token input) e **DeepL** forte su UI strings e lingue europee. **Claude** resta indicato tra i migliori per tono e sfumatura culturale (output naturale per madrelingua). Unico segnale fresco (1 giu): Anthropic ha annunciato un upgrade della linea **Claude Opus** (Opus 4.8, contesto default 1M token) — rilevante più per i task agentici/coding che per la traduzione pura, ma da valutare come opzione qualità sul testo tone-sensitive. Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido.

---

## 📝 Cose non verificate / da controllare manualmente

- **Blood.West v4.6.2**: confermare su GamesTranslator.it se l'aggiornamento della patch è completo o ancora in lavorazione, e la versione del gioco testata.
- **Luna Abyss**: confermare lo stato reale (segnalazione del 3 giu di dialoghi ancora in inglese) prima di considerarla completa.
- **Summer Game Fest / First Playable**: controllare a mano nei prossimi giorni le schede dei titoli annunciati per eventuali conferme di localizzazione ITA ufficiale.
- **Claude Opus 4.8 / Gemini 3.1 Pro / nomi modello LLM**: risultati da articoli comparativi e annunci di terze parti — verificare disponibilità reale e stringhe modello via API ufficiale prima di pinnarli nel progetto.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **BepInEx 6 stabile**: continuare a monitorare — quando esce la prima v6 stabile sarà il momento di valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases/) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [Games Translator (home)](https://www.gamestranslator.it/) · [Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali) · [Curator](https://store.steampowered.com/curator/31747270-Traduzioni-Italiane-Amatoriali/)
- [Summer Game Fest 2026 — annunci (Everyeye)](https://www.everyeye.it/articoli/speciale-summer-game-fest-2026-riassunto-annunci-evento-geoff-keighley-67226.html) · [Giochi 2026 con doppiaggio ITA (Everyeye)](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/) · [Language Pack Italia — tool (Q-Gin)](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Best AI Translator 2026 (Pillitteri)](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison) · [AI Updates Today — June 2026 (llm-stats)](https://llm-stats.com/llm-updates)
