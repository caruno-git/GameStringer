# Digest Traduzioni Videogiochi — 23 giugno 2026

> Altra giornata tranquilla, in piena continuità con i digest 19-22/06. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0 — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Nessuna nuova release stabile dei tool (XUnity fermo a 5.6.1 del 19/04, MelonLoader a 0.7.3, BepInEx 6 stabile sempre `pre.2`). Nessuna patch amatoriale ITA *nuova* rispetto a quanto già storicizzato. Sul fronte LLM, **Gemini 3.5 Pro ancora NON in GA** (target giugno, slittamenti): unica cosa da continuare a monitorare. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Nessuna riga da toccare — riferimenti: XUnity righe 21/35/38 (`v5.6.1`), BepInEx 5.x righe 10-11 (`v5.4.23.5`), BepInEx legacy righe 14-15 (`v5.4.11`), BepInEx 6.x righe 25-31 (`v6.0.0-pre.2`), TMP Fonts riga 44 (`v5.5.0`).
2. *(Spunto, non codice — già segnalato, non urgente)* Continuare a tenere d'occhio la GA di **Gemini 3.5 Pro** (2M token context, "Deep Think"): se/quando esce in API potrebbe interessare per la traduzione batch di volumi grossi, ma il default attuale (Gemini 3.5 Flash) resta più che adeguato per costo/latenza. Nessuna implementazione richiesta oggi.

## 📡 Proposte fonti RSS

Nessuna nuova candidata oggi rispetto ai giorni precedenti. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato:

- **Language Pack Italia** (`https://www.languagepack.it/feed/` o `https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`) — candidata WordPress, **non ancora testata** (`lib/news-feeds.ts:121`, `enabled: false`).
- Le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false`.

`romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 giu 2026 | Traduzione aggiornata a build GOG/Steam **1.1.37407** (titolo non esposto negli snippet) | Aggiornata | [GamesTranslator.it](https://www.gamestranslator.it/) |
| 12 giu 2026 | DLC *The Flower & The Flame* (v1.09, autore TurinaR) — ITA 100% (revisione trama) | DLC completo, revisione in corso | [GamesTranslator.it](https://www.gamestranslator.it/) |

**Nessuna patch ITA nuova** trovata con data 20-23 giugno. Le due voci sopra sono le stesse dei digest 19-22/06 e restano dentro la finestra 7 giorni (la prima esce dalla finestra domani, 24/06). Patch già citate in precedenza (Anno 2205, Gothic 2 New Balance, Trails in the Sky 1st Chapter v1.06, The Messenger, LPI Hub) **non** ripetute.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio nuovo. Confermate (già citate, non nuove):

- **Rayman Legends Retold** — doppiaggio ITA completo (Ubisoft, uscita 1° ottobre 2026). Già nel digest 21/06.
- **Control: Resonant** — doppiaggio ITA confermato (Remedy, uscita 2026, data non annunciata). Già citato in precedenza.
- **Tomb Raider: Legacy of Atlantis** — aggiunto doppiaggio polacco, **ancora nessun italiano** confermato. Nota di mercato, non azionabile.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge ~`6.0.0-be.78x` del 21 giu) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: il bleeding edge continua ad avanzare (build #777 del 21 giu visto sul build server). I build dopo `6.0.0-be.697` introducono breaking change in preparazione della prima v6 stabile. **Restare su `v6.0.0-pre.2`** salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **GamesTranslator.it build 1.1.37407 (15/06):** titolo del gioco ancora non identificato dagli snippet — confermare sulla pagina sorgente (esce dalla finestra 7 giorni il 24/06).
- **DLC *The Flower & The Flame* (12/06):** gioco-madre non identificato — confermare su GamesTranslator.it.
- **Feed RSS Language Pack Italia:** URL feed WordPress ipotizzato ma **non testato** in-app.
- **Gemini 3.5 Pro:** ancora in preview limitata Vertex, GA non confermata con data precisa (Pichai: "give us until next month"). Da ricontrollare per pricing/context su traduzione batch quando arriva la GA. Nessun impatto sul pipeline oggi (default = Gemini 3.5 Flash).
- **RomHack Plaza ITA:** stessi titoli retro ITA di GiAnMMV (EarthBound Beginnings, Battle City, Adventure Island III, Final Fight 3, Solstice, Yu-Gi-Oh! Forbidden Memories) **senza date esposte** — nessuna confermabile come "ultimi 7 giorni" e irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [Release v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [PCGW Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [GameTimers — Rayman Legends Retold doppiaggio ITA](https://gametimers.it/rayman-legends-retold-sara-doppiato-in-italiano-ubisoft-riporta-la-localizzazione-completa/) · [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/)
- [LLM updates June 2026](https://llm-stats.com/llm-updates) · [TechTimes — Gemini 3.5 Pro June launch](https://www.techtimes.com/articles/317919/20260606/google-gemini-35-pro-nears-june-launch-2-million-token-context-deep-think-reasoning.htm)
