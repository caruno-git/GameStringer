# Digest Traduzioni Videogiochi — 4 luglio 2026

> Primo digest in `docs/digests/` (nessun digest precedente trovato — baseline creata oggi).

## 🔥 Azione consigliata per GameStringer

Nessun drift di versione critico. Stato verificato in `src-tauri/src/commands/unity_patcher.rs`:

- **XUnity.AutoTranslator v5.6.1** (righe 21, 35, 38) = ultima release upstream (19/04/2026). ✅ Allineato.
- **BepInEx 5.4.23.5** (righe 10-11) = ultima stable 5.x. ✅ Allineato.
- **BepInEx 6.0.0-pre.2** (righe 25-31) = ultima pre-release taggata. Esistono bleeding-edge build (be.784 del 24/06/2026, be.785 del 30/06) ma non c'è ancora una pre.3 taggata: **nessuna azione**, le BE build non sono adatte a URL hard-coded.
- Unica cosa da valutare: **LPI-Hub**, nuovo tool di Language Pack Italia per gestire/installare traduzioni ITA. Potenziale fonte di patch da integrare nella ricerca patch di GameStringer — da esplorare manualmente.

## 📡 Proposte fonti RSS — AGGIORNATO (pomeriggio 04/07)

- **Q-Gin** (`https://www.q-gin.info/feed/`) — **testato ✅ e aggiunto** a `lib/news-feeds.ts` (id `qgin`, enabled). Feed generalista gaming IT con copertura traduzioni; alternativa più mirata (non verificata): feed del tag `traduzione-italiana`.
- **Romhacking.it** — l'URL configurato `/feed/` era **sbagliato** (il sito non è WordPress). Corretto con il feed SMF del forum (board News), verificato funzionante: `https://romhacking.it/forums/index.php?type=rss2;action=.xml;sa=news;boards=1`.
- Le fonti pendenti di maggio/giugno (Ctrl+Trad, OldGamesItalia, PCGW, 2duerighe, Language Pack Italia) sono state **abilitate nei default**: siti tutti verificati vivi il 04/07; i feed veri e propri vanno confermati al prossimo avvio dell'app.
- ⚠️ **Attenzione**: `loadConfig()` fa il merge con `localStorage` mantenendo l'`enabled` salvato dell'utente — sulle installazioni esistenti le fonti già note resteranno spente finché non le attivi dal pannello fonti (o si svuota `gamestringer_news_feeds_config`). Solo `qgin` (nuova) partirà attiva.
- Nessuna alternativa funzionante trovata per NexusMods (bot protection) o RomHacking.net (RSS morto).

## 🔎 LPI-Hub — analisi integrazione (aggiunto 04/07)

- LPI-Hub v1.2.10 (26/06/2026, aggiunta compatibilità Linux). App desktop Windows che rileva i giochi via Steam/GOG/Epic, installa le traduzioni LPI e **blocca gli auto-update Steam** per non rompere le patch.
- **Download e traduzioni dietro registrazione/login** al sito (WordPress Download Manager): niente API pubblica né endpoint scaricabili in modo anonimo → integrazione diretta delle patch in GameStringer **non fattibile** senza accordo con il team LPI.
- Integrazione realistica: feed RSS LPI come fonte news (fatto) + eventuale link "Cerca su LanguagePack.it" nella scheda gioco. Se interessa di più, contattarli via Discord (canale ufficiale LPI).
- Spunto feature da LPI-Hub: blocco auto-update Steam per proteggere le traduzioni installate — valutare se ha senso in GameStringer.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 27/06/2026 | Traduzione indipendente aggiornata per update Steam/GOG (v1.1.37972, switch DE/ITA con tasto Q) — titolo non identificato dalla ricerca | Aggiornata | GamesTranslator.it |
| 17/06/2026 | Balatro — v1.07, uscita dalla beta | Completa | GamesTranslator.it |
| 06/06/2026 | Trails in the Sky 1st Chapter (Steam) — v1.06, 100% con revisione (Tarabas & Vessor) | Completa | GamesTranslator.it |
| — | Language Pack Italia rilascia **LPI-Hub**, tool per gestione/installazione traduzioni ITA | Tool nuovo | Q-Gin |

Le ultime due voci sono fuori dalla finestra di 7 giorni ma incluse perché è il primo digest.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio rilevante di localizzazione italiana ufficiale trovato nelle ricerche di oggi (ultimi 7 giorni).

## 🛠 Stato tool

| Tool | Upstream | Nel progetto | Stato |
|------|----------|--------------|-------|
| XUnity.AutoTranslator | v5.6.1 (19/04/2026) | v5.6.1 | ✅ |
| BepInEx 5.x | v5.4.23.5 | v5.4.23.5 | ✅ |
| BepInEx 6.x | v6.0.0-pre.2 (BE build be.785 30/06) | v6.0.0-pre.2 | ✅ (pre.3 non ancora taggata) |
| BepInEx Legacy | v5.4.11 (pin intenzionale Unity 5.6) | v5.4.11 | ✅ pin |
| MelonLoader | v0.7.3 (14/05/2026) | Non hard-coded nel progetto | n/a |
| UnrealLocres | Linkato senza pin di versione | — | n/a |

## 📝 Cose non verificate / da controllare manualmente

- Titolo del gioco della traduzione aggiornata il 27/06 su GamesTranslator (la ricerca non l'ha identificato — controllare la sezione download del sito).
- Feed RSS di Q-Gin: esistenza e CORS da verificare in app.
- LPI-Hub: capire se distribuisce patch in formato integrabile in GameStringer.
- RomHack Plaza: nessuna patch ITA nuova identificabile negli ultimi 7 giorni (l'indice non espone date via ricerca web — il feed RSS già attivo in app è più affidabile).
- Nessuna novità LLM specifica per game translation questa settimana; solo comparative generiche (DeepL rivendica vittorie 94% in blind test sul suo nuovo modello — claim di parte).

## Fonti

- [XUnity.AutoTranslator releases](https://github.com/bbepis/XUnity.AutoTranslator/releases) · [Release 5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx releases](https://github.com/bepinex/bepinex/releases) · [Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [MelonLoader releases](https://github.com/LavaGang/MelonLoader/releases)
- [GamesTranslator.it](https://www.gamestranslator.it/)
- [Q-Gin — LPI-Hub di Language Pack Italia](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [DeepL — nuovo modello di traduzione](https://home.deepl.com/en/blog/meet-new-deepl-translator)
