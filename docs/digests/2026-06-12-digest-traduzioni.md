# Digest Traduzioni Videogiochi — 12 giugno 2026

> Primo digest in `docs/digests/` (nessun digest precedente trovato). Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

1. **Rimuovere il blocco "⚠️ Doc vs. codice" obsoleto** in `docs/TRANSLATION_INNOVATIONS_2026.md`. Il bump a `gemini-3.5-flash` con override `NEXT_PUBLIC_GEMINI_MODEL` risulta **già completato nei sorgenti** (verificato oggi in `lib/ai/ai-translate-direct.ts:133`, `lib/ai/ai-post-edit.ts:132`, `lib/ocr/vision-translate.ts:178`, `lib/lore-assistant.ts:153`, `lib/ai/smart-content-router.ts:360`). Il doc stesso dice di rimuovere il blocco una volta fatto il bump — è il momento.
2. **Correggere riferimento MelonLoader in `docs/TODO.md`**: la voce "MelonLoader come alternativa BepInEx IL2CPP" indica di partire da `v0.7.3 (mag 2026)`, ma la release stabile più recente su GitHub è **v0.7.2 (3 marzo 2026)** — v0.7.3 non esiste. Aggiornare la nota a v0.7.2.
3. **Nessun drift di versione** in `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi sezione 🛠).

## 📡 Proposte fonti RSS

Niente di nuovo da proporre oggi. Le candidate già presenti in `lib/news-feeds.ts` (Ctrl+Trad itch.io devlog, OldGamesItalia forum, Romhacking.it, PCGW Italian fan translations, 2duerighe) sono ancora marcate "da verificare in app" e disabilitate — il passo utile è testarle nell'app, non aggiungerne altre. RomHack Plaza (`romhackplaza.org/feed/`) resta l'unica fonte `translations` attiva e il sito risulta raggiungibile e aggiornato (entry di giugno 2026 presenti).

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| giu 2026 | Traduzione di TurinaR (revisione Tarabas/Vessor) — titolo da verificare sul sito | Completata | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |
| giu 2026 | The Excavation of Hob's Barrow — ITA di liogiu (karmasound91) | Pubblicata | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |

Niente di nuovo su RomHack Plaza negli ultimi 7 giorni per l'italiano (le entry recenti sono romhack/utility, non traduzioni ITA). Segnalata inoltre — fuori finestra ma recente — la patch ITA completa di **Blue Prince Director's Cut** (11 maggio 2026, GamesTranslator.it/Steam).

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA trovato negli ultimi 7 giorni. Contesto utile: [Everyeye — giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci del [Summer Game Fest 2026](https://videogiochitalia.it/summer-game-fest-2026-giochi/) (da spulciare manualmente per le lingue supportate).

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge build #759 del 9 giu 2026) | v6.0.0-pre.2 | ✅ Allineato (BE solo se servono fix IL2CPP specifici) |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| MelonLoader | **v0.7.2** (3 mar 2026) | Non integrato (voce TODO, trigger ≥3 segnalazioni) | ⚠️ TODO.md cita v0.7.3 inesistente |

## 📝 Cose non verificate / da controllare manualmente

- Il titolo esatto della traduzione di TurinaR completata a giugno 2026 su GamesTranslator.it (il sito non espone il dettaglio via ricerca; aprire la home/sezione Discover).
- Le entry "Gantz Patch (GBA)" su RomHack Plaza (postata da Bunkai a giugno) è classificata romhack — verificare se include traduzione.
- I feed RSS candidati in `news-feeds.ts` restano da testare in-app (CORS/formato).
- Notizie LLM: nessun annuncio rilevante per la traduzione giochi nelle fonti consultate questa settimana (i pezzi trovati sono comparative/benchmark 2026 generiche, non release nuove).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [BepInEx Bleeding Edge](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/index.php)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/) · [Recently added](https://romhackplaza.org/recently-added)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [PCGamingWiki — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Summer Game Fest 2026 — annunci](https://videogiochitalia.it/summer-game-fest-2026-giochi/)
