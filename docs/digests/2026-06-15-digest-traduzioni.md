# Digest Traduzioni Videogiochi — 15 giugno 2026

> Giornata tranquilla, in linea con il 13–14 giugno. **Nessun drift di versione**: XUnity, BepInEx, MelonLoader (riferimento TODO) e TMP Fonts tutti allineati all'upstream. **I due carryover di documentazione di ieri risultano CHIUSI** (vedi sotto). Nessuna nuova traduzione ITA confermata della settimana: la voce **Star Trek Infinite** emersa nelle ricerche, verificata manualmente, è in realtà una patch **più vecchia** (v1.0.6, copertina caricata set 2025) e non una novità. Nessuna azione richiesta sul codice. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione richiesta oggi.** Entrambi i carryover segnalati il 14/06 risultano risolti:

1. ✅ **Chiuso** — Il blocco "⚠️ Doc vs. codice" in `docs/TRANSLATION_INNOVATIONS_2026.md` è stato rimosso/sostituito. La riga 9 ora riporta `Stato 14/06/2026: bump completato nei sorgenti`, confermando che tutti i file (`lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`) leggono `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash` e nessun `gemini-2.0-flash` hard-coded residuo.
2. ✅ **Chiuso** — `docs/TODO.md:26` ora cita correttamente **MelonLoader `v0.7.2` (3 mar 2026, ultima stabile)**. Il riferimento alla `v0.7.3` inesistente è stato corretto.
3. **Nessun drift di versione** in `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi sezione 🛠). Nessuna azione sul patcher.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre. Le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision forum, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false` e marcate "da verificare in app": il passo utile resta **testarle nell'app (Gestisci feed) per CORS/formato**, non aggiungerne altre. `romhackplaza` (`romhackplaza.org/feed/`, riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata oggi.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 06 giu 2026 | The Legend of Heroes: Trails in the Sky 1st Chapter — ITA (v1.06, fuori beta; video, grafica, dialoghi, missioni principali/secondarie) | Completa, ottimizzazione in corso | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |
| 11 mag → agg. 2026 | Blue Prince — Director's Cut (ITA completa ~99.9%: testi, immagini, quadri, puzzle finale) | Completa / aggiornata | [NexusMods](https://www.nexusmods.com/blueprince/mods/18) · [GamesTranslator.it](https://www.gamestranslator.it/index.php) |

> **Verificato manualmente (15/06)** — **Star Trek Infinite v1.0.6 – Traduzione Italiana**, emersa nelle ricerche come possibile novità, NON è una traduzione della settimana: è pubblicata da [Enimols77](https://www.gamestranslator.it/index.php?/file/921-star-trek-infinite-v106-traduzone-italiana/) (traduzione a cura di **Ctrl+Trad**), copertina caricata a settembre 2025, gioco v1.0.6. I risultati di ricerca avevano erroneamente attribuito autore (TurinaR) e data (giu 2026). Esclusa dalla tabella. Rilevanza tecnica per GameStringer: vedi sezione 📝.

Nessuna nuova traduzione ITA su RomHack Plaza negli ultimi 7 giorni: le entry italiane indicizzate (Battle City, Adventure Island III, EarthBound Beginnings, Final Fight 3, Yu-Gi-Oh! Forbidden Memories, Zelda OoT Master Quest) sono titoli retro NES/SNES/N64/PS già noti, non novità della settimana.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua italiana (es. Metro 2039, Marvel's Wolverine citati nelle liste) restano da spulciare manualmente [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026. Le discussioni Steam che emergono (Endless Space 2, Blue Prince) sono thread community sulla lingua, non annunci ufficiali nuovi.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge ~#763, 11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.2** (3 mar 2026) | Non integrato (voce TODO, ora corretta) | ✅ Riferimento allineato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08, le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (~#763 dell'11 giu). Le build dopo #697 introducono breaking API in vista della prima v6 stabile — restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **Star Trek Infinite (ITA) — VERIFICATO 15/06**: pagina reale [file/921](https://www.gamestranslator.it/index.php?/file/921-star-trek-infinite-v106-traduzone-italiana/), pubblicata da Enimols77 (traduzione Ctrl+Trad), gioco v1.0.6, asset caricato set 2025 → **non è novità della settimana**, declassata. Tecnicamente conferma il pattern utile: è un grand strategy Paradox (engine Clausewitz) la cui localizzazione è un **singolo file di testo** `l_spanish.yml` in `Star Trek Infinite\localisation\spanish\`, sostituito a mano (si seleziona lo spagnolo in-game). Caso d'uso ideale per il flusso **"Batch Folder Translator"** su file `.yml`/`.csv`, **non** per il patcher Unity/Unreal/BepInEx. Possibile spunto: preset "Paradox/Clausewitz `.yml`" nel Batch Folder Translator (preserva chiavi `KEY:0 "valore"`, escape, e tag colore `§Y…§!`).
- **LLM**: nessuna nuova release di API di traduzione testi direttamente applicabile all'injection nei giochi. I risultati sono articoli comparativi 2026 (GPT-5.5 $5/$30, Claude Opus 4.8 $5/$25, Sonnet 4.6 $3/$15, Gemini 2.5/3.x) senza feature nuove sfruttabili. Nessuna azione.
- **Trails in the Sky 1st Chapter**: già segnalato; la v1.06 (06/06) è fuori beta — confermare stato finale su GamesTranslator.it.
- I feed RSS candidati in `news-feeds.ts:115-119` restano da testare in-app (CORS/formato WordPress/Invision/MediaWiki).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/index.php)
- [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [RomHack Plaza](https://romhackplaza.org/)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) · [Summer Game Fest 2026](https://videogiochitalia.it/summer-game-fest-2026-giochi/)
- [AI API Pricing giugno 2026 (DevTk)](https://devtk.ai/en/blog/ai-api-pricing-comparison-2026/) · [LLM updates](https://llm-stats.com/llm-updates)
