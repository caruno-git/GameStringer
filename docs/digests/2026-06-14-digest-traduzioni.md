# Digest Traduzioni Videogiochi — 14 giugno 2026

> Giornata tranquilla, in linea con il 13 giugno. Nessun nuovo drift di versione: XUnity, BepInEx e MelonLoader tutti allineati all'upstream. Le azioni segnalate restano i due carryover di documentazione non ancora chiusi. Unica novità concreta: la traduzione ITA di **Blue Prince — Director's Cut** (NexusMods + GamesTranslator.it). Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

1. **(Carryover, ancora aperto) Rimuovere il blocco "⚠️ Doc vs. codice" obsoleto** in `docs/TRANSLATION_INNOVATIONS_2026.md:9`. Riverificato oggi: il blocco è ancora presente e afferma che il bump a `gemini-3.5-flash` è "pendente" e che i sorgenti referenziano `gemini-2.0-flash` hard-coded — ma il codice usa già `NEXT_PUBLIC_GEMINI_MODEL || 'gemini-3.5-flash'`. Il doc stesso chiede di eliminare il blocco una volta fatto il bump. Da chiudere (azione di pulizia, 1 minuto).
2. **(Carryover, ancora aperto) Correggere il riferimento MelonLoader in `docs/TODO.md:26`**: la voce cita `MelonLoader v0.7.3` (mag 2026), release **inesistente**. L'ultima stabile su GitHub resta **v0.7.2 (3 marzo 2026)**. Aggiornare la stringa a `v0.7.2` per non partire da una URL morta quando/se si implementerà il loader.
3. **Nessun drift di versione** in `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi sezione 🛠). Nessuna azione sul codice del patcher oggi.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre. Le candidate in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia forum, Romhacking.it WordPress, PCGW Italian fan translations, 2duerighe) restano disabilitate e marcate "da verificare in app": il passo utile è testarle nell'app per CORS/formato, non aggiungerne altre. `romhackplaza` (`romhackplaza.org/feed/`, riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata oggi.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 11 mag → agg. 2026 | **Blue Prince — Director's Cut** (ITA completa, ~99.9%: testi, immagini, quadri, puzzle finale) | Completa / aggiornata | [NexusMods](https://www.nexusmods.com/blueprince/mods/18) · [GamesTranslator.it](https://www.gamestranslator.it/index.php) |
| 06 giu 2026 | The Legend of Heroes: Trails in the Sky 1st Chapter — ITA (v1.06, fuori beta; video, grafica, dialoghi, missioni principali/secondarie) | Completa, ottimizzazione in corso | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |

Nessuna nuova traduzione ITA su RomHack Plaza negli ultimi 7 giorni: le entry italiane indicizzate (Felix the Cat, Battle City, Adventure Island III, EarthBound Beginnings, Final Fight 3, Yu-Gi-Oh! Forbidden Memories) sono titoli retro NES/SNES/PS già noti, non novità della settimana.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua italiana restano da spulciare manualmente le liste di [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026. Le discussioni Steam che emergono (Endless Space 2, Baldur's Gate 3, Alaskan Road Truckers) sono thread community sulla lingua, non annunci ufficiali nuovi.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge ~#764, 11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| MelonLoader | **v0.7.2** (3 mar 2026) | Non integrato (voce TODO) | ⚠️ TODO.md cita v0.7.3 inesistente |
| TMP Font AssetBundles | v5.5.0 (2025-12-08, le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (~#764 dell'11 giu). Le build dopo #697 introducono breaking API in vista della prima v6 stabile — restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **LLM**: nessuna nuova release di API di traduzione testi (Gemini, DeepL, Claude, OpenAI) rilevante questa settimana. I risultati di ricerca sono articoli comparativi 2026 (GPT-5.5, Claude Opus 4.7, Gemini 2.5/3.x) senza feature direttamente applicabili all'injection di testo nei giochi. Nessuna azione.
- **Blue Prince — Director's Cut**: confermare manualmente versione/percentuale esatta aprendo la pagina NexusMods e la sezione Discover di GamesTranslator.it (i risultati la danno ~99.9% completa). Buon candidato come gioco di test per il flusso di patching testi UI.
- **Trails in the Sky 1st Chapter**: già segnalato la settimana scorsa; la v1.06 (06/06) è fuori beta — confermare stato finale su GamesTranslator.it.
- I feed RSS candidati in `news-feeds.ts:115-119` restano da testare in-app (CORS/formato WordPress/Invision/MediaWiki).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases)
- [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18) · [Blue Prince — discussione Steam ITA](https://steamcommunity.com/app/1569580/discussions/0/830458962613714632/)
- [GamesTranslator.it](https://www.gamestranslator.it/index.php) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [RomHack Plaza](https://romhackplaza.org/)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [LLM updates (giugno 2026)](https://llm-stats.com/llm-updates) · [Best AI Translators 2026](https://www.vozo.ai/blogs/8-best-llms-for-translation-2026)
