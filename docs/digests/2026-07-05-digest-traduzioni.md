# Digest Traduzioni Videogiochi — 5 luglio 2026

> Giornata tranquilla: **nessuna novità sostanziale** rispetto al digest del 04/07. Nessun nuovo rilascio dei tool, nessun drift di versione, RSS già sistemato ieri. Uniche cose degne di nota: Gemini 3.5 Live Translate (annuncio Google di giugno) e una traduzione ITA community per *The Precinct* (data da confermare).

## 🔥 Azione consigliata per GameStringer

**Nessuna azione richiesta.** Tutti i tool referenziati in `src-tauri/src/commands/unity_patcher.rs` sono allineati all'upstream (verificato oggi via GitHub/WebSearch):

- **XUnity.AutoTranslator v5.6.1** (righe 21, 35, 38) = ultima release upstream (19/04/2026). ✅ Allineato.
- **BepInEx 5.4.23.5** (righe 10-11) = ultima stable 5.x. ✅ Allineato.
- **BepInEx 6.0.0-pre.2** (righe 25-31) = ultima pre-release taggata. Nessuna `pre.3` ancora rilasciata. ✅
- **BepInEx Legacy 5.4.11** (righe 14-15) = pin intenzionale per Unity 5.6. ✅
- **IPA 3.4.1** (riga 18) e **TMP_Font_AssetBundles da v5.5.0** (riga 44) = invariati, ok.

Promemoria (non urgente, già segnalato ieri): valutare la feature "blocco auto-update Steam" ispirata a LPI-Hub, per proteggere le patch installate. È l'unico spunto d'implementazione aperto e non ancora in roadmap.

## 📡 Proposte fonti RSS

Niente di nuovo. La categoria `translations` in `lib/news-feeds.ts` è già stata riorganizzata a fondo ieri (04/07): abilitate Ctrl+Trad, OldGamesItalia, Romhacking.it (feed SMF corretto), PCGW Italian, 2duerighe, Language Pack Italia, Q-Gin. Restano disabilitate solo le fonti senza feed accessibile:

- **NexusMods** — RSS bloccato da bot protection. Nessuna alternativa trovata.
- **GamesTranslator.it** — RSS bloccato da CORS. Nessun endpoint pubblico alternativo.
- **RomHacking.net (news + translations)** — feed RSS morto lato server.

Da fare in-app al prossimo avvio: confermare che i feed abilitati ieri (Q-Gin ecc.) rispondano senza errori CORS.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 28/06/2026 | Traduzione indipendente riallineata all'update Steam/GOG v1.1.37972 (titolo non identificato dalla ricerca — probabilmente lo stesso della voce 27/06 di ieri) | Aggiornata | GamesTranslator.it |
| data da confermare | *The Precinct* — traduzione ITA a cura di Vox Italica | Community | Q-Gin |

Nessuna nuova patch ITA datata negli ultimi 7 giorni oltre a quanto già riportato ieri. La voce *The Precinct* è emersa oggi ma la ricerca non ha restituito una data affidabile: **da verificare manualmente** (vedi sezione note).

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio di localizzazione italiana **ufficiale** (publisher/sviluppatore) trovato negli ultimi 7 giorni. *The Precinct* risulta un lavoro community (Vox Italica), non ufficiale.

## 🛠 Stato tool

| Tool | Upstream | Nel progetto | Stato |
|------|----------|--------------|-------|
| XUnity.AutoTranslator | v5.6.1 (19/04/2026) | v5.6.1 | ✅ |
| BepInEx 5.x | v5.4.23.5 | v5.4.23.5 | ✅ |
| BepInEx 6.x | v6.0.0-pre.2 | v6.0.0-pre.2 | ✅ (pre.3 non rilasciata) |
| BepInEx Legacy | v5.4.11 (pin Unity 5.6) | v5.4.11 | ✅ pin |
| MelonLoader | v0.7.3 (15/05/2026) | Non hard-coded | n/a |
| UnrealLocres | Linkato senza pin di versione | — | n/a |

## 🤖 Novità LLM per traduzione

- **Gemini 3.5 Live Translate** — annunciato da Google a giugno 2026 come una delle principali novità AI del mese. Focus su traduzione in tempo reale (audio/multimodale); non specifico per giochi, ma da tenere d'occhio se GameStringer volesse un provider Gemini aggiornato. Verificare quale modello Gemini è attualmente configurato nel progetto e se conviene puntare a `gemini-3.5-*`.
- Comparativi generici 2026 (fonti di parte/marketing): Claude in cima ai blind test di traduzione, DeepL forte sulle lingue europee, ChatGPT su lingue asiatiche/idiomi. Nessun benchmark specifico "game translation" nuovo.

## 📝 Cose non verificate / da controllare manualmente

- **The Precinct ITA (Vox Italica)**: confermare data di rilascio/aggiornamento e se è patch scaricabile — la ricerca web non ha dato una data certa. Controllare l'articolo Q-Gin linkato sotto.
- Titolo del gioco della traduzione aggiornata il 27-28/06 su GamesTranslator (ancora non identificato dalla ricerca — controllare la sezione download del sito).
- Modello Gemini attualmente usato in GameStringer vs `gemini-3.5-*`: verificare in codice/config se vale un aggiornamento.
- Feed RSS abilitati ieri: conferma risposta senza CORS al prossimo avvio dell'app.

## Fonti

- [XUnity.AutoTranslator — releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — releases](https://github.com/bepinex/bepinex/releases) · [6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [MelonLoader — releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [GamesTranslator.it](https://www.gamestranslator.it/)
- [Q-Gin — The Precinct in italiano (Vox Italica)](https://www.q-gin.info/the-precinct-in-italiano-vox-italica-schierata-a-favore-dei-giocatori/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Google — novità AI di giugno 2026 (Gemini 3.5 Live Translate)](https://blog.google/innovation-and-ai/technology/ai/google-ai-updates-june-2026/)
