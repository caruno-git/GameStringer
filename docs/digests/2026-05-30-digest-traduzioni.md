# 🎮 Digest Traduzioni Videogiochi — 30 maggio 2026

> Digest mattutino GameStringer. Primo digest archiviato (`docs/digests/` era vuoto).
> Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.

---

## 🔥 Azione consigliata per GameStringer

**Drift di versione: BepInEx 5 (minore, solo fix).**

Il progetto referenzia **BepInEx 5.4.23.4**, ma upstream è uscita **5.4.23.5** (release di soli fix; 5.4 è l'ultima major di BepInEx 5, da qui in poi solo patch).

File da toccare: `src-tauri/src/commands/unity_patcher.rs`

| Riga | Costante | Attuale | Proposto |
|------|----------|---------|----------|
| 10 | `BEPINEX5_X64_URL` | `.../v5.4.23.4/BepInEx_win_x64_5.4.23.4.zip` | `v5.4.23.5/BepInEx_win_x64_5.4.23.5.zip` |
| 11 | `BEPINEX5_X86_URL` | `.../v5.4.23.4/BepInEx_win_x86_5.4.23.4.zip` | `v5.4.23.5/BepInEx_win_x86_5.4.23.5.zip` |

⚠️ Prima di applicare: **verificare il nome esatto degli asset** sulla pagina release v5.4.23.5 (lo schema di naming BepInEx è cambiato in passato). Il bump è opzionale/basso rischio — è un fix-release, non urgente.

**Nessun altro drift:** XUnity.AutoTranslator è **allineato** (progetto 5.6.1 = upstream 5.6.1, ultima del 19/04/2026). BepInEx 6 resta a `6.0.0-pre.2` (upstream ancora in pre-release, niente stabile). IPA 3.4.1 e BepInEx Legacy 5.4.11 invariati.

---

## 📡 Proposte fonti RSS

In `lib/news-feeds.ts` la categoria `translations` ha già molte fonti italiane "da verificare in app" (Ctrl+Trad, OldGamesItalia, Romhacking.it, PCGW Italian, 2duerighe). Una sola aggiunta concreta nuova:

- **RomHack Plaza — archivio Italiano** (feed di categoria WordPress, più mirato del feed generale già attivo):
  `https://romhackplaza.org/language/italian/feed/`
  RomHack Plaza è già abilitato col feed globale (`romhackplaza`, enabled: true); il feed di categoria `/language/italian/` filtrerebbe solo le patch ITA retro. **Da testare in app** (WordPress espone i feed di categoria di default, ma non garantito).

Per NexusMods e GamesTranslator.it resta il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi. Restano consultabili solo via web.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 11 mag 2026 | **Blue Prince** (2026 Director's Cut) | Traduzione ITA 99,9%, aggiornata per la Director's Cut | NexusMods |
| 20 mag 2026 | Gioco in Early Access (titolo non specificato nei risultati) | Patch aggiornata dopo update del 30/04 | GamesTranslator.it |
| mag 2026 | **Heaven Dust** | Traduzione testata su Steam e Game Pass | GamesTranslator.it |
| (recente) | **Yakuza Zero** | Patch fan made ITA disponibile gratis | Everyeye.it |

> Nota: le date precise di alcune patch non sono confermate dai risultati di ricerca (vedi sezione "da controllare"). GamesTranslator.it è la community più attiva ma non espone RSS leggibile.

---

## 🏢 Localizzazioni ufficiali annunciate

- **Sea of Stars** — Sabotage Studio ha incluso la **localizzazione italiana ufficiale** con l'update gratuito *Throes of the Watchmaker* (20 maggio 2026), su tutte le piattaforme (Steam e console). [Q-Gin]
- **Europa Universalis 5** — riacceso il dibattito sulla localizzazione ITA ufficiale (Paradox); nessuna conferma definitiva. [NerdPool]
- SpazioGames mantiene l'articolo-tracker "Videogiochi in italiano: le uscite del 2026 con lingua italiana".

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | **5.4.23.5** | 5.4.23.4 | ⚠️ Dietro di una patch |
| BepInEx 6 | 6.0.0-pre.2 (pre-release) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (14/05/2026) | non hard-coded | ➖ N/A (XUnity-MelonMod usato, ma loader non scaricato dal progetto) |
| UnrealLocres | locres v3 supportato, nessuna nuova release evidente | n/a | ➖ Nessuna novità |

---

## 📝 Cose non verificate / da controllare manualmente

- **Nome esatto asset BepInEx 5.4.23.5**: confermare su https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.5 prima di aggiornare gli URL.
- **Feed `/language/italian/feed/` di RomHack Plaza**: testare in app che restituisca XML valido.
- **Date patch ITA**: Heaven Dust e Yakuza Zero non hanno data precisa nei risultati; verificare su GamesTranslator.it / Everyeye se rientrano negli ultimi 7 giorni.
- **Provider LLM**: emergono **Claude Opus 4.7**, **GPT-5.5**, **Gemini 3.1 Pro** e **DeepSeek V4** come frontier di maggio 2026; al Google I/O 2026 annunci sull'app Gemini (Gemini Omni video, Spark) ma non sui modelli di traduzione testuale. Il setup GameStringer (Gemini 3.5 Flash default, Claude Sonnet 4.6, DeepL Voice) resta valido. *Da valutare (non urgente):* aggiungere `claude-opus-4-7` come opzione premium e considerare `deepseek-v4` come provider economy per batch RPG grandi. Verificare disponibilità API prima.
- Ricerca DeepL/OpenAI parzialmente generica: da riapprofondire se serve.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [v5.4.23.5](https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.5) · [v5.4.23.4](https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.4)
- [MelonLoader — Releases (v0.7.3)](https://github.com/LavaGang/MelonLoader/releases)
- [UnrealLocres](https://github.com/akintos/UnrealLocres/releases)
- [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [Games Translator](https://www.gamestranslator.it/index.php)
- [Yakuza Zero in italiano — Everyeye](https://www.everyeye.it/notizie/yakuza-zero-italiano-patch-fan-made-disponibile-gratis-come-scaricarla-770850.html)
- [RomHack Plaza — archivio Italiano](https://romhackplaza.org/language/italian/)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Europa Universalis 5 — localizzazione ITA (NerdPool)](https://nerdpool.it/la-scommessa-della-localizzazione-italiana-europa-universalis-5-riaccende-la-discussione/)
- [AI Model Releases — maggio 2026 (llm-stats)](https://llm-stats.com/llm-updates)
- [Google I/O 2026 — Gemini app (TechCrunch)](https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/)
