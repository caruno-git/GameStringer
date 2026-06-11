# 🎮 Digest Traduzioni Videogiochi — 5 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Altra giornata tranquilla, in continuità con il 4 giugno. **Nessun drift di versione**: XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / Legacy 5.4.11, IPA 3.4.1, MelonLoader 0.7.3 (non scaricato dal progetto) restano tutti allineati agli upstream. Una sola voce potenzialmente nuova sul fronte ITA: aggiornamento patch **Blood.West v4.6.2** segnalato il 4 giu su GamesTranslator.it (lavoro ancora in corso — da confermare a mano). Nessun nuovo annuncio di localizzazione ufficiale. Fronte LLM e RSS invariati.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs`:

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 21 | `XUNITY_IPA_URL` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |
| 35, 38 | `XUNITY_URL` / `XUNITY_IL2CPP_URL` | `5.6.1` | 5.6.1 | ✅ Allineato |

> XUnity.AutoTranslator resta a **5.6.1** (ultima release GitHub 19/04/2026, nessuna successiva). BepInEx 6 stabile ancora non pubblicato: solo `6.0.0-pre.2` + bleeding-edge (ultimo build noto ~755, 07/03/2026; i build > `6.0.0-be.697` introdurranno breaking change verso la prima v6 stabile). Nessun motivo di muovere i pin attuali.

**Spunto opzionale (debito tecnico interno, non novità esterna):** resta valido il task già annotato nei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`. Utile se in futuro si vorrà agganciare la generazione Gemini 3.x.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza` già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, da ritestare in app: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. GamesTranslator.it resta la fonte ITA più viva, ma il feed continua a essere bloccato lato app — resta da valutare un proxy server-side.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **4 giu 2026** | **Blood.West** | Aggiornamento patch ITA a **v4.6.2** (Steam) segnalato; thread indica lavoro ancora in corso sull'update — *da confermare stato reale* | GamesTranslator.it |
| 2 giu 2026 | Luna Abyss | Traduzione ITA pubblicata (CoccoLoco). Segnalazioni del 3 giu: alcune frasi ancora in inglese — patch in rifinitura | GamesTranslator.it |
| 2 giu 2026 | Battlestar Galactica: Scattered Hopes | Traduzione ITA pubblicata | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |
| 31 mag 2026 | Anno 2205 | Traduzione ITA completa (EN→IT), patch non invasiva | GamesTranslator.it |

> Unica novità *nuova* rispetto al digest del 4 giugno: l'aggiornamento **Blood.West v4.6.2** (segnalato 4 giu, dopo la generazione del digest precedente). Il thread suggerisce che il lavoro sull'update non è concluso → non considerarla finalizzata senza verifica manuale. Le altre voci sono riportate per continuità settimanale ed erano già nei digest precedenti. RomHack Plaza non ha esposto nuove patch ITA databili in finestra (solo titoli retro NES/SNES/PS1 già archiviati).

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio rispetto ai digest precedenti. Restano:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma.

> Promemoria evento: **First Playable 2026** a Firenze (10–12 giugno) — possibile contesto per annunci di localizzazione ITA nei prossimi giorni; da monitorare.

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | 5.4.23.5 | ✅ Allineato |
| BepInEx 6 | 6.0.0-pre.2 (pre-release) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (14/05/2026) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | v1.1.1 (nessuna nuova release) | n/a | ➖ Nessuna novità |
| UnityEx | nessuna novità databile | n/a | ➖ Nessuna novità |

**Provider LLM (segnalazioni da verificare):** quadro invariato. I comparativi 2026 continuano a indicare **Gemini 3.1 Pro** in testa ai benchmark generalisti e **DeepL** (update di marzo 2026) vincente nei confronti diretti per coppia linguistica (94% dei casi citati vs Google/Gemini 3.1 Pro/GPT-5.2/Claude Opus 4.6). **Claude** resta indicato come più forte su testo ad alta sfumatura/tone-sensitive e tra i migliori per l'italiano. Nessun annuncio nuovo databile in finestra. Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido.

---

## 📝 Cose non verificate / da controllare manualmente

- **Blood.West v4.6.2**: confermare su GamesTranslator.it se l'aggiornamento della patch è completo o ancora in lavorazione, e la versione del gioco testata.
- **Luna Abyss**: confermare lo stato reale (segnalazione del 3 giu di dialoghi ancora in inglese) prima di considerarla completa.
- **Gemini 3.1 Pro / nomi modello LLM**: risultati da articoli comparativi di terze parti — verificare disponibilità reale via API ufficiale prima di pinnarli nel progetto.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **BepInEx 6 stabile**: continuare a monitorare — quando esce la prima v6 stabile sarà il momento di valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases/) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be) · [v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/discussions/969)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases) · [v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [Games Translator (home)](https://www.gamestranslator.it/) · [Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Steam — Blue Prince / Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali/comments)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Giochi 2026 con doppiaggio italiano (Everyeye)](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html) · [First Playable 2026 (Firenze)](https://www.toscanafilmcommission.it/first-playable-2026-tutto-pronto-per-lottava-edizione-a-firenze/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Best AI Translator 2026 (Pillitteri)](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison) · [LLM Translation Benchmark 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [DeepL nuovo modello (marzo 2026)](https://home.deepl.com/en/blog/meet-new-deepl-translator)
