# Digest Traduzioni Videogiochi — 24 giugno 2026

> Giornata tranquilla, in continuità con i digest 19-23/06. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0 — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Nessuna nuova release stabile dei tool (XUnity fermo a 5.6.1 del 19/04, MelonLoader 0.7.3, BepInEx 6 stabile sempre `pre.2`, UnrealLocres 1.1.1). **Nessuna patch amatoriale ITA nuova**: le due voci GamesTranslator citate nei giorni scorsi (build 1.1.37407 del 15/06 e DLC *The Flower & The Flame* del 12/06) **escono oggi dalla finestra 7 giorni** → tabella ITA della settimana ora vuota. Unica novità LLM degna di nota: Google ha annunciato **Gemini 3.5 "Live Translate" (audio)** — traduzione vocale in tempo reale, **non rilevante** per la traduzione batch di testo dei giochi. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Riferimenti righe: XUnity `v5.6.1` (righe 21/35/38), BepInEx 5.x `v5.4.23.5` (righe 10-11), BepInEx legacy `v5.4.11` (righe 14-15), BepInEx 6.x `v6.0.0-pre.2` (righe 25-31), IPA `3.4.1` (riga 18), TMP Fonts `v5.5.0` (riga 44). Nessuna riga da toccare.
2. *(Spunto, non codice — già segnalato, non urgente)* Continuare a monitorare la GA di **Gemini 3.5 Pro** (context 2M, "Deep Think"): annunciata per giugno 2026 ma ancora non confermata in GA stabile su API. Quando esce, valutare per traduzione batch di volumi grossi; il default attuale (Gemini 3.5 Flash) resta adeguato per costo/latenza. Nessuna implementazione richiesta oggi.

## 📡 Proposte fonti RSS

Nessuna nuova candidata oggi. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato — tutte `enabled: false` in `lib/news-feeds.ts`:

- **Language Pack Italia** (`https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`, fallback `https://www.languagepack.it/feed/`) — riga 121, non ancora testata.
- Le 5 candidate del 20/05 (righe 115-119): Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress.

`romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| — | Nessuna patch ITA nuova nella finestra 18-24/06 | — | — |

Le due voci GamesTranslator citate nei digest 19-23/06 (build GOG/Steam **1.1.37407** del 15/06; DLC ***The Flower & The Flame*** v1.09 del 12/06, autore TurinaR) **escono oggi dalla finestra 7 giorni** e non vengono ripetute. Nessun nuovo rilascio ITA datato 18-24/06 trovato su GamesTranslator.it, RomHack Plaza, Ctrl+Trad o PCGW.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio nuovo. Confermate (già citate, non nuove):

- **Rayman Legends Retold** — doppiaggio ITA completo (Ubisoft, uscita 1° ottobre 2026). Annuncio 19/06.
- **Control: Resonant** — doppiaggio ITA confermato (Remedy, uscita 2026, data non annunciata).
- **Tomb Raider: Legacy of Atlantis** — aggiunto doppiaggio polacco, **ancora nessun italiano** confermato. Nota di mercato, non azionabile.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge build del 21/06 sul build server) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| UnityEx | nessuna release nuova rilevante 2026 | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: il bleeding edge continua ad avanzare (build più recente vista 2026-06-21, commit `c58c42d`). I build dopo `6.0.0-be.697` introducono breaking change in preparazione della prima v6 stabile. **Restare su `v6.0.0-pre.2`** salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **Gemini 3.5 Pro:** GA annunciata "per giugno" ma non confermata con data precisa in produzione API. Da ricontrollare per pricing/context su traduzione batch quando arriva la GA. Nessun impatto sul pipeline oggi (default = Gemini 3.5 Flash).
- **Gemini 3.5 "Live Translate" (audio):** annuncio 09/06, traduzione vocale in tempo reale (es. Google Meet, 70+ lingue). Tecnologia speech-to-speech: **non applicabile** alla traduzione del testo statico dei giochi nel pipeline GameStringer. Solo monitoraggio.
- **Feed RSS Language Pack Italia + 5 candidate del 20/05:** URL feed WordPress/Invision/MediaWiki ipotizzati ma **non testati** in-app per CORS/formato.
- **RomHack Plaza ITA:** stessi titoli retro ITA di GiAnMMV (EarthBound Beginnings, Battle City, Adventure Island III, Final Fight 3, Solstice, Yu-Gi-Oh! Forbidden Memories, Zelda OoT Master Quest) **senza date esposte** — nessuno confermabile come "ultimi 7 giorni" e irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases) · [UnityEx releases](https://github.com/igadmg/UnityEx/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [PCGW Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations) · [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [GameTimers — Rayman Legends Retold doppiaggio ITA](https://gametimers.it/rayman-legends-retold-sara-doppiato-in-italiano-ubisoft-riporta-la-localizzazione-completa/) · [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/) · [UAGNA — Tomb Raider Legacy of Atlantis](https://www.uagna.it/videogiochi/tomb-raider-legacy-of-atlantis-sara-doppiato-anche-in-polacco-ma-ancora-niente-italiano-214841)
- [Slator — Gemini 3.5 Live Translate](https://slator.com/google-ai-live-speech-translation-gemini-3-5-live-translate/) · [Gemini 3.5 guide & pricing 2026](https://codersera.com/blog/gemini-3-5-complete-guide-2026/)
