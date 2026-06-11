# 🎮 Digest Traduzioni Videogiochi — 1 giugno 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **Buona notizia:** il drift BepInEx 5 segnalato negli ultimi giorni risulta **risolto nel codice** (gli URL puntano già a `v5.4.23.5`). Nessun altro drift di versione. Per il resto giornata tranquilla. Una sola novità degna di nota: il tool concorrente/ispirazione **LPI-Hub** di Language Pack Italia.

---

## 🔥 Azione consigliata per GameStringer

**Nessuna azione di drift di versione richiesta oggi. Tutti i tool sono allineati.**

Verifica diretta su `src-tauri/src/commands/unity_patcher.rs`:

| Riga | Costante | Valore nel codice | Upstream | Stato |
|------|----------|-------------------|----------|-------|
| 10–11 | `BEPINEX5_X64/X86_URL` | `v5.4.23.5` | 5.4.23.5 | ✅ Allineato (drift chiuso) |
| 25–27 | `BEPINEX6_MONO_*` | `6.0.0-pre.2` | 6.0.0-pre.2 (no stabile) | ✅ Allineato |
| 30–31 | `BEPINEX6_IL2CPP_*` | `6.0.0-pre.2` | 6.0.0-pre.2 | ✅ Allineato |
| 14–15 | `BEPINEX_LEGACY_*` | `5.4.11` | 5.4.11 | ✅ Invariato |
| 18 | `IPA_URL` | `3.4.1` | 3.4.1 | ✅ Invariato |
| 21, 35, 38 | `XUNITY_*` | `5.6.1` | 5.6.1 (19/04/2026) | ✅ Allineato |

> L'azione "bump BepInEx 5.4.23.4 → 5.4.23.5" presente nei digest del 28–31 maggio **non è più necessaria**: il codice è già a `5.4.23.5` su entrambe le costanti x64/x86. Si può considerare chiusa.

**Spunto opzionale (non urgente) — intelligence competitiva:** valutare **LPI-Hub** (vedi sezione 🏢). È un launcher Windows che installa/aggiorna patch ITA leggendo i giochi originali da Steam/GOG/Epic e gestendo backup/ripristino dei file sostituiti. È esattamente il dominio di GameStringer: utile come benchmark UX per il flusso "Gestisci patch" (rilevamento gioco originale, update automatici, ripristino file originali in un clic).

---

## 📡 Proposte fonti RSS

Nessuna nuova proposta RSS rispetto a ieri. Restano in piedi i suggerimenti già annotati:

- **RomHack Plaza — feed di categoria Italiano** (più mirato del feed globale già attivo `romhackplaza`): `https://romhackplaza.org/language/italian/feed/` — *da testare in app* che restituisca XML valido.
- Le fonti italiane già presenti in `lib/news-feeds.ts` ma `enabled: false` con flag "da verificare in app" (Ctrl+Trad, OldGamesItalia, Romhacking.it, PCGW Italian, 2duerighe) restano da validare manualmente: oggi tutte hanno mostrato attività (Ctrl+Trad e Romhacking.it raggiungibili, PCGW lista aggiornata), quindi vale la pena testarne il parsing RSS in app.

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi.

**Possibile nuova fonte da considerare:** `languagepack.it` (WordPress) espone quasi certamente un feed standard `https://www.languagepack.it/feed/` — community ITA molto attiva con tool proprio. *Da verificare in app prima di aggiungerla* a `news-feeds.ts` categoria `translations`.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

Nessuna patch ITA **nuova confermata** strettamente negli ultimi 7 giorni (25/05–01/06). Aggiornamenti recenti già noti / ai margini della finestra:

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 20 mag 2026 | **Magicraft** | Traduzione ITA aggiornata | GamesTranslator.it |
| 11 mag 2026 | **Blue Prince** (2026 Director's Cut) | Traduzione ITA 99,9%, aggiornata per la Director's Cut | NexusMods |
| mag 2026 | **Heaven Dust** | Traduzione ITA testata su Steam e Game Pass | GamesTranslator.it |
| (recente) | **Yakuza Zero** | Patch fan made ITA gratuita | Everyeye.it |

> Magicraft (20/05) è appena fuori dalla finestra stretta dei 7 giorni ma è l'aggiornamento ITA databile più recente trovato. RomHack Plaza non ha esposto patch ITA nuove databili in questa settimana (i risultati sono titoli retro NES/SNES/PS1 già archiviati).

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun **nuovo** annuncio di localizzazione ufficiale rispetto ai digest precedenti. Restano:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme (main game + DLC). [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma. [NerdPool]

**Novità di rilievo (tool community, non localizzazione ufficiale):**

- **LPI-Hub — Language Pack Italia Hub** — launcher PC Windows (parzialmente compatibile Linux) della community Language Pack Italia per scaricare, attivare e aggiornare le loro traduzioni ITA. Rileva i giochi **originali** via Steam/GOG/Epic, gestisce update automatici e ripristino dei file sostituiti. LPI ha all'attivo traduzioni di titoli grossi (Pathfinder: WotR, Warhammer 40k: Rogue Trader, Throne and Liberty). **Rilevante come benchmark diretto per GameStringer.** ⚠️ *Data di rilascio non certa:* la versione 1.0.0 risulterebbe annunciata già a gennaio (fonte FB/sito), mentre l'articolo Q-Gin è emerso ora — possibile sia ri-circolato di recente, **non confermato come novità degli ultimi 7 giorni.** [Q-Gin / languagepack.it]

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | 5.4.23.5 | **5.4.23.5** | ✅ Allineato (drift chiuso) |
| BepInEx 6 | 6.0.0-pre.2 (pre-release; BE build ~755) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (14/05/2026) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | nessuna nuova release | n/a | ➖ Nessuna novità |

> BepInEx 6 stabile **non** ancora pubblicato: esistono solo pre-release (`6.0.0-pre.2`) e bleeding-edge (~build 755). Nessun motivo di muoversi dal pin attuale.

---

## 📝 Cose non verificate / da controllare manualmente

- **Magicraft (20/05)**: confermare su GamesTranslator.it lo stato esatto (completa vs WIP) e se l'update rientra nella settimana corrente.
- **LPI-Hub — data**: chiarire se è davvero una novità recente o un articolo Q-Gin ri-circolato; la v1.0.0 sembra di gennaio. Non darlo per "nuovo della settimana" senza conferma.
- **Feed `languagepack.it/feed/`** e **`romhackplaza.org/language/italian/feed/`**: testare in app che restituiscano XML valido prima di abilitarli in `news-feeds.ts`.
- **Provider LLM**: landscape stabile. Conferme di maggio: Gemini 3.1 Pro forte su traduzione broad (top WMT25), DeepL leader BLEU su UI/stringhe corte, LLM frontier (Claude Opus 4.6, GPT-5) per testo narrativo. Nessuna novità operativa per la traduzione di giochi rispetto a ieri. Il setup GameStringer (Gemini 3.5 Flash default, Claude Sonnet 4.6, DeepL Voice) resta valido. Valutazioni già annotate (eventuale `claude-opus-4-7` premium, `deepseek-v4` economy) restano non urgenti — nessun nuovo elemento oggi.
- **Promemoria interno (non legato alle news):** in `TRANSLATION_INNOVATIONS_2026.md` resta pendente il bump effettivo nei sorgenti da `gemini-2.0-flash` hard-coded a lettura di `NEXT_PUBLIC_GEMINI_MODEL` (file `lib/ai/ai-translate-direct.ts`, `ai-post-edit.ts`, `vision-translate.ts`, `lore-assistant.ts`, `smart-content-router.ts`). Task di codice, non novità esterna.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/bepinex/bepinex/releases) · [v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [MelonLoader — Releases (v0.7.3)](https://github.com/LavaGang/MelonLoader/releases)
- [Language Pack Italia Hub — Q-Gin](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/) · [LPI-Hub (sito ufficiale)](https://www.languagepack.it/notizie/language-pack-italia-hub/)
- [Games Translator](https://www.gamestranslator.it/index.php)
- [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [Yakuza Zero in italiano — Everyeye](https://www.everyeye.it/notizie/yakuza-zero-italiano-patch-fan-made-disponibile-gratis-come-scaricarla-770850.html)
- [RomHack Plaza — archivio Italiano](https://romhackplaza.org/language/italian/) · [Translations](https://romhackplaza.org/translations/)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Europa Universalis 5 — localizzazione ITA (NerdPool)](https://nerdpool.it/la-scommessa-della-localizzazione-italiana-europa-universalis-5-riaccende-la-discussione/)
- [AI Model Releases — maggio 2026 (llm-stats)](https://llm-stats.com/llm-updates) · [LLM Translation Benchmark 2026 (intlpull)](https://intlpull.com/blog/llm-translation-quality-benchmark-2026)
