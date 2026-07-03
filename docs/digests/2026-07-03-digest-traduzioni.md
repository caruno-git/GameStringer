# Digest Traduzioni Videogiochi — 3 luglio 2026

> Primo digest in `docs/digests/` (cartella creata oggi — nessun digest precedente con cui confrontare).

## 🔥 Azione consigliata per GameStringer

**Nessun drift di versione critico.** Verifica effettuata su `src-tauri/src/commands/unity_patcher.rs`:

- **XUnity.AutoTranslator v5.6.1** (righe 21, 35, 38) = ultima release upstream (2026-04-19). ✅ Allineato.
- **BepInEx 5.4.23.5** (righe 10-11) = ultima stable 5.x. ✅ Allineato.
- **BepInEx 6.0.0-pre.2** (righe 25-31) = ultima pre-release ufficiale. ✅ Allineato, ma upstream è molto attivo sui build bleeding-edge (be.784 del 24/06, be.785 del 30/06 con supporto a giochi senza legacy input). Le API stanno cambiando in vista della prima stable v6: quando uscirà, `resolve_gh_asset` potrebbe non bastare perché i nomi degli asset potrebbero cambiare. Da tenere d'occhio, nessuna azione oggi.
- **MelonLoader**: attività upstream recente (release principale aggiornata 15/05/2026, Installer 4.3.0 del 14/05/2026). Il progetto non pinna versioni MelonLoader in `unity_patcher.rs`, quindi nessun drift.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre oggi. Le fonti candidate più promettenti sono già in `lib/news-feeds.ts` in stato "da testare in app" (Ctrl+Trad, OldGamesItalia, Romhacking.it, PCGW Italian fan translations, Language Pack Italia, 2duerighe — aggiunte 20/05 e 19/06). **Azione utile**: testarle in app e abilitare quelle funzionanti, invece di aggiungerne altre.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~fine giu/inizio lug 2026 | Patch aggiornate per update Steam/GOG 1.1.37972 del 25-26/06 (titolo non identificabile dai risultati di ricerca) | Aggiornamento patch | GamesTranslator.it |
| 06/06/2026 | Trails in the Sky 1st Chapter (Steam) — v1.06 | 100% tradotto, revisione completa | GamesTranslator.it (TurinaR) |
| giu 2026 | Traduzione di TurinaR: 100%, revisione in corso, testata su versione Steam del 21/04/2026 | In revisione | GamesTranslator.it |
| data incerta | EarthBound Beginnings, Adventure Island III, Battle City (NES) — trad. di GiAnMMV | Complete | RomHack Plaza |

Nota: WebSearch (solo risultati US) rende difficile datare con precisione le uscite italiane — vedi sezione "da controllare".

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio rilevante di aggiunta della lingua italiana trovato negli ultimi 7 giorni.

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream | Nel progetto | Drift |
|------|----------|--------------|-------|
| XUnity.AutoTranslator | v5.6.1 (19/04/2026) | v5.6.1 | ✅ No |
| BepInEx 5.x | v5.4.23.5 | v5.4.23.5 | ✅ No |
| BepInEx 6.x | v6.0.0-pre.2 (stable); BE be.785 (30/06/2026) | v6.0.0-pre.2 | ✅ No (BE attivi, stable v6 in avvicinamento) |
| MelonLoader | release aggiornata 15/05/2026; Installer 4.3.0 | non pinnato | — |
| UnrealLocres | non verificato questa settimana | link non versionato (riga 1291) | — |

## 📝 Novità AI/LLM rilevanti

- **Google Gemini 3.5 Live Translate** (annuncio 09/06/2026): traduzione vocale live, 70+ lingue via Gemini Live API / AI Studio (public preview). Potenziale futuro per traduzione audio/dialoghi, non prioritario per pipeline testo.
- **DeepL**: il modello di marzo 2026 dichiara il 94% di vittorie in test blind head-to-head contro Gemini 3.1 Pro, GPT-5.2 e Claude Opus 4.6 su 16 coppie linguistiche.
- Consenso dei confronti 2026: Claude forte su fluency stilistica, Gemini su consistenza long-context multi-file, GPT su contenuti tecnici con placeholder. Coerente con la strategia multi-provider già in GameStringer.

## 📝 Cose non verificate / da controllare manualmente

- Quale gioco riguarda l'aggiornamento patch Steam/GOG 1.1.37972 su GamesTranslator.it (i risultati di ricerca non riportano il titolo).
- Date esatte delle traduzioni ITA di GiAnMMV su RomHack Plaza (potrebbero essere precedenti a questa settimana).
- Feed RSS "da testare in app" in `news-feeds.ts` (Ctrl+Trad, OldGamesItalia, Romhacking.it, PCGW, Language Pack Italia): verificare CORS/formato in app.
- Prima stable di BepInEx 6: controllare i prossimi digest.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/bepinex/bepinex/releases) · [BepInEx Bleeding Edge](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [MelonLoader.Installer releases](https://github.com/LavaGang/MelonLoader.Installer/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/) · [EarthBound Beginnings ITA](https://romhackplaza.org/translations/earthbound-beginnings-italian-translation-nes/)
- [Ctrl+Trad](https://ctrltrad.itch.io/)
- [Slator — Gemini 3.5 Live Translate](https://slator.com/google-ai-live-speech-translation-gemini-3-5-live-translate/)
- [Lokalise — Best LLM for translation 2026](https://lokalise.com/blog/what-is-the-best-llm-for-translation/)
- [PCGamingWiki — Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
