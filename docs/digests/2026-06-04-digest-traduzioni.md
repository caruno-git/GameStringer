# 🎮 Digest Traduzioni Videogiochi — 4 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **TL;DR:** Giornata tranquilla. **Nessun drift di versione**: tutti i tool restano allineati (XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2, IPA 3.4.1). Due nuove patch ITA databili nella finestra: **Luna Abyss** (2 giu, CoccoLoco — con segnalazioni di frasi ancora in inglese) e **Battlestar Galactica: Scattered Hopes** (2 giu), entrambe su GamesTranslator.it. Nessun nuovo annuncio di localizzazione ufficiale. Fronte LLM e RSS invariati rispetto a ieri.

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

> XUnity.AutoTranslator resta a **5.6.1** (nessuna release più recente su GitHub; ultima del 19/04/2026). BepInEx 6 stabile ancora non pubblicato: solo pre-release `6.0.0-pre.2` + bleeding-edge (ultimo build noto ~755, 07/03/2026; i build > 6.0.0-be.697 introdurranno breaking change verso il primo v6 stabile). Nessun motivo di muoversi dai pin attuali.

**Spunto opzionale (debito tecnico interno, non novità esterna):** resta in piedi il task già annotato nei digest precedenti — sostituire i modelli Gemini hard-coded (`gemini-2.0-flash`) con la lettura di `NEXT_PUBLIC_GEMINI_MODEL` nei file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`. Diventa più interessante se si vuole agganciare la nuova generazione Gemini 3.x.

---

## 📡 Proposte fonti RSS

Nessuna **nuova** proposta RSS funzionante rispetto a ieri. Restano candidate da validare manualmente in app (tutte `enabled: false` in `lib/news-feeds.ts`):

- `https://romhackplaza.org/language/italian/feed/` — feed di categoria Italiano (più mirato del feed globale `romhackplaza` già attivo).
- `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio (LPI-Hub).
- Già presenti ma disattivate, da ritestare in app: Ctrl+Trad (`ctrltrad.itch.io/devlog.rss`), OldGamesItalia, Romhacking.it (`romhacking.it/feed/`), PCGW Italian.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. GamesTranslator.it resta la fonte ITA più viva (vedi sotto), ma il feed continua a essere bloccato lato app — da valutare se un proxy server-side risolverebbe.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **2 giu 2026** | **Luna Abyss** | Traduzione ITA pubblicata (CoccoLoco, supporto Godran65). Segnalazioni utenti (3 giu): alcune frasi/dialoghi ancora in inglese — patch in rifinitura | GamesTranslator.it |
| **2 giu 2026** | **Battlestar Galactica: Scattered Hopes** | Traduzione ITA pubblicata | GamesTranslator.it |
| ~giu 2026 | Starbites | Traduzione ITA (Steam) segnalata, data esatta da confermare | GamesTranslator.it |
| 31 mag 2026 | Anno 2205 | Traduzione ITA completa (EN→IT), patch non invasiva | GamesTranslator.it |
| 1 giu 2026 | Little Witch in the Woods | Traduzione ITA pubblicata (CaramellaGTX) | GamesTranslator.it |

> Novità *nuove* rispetto al digest del 3 giugno: **Luna Abyss** e **Battlestar Galactica: Scattered Hopes** (entrambe 2 giu). Luna Abyss ha segnalazioni di testo ancora parzialmente in inglese — non considerarla 100% completa. Anno 2205 e Little Witch erano già nel digest precedente, riportati per continuità settimanale. RomHack Plaza non ha esposto nuove patch ITA databili in finestra (solo titoli retro NES/SNES già archiviati).

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio rispetto ai digest precedenti. Restano:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma.

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

**Provider LLM (segnalazioni da verificare):** quadro invariato rispetto a ieri. I comparativi 2026 continuano a indicare **Gemini 3.1 Pro** in testa ai benchmark (~$2/M token input) e **DeepL** vincente nei confronti diretti per coppia linguistica (94% dei casi citati vs Google/GPT-5.2/Claude Opus 4.6). **Claude** resta indicato come più forte sul testo ad alta sfumatura/tone-sensitive. Nessun annuncio nuovo databile in finestra. Il setup attuale di GameStringer (Gemini Flash default, Claude Sonnet 4.6, DeepL) resta valido.

---

## 📝 Cose non verificate / da controllare manualmente

- **Luna Abyss**: confermare su GamesTranslator.it lo stato reale della patch (segnalazione utente del 3 giu di dialoghi ancora in inglese) e la versione del gioco testata prima di considerarla completa.
- **Battlestar Galactica: Scattered Hopes** e **Starbites**: confermare a mano stato (completa/parziale) e data esatta sul sito.
- **Gemini 3.1 Pro / nomi modello LLM**: i risultati provengono da articoli comparativi di terze parti — verificare la disponibilità reale via API ufficiale prima di pinnarli nel progetto.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli.
- **BepInEx 6 stabile**: continuare a monitorare — quando esce la prima v6 stabile sarà il momento di valutare il bump dei pin `6.0.0-pre.2`.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be) · [v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/discussions/969)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases) · [UnrealLocres — Releases](https://github.com/akintos/UnrealLocres/releases)
- [Games Translator (home)](https://www.gamestranslator.it/) · [Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=) · [Richiesta/Topic Luna Abyss](https://www.gamestranslator.it/index.php?%2Fforums%2Ftopic%2F3587-richiesta-traduzione-luna-abyss%2F=)
- [Steam — Traduzioni Italiane Amatoriali (gruppo)](https://steamcommunity.com/groups/traduzioniitalianeamatoriali/comments)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Best AI Translator 2026 (Pillitteri)](https://pasqualepillitteri.it/en/news/764/best-ai-translator-2026-deepl-chatgpt-claude-gemini-comparison) · [LLM Translation Benchmark 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026) · [AI Updates Today June 2026 (llm-stats)](https://llm-stats.com/llm-updates)
