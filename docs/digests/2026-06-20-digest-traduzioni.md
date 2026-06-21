# Digest Traduzioni Videogiochi — 20 giugno 2026

> Giornata tranquilla, in linea con il digest del 19/06. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0, MelonLoader v0.7.3 (solo doc) — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Le ricerche odierne non producono patch ITA con data interna alla finestra dei 7 giorni che siano *nuove* rispetto a quanto già storicizzato: confermate solo le attività di GamesTranslator.it (DLC *The Flower & The Flame* del 12/06, build 1.1.37407 del 15/06) già riportate ieri. Nessuna nuova release di tool, nessun annuncio puntuale di localizzazione ITA ufficiale datato questa settimana. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Nessuna riga da toccare — riferimenti: XUnity righe 21/35/38 (`v5.6.1`), BepInEx 5.x righe 10-11 (`v5.4.23.5`), BepInEx legacy righe 14-15 (`v5.4.11`), BepInEx 6.x righe 25-31 (`v6.0.0-pre.2`), IPA riga 18 (`3.4.1`), TMP Fonts riga 44 (`v5.5.0`).
2. *(Spunto, non codice — già segnalato il 19/06, non urgente)* **LPI Hub** di Language Pack Italia resta un benchmark UX utile per il flusso "scarica → applica → mantieni aggiornata" e per l'idea "disattiva auto-update del gioco" (gli update Steam/GOG rompono le patch). Solo valutazione, nessuna implementazione richiesta.

## 📡 Proposte fonti RSS

Nessuna nuova candidata oggi rispetto al 19/06. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato:

- **Language Pack Italia** (`https://www.languagepack.it/feed/` o `https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`) — candidata WordPress segnalata ieri, **non ancora testata**.
- Le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false`.

`romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

*Spunto:* i devlog itch.io sono di fatto un feed costante di patch ITA (es. Ctrl+Trad pubblica via `itch.io/event/...`); la candidata "Ctrl+Trad itch.io devlog" già presente in `news-feeds.ts` resta quella con il miglior rapporto segnale/rumore se si riesce a farne il parsing.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 giu 2026 | Traduzione aggiornata a build GOG/Steam **1.1.37407** (titolo non esposto negli snippet) | Aggiornata | [GamesTranslator.it](https://www.gamestranslator.it/) |
| 12 giu 2026 | DLC *The Flower & The Flame* (v1.09, autore TurinaR) — ITA 100% (revisione trama protagonista F completata, M in corso) | DLC completo, revisione in corso | [GamesTranslator.it](https://www.gamestranslator.it/) |

**Nessuna patch ITA nuova** trovata con data 18-20 giugno. Le due voci sopra sono le stesse del digest 19/06 (restano dentro la finestra 7 giorni). Patch già citate nei digest precedenti (Anno 2205 03/06, Gothic 2 New Balance 07/06, Trails in the Sky 1st Chapter v1.06 06/06, LPI Hub) **non** ripetute. I risultati Ctrl+Trad (Tales of Old Dominus, The Valiant, Icarus, Total Chaos, Sengoku Dynasty…) e "On the Last Episode" (ITA dal 31/10/2024) sono **vecchi**, non rientrano nella settimana.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio puntuale di localizzazione ITA ufficiale datato 14-20 giugno. Le ricerche restituiscono solo materiale di contesto già noto: *Control: Resonant* con doppiaggio ITA confermato (annuncio Remedy ad **aprile 2026**, non questa settimana; primo doppiaggio ITA Remedy dai tempi di Quantum Break 2016) e le consuete panoramiche/liste 2026. Per gli arrivi 2026 con doppiaggio/lingua ITA restano da spulciare manualmente [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4; doorstop 4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge attivi, ultimo build 11 giu) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi. I build dopo `6.0.0-be.697` introdurranno breaking change in preparazione della prima v6 stabile. Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **GamesTranslator.it build 1.1.37407 (15/06):** titolo del gioco ancora non identificato dagli snippet — confermare sulla pagina sorgente.
- **DLC *The Flower & The Flame* (12/06):** gioco-madre non identificato (pattern protagonista M/F → probabile visual novel/otome) — confermare su GamesTranslator.it.
- **Feed RSS Language Pack Italia:** URL feed WordPress ipotizzato ma **non testato** — verificare in-app prima di abilitarlo.
- **Provider LLM:** nessuna release rilevante per la traduzione di giochi nelle ultime 24h. Rumore di fondo su "best AI translator 2026" (DeepL ancora dato vincente nei benchmark testuali; comparative DeepL/GPT-5.x/Claude 4.x/Gemini 3.x) e annunci modello generici (GPT-5.6 / Gemini 3.5 Pro / Claude 4.8 in arrivo a giugno) senza impatto diretto sul pipeline di GameStringer (Gemini 3.5 Flash default). Da monitorare se Gemini 3.5 Pro/Flash o Claude 4.8 cambiano pricing o context per la traduzione batch.
- **RomHack Plaza ITA:** stesse traduzioni retro ITA (Felix the Cat, Battle City, Adventure Island III, EarthBound Beginnings, Yu-Gi-Oh! Forbidden Memories, Final Fight 3) **senza date esposte** — nessuna confermabile come "ultimi 7 giorni" e comunque irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/) · [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Lokalise — best LLM for translation 2026](https://lokalise.com/blog/what-is-the-best-llm-for-translation/) · [DeepL Translator (AI-first)](https://home.deepl.com/en/blog/meet-new-deepl-translator)
