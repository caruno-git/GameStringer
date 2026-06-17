# Digest Traduzioni Videogiochi — 13 giugno 2026

> Giornata tranquilla. Nessuna novità di rilievo rispetto al digest del 12 giugno: tool tutti allineati, nessun drift di versione. Le azioni segnalate sono carryover non ancora chiusi. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

1. **(Carryover dal 12/06) Rimuovere il blocco "⚠️ Doc vs. codice" obsoleto** in `docs/TRANSLATION_INNOVATIONS_2026.md:9`. Il blocco dice che il bump a `gemini-3.5-flash` nei sorgenti è "ancora pendente" e referenzia `gemini-2.0-flash` hard-coded — ma è **falso**: riverificato oggi in `lib/ai/ai-translate-direct.ts:132-133` (`NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.5-flash'`). Il doc stesso chiede di rimuovere il blocco una volta fatto il bump. Da chiudere.
2. **(Carryover dal 12/06) Correggere il riferimento MelonLoader in `docs/TODO.md`**: la voce cita `v0.7.3 (mag 2026)`, release inesistente. L'ultima stabile su GitHub è **v0.7.2 (3 marzo 2026)**. Aggiornare la nota.
3. **Nessun drift di versione** in `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi sezione 🛠).

## 📡 Proposte fonti RSS

Niente di nuovo da proporre. Le candidate già presenti in `lib/news-feeds.ts` (Ctrl+Trad itch.io devlog, OldGamesItalia forum, Romhacking.it, PCGW Italian fan translations, 2duerighe) restano marcate "da verificare in app" e disabilitate — il passo utile è testarle nell'app, non aggiungerne altre. RomHack Plaza (`romhackplaza.org/feed/`) resta l'unica fonte `translations` attiva e raggiungibile.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| giu 2026 | The Legend of Heroes: Trails in the Sky 1st Chapter — ITA | Completa, revisione/rielaborazione dialoghi in corso | [GamesTranslator.it](https://gamestranslator.it/index.php?%2Fdiscover%2F=) |

Nessuna nuova traduzione ITA su RomHack Plaza negli ultimi 7 giorni (le entry italiane indicizzate sono titoli NES/SNES/PS già noti, non novità). La patch ITA di **Yakuza 0** (Rulesless) torna nei risultati di ricerca ma è la v2.0C di **gennaio 2025** — non è una novità.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale negli ultimi 7 giorni. Contesto invariato rispetto a ieri: [Everyeye — giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci del [Summer Game Fest 2026](https://videogiochitalia.it/summer-game-fest-2026-giochi/), da spulciare manualmente per le lingue supportate.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge build #764 dell'11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| MelonLoader | **v0.7.2** (3 mar 2026) | Non integrato (voce TODO) | ⚠️ TODO.md cita v0.7.3 inesistente |

Nota BepInEx 6: i bleeding edge sono passati da build #759 (9 giu) a #764 (11 giu). Le build dopo #697 introducono breaking API in preparazione alla prima v6 stabile — restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **LLM**: rilasciato globalmente **Gemini 3.5 Live Translate** su Google Traduttore (rilevamento auto di 70+ lingue, traduzione vocale con preservazione di tono/ritmo). È una feature voce/conversazione, **non** direttamente applicabile all'injection di testo nei giochi — nessuna azione, ma da tenere d'occhio se in futuro si valuta l'OCR/audio live. Nessuna nuova release API rilevante per la traduzione testi di Gemini/DeepL/Claude/OpenAI questa settimana.
- Titolo/stato esatto della traduzione "Trails in the Sky 1st Chapter" su GamesTranslator.it (i risultati di ricerca la danno completa con rielaborazione dialoghi in corso; confermare aprendo la sezione Discover).
- I feed RSS candidati in `news-feeds.ts` restano da testare in-app (CORS/formato).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/bepinex/bepinex/releases) · [Discussion 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/discussions/969) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader v0.7.2](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.2)
- [GamesTranslator.it](https://gamestranslator.it/index.php?%2Fdiscover%2F=) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [RomHack Plaza](https://romhackplaza.org/) · [Le traduzioni di Rulesless — Yakuza 0](https://letraduzionidirulesless.wordpress.com/yakuza0-2/)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) · [Summer Game Fest 2026](https://videogiochitalia.it/summer-game-fest-2026-giochi/)
- [Multiplayer.it — Gemini 3.5 Live Translate](https://multiplayer.it/notizie/google-presenta-gemini-35-live-translate-traduzioni-vocali-senza-interruzioni.html)
