# 🎮 Digest Traduzioni Videogiochi — 10 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla. **Nessun drift di versione** (tutte le ricerche completate oggi, a differenza del 9/06): XUnity 5.6.1 resta l'ultima release, BepInEx 6 stabile non ancora uscito (BE build 759 del 09/06). Possibile novità ITA: **The Excavation of Hob's Barrow** segnalata completata su GamesTranslator.it (da confermare). Dal Summer Game Fest 2026 nessun annuncio di localizzazione ITA specifico emerso. **First Playable 2026 a Firenze inizia oggi (10–12/06)** — da monitorare.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift richiesta oggi.** Verifica completa eseguita su `src-tauri/src/commands/unity_patcher.rs`:

| Riga | Costante | Nel codice | Upstream (verificato oggi) | Stato |
|------|----------|-----------|----------------------------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ |
| 21, 35, 38 | `XUNITY_*` | `5.6.1` | 5.6.1 (19/04/2026, ancora l'ultima) | ✅ |
| 25–27, 30–31 | `BEPINEX6_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile; BE build 759 del 09/06) | ✅ |

> BepInEx: i bleeding-edge post `be.697` introducono breaking API in vista della prima v6 stabile — quando uscirà, il bump dei pin `6.0.0-pre.2` potrebbe richiedere anche adeguamenti di compatibilità plugin, non solo URL. Tenere d'occhio.

**Spunto opzionale (invariato dai digest precedenti):** sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con lettura di `NEXT_PUBLIC_GEMINI_MODEL` in `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta rispetto a ieri. Restano in coda di validazione (non testabili automaticamente oggi — il fetch diretto dei feed non è disponibile in questa run):

- `https://romhackplaza.org/language/italian/feed/` — feed categoria Italiano, più mirato del feed globale già attivo.
- `https://www.languagepack.it/feed/` — Language Pack Italia; la community ha anche rilasciato il tool **LPI-Hub** per gestire le traduzioni ITA (riconfermato oggi via Q-Gin), fonte viva.
- Da ritestare in app: Ctrl+Trad, OldGamesItalia, Romhacking.it, PCGW Italian, 2duerighe (tutte `enabled: false` in `lib/news-feeds.ts`).

NexusMods / GamesTranslator.it: blocco invariato (bot protection / CORS); unica via realistica resta un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| ~giu 2026 | **The Excavation of Hob's Barrow** | Traduzione ITA v1.0.1 segnalata completata — **NUOVA, da confermare** | GamesTranslator.it |
| 6 giu 2026 | Trails in the Sky 1st Chapter | ITA completa v1.06, revisione Tarabas/Vessor in corso (riconfermata oggi) | GamesTranslator.it |
| 4 giu 2026 | Blood.West | Patch ITA v4.6.2, lavoro in corso — *da confermare* | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | ITA pubblicata (CoccoLoco), in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | ITA pubblicata (CaramellaGTX) | GamesTranslator.it |

Su RomHack Plaza nessuna nuova patch ITA datata giugno individuata via ricerca (catalogo retro ITA di GiAnMMV invariato).

---

## 🏢 Localizzazioni ufficiali annunciate

- **Summer Game Fest 2026 (5–6 giu):** grandi annunci (RE Veronica, FFVII Revelation, Guild Wars 3, Alien: Isolation 2…) ma **nessun annuncio specifico di localizzazione ITA** emerso dalle ricerche. Le lingue supportate dei titoli annunciati andranno verificate sulle pagine Steam man mano che compaiono.
- **First Playable 2026, Firenze — inizia oggi (10–12 giu):** evento dell'industria italiana, contesto probabile per annunci di localizzazione ITA. Controllare domani.
- Everyeye mantiene un articolo aggiornato sui [giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) — utile come fonte ricorrente.
- *Carry-over:* Sea of Stars ITA ufficiale (update *Throes of the Watchmaker*, 20/05); Sky: Children of the Light con API DeepL per chat live.

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) — verificato oggi | 5.6.1 | ✅ |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ |
| BepInEx 6 | 6.0.0-pre.2 (BE build 759, 09/06/2026) | 6.0.0-pre.2 | ✅ (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ |
| IPA | 3.4.1 | 3.4.1 | ✅ |
| MelonLoader / UnrealLocres / UnityEx | non riverificati oggi (nessun segnale di novità) | n/a | ➖ |

**Provider LLM (riverificati oggi):** quadro stabile — i benchmark 2026 confermano Gemini 3.1 Pro in testa per costo/qualità (~$2/M input), Claude Opus per contenuti letterari/tone-sensitive, DeepL ancora il migliore su stringhe UI brevi. Coerente con il setup GameStringer (Gemini Flash default + Claude + DeepL): **nessuna azione**.

---

## 📝 Cose non verificate / da controllare manualmente

- **The Excavation of Hob's Barrow ITA:** confermare su GamesTranslator.it data esatta, autore e completezza prima di considerarla stabile.
- **Feed RSS candidati** (`romhackplaza.org/language/italian/feed/`, `languagepack.it/feed/`): testare in app che restituiscano XML valido (fetch automatico non disponibile in questa run).
- **First Playable 2026:** ricontrollare domani e il 12/06 eventuali annunci di localizzazione ITA.
- **Titoli SGF 2026:** verificare le lingue supportate sulle pagine Steam quando pubblicate.
- **BepInEx v6 stabile:** monitorare; al rilascio valutare bump pin + impatto breaking changes plugin.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be) · [Discussion 6.0.0-pre.2](https://github.com/BepInEx/BepInEx/discussions/969)
- [Games Translator (home)](https://www.gamestranslator.it/index.php)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — LPI-Hub di Language Pack Italia](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Everyeye — Giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Everyeye — Summer Game Fest 2026: riassunto annunci](https://www.everyeye.it/articoli/speciale-summer-game-fest-2026-riassunto-annunci-evento-geoff-keighley-67226.html)
- [Tom's Hardware — SGF 2026 tutti gli annunci](https://www.tomshw.it/videogioco/summer-game-fest-2026-tutti-gli-annunci-e-i-trailer-2026-06-06)
- [Benchmark traduzione LLM 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [Confronto AI translator 2026](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison)
- [PCGamingWiki — Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
