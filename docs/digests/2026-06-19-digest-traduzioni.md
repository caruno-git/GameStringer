# Digest Traduzioni Videogiochi — 19 giugno 2026

> Giornata tranquilla, in linea con la settimana. **Nessun drift di versione** in `unity_patcher.rs`: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2, IPA 3.4.1, MelonLoader v0.7.3 (solo doc), TMP Fonts v5.5.0 — tutto allineato all'upstream. **Nessuna azione richiesta sul codice.** La novità più interessante è di tipo "ecosistema": **Language Pack Italia ha rilasciato l'"LPI Hub"**, un programma desktop gratuito per scaricare/attivare/aggiornare le traduzioni ITA della community — un peer/competitor diretto di GameStringer, utile da studiare come riferimento UX e come potenziale nuova fonte ITA. Lato patch ITA, attività confermata su GamesTranslator.it (aggiornamento del 15/06) e un DLC visual-novel ("The Flower & The Flame") al 12/06; nessuna patch ITA con data interna alla settimana risulta inequivocabilmente "nuova" oltre a queste. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'ultima release upstream (vedi 🛠). Nessuna riga da toccare (XUnity righe 21/35/38, BepInEx righe 10-31, IPA riga 18, TMP Fonts riga 44).
2. *(Spunto, non codice)* **LPI Hub** (Language Pack Italia) è un nuovo gestore desktop di traduzioni ITA: download/attivazione/aggiornamento in pochi clic + gestione del blocco aggiornamenti automatici del gioco. Vale la pena **guardarlo come benchmark UX** per il flusso "scarica → applica → mantieni aggiornata" di GameStringer, e valutare l'opzione "disattiva auto-update del gioco" come feature (problema reale: gli update Steam/GOG rompono le patch). Solo valutazione, nessuna implementazione richiesta oggi.

## 📡 Proposte fonti RSS

**Nuova candidata:** **Language Pack Italia** (`languagepack.it`) — repository ITA molto attivo (sezione *Traduzioni Giochi* `https://www.languagepack.it/category/traduzioni/trad-giochi/`), sito WordPress quindi quasi certamente con feed `https://www.languagepack.it/feed/` o `https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`. Da aggiungere come candidata `translations` ITA in `lib/news-feeds.ts` (stesso pattern delle altre `enabled: false` da verificare in app per CORS/formato). È una fonte che oggi non monitoriamo e che pubblica costantemente.

Per il resto invariato rispetto al 18/06: le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false` e **da testare in-app (Gestisci feed)**. `romhackplaza` (riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 giu 2026 | Traduzione aggiornata a build GOG/Steam **1.1.37407** (titolo non esposto nei risultati di ricerca) | Aggiornata | [GamesTranslator.it](https://www.gamestranslator.it/) |
| 12 giu 2026 | DLC *The Flower & The Flame* — ITA 100% (revisione trama protagonista femminile completata, maschile in corso) | DLC completo, revisione in corso | [GamesTranslator.it](https://www.gamestranslator.it/) |
| — | **LPI Hub** (Language Pack Italia) — *tool*, non una singola patch: gestore desktop delle traduzioni ITA della community | Rilasciato (segnalato giu 2026) | [Language Pack Italia](https://www.languagepack.it/) · [Q-Gin](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/) |

**Nota onestà sulle date:** le date provengono dai risultati di ricerca (snippet), non da accesso diretto alle pagine. Il titolo dietro la build "1.1.37407" non è esposto nello snippet di GamesTranslator.it: va confermato manualmente. Le patch di inizio giugno già citate nei digest precedenti (Anno 2205 03/06, Gothic 2 New Balance 07/06, Trails in the Sky 1st Chapter v1.06 06/06) **non** vengono ripetute qui perché fuori dalla finestra dei 7 giorni e già storicizzate.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Le ricerche restituiscono solo materiale generico (liste giochi 2026 con doppiaggio ITA su Everyeye, panoramiche Summer Game Fest 2026, forum RPG Italia, articoli sullo stato della localizzazione ITA) senza un annuncio puntuale datato giugno 2026. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua ITA restano da spulciare manualmente le liste su [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.x** (ultima stabile della linea 5.4; doorstop 4) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge attivi, build #763 dell'11 giu) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08; le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi. I build dopo `6.0.0-be.697` introdurranno breaking change in preparazione della prima v6 stabile. Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **LPI Hub (Language Pack Italia):** segnalato come rilasciato in articoli giu 2026, ma data esatta, requisiti, engine supportati e modalità di "applicazione patch" non sono esposti negli snippet — da verificare su `languagepack.it`. Interessante sia come benchmark UX (gestione auto-update giochi) sia come fonte ITA da monitorare.
- **Feed RSS Language Pack Italia:** URL feed WordPress (`/feed/` o `/category/.../feed/`) ipotizzato ma **non testato** — verificare in-app prima di abilitarlo.
- **GamesTranslator.it build 1.1.37407 (15/06):** titolo del gioco non identificato dallo snippet — confermare sulla pagina sorgente.
- **DLC *The Flower & The Flame* (12/06):** gioco-madre non identificato dallo snippet (pattern "protagonista M/F" → probabile visual novel / otome) — confermare su GamesTranslator.it.
- **Provider LLM:** nessuna novità rilevante nelle ultime 24h oltre a quanto già noto (Gemini 3.5 Flash default in GameStringer; DeepL Voice/Voice-to-Voice in GA come opzione vocale futura; Gemini Live Translate ancora in preview). Le ricerche odierne restituiscono solo comparative "best AI translator 2026" senza release nuove.
- **RomHack Plaza ITA (NES/SNES/PSX):** ancora traduzioni retro ITA di GiAnMMV (Felix the Cat, Battle City, Adventure Island III, EarthBound Beginnings, Yu-Gi-Oh! Forbidden Memories) **senza date di pubblicazione esposte** — nessuna confermabile come "ultimi 7 giorni" e comunque irrilevanti per il patcher Unity/Unreal.

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [Language Pack Italia](https://www.languagepack.it/) · [LPI Hub (notizia)](https://www.languagepack.it/notizie/language-pack-italia-hub/) · [Q-Gin — LPI tool](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [RomHack Plaza](https://romhackplaza.org/) · [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) · [Summer Game Fest 2026 (videogiochitalia)](https://videogiochitalia.it/summer-game-fest-2026-giochi/)
