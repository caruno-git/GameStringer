# Digest Traduzioni Videogiochi — 18 giugno 2026

> Giornata tranquilla sul fronte codice. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2, IPA 3.4.1, MelonLoader v0.7.3 (doc), TMP Fonts v5.5.0 — tutti allineati all'upstream. **Nessuna azione richiesta sul codice.** Due patch ITA non ancora segnalate nei digest precedenti emergono dalle ricerche (Anno 2205 e l'aggiornamento ITA della mod Gothic 2 New Balance), entrambe però datate inizio giugno, quindi fuori dalla finestra stretta dei 7 giorni. Sul fronte provider, **DeepL Voice-to-Voice API** (GA dal 16 apr 2026) resta il candidato più interessante in prospettiva per la pipeline vocale di GameStringer, ma è enterprise-oriented e senza casi d'uso gaming documentati. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Nessuna riga da toccare.
2. *(In prospettiva, non oggi)* **DeepL Voice-to-Voice / Voice API** (vedi 📝) è ora in GA e copre trascrizione + traduzione speech real-time. È il provider più maturo per l'eventuale **Pipeline Traduzione Vocale** (Whisper → Traduzione → TTS) di GameStringer, ma è pensato per meeting/contact center, streaming audio verso max 5 lingue target, senza integrazioni gaming note. Solo da valutare come opzione futura: nessuna integrazione finché non c'è un caso d'uso in-game concreto.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre. Situazione invariata rispetto al 17/06: le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false` e da verificare in app. Il passo utile resta **testarle in-app (Gestisci feed) per CORS/formato**. `romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

Nota: l'attività rilevata oggi proviene da **GamesTranslator.it** (mod Gothic 2 caricata il 07/06) e **Ctrl+Trad** (Anno 2205 il 03/06), entrambe già presenti come candidate in `news-feeds.ts` — un altro motivo per testarle in-app, sembrano le fonti ITA più vive.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 07 giu 2026 | Gothic 2 — mod *New Balance* (aggiornamento ITA, basato sulla versione RU del 22/05) | Aggiornata | [GamesTranslator.it](https://www.gamestranslator.it/) |
| 03 giu 2026 | Anno 2205 — ITA (EN→IT, patch a installazione semplice) | Completa | [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) |
| 06 giu 2026 | Trails in the Sky 1st Chapter — ITA (v1.06, fuori beta) | Completa / ottimizzazione | [GamesTranslator.it](https://www.gamestranslator.it/) |

**Nota onestà sulle date:** Anno 2205 (03/06) e Gothic 2 New Balance (07/06) **non erano stati segnalati** nei digest precedenti, quindi li riporto qui come novità rispetto allo storico — ma sono datati inizio giugno, **fuori dalla finestra stretta degli "ultimi 7 giorni"** (11–18 giu). Nessuna nuova patch ITA con data **interna** alla settimana 11–18 giugno è risultata confermata su GamesTranslator.it, Ctrl+Trad, NexusMods o RomHack Plaza. Trails in the Sky è carryover dal 17/06.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Le ricerche restituiscono solo materiale generico (forum RPG Italia, paper accademici sulla localizzazione, gruppi Steam) e nessun annuncio puntuale di aggiunta lingua italiana datato giugno 2026. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua ITA restano da spulciare manualmente le liste su [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge build #763 dell'11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08, le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (build #763 dell'11 giu). I build dopo `6.0.0-be.697` introdurranno breaking change in preparazione della prima v6 stabile. Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **DeepL Voice API (GA feb 2026) + DeepL Voice-to-Voice (16 apr 2026):** trascrizione e traduzione speech real-time via API, streaming audio → fino a 5 lingue target, 40+ lingue voce. È il provider vocale più maturo per l'eventuale Pipeline Traduzione Vocale di GameStringer. **Limiti:** orientato enterprise (meeting/contact center), nessun caso d'uso gaming documentato, pricing/SLA dedicati da verificare. Solo da monitorare. Contesto correlato: *thatgamecompany* ha integrato l'API testuale DeepL in **Sky: Children of the Light** per la traduzione real-time della chat tra giocatori (utile come precedente d'uso in-game, ma è chat, non doppiaggio/UI).
- **Gemini 3.5 Live Translate (9 giu, preview):** ancora in public preview senza GA/SLA, già segnalato il 17/06. Nessuna novità.
- **Anno 2205 ITA (Ctrl+Trad, 03/06) e Gothic 2 New Balance ITA (GamesTranslator, 07/06):** confermare lo stato finale direttamente sulle pagine sorgente; le date provengono dai risultati di ricerca, non da accesso diretto al file/devlog.
- **Trails in the Sky 1st Chapter:** la v1.06 (06/06) è fuori beta — confermare lo stato finale su GamesTranslator.it.
- **RomHack Plaza ITA (NES/SNES/N64/PSX):** le ricerche continuano a mostrare traduzioni retro ITA (Felix The Cat, Battle City, Adventure Island II/III, EarthBound Beginnings di GiAnMMV; Zelda OoT Master Quest N64) **senza date di pubblicazione esposte** nei risultati. Nessuna confermata come "ultimi 7 giorni" e comunque irrilevanti per il patcher Unity/Unreal di GameStringer.
- I feed RSS candidati in `news-feeds.ts:115-119` restano da testare in-app (CORS/formato WordPress/Invision/MediaWiki).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3 (14 mag 2026, Latest)](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [RomHack Plaza](https://romhackplaza.org/) · [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [DeepL Voice API (press release)](https://www.deepl.com/en/press-release/deepl_launches_voice_api_for_real_time_speech_transcription_and_translation) · [DeepL Voice-to-Voice (PR Newswire)](https://www.prnewswire.com/news-releases/deepl-unveils-real-time-spoken-translation-breaking-the-next-language-barrier-with-voice-to-voice-302744002.html) · [Sky adotta DeepL in-game (Aitoolsbee)](https://aitoolsbee.com/news/in-game-translation-powers-sky-as-thatgamecompany-adopts-deepl/)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
