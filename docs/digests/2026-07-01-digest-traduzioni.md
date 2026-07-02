# Digest Traduzioni Videogiochi — 1 luglio 2026

> Primo digest dopo la pausa 27-30/06 (ultimo file: 26/06). **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0 — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** Nessuna nuova release stabile dei tool: XUnity fermo a 5.6.1 (19/04), BepInEx 6 sempre `pre.2` (bleeding edge avanza, build #785 al 28/06, nessuna v6 stabile su GitHub), MelonLoader 0.7.x, UnrealLocres 1.1.1. Due movimenti ITA nella finestra 24/06-01/07: **Trails in the Sky 1st Chapter** traduzione v1.06 (uscita dalla beta) e aggiornamento della patch DE/IT indipendente alla build Steam/GOG **1.1.37972** (25-26/06). Sul fronte LLM: **Gemini 3.5 Live Translate** lanciato il 9/06 (real-time, non batch — nessun impatto sul pipeline). Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Riferimenti righe: XUnity `v5.6.1` (righe 21/35/38), BepInEx 5.x `v5.4.23.5` (righe 10-11), BepInEx legacy `v5.4.11` (righe 14-15), BepInEx 6.x `v6.0.0-pre.2` (righe 25-31), IPA `3.4.1` (riga 18), TMP Fonts `v5.5.0` (riga 44). Nessuna riga da toccare.
2. *(Spunto, non codice — non urgente)* **Gemini 3.5 Live Translate** (lanciato 9/06 su Google Translate, Live API, AI Studio) è orientato al real-time voice/chat, non alla traduzione batch di testo estratto. **Non rilevante** per il pipeline di GameStringer. Il default (Gemini 3.5 Flash) resta la scelta costo/latenza migliore per la traduzione batch. Nessuna implementazione richiesta.

## 📡 Proposte fonti RSS

Nessuna nuova candidata funzionante confermata oggi. Restano sul tavolo, **da testare in-app (Gestisci feed)** per CORS/formato — tutte `enabled: false` in `lib/news-feeds.ts`:

- **Language Pack Italia** (`https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`, fallback `https://www.languagepack.it/feed/`) — riga 122, non ancora testata. Fonte confermata attiva (Q-Gin cita il loro tool "LPI Hub").
- Le 5 candidate del 20/05 (righe 116-120): Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress.

`romhackplaza` (riga 114) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 111) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~fine giu 2026 | **Trails in the Sky 1st Chapter** | Traduzione v1.06 completa (uscita dalla beta), Steam — dialoghi, video, grafica, missioni principali/secondarie | GamesTranslator.it |
| 25-26/06 | Progetto DE/IT indipendente (switch lingua in-game con tasto Q) | Patch aggiornata alle build **Steam/GOG 1.1.37972** | GamesTranslator.it |
| n.d. | **The Precinct** — patch ITA fan (Vox Italica) | In lavorazione/segnalata (data non esposta) | Q-Gin |

Note: la voce DE/IT 1.1.37972 è l'evoluzione del progetto già citato a giugno (era build 1.1.37407 il 15/06), ora riallineato agli update Steam/GOG del 25-26/06 — quindi **dentro** la finestra 7 giorni. Nessuna delle voci riguarda giochi Unity/Unreal patchabili dal nostro flusso, ma restano segnali di community attiva.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio nuovo di rilievo. Aggiornamenti/conferme:

- **Tomb Raider: Legacy of Atlantis** — confermato doppiaggio in polacco ma **ancora nessun italiano** (a differenza dei capitoli precedenti). Segnale di mercato, non azionabile.
- **Control: Resonant** — doppiaggio ITA confermato (Remedy, uscita 2026, data non annunciata). Già citato.
- **Rayman Legends Retold** — doppiaggio ITA completo (Ubisoft, 1° ottobre 2026). Già citato.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile linea 5.4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; BE #785 al 28/06 sul build server) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.x** (linea 0.7 stabile, ~mag 2026) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| UnityEx | nessuna release nuova rilevante 2026 | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: il bleeding edge continua ad avanzare (build #785 al 28/06). **Restare su `v6.0.0-pre.2`** salvo necessità di fix IL2CPP specifici. Nessuna v6 stabile ancora pubblicata su GitHub.

## 📝 Cose non verificate / da controllare manualmente

- **The Precinct patch ITA (Vox Italica):** segnalata da Q-Gin ma **senza data di rilascio esposta** — non confermabile come "ultimi 7 giorni". Da verificare stato/link diretto.
- **MelonLoader versione esatta:** i risultati di ricerca mostrano prevalentemente il tag `v0.7.2`; il digest del 26/06 riportava 0.7.3. Discrepanza **non critica** (tool non integrato nel progetto). Da confermare l'ultima stabile su GitHub se/quando si valuta l'integrazione.
- **Feed RSS Language Pack Italia + 5 candidate del 20/05:** URL feed WordPress/Invision/MediaWiki **non testati** in-app per CORS/formato.
- **Trails in the Sky 1st Chapter v1.06:** data precisa di rilascio non esposta chiaramente (attribuita a "giugno 2026") — plausibilmente dentro finestra ma da verificare sul thread GamesTranslator.

## Fonti

- [XUnity.AutoTranslator — Releases (GitHub)](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases (GitHub)](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx 6.0.0-pre.2 (Discussion #969)](https://github.com/BepInEx/BepInEx/discussions/969)
- [BepInEx Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader — Releases (GitHub)](https://github.com/LavaGang/MelonLoader/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [PCGamingWiki — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/)
- [Q-Gin — The Precinct in italiano (Vox Italica)](https://www.q-gin.info/the-precinct-in-italiano-vox-italica-schierata-a-favore-dei-giocatori/)
- [Q-Gin — Language Pack Italia tool](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [UAGNA — Tomb Raider: Legacy of Atlantis (no ITA)](https://www.uagna.it/videogiochi/tomb-raider-legacy-of-atlantis-sara-doppiato-anche-in-polacco-ma-ancora-niente-italiano-214841)
- [Gemini 3.5 Live Translate (guida)](https://www.digitalapplied.com/blog/gemini-live-3-5-translate-real-time-multilingual-cx-guide)
