# 📰 Digest Traduzioni Videogiochi — 20 Maggio 2026

> Digest generato automaticamente. Copre: novità su tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.

---

## 🔥 Azione consigliata per GameStringer

### 🚨 XUnity.AutoTranslator — aggiornare da 5.5.0 → 5.6.1

**Dove**: `src-tauri/src/commands/unity_patcher.rs` (righe 21, 34, 37) — gli URL di download sono hard-coded a `v5.5.0`. L'ultima release ufficiale è `v5.6.1` del **19 aprile 2026**.

**Cosa porta v5.6.x rispetto a 5.5.0**:

- Supporto `UIElements` (nuovo sistema UI Unity 2019.1+) — molti giochi recenti lo usano e con 5.5.0 le UI non vengono catturate.
- Tag `XUAIGNORETREE` nei `GameObject` per escludere interi rami dalla traduzione — utile per ridurre falsi positivi (ad es. log di debug, console interne, asset di sviluppo).
- Evento `PluginInitializationCompleted` + property `AutoTranslatorState.PluginInitialized` — utile se in futuro vogliamo agganciare un plugin custom GameStringer al ciclo di init di XUnity.
- Fix endpoint Papago (era rotto dal cambio sito Naver).
- Supporto Yandex Translate API v2 (la v1 è deprecata).

**File / costanti da toccare**:

```rust
// src-tauri/src/commands/unity_patcher.rs:21
const XUNITY_IPA_URL: &str = "https://github.com/bbepis/XUnity.AutoTranslator/releases/download/v5.6.1/XUnity.AutoTranslator-IPA-5.6.1.zip";

// src-tauri/src/commands/unity_patcher.rs:34
const XUNITY_URL: &str = "https://github.com/bbepis/XUnity.AutoTranslator/releases/download/v5.6.1/XUnity.AutoTranslator-BepInEx-5.6.1.zip";

// src-tauri/src/commands/unity_patcher.rs:37
const XUNITY_IL2CPP_URL: &str = "https://github.com/bbepis/XUnity.AutoTranslator/releases/download/v5.6.1/XUnity.AutoTranslator-BepInEx-IL2CPP-5.6.1.zip";
```

> ⚠️ Prima del bump: testare su almeno un gioco Unity Mono e uno IL2CPP, perché le release 5.6.x hanno cambiato qualche internals e plugin terzi potrebbero rompersi.

---

### 📡 Fonti RSS "traduzioni" — sostituire le 3 disabilitate

In `lib/news-feeds.ts` la categoria `translations` ha 4 fonti, di cui solo **RomHack Plaza** funziona. Le altre tre (NexusMods, GamesTranslator.it, RomHacking.net) sono disabilitate perché RSS bloccato o non disponibile. Proposte di sostituzione/aggiunta:

| ID proposto | Sito | Perché aggiungerla |
|---|---|---|
| `oldgamesitalia` | https://www.oldgamesitalia.net/forum/ | Storica community ITA di traduzioni, ancora attiva nel 2026. Verificare se Invision Forum espone feed `/rss/topics/`. |
| `ctrltrad` | https://ctrltrad.itch.io/ | Creator italiano molto attivo (Steam/GOG, sia indie che AA). Itch.io espone devlog RSS. |
| `pcgamingwiki_ita` | https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations | Lista curata e aggiornata; usare il MediaWiki API (`api.php?action=feedrecentchanges`) puntato a quella categoria. |
| `2duerighe_videogiochi` | https://www.2duerighe.com/videogiochi/ | Copre il dibattito fan vs ufficiale e segnala uscite ITA. RSS WordPress standard. |
| `finalround` | https://www.finalround.it/ | Editoriali approfonditi su localizzazione. |

> **Nota implementazione**: tutti questi sono `language: 'it'`, `category: 'translations'`. Tre dei feed attuali falliscono per CORS/bot-protection: usare il backend Tauri `fetch_rss_feed` già presente (`lib/news-feeds.ts:200`) — bypassa quei problemi.

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate/aggiornate (Maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 15 mag 2026 | Cyberpunk 2077 — Phantom Liberty Director's Cut | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 12 mag 2026 | (vari) — aggiornamenti minori | Patch in revisione | GamesTranslator.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA community rilasciata | RomHack Plaza |
| 8 mag 2026 | Card Artisan | 99,5% completata (Steam EA + Game Pass) | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata (testo + immagini), Steam + Game Pass | GamesTranslator.it |
| Maggio 2026 | Wild West Supermarket Simulator | Traduzione community (Coccoloco + Godran65) | Steam Community |
| In corso | FOUNDRY 2.2 | Patch ITA inclusa via portale community degli sviluppatori | Steam |

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — annuncio del **1 maggio 2026**: italiano disponibile via DLC gratuito *Throes of the Watchmaker* (Steam + console). Sabotage Studio ha integrato la community translation.
- *Pochi altri annunci ufficiali tracciabili questo mese* — il grosso del movimento ITA passa per la community.

---

## 🛠 Tool e framework (stato al 20/05/2026)

| Tool | Ultima versione | Data | GameStringer usa |
|------|-----------------|------|---------------------|
| XUnity.AutoTranslator | **5.6.1** | 19/04/2026 | ❌ 5.5.0 (da aggiornare) |
| BepInEx 5 / 6 | 5.4.x / 6.0.0-pre.x | stabile | ✅ |
| UnrealLocres | stable (`akintos/UnrealLocres`) | nessuna release 2026 | ✅ |
| Unreal Engine | 5.7 docs / 5.8 release window annunciato Mar 2026 | — | n/a |

---

## 📝 Cose che NON ho potuto verificare

- Stato attuale dei forum **OldGamesItalia** e **Romhacking.it** (RSS non parsato direttamente).
- Se le patch di GamesTranslator.it segnalate sopra hanno problemi noti su Game Pass — andrebbero scaricate e provate per essere certi.

---

## Fonti

- [Games Translator](https://www.gamestranslator.it/)
- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [PCGamingWiki — List of Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [Everyeye — Yakuza Zero patch ITA fan-made](https://www.everyeye.it/notizie/yakuza-zero-italiano-patch-fan-made-disponibile-gratis-come-scaricarla-770850.html)
- [Sea of Stars — Throes of the Watchmaker DLC ITA](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [2duerighe — Traduzioni fanmade](https://www.2duerighe.com/videogiochi/134607-localizzazione-fanmade-quando-lufficiale-non-ce-i-fan-traducono-e-bene.html)
- [Final Round — I danni della traduzione fan-made](https://www.finalround.it/monografie/475/i-danni-della-traduzione-fan-made)
- [UnrealLocres su GitHub](https://github.com/akintos/UnrealLocres)
