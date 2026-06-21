# Digest Traduzioni Videogiochi — 21 giugno 2026

> Giornata tranquilla, in linea con i digest del 19-20/06. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0, MelonLoader v0.7.3 (solo doc) — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Unica novità rispetto a ieri: annuncio ufficiale di **doppiaggio ITA per Rayman Legends Retold** (Ubisoft, uscita 1° ottobre 2026) — non ancora presente nei digest precedenti. Nessuna nuova release di tool. Nessuna patch amatoriale ITA con data interna alla finestra dei 7 giorni che sia *nuova* rispetto a quanto già storicizzato. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Nessuna riga da toccare — riferimenti: XUnity righe 21/35/38 (`v5.6.1`), BepInEx 5.x righe 10-11 (`v5.4.23.5`), BepInEx legacy righe 14-15 (`v5.4.11`), BepInEx 6.x righe 25-31 (`v6.0.0-pre.2`), IPA riga 18 (`3.4.1`), TMP Fonts riga 44 (`v5.5.0`).
2. *(Spunto, non codice — già segnalato, non urgente)* L'idea "disattiva auto-update del gioco" (gli update Steam/GOG rompono le patch) resta un miglioramento UX valido per il flusso di applicazione patch. Solo valutazione, nessuna implementazione richiesta oggi.

## 📡 Proposte fonti RSS

Nessuna nuova candidata oggi rispetto al 20/06. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato:

- **Language Pack Italia** (`https://www.languagepack.it/feed/` o `https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`) — candidata WordPress, **non ancora testata**.
- Le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false`.

`romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

*Spunto:* i devlog itch.io di Ctrl+Trad restano la candidata con il miglior rapporto segnale/rumore se si riesce a farne il parsing.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 giu 2026 | Traduzione aggiornata a build GOG/Steam **1.1.37407** (titolo non esposto negli snippet) | Aggiornata | [GamesTranslator.it](https://www.gamestranslator.it/) |
| 12 giu 2026 | DLC *The Flower & The Flame* (v1.09, autore TurinaR) — ITA 100% (revisione trama) | DLC completo, revisione in corso | [GamesTranslator.it](https://www.gamestranslator.it/) |

**Nessuna patch ITA nuova** trovata con data 19-21 giugno. Le due voci sopra sono le stesse dei digest 19-20/06 (restano dentro la finestra 7 giorni). Patch già citate nei digest precedenti (Anno 2205 03/06, Gothic 2 New Balance 07/06, Trails in the Sky 1st Chapter v1.06 06/06, The Messenger, LPI Hub) **non** ripetute.

## 🏢 Localizzazioni ufficiali annunciate

- **🆕 Rayman Legends Retold — doppiaggio ITA completo** (Ubisoft). Localizzazione completa in italiano riportata per il remake; uscita **1° ottobre 2026** su PC, PS5, Xbox Series X|S e Nintendo Switch 2. Non presente nei digest precedenti. Fonte: [GameTimers](https://gametimers.it/rayman-legends-retold-sara-doppiato-in-italiano-ubisoft-riporta-la-localizzazione-completa/).
- *Control: Resonant* con doppiaggio ITA (annuncio Remedy, già citato nei digest precedenti) — non nuovo.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge `6.0.0-be.764` dell'11 giu) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (ultimo build noto `6.0.0-be.764`, 11 giu). I build dopo `6.0.0-be.697` introducono breaking change in preparazione della prima v6 stabile. Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **Rayman Legends Retold:** annuncio doppiaggio ITA da confermare sulla pagina ufficiale Ubisoft (fonte secondaria GameTimers). Irrilevante per il patcher (localizzazione ufficiale, non fan-made), ma utile per la sezione novità.
- **GamesTranslator.it build 1.1.37407 (15/06):** titolo del gioco ancora non identificato dagli snippet — confermare sulla pagina sorgente.
- **DLC *The Flower & The Flame* (12/06):** gioco-madre non identificato — confermare su GamesTranslator.it.
- **Feed RSS Language Pack Italia:** URL feed WordPress ipotizzato ma **non testato**.
- **Provider LLM:** nessuna release rilevante per la traduzione di giochi nelle ultime 24h. Rumore di fondo su "AI model flood" di giugno (GPT-5.6, Gemini 3.5 Pro ~$15/$60 per M token con context 2M atteso, Claude Opus 4.8 uscito il 28/05). Nessun impatto diretto sul pipeline (Gemini 3.5 Flash default). Da monitorare se Gemini 3.5 Pro/Flash cambia pricing/context per la traduzione batch.
- **RomHack Plaza ITA:** stesse traduzioni retro ITA (EarthBound Beginnings, Battle City, Adventure Island III, Final Fight 3, Solstice, Yu-Gi-Oh! Forbidden Memories) **senza date esposte** — nessuna confermabile come "ultimi 7 giorni" e irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [Release v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [PCGW Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [GameTimers — Rayman Legends Retold doppiaggio ITA](https://gametimers.it/rayman-legends-retold-sara-doppiato-in-italiano-ubisoft-riporta-la-localizzazione-completa/) · [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/)
- [LLM updates June 2026](https://llm-stats.com/llm-updates) · [Best AI translator 2026](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison)
