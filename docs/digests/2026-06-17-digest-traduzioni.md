# Digest Traduzioni Videogiochi — 17 giugno 2026

> Giornata tranquilla. **Nessun drift di versione nel codice** (`unity_patcher.rs`): XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2, IPA 3.4.1, TMP Fonts v5.5.0 — tutti allineati all'upstream. **Nessuna azione richiesta sul codice.** La correzione documentale segnalata il 16/06 (etichetta MelonLoader) **è già stata applicata**: `docs/TODO.md:26` ora cita correttamente `MelonLoader v0.7.3 (14 mag 2026, ultima stabile)`. L'unica novità degna di nota è **Gemini 3.5 Live Translate** (annunciato il 9 giu, ancora in preview) — interessante in prospettiva per la pipeline vocale, ma non sfruttabile ora. Nessuna nuova patch ITA confermata negli ultimi 7 giorni. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice, nessuna azione documentale aperta.**

1. **Nessun drift nel patcher** `src-tauri/src/commands/unity_patcher.rs`: tutte le URL hard-coded sono allineate all'upstream (vedi 🛠). Nessuna riga da toccare.
2. ✅ **Già fatto** — la correzione raccomandata il 16/06 su `docs/TODO.md:26` (MelonLoader `v0.7.2` → `v0.7.3`) **risulta applicata**: la riga ora recita correttamente `MelonLoader v0.7.3 (14 mag 2026, ultima stabile)`. Niente da fare.
3. *(In prospettiva, non oggi)* **Gemini 3.5 Live Translate** (vedi 📝) potrebbe diventare un provider rilevante per la **Pipeline Traduzione Vocale** (Whisper → Traduzione → TTS) già documentata. È in **public preview** senza SLA/pricing stabili: solo da monitorare, nessuna integrazione finché non esce in GA.

## 📡 Proposte fonti RSS

Niente di nuovo da proporre oggi. Situazione invariata: le 5 candidate aggiunte il 20/05 in `lib/news-feeds.ts:115-119` (Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations MediaWiki, 2duerighe WordPress) restano `enabled: false` e "da verificare in app". Il passo utile resta **testarle in-app (Gestisci feed) per CORS/formato**, non aggiungerne altre. `romhackplaza` (`romhackplaza.org/feed/`, riga 113) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 110) continua a bloccare l'RSS via bot protection — nessuna alternativa funzionante trovata.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 06 giu 2026 | The Legend of Heroes: Trails in the Sky 1st Chapter — ITA (v1.06, fuori beta) | Completa, ottimizzazione in corso | [GamesTranslator.it](https://www.gamestranslator.it/index.php) |
| 11 mag → agg. 2026 | Blue Prince — Director's Cut (ITA ~99.9%) | Completa / aggiornata | [NexusMods](https://www.nexusmods.com/blueprince/mods/18) |

Entrambe sono **carryover** già segnalati nei giorni scorsi, **non novità di oggi**. Nessuna nuova patch ITA confermata negli ultimi 7 giorni su GamesTranslator.it, NexusMods o RomHack Plaza. Sul fronte itch.io le ricerche riportano ancora Ctrl+Trad e "Le traduzioni di Rulesless" (es. Yakuza 0 ITA), senza una data di rilascio recente verificabile.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio specifico di localizzazione ITA ufficiale aggiunta a un gioco negli ultimi 7 giorni. Le ricerche restituiscono materiale sul Summer Game Fest 2026 (5 giu) e calendari di uscita, non annunci puntuali di aggiunta lingua italiana. Contesto invariato: per gli arrivi 2026 con doppiaggio/lingua ITA restano da spulciare manualmente le liste su [Everyeye](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) e gli annunci post Summer Game Fest 2026.

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 (BepInEx, IL2CPP, IPA) | ✅ Allineato |
| BepInEx 5.x | **v5.4.23.5** (stabile) | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (stabile più recente; bleeding edge aggiornato 11 giu 2026) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 (scelta deliberata per Unity vecchie) | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | **v0.7.3** (14 mag 2026, ultima stabile) | Non integrato (voce TODO condizionale) | ✅ Riferimento doc allineato |
| UnrealLocres | v1.1.1 (nessuna release nuova nel 2026) | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08, le release successive rimandano lì) | v5.5.0 | ✅ OK (riferimento volutamente fisso) |

Nota BepInEx 6: i bleeding edge restano attivi (repo aggiornato 11 giu) e i build dopo `6.0.0-be.697` introdurranno breaking change in preparazione della prima v6 stabile. Restare su `v6.0.0-pre.2` salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **Gemini 3.5 Live Translate (9 giu 2026, preview)**: traduzione vocale real-time, 70+ lingue, rilevamento automatico lingua sorgente. Rilasciato in public preview su Google Translate, Gemini Live API, AI Studio e Google Meet — **senza SLA/pricing stabili né GA**. Potenzialmente interessante per la Pipeline Traduzione Vocale di GameStringer, ma **nessuna azione finché non esce in GA**. Solo da monitorare.
- **LLM in generale**: nessuna nuova API di traduzione *injectabile nei giochi* applicabile direttamente. XUnity supporta già LLM custom (Gemini/ChatGPT via prompt) e DeepL nelle versioni recenti; nessuna feature nuova sfruttabile rispetto a ieri.
- **RomHack Plaza ITA (NES/SNES/PSX)**: le ricerche continuano a mostrare traduzioni retro ITA (Felix The Cat, Battle City, Adventure Island III, EarthBound Beginnings di GiAnMMV; Final Fight 3 SNES; Yu-Gi-Oh! Forbidden Memories PSX) **senza date di pubblicazione esposte nei risultati**. Nessuna confermata come "ultimi 7 giorni" e comunque irrilevanti per il patcher Unity/Unreal di GameStringer.
- **Trails in the Sky 1st Chapter**: la v1.06 (06/06) è fuori beta — confermare lo stato finale su GamesTranslator.it.
- I feed RSS candidati in `news-feeds.ts:115-119` restano da testare in-app (CORS/formato WordPress/Invision/MediaWiki).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3 (14 mag 2026, Latest)](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres releases](https://github.com/akintos/UnrealLocres/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/) · [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [RomHack Plaza](https://romhackplaza.org/) · [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/) · [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Gemini 3.5 Live Translate (digitalapplied)](https://www.digitalapplied.com/blog/gemini-live-3-5-translate-real-time-multilingual-cx-guide) · [Everyeye — doppiaggio ITA 2026](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
