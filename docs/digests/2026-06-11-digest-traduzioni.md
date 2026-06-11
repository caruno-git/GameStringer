# 🎮 Digest Traduzioni Videogiochi — 11 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla, quadro **invariato rispetto al 10/06**. **Nessun drift di versione**: XUnity 5.6.1 resta l'ultima release, BepInEx 6 stabile non ancora uscito (bleeding-edge be.759). Nessuna nuova patch ITA confermata con certezza oggi (GamesTranslator.it riconferma gli stessi progetti di ieri). Provider LLM stabili. **First Playable 2026** in corso a Firenze (10–12/06) con Italian Video Game Awards stasera (11/06): evento B2B, **nessun annuncio di localizzazione ITA** rilevante emerso.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift richiesta oggi.** Verifica eseguita su `src-tauri/src/commands/unity_patcher.rs` (versioni hard-coded confrontate con le release upstream verificate oggi):

| Riga | Costante | Nel codice | Upstream (verificato 11/06) | Stato |
|------|----------|-----------|------------------------------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ |
| 21, 35, 38 | `XUNITY_*` | `5.6.1` | 5.6.1 (19/04/2026, ancora l'ultima) | ✅ |
| 25–27, 30–31 | `BEPINEX6_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile; BE build 759) | ✅ |

> Promemoria invariato: i bleeding-edge BepInEx post `be.697` introducono breaking API in vista della prima v6 stabile. Quando uscirà la v6 stabile, il bump dei pin `6.0.0-pre.2` potrebbe richiedere anche adeguamenti di compatibilità plugin, non solo URL.

**Spunto opzionale (invariato):** sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con lettura di `NEXT_PUBLIC_GEMINI_MODEL` in `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta rispetto a ieri. Restano in coda di validazione (non testabili automaticamente in questa run — il fetch diretto dei feed non è disponibile):

- `https://romhackplaza.org/language/italian/feed/` — feed categoria Italiano, più mirato del feed globale già attivo (`romhackplaza`, `enabled: true`).
- `https://www.languagepack.it/feed/` — Language Pack Italia.
- Già presenti in `lib/news-feeds.ts` ma `enabled: false`, da ritestare in app: `ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`.

NexusMods / GamesTranslator.it: blocco invariato (bot protection / CORS); unica via realistica resta un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~giu 2026 | The Excavation of Hob's Barrow | ITA v1.0.1 segnalata completata — **ancora da confermare** (riportata anche ieri) | GamesTranslator.it |
| 6 giu 2026 | Trails in the Sky 1st Chapter | ITA completa v1.06, revisione Tarabas/Vessor in corso | GamesTranslator.it |
| 4 giu 2026 | Blood.West | Patch ITA v4.6.2, lavoro in corso — da confermare | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | ITA pubblicata (CoccoLoco), in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | ITA pubblicata (CaramellaGTX) | GamesTranslator.it |

Nessuna **nuova** patch ITA datata 11/06 individuata via ricerca rispetto al digest di ieri. Su RomHack Plaza catalogo retro ITA di GiAnMMV invariato, nessuna patch nuova con data giugno individuata.

---

## 🏢 Localizzazioni ufficiali annunciate

- **First Playable 2026, Firenze (10–12 giu):** evento business dell'industria italiana (IIDEA). Oltre 1.000 incontri B2B, 55 publisher/investitori internazionali, Italian Video Game Awards stasera (11/06) al Cinema La Compagnia. È un evento di settore: **nessun annuncio di localizzazione ITA** specifico per giochi emerso dalle ricerche.
- Nessun annuncio ufficiale di nuova localizzazione ITA individuato oggi.
- *Carry-over / fonti ricorrenti:* [Everyeye — giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html). Titoli SGF 2026 (RE Veronica, FFVII Revelation, Guild Wars 3, Alien: Isolation 2…): lingue supportate da verificare sulle pagine Steam man mano che compaiono.

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) — verificato oggi | 5.6.1 | ✅ |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ |
| BepInEx 6 | 6.0.0-pre.2 (bleeding-edge be.759) | 6.0.0-pre.2 | ✅ (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ |
| IPA | 3.4.1 | 3.4.1 | ✅ |
| MelonLoader / UnrealLocres / UnityEx | non riverificati oggi (nessun segnale di novità) | n/a | ➖ |

**Provider LLM (riverificati oggi):** giugno 2026 è un mese fitto di rilasci (GPT-5.6, Gemini 3.5 Pro, Claude 4.8 segnalati dalle fonti), ma il quadro per la traduzione resta coerente: benchmark confermano Claude tra i migliori per ITA/letterario, Gemini forte su costo/qualità e altre lingue, DeepL ottimo su stringhe UI brevi. Coerente con il setup GameStringer (Gemini Flash default + Claude + DeepL): **nessuna azione**. Eventuale spunto futuro: valutare se aggiornare il default Gemini a una build 3.x quando i nuovi modelli saranno stabili e documentati (legato allo spunto sui modelli hard-coded sopra).

---

## 📝 Cose non verificate / da controllare manualmente

- **The Excavation of Hob's Barrow ITA:** confermare su GamesTranslator.it data esatta, autore e completezza (segnalata da due giorni, ancora non confermata).
- **Feed RSS candidati** (`romhackplaza.org/language/italian/feed/`, `languagepack.it/feed/`): testare in app che restituiscano XML valido.
- **First Playable 2026:** ricontrollare il 12/06 eventuali annunci/novità a chiusura evento (i premi IVGA stasera potrebbero generare coverage).
- **Modelli LLM giugno 2026** (Gemini 3.5 Pro, Claude 4.8, GPT-5.6): verificare stringhe modello esatte e disponibilità API prima di considerare un aggiornamento dei default in `lib/ai/`.
- **BepInEx v6 stabile:** monitorare; al rilascio valutare bump pin + impatto breaking changes plugin.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be) · [Discussion 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/discussions/969)
- [Games Translator (home)](https://www.gamestranslator.it/index.php)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [First Playable 2026 — IIDEA](https://iideassociation.com/en/first-playable-2026-preparations-are-underway-for-the-new-edition-of-the-video-game-business-event-which-is-scheduled-to-take-place-from-10-12-june-in-florence/) · [Multiplayer.it](https://multiplayer.it/notizie/first-playable-2026-al-via-a-firenze-evento-dedicato-allindustria-italiana-dei-videogiochi.html)
- [Everyeye — Giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Benchmark traduzione LLM 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [AI Updates giugno 2026 (llm-stats)](https://llm-stats.com/llm-updates)
- [PCGamingWiki — Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
