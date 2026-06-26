# Digest Traduzioni Videogiochi — 26 giugno 2026

> Giornata tranquilla, in continuità con i digest 19-25/06. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0 — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Nessuna nuova release stabile dei tool: XUnity fermo a 5.6.1 (19/04), BepInEx 6 sempre `pre.2` (il bleeding edge avanza, build #784 del 24/06, ma nessuna v6 stabile su GitHub), MelonLoader 0.7.3, UnrealLocres 1.1.1. **Nessuna patch amatoriale ITA nuova** nella finestra 20-26/06: la tabella ITA della settimana resta vuota (voci GamesTranslator dei giorni scorsi ormai fuori finestra). Sul fronte LLM nessuna novità azionabile: il default attuale (Gemini 3.5 Flash) resta la scelta migliore costo/latenza per la traduzione batch. Nessun nuovo annuncio di localizzazione ufficiale ITA. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Riferimenti righe: XUnity `v5.6.1` (righe 21/35/38), BepInEx 5.x `v5.4.23.5` (righe 10-11), BepInEx legacy `v5.4.11` (righe 14-15), BepInEx 6.x `v6.0.0-pre.2` (righe 25-31), IPA `3.4.1` (riga 18), TMP Fonts `v5.5.0` (riga 44). Nessuna riga da toccare.
2. *(Spunto, non codice — già segnalato, non urgente)* **Gemini 3.5 Pro**: alcune fonti la danno in GA a giugno 2026 (context 2M, "Deep Think"). Da confermare con pricing/disponibilità API reali prima di valutarla per la traduzione batch di volumi grossi; il default (Gemini 3.5 Flash) resta adeguato. Nessuna implementazione richiesta oggi.

## 📡 Proposte fonti RSS

Nessuna nuova candidata oggi. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato — tutte `enabled: false` in `lib/news-feeds.ts`:

- **Language Pack Italia** (`https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`, fallback `https://www.languagepack.it/feed/`) — riga 122, non ancora testata.
- Le 5 candidate del 20/05 (righe 116-120): Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress.

`romhackplaza` (riga 114) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 111) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| — | Nessuna patch ITA nuova nella finestra 20-26/06 | — | — |

Nessun nuovo rilascio ITA datato 20-26/06 trovato su GamesTranslator.it, RomHack Plaza, Ctrl+Trad o PCGW. Le voci GamesTranslator dei digest precedenti (build GOG/Steam **1.1.37407** del 15/06; DLC ***The Flower & The Flame*** v1.09 del 12/06, autore TurinaR) sono **fuori finestra 7 giorni** e non vengono ripetute.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio nuovo. Confermate (già citate, non nuove):

- **Rayman Legends Retold** — doppiaggio ITA completo (Ubisoft, uscita 1° ottobre 2026). Annuncio 19/06.
- **Control: Resonant** — doppiaggio ITA confermato (Remedy, uscita 2026, data non annunciata).
- **GTA VI** — pre-ordini aperti dal 25/06. Localizzazione ITA attesa a **sottotitoli** (nessun doppiaggio annunciato): nota di mercato, **non azionabile** per il patcher Unity/Unreal.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; BE #784 del 24/06 sul build server) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| UnityEx | nessuna release nuova rilevante 2026 | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: il bleeding edge continua ad avanzare (build dopo `6.0.0-be.697` introducono breaking change in preparazione della prima v6 stabile). **Restare su `v6.0.0-pre.2`** salvo necessità di fix IL2CPP specifici. Nessuna v6 stabile ancora pubblicata su GitHub.

## 📝 Cose non verificate / da controllare manualmente

- **Gemini 3.5 Pro (GA giugno 2026):** alcune fonti secondarie la danno disponibile in GA, ma **non confermata** con pricing/disponibilità API ufficiali. Da ricontrollare prima di qualsiasi valutazione per la traduzione batch. Nessun impatto sul pipeline oggi (default = Gemini 3.5 Flash).
- **Feed RSS Language Pack Italia + 5 candidate del 20/05:** URL feed WordPress/Invision/MediaWiki ipotizzati ma **non testati** in-app per CORS/formato.
- **RomHack Plaza ITA:** stessi titoli retro ITA di GiAnMMV (EarthBound Beginnings, Zelda NES, Battle City, Adventure Island III, Final Fight 3, Yu-Gi-Oh! Forbidden Memories) **senza date esposte** — nessuno confermabile come "ultimi 7 giorni" e irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [PCGW Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations) · [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [GameTimers — Rayman Legends Retold doppiaggio ITA](https://gametimers.it/rayman-legends-retold-sara-doppiato-in-italiano-ubisoft-riporta-la-localizzazione-completa/)
- [Lokalise — best LLM for translation 2026](https://lokalise.com/blog/what-is-the-best-llm-for-translation/) · [LLM translation benchmark 2026](https://intlpull.com/blog/llm-translation-quality-benchmark-2026)
