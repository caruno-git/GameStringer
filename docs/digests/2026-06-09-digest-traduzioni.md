# 🎮 Digest Traduzioni Videogiochi — 9 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla, in continuità con l'8 giugno. **Nessun drift di versione**: XUnity 5.6.1 (ultima GitHub 19/04/2026, nessuna release successiva), BepInEx 5.4.23.5 / 6.0.0-pre.2 / Legacy 5.4.11, IPA 3.4.1 restano allineati agli upstream. **Nota operativa:** il budget WebSearch ha raggiunto il limite mensile a metà esecuzione — le ricerche su tool (XUnity, BepInEx) sono andate a buon fine e confermano l'assenza di drift, ma le ricerche mirate su nuove patch ITA, localizzazioni ufficiali e RomHack Plaza **non sono state completate oggi** e vanno ricontrollate a mano. Nessuna nuova voce ITA confermabile rispetto al digest di ieri. Fronte RSS invariato.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool verificabili sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs` (versioni estratte con Grep, confrontate con le release GitHub di oggi):

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ Invariato |
| 21 | `XUNITY_IPA_URL` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |
| 35, 38 | `XUNITY_URL` / `XUNITY_IL2CPP_URL` | `5.6.1` | 5.6.1 | ✅ Allineato |

> XUnity.AutoTranslator resta a **5.6.1** — confermato oggi via WebSearch che la release del 19/04/2026 è ancora l'ultima (nessuna 5.6.2 / 5.7). BepInEx 6 stabile ancora non pubblicato: l'ultima `pre` è `6.0.0-pre.2`; i bleeding-edge proseguono (build BE più recente segnalata 08/06/2026) ma restano fuori dai pin ufficiali per scelta. Nessun motivo di muovere le versioni.

**Spunto opzionale (debito tecnico interno, già annotato):** resta valido il task dei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri (le ricerche di validazione non sono state ripetibili oggi per il limite WebSearch). Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza`, già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, da ritestare in app: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian, 2duerighe.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata. GamesTranslator.it resta la fonte ITA più viva ma il feed continua a essere bloccato lato app — resta da valutare un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 6 giu 2026 | **Trails in the Sky 1st Chapter** | Traduzione ITA completa al 100% con revisione; aggiornata dopo gli update K03 (Steam `1.1.37157.K03` / GOG) — *già nel digest dell'8 giu* | Steam Guide / GamesTranslator.it |
| 4 giu 2026 | Blood.West | Aggiornamento patch ITA a **v4.6.2** (Steam); lavoro ancora in corso — *da confermare a mano* | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | Traduzione ITA pubblicata (CoccoLoco); segnalazioni di frasi ancora in inglese — patch in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | Traduzione ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |

> ⚠️ **Nessuna voce genuinamente nuova confermata oggi.** Le ricerche mirate su nuove patch ITA e su RomHack Plaza non sono state completate (limite WebSearch raggiunto). La tabella riporta le voci della settimana già verificate nei digest precedenti, per continuità. Da ricontrollare manualmente su GamesTranslator.it e sul gruppo Steam "Traduzioni Italiane Amatoriali" per eventuali pubblicazioni del 7–9 giugno.

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio di localizzazione ITA ufficiale confermato (ricerca dedicata non completata oggi). Voci ancora valide da monitorare:

- **First Playable 2026** a Firenze (10–12 giugno) — possibile contesto per annunci di localizzazione ITA nei prossimi giorni; da monitorare.
- **Sky: Children of the Light (thatgamecompany)** — integrazione dell'**API DeepL** per la traduzione in tempo reale delle chat in-game (caso industriale rilevante di AI translation live, non una localizzazione ITA del gioco). Da monitorare come trend.
- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ Allineato |
| BepInEx 6 | 6.0.0-pre.2 (pre-release; BE in corso) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (non riverificato oggi) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | v1.1.1 (non riverificato oggi) | n/a | ➖ Nessuna novità nota |
| UnityEx | — (non riverificato oggi) | n/a | ➖ Nessuna novità nota |

**Provider LLM:** non riverificati oggi (limite WebSearch). Quadro dell'8 giugno invariato: Gemini 3.1 Pro in testa ai benchmark generalisti, DeepL forte su lingue europee/UI (confermato dall'adozione in *Sky: Children of the Light*), Claude indicato per contenuti letterari. Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido. Le stringhe modello esatte (Claude Opus 4.7 vs 4.8, Gemini 3.1 Pro) restano da verificare via API ufficiale prima di pinnarle.

---

## 📝 Cose non verificate / da controllare manualmente

- ⚠️ **Ricerche WebSearch incomplete oggi:** budget mensile esaurito a metà run. Da rieseguire manualmente: nuove patch ITA (7–9 giu), annunci localizzazione ufficiale, RomHack Plaza, fonti ITA (GamesTranslator.it, OldGamesItalia, Ctrl+Trad, PCGW), provider LLM.
- **Blood.West v4.6.2** / **Luna Abyss**: confermare lo stato reale (completa o in lavorazione) prima di considerarle stabili.
- **Nomi modello LLM (Claude Opus 4.7 vs 4.8 / Gemini 3.1 Pro):** verificare le stringhe modello reali via API ufficiale.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **First Playable 2026 (10–12 giu):** controllare a mano nei prossimi giorni eventuali annunci di localizzazione ITA.
- **BepInEx 6 stabile:** continuare a monitorare — al primo rilascio v6 stabile valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases/) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [Games Translator (home)](https://www.gamestranslator.it/index.php)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [List of Italian fan translations — PCGamingWiki](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
