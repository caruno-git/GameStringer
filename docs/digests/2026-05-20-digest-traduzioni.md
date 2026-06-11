# 📰 Digest Traduzioni Videogiochi — 20 Maggio 2026

> Digest generato automaticamente. Copre: novità su tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Nota**: questo file sostituisce una versione precedente dello stesso giorno che era stata generata prima dell'applicazione delle azioni suggerite. Lo stato del codice ora è allineato; il digest riflette la situazione reale al momento della rigenerazione.

---

## 🔥 Azione consigliata per GameStringer

### ✅ Nessun drift di versione — tutto allineato

Verifica del codice in `src-tauri/src/commands/unity_patcher.rs` confrontata con upstream:

| Componente | In progetto | Upstream latest | Stato |
|---|---|---|---|
| XUnity.AutoTranslator (BepInEx) | `v5.6.1` (righe 35, 38) | `v5.6.1` (19/04/2026) | ✅ Aggiornato |
| XUnity.AutoTranslator (IPA) | `v5.6.1` (riga 21) | `v5.6.1` | ✅ Aggiornato |
| BepInEx 5 | `v5.4.23.4` (righe 10–11) | `v5.4.23.4` | ✅ Aggiornato |
| BepInEx 5 Legacy | `v5.4.11` (righe 14–15) | `v5.4.11` | ✅ Aggiornato (compatibilità Unity vecchie) |
| BepInEx 6 Mono | `v6.0.0-pre.2` (righe 25, 27) | `v6.0.0-pre.2` (latest stable pre-release) | ✅ Aggiornato |
| BepInEx 6 IL2CPP | `v6.0.0-pre.2` (righe 30–31) | `v6.0.0-pre.2` | ✅ Aggiornato |
| IPA (Illusion) | `3.4.1` (riga 18) | `3.4.1` | ✅ Aggiornato |
| UnrealLocres | non hard-coded / `1.1.1` | `1.1.1` (nessuna release nel 2026) | ✅ |

> 💡 **Nota su BepInEx 6 bleeding edge**: esiste una build `6.0.0-be.755` (2026-03-07) ma il maintainer raccomanda di restare su `6.0.0-pre.2` perché le build successive introducono breaking API changes in vista della prima v6 stabile. Restare su pre.2 è corretto.

### 🆕 Possibile feature da valutare: DeepL Voice API v2

DeepL ha rilasciato in **General Availability il 15 aprile 2026** la nuova `/v1/voice/realtime` (REST + WebSocket) — l'API supporta trascrizione + traduzione in tempo reale in fino a **5 lingue target** simultanee. In più, **2 febbraio 2026** è stata pubblicata la voice-to-voice (sintesi vocale traduzione live).

In `docs/TRANSLATION_INNOVATIONS_2026.md` GameStringer documenta già l'integrazione di DeepL Voice (Aprile 2026). Verificare manualmente se la pipeline attuale (`lib/voice-pipeline.ts` o equivalente) usa già gli endpoint `v1/voice/realtime` oppure ancora gli endpoint legacy: se è ancora sui legacy, vale la pena migrare per ottenere streaming WebSocket e supporto multi-target language.

### 🆕 Memoria traduzioni DeepL via API

A maggio 2026 DeepL ha esposto i parametri `translation_memory_id` e `translation_memory_threshold` nell'API: significa che si possono ora caricare TM lato server e farsi restituire match consistenti. GameStringer ha già una propria TM locale per Adaptive MT; se l'utente vuole *condividere* TM tra macchine, questo è il gancio nuovo da considerare nella roadmap (non urgente).

---

## 📡 Proposte fonti RSS — già applicate

Le 5 nuove fonti RSS proposte nel digest precedente (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) sono **già state aggiunte** in `lib/news-feeds.ts` (righe 115–119). Tutte sono in stato `enabled: false` con descrizione *"da verificare in app"*.

**Prossimo passo manuale** (Davide):

1. Aprire la pagina **Gestisci feed** in GameStringer.
2. Abilitare una alla volta le 5 nuove fonti.
3. Verificare quale risponde via `fetch_rss_feed` (backend Rust) — quelle che falliscono mostreranno errore nei log o "0 items".
4. Lasciare attive solo quelle che restituiscono almeno 1 item. Disabilitare le altre (o eventualmente eliminarle al prossimo refactor).

Candidate aggiuntive emerse questa settimana:

| ID proposto | Sito | Perché |
|---|---|---|
| `q_gin` | https://www.q-gin.info/ | Copre annunci di localizzazioni ITA in giochi giapponesi (es. articolo Sea of Stars 20/05/2026). RSS WordPress standard probabilmente disponibile. Verificare. |
| `rulesless` | https://letraduzionidirulesless.wordpress.com/ | Traduttore italiano attivo, WordPress nativo → RSS quasi certamente funzionante. |
| `letsplay_ita` / `spaghettiproject` | varie | Spaghetti Project (Undertale ITA) e altri team: di solito non hanno RSS ma annunci via Discord/X — non automatizzabile. |

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 14–20 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 mag 2026 | Cyberpunk 2077 — Phantom Liberty Director's Cut | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 12 mag 2026 | (vari) — aggiornamenti minori catalogo | Patch in revisione | GamesTranslator.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA community rilasciata | RomHack Plaza |
| 8 mag 2026 | Card Artisan | Traduzione 0.95beta in EA (5.200 nuove frasi, 4.000 obsolete rimosse) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (testo + immagini), Steam + Game Pass | GamesTranslator.it |
| Maggio 2026 | Wild West Supermarket Simulator | Traduzione community (Coccoloco + Godran65) | Steam Community |
| 29 apr 2026 (rifer.) | DLC "Loose Cannon" — gioco non specificato in fonte | Patch riallineata: +2.400 frasi, alcune vecchie modificate | GamesTranslator.it |
| In corso | FOUNDRY 2.2 | Patch ITA inclusa via portale community degli sviluppatori | Steam |

> ⚠️ Diverse voci ripetono il digest precedente perché GamesTranslator.it ha aggiornato il catalogo principalmente fino al 15 maggio; non sono comparse altre patch ITA *nuove* tra 15 e 20 maggio.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — *conferma in finestra di uscita oggi 20/05/2026*: Sabotage Studio ha confermato via X che la localizzazione ITA del gioco principale + DLC *Throes of the Watchmaker* va live oggi. La community translation è stata integrata ufficialmente.
- *Pochi altri annunci ufficiali tracciabili questa settimana* — il movimento ITA del momento passa per la community e i porting Game Pass/Steam.

---

## 🛠 Tool e framework (stato al 20/05/2026)

| Tool | Ultima versione upstream | Data | GameStringer usa | Note |
|------|-----------------|------|---------------------|---|
| **XUnity.AutoTranslator** | `v5.6.1` | 19/04/2026 | `v5.6.1` ✅ | Fix font asset bundle in IL2CPP + hotkey unresponsiveness |
| **BepInEx 5** | `v5.4.23.4` | stabile | `v5.4.23.4` ✅ | |
| **BepInEx 6** | `v6.0.0-pre.2` | pre-release | `v6.0.0-pre.2` ✅ | Bleeding edge be.755 esiste ma non raccomandata |
| **UnrealLocres** | `v1.1.1` | nessuna release 2026 | `v1.1.1` ✅ | |
| **MelonLoader** | `v0.7.0` (LavaGang) | 2026 | n/a (non integrato) | Possibile alternativa a BepInEx per Unity IL2CPP. Da valutare in futuro. |
| **DeepL Voice API** | `v1/voice/realtime` GA | 15/04/2026 | DeepL integrato (legacy?) | Vedere se serve migrazione |
| **Gemini 3 Translation** | rilasciato in Google Translate | 2026 | Gemini 3.1 Flash-Lite già integrato | Catena `long_context` già usa Gemini 3.1 |
| **Claude Sonnet** | `4.6` | febbraio 2026 | catena AI integrata (vedi `lib/ai-translate-direct.ts`) | Verificare se l'app punta a 4.5/4.6 o ancora 3.5 |

> 💡 **Possibile bump model identifier**: cercare in `lib/ai-translate-direct.ts` o `lib/llm-providers.ts` se l'ID modello Anthropic è hard-coded a `claude-3-5-sonnet-*` o se è già parametrizzato. Se è hard-coded, considerare bump a `claude-sonnet-4-6` (la documentazione interna conferma `claude-sonnet-4-6` come modello di riferimento corrente di Anthropic).

---

## 📝 Cose NON verificate (da controllare manualmente)

- Funzionamento effettivo dei 5 feed RSS aggiunti oggi (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) — l'app deve essere lanciata e i feed abilitati uno alla volta.
- Se la pipeline DeepL di GameStringer usa già l'endpoint `v1/voice/realtime` (vedere `lib/deepl-*.ts` o equivalente).
- Identificatore modello Claude attualmente in uso nella chain AI (`lib/ai-translate-direct.ts`): può essere già `4.5`/`4.6` o ancora `3.5`. Vale la pena un check.
- Patch ITA su forum **OldGamesItalia** e **Romhacking.it**: feed non parsato direttamente; le notizie più recenti tipicamente sono scoperte solo via app.
- Stato testing delle patch GamesTranslator.it su Game Pass — andrebbero scaricate e provate per essere certi.

---

## Fonti

- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [XUnity.AutoTranslator — Release v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [BepInEx — Release v6.0.0-pre.2](https://github.com/BepInEx/BepInEx/releases/tag/v6.0.0-pre.2)
- [BepInEx — Releases](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [DeepL — Roadmap & Release Notes](https://developers.deepl.com/docs/resources/roadmap-and-release-notes)
- [DeepL — Voice-to-Voice annuncio](https://www.prnewswire.com/news-releases/deepl-unveils-real-time-spoken-translation-breaking-the-next-language-barrier-with-voice-to-voice-302744002.html)
- [Google — Gemini in Google Translate](https://blog.google/products-and-platforms/products/search/gemini-capabilities-translation-upgrades/)
- [Anthropic — Claude Sonnet 4.5](https://www.anthropic.com/news/claude-sonnet-4-5)
- [Q-Gin — Sea of Stars patch ITA](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [PCGamingWiki — Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Final Round — I danni della traduzione fan-made](https://www.finalround.it/monografie/475/i-danni-della-traduzione-fan-made)
- [2duerighe — Traduzioni fanmade](https://www.2duerighe.com/videogiochi/134607-localizzazione-fanmade-quando-lufficiale-non-ce-i-fan-traducono-e-bene.html)
