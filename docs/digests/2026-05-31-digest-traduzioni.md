# 🎮 Digest Traduzioni Videogiochi — 31 maggio 2026

> Digest mattutino GameStringer. Esecuzione automatica — scelte prese autonomamente, nessuna modifica al codice applicata.
> **Giornata tranquilla:** nessuna novità rilevante rispetto al digest di ieri (30/05). Confermati gli stessi stati; nessun nuovo tool, nessuna nuova localizzazione ufficiale. Riepilogo conciso qui sotto.

---

## 🔥 Azione consigliata per GameStringer

**Unica azione pendente (invariata da ieri): drift BepInEx 5 — minore, opzionale.**

Il progetto referenzia ancora **BepInEx 5.4.23.4**, mentre upstream è **5.4.23.5** (release di soli fix; 5.4 è l'ultima major di BepInEx 5). Il bump non è stato ancora applicato al codice.

File: `src-tauri/src/commands/unity_patcher.rs`

| Riga | Costante | Attuale | Proposto |
|------|----------|---------|----------|
| 10 | `BEPINEX5_X64_URL` | `.../v5.4.23.4/BepInEx_win_x64_5.4.23.4.zip` | `v5.4.23.5/BepInEx_win_x64_5.4.23.5.zip` |
| 11 | `BEPINEX5_X86_URL` | `.../v5.4.23.4/BepInEx_win_x86_5.4.23.4.zip` | `v5.4.23.5/BepInEx_win_x86_5.4.23.5.zip` |

⚠️ Prima di applicare: **verificare il nome esatto degli asset** sulla pagina release v5.4.23.5 (lo schema di naming BepInEx è cambiato in passato). Rischio basso, non urgente.

**Nessun altro drift:** XUnity.AutoTranslator allineato (5.6.1 = upstream). BepInEx 6 fermo a `6.0.0-pre.2` (upstream ancora pre-release). MelonLoader v0.7.3 (non hard-coded nel progetto). IPA 3.4.1 e BepInEx Legacy 5.4.11 invariati.

---

## 📡 Proposte fonti RSS

Nessuna nuova proposta rispetto a ieri. Resta valido il suggerimento (da testare in app) del feed di categoria RomHack Plaza Italiano: `https://romhackplaza.org/language/italian/feed/` — più mirato del feed globale `romhackplaza` già attivo (`enabled: true`).

Per **NexusMods** e **GamesTranslator.it** persiste il blocco noto (bot protection / CORS): nessuna alternativa RSS funzionante trovata oggi.

---

## 🇮🇹 Traduzioni amatoriali ITA della settimana

Nessuna patch ITA nuova confermata negli ultimi 7 giorni oltre a quelle già riportate. Stato invariato:

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 24 mag 2026 | **Real Robots Final Attack** (PS1) | Traduzione completata pubblicata su RomHack Plaza — *lingua da confermare (vedi note)* | RomHack Plaza |
| 11 mag 2026 | **Blue Prince** (2026 Director's Cut) | Traduzione ITA 99,9%, aggiornata per la Director's Cut | NexusMods |
| mag 2026 | **Heaven Dust** | Traduzione ITA testata su Steam e Game Pass (fino al 25/05) | GamesTranslator.it |
| (recente) | **Yakuza Zero** | Patch fan made ITA disponibile gratis | Everyeye.it |

---

## 🏢 Localizzazioni ufficiali annunciate

Nessun nuovo annuncio. Restano quelli noti:

- **Sea of Stars** — localizzazione ITA ufficiale inclusa nell'update gratuito *Throes of the Watchmaker* (20 maggio 2026), tutte le piattaforme. [Q-Gin]
- **Europa Universalis 5** — dibattito aperto sulla localizzazione ITA ufficiale (Paradox), nessuna conferma. [NerdPool]

---

## 🛠 Stato tool (upstream vs progetto)

| Tool | Upstream (ultima) | Nel progetto | Stato |
|------|-------------------|--------------|-------|
| XUnity.AutoTranslator | 5.6.1 (19/04/2026) | 5.6.1 | ✅ Allineato |
| BepInEx 5 | **5.4.23.5** | 5.4.23.4 | ⚠️ Dietro di una patch (fix-release) |
| BepInEx 6 | 6.0.0-pre.2 (pre-release) | 6.0.0-pre.2 | ✅ Allineato (no stabile) |
| BepInEx Legacy | 5.4.11 | 5.4.11 | ✅ Invariato |
| IPA | 3.4.1 | 3.4.1 | ✅ Invariato |
| MelonLoader | v0.7.3 (14/05/2026) | non hard-coded | ➖ N/A (loader non scaricato dal progetto) |
| UnrealLocres | nessuna nuova release | n/a | ➖ Nessuna novità |

---

## 📝 Cose non verificate / da controllare manualmente

- **Real Robots Final Attack (PS1)**: i risultati di ricerca non specificano la lingua della patch del 24/05 — verificare su RomHack Plaza se è italiana (potrebbe essere altra lingua). Inserita con riserva.
- **Nome esatto asset BepInEx 5.4.23.5**: confermare su https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23.5 prima di aggiornare gli URL.
- **Feed `/language/italian/feed/` di RomHack Plaza**: testare in app che restituisca XML valido.
- **Provider LLM**: nessuna novità operativa per la traduzione di giochi rispetto a ieri. Landscape stabile (DeepL forte su UI/lingue europee; LLM frontier per testo narrativo). Il setup GameStringer (Gemini 3.5 Flash default, Claude Sonnet 4.6, DeepL Voice) resta valido. Valutazioni non urgenti già annotate nel digest del 30/05 (eventuale `claude-opus-4-7` premium, `deepseek-v4` economy) — nessun nuovo elemento oggi.

---

## Fonti

- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases) · [v5.4.23](https://github.com/BepInEx/BepInEx/releases/tag/v5.4.23)
- [MelonLoader — Releases (v0.7.3)](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [Games Translator](https://www.gamestranslator.it/index.php)
- [Blue Prince — traduzione ITA (NexusMods)](https://www.nexusmods.com/blueprince/mods/18)
- [Yakuza Zero in italiano — Everyeye](https://www.everyeye.it/notizie/yakuza-zero-italiano-patch-fan-made-disponibile-gratis-come-scaricarla-770850.html)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/) · [archivio Italiano](https://romhackplaza.org/language/italian/)
- [Sea of Stars — traduzione italiana ufficiale (Q-Gin)](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Europa Universalis 5 — localizzazione ITA (NerdPool)](https://nerdpool.it/la-scommessa-della-localizzazione-italiana-europa-universalis-5-riaccende-la-discussione/)
- [TechCrunch — Google I/O 2026 Gemini app](https://techcrunch.com/2026/05/19/google-updates-its-gemini-app-to-take-on-chatgpt-and-claude-at-io-2026/)
