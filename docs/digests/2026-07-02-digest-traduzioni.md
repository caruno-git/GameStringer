# Digest Traduzioni Videogiochi — 2 luglio 2026

> **Giornata tranquilla: nessuna novità rilevante rispetto al digest del 01/07.** Nessun drift di versione in `unity_patcher.rs` (XUnity 5.6.1, BepInEx 5.4.23.5 / 6.0.0-pre.2 / legacy 5.4.11, IPA 3.4.1, TMP Fonts v5.5.0 — tutto allineato). **Nessuna azione richiesta sul codice.** Nessuna nuova release stabile dei tool: XUnity fermo a **5.6.1** (19/04), BepInEx 6 sempre a **pre.2** (bleeding edge #785 al 28/06, ancora nessuna v6 stabile su GitHub). Fronte ITA invariato: nessuna nuova patch entro la finestra 7 giorni oltre a quelle già segnalate (Trails in the Sky 1st Chapter, aggiornamento DE/IT build 1.1.37972 del 27/06). Nessun annuncio nuovo di localizzazione ufficiale. LLM: nulla di nuovo rilevante per la traduzione batch. Progetto: GameStringer v1.9.1.

## 🔥 Azione consigliata per GameStringer

**Nessuna azione sul codice.**

Tutte le URL hard-coded in `src-tauri/src/commands/unity_patcher.rs` sono allineate all'ultima release upstream:
- XUnity `v5.6.1` — righe 21 / 35 / 38
- BepInEx 5.x `v5.4.23.5` — righe 10-11
- BepInEx legacy `v5.4.11` — righe 14-15
- BepInEx 6.x `v6.0.0-pre.2` — righe 25-31
- IPA `3.4.1` — riga 18
- TMP Fonts `v5.5.0` — riga 44 (riferimento volutamente fisso)

Nessuna riga da toccare.

## 📡 Proposte fonti RSS

Nessuna nuova candidata funzionante confermata oggi. Restano da testare in-app (Gestisci feed) per CORS/formato, tutte `enabled: false` in `lib/news-feeds.ts`:

- **Language Pack Italia** (`https://www.languagepack.it/category/traduzioni/trad-giochi/feed/`, fallback `.../feed/`) — riga 122, fonte confermata attiva, non ancora testata.
- Candidate del 20/05 (righe 116-120): Ctrl+Trad itch.io devlog, OldGamesItalia Invision, Romhacking.it WordPress, PCGW Italian fan translations, 2duerighe WordPress.

`romhackplaza` (riga 114) resta l'unica fonte `translations` attiva e raggiungibile. NexusMods (riga 111) continua a bloccare l'RSS via bot protection.

## 🇮🇹 Traduzioni amatoriali ITA della settimana

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| 27/06 | Progetto DE/IT indipendente (switch lingua in-game) | Patch aggiornata alle build **Steam/GOG 1.1.37972** | GamesTranslator.it |
| ~giu 2026 | **Trails in the Sky 1st Chapter** | Traduzione v1.06 completa (Steam) | GamesTranslator.it |

Nessuna nuova voce rispetto a ieri. Entrambe già presenti nel digest 01/07; incluse solo perché la voce 1.1.37972 (27/06) resta tecnicamente dentro la finestra 7 giorni. Nessun titolo Unity/Unreal patchabile dal nostro flusso. RomHack Plaza mostra solo traduzioni ITA retro (NES/N64) senza date recenti nella finestra.

## 🏢 Localizzazioni ufficiali annunciate

Nessun annuncio nuovo. Situazione invariata rispetto a ieri:

- **Control: Resonant** — doppiaggio ITA confermato (Remedy, 2026, data non annunciata).
- **Rayman Legends Retold** — doppiaggio ITA completo (Ubisoft, 1° ottobre 2026).
- **Tomb Raider: Legacy of Atlantis** — confermato polacco, ancora nessun italiano (segnale di mercato, non azionabile).

## 🛠 Stato tool

| Tool | Upstream (ultima release) | Nel progetto | Stato |
|------|---------------------------|--------------|-------|
| XUnity.AutoTranslator | **v5.6.1** (19 apr 2026) | v5.6.1 | ✅ Allineato |
| BepInEx 5.x | v5.4.23.5 | v5.4.23.5 | ✅ Allineato |
| BepInEx 6.x | **v6.0.0-pre.2** (BE #785 al 28/06, nessuna v6 stabile) | v6.0.0-pre.2 | ✅ Allineato |
| BepInEx Legacy | v5.4.11 | v5.4.11 | ✅ OK |
| IPA (Unity 4.x) | 3.4.1 | 3.4.1 | ✅ OK |
| MelonLoader | v0.7.x | Non integrato (voce TODO) | ✅ Riferimento allineato |
| UnrealLocres | v1.1.1 (nessuna nuova release 2026) | — | ✅ Invariato |
| UnityEx | nessuna nuova release rilevante 2026 | — | ✅ Invariato |
| TMP Font AssetBundles | v5.5.0 (2025-12-08) | v5.5.0 | ✅ OK (fisso) |

Nota BepInEx 6: builds successive a `6.0.0-be.697` introdurranno breaking API changes in preparazione alla prima v6 stabile. **Restare su `v6.0.0-pre.2`** salvo necessità di fix IL2CPP specifici.

## 📝 Cose non verificate / da controllare manualmente

- **Feed RSS Language Pack Italia + 5 candidate del 20/05:** URL non testati in-app per CORS/formato.
- **MelonLoader versione esatta:** discrepanza minore (0.7.2 vs 0.7.3 nei risultati); non critica, tool non integrato.
- **The Precinct patch ITA (Vox Italica):** segnalata a giugno senza data di rilascio esposta — non confermabile nella finestra 7 giorni.

## Fonti

- [XUnity.AutoTranslator — Releases (GitHub)](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [XUnity.AutoTranslator v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [BepInEx — Releases (GitHub)](https://github.com/BepInEx/BepInEx/releases)
- [BepInEx 6.0.0-pre.2 (Discussion #969)](https://github.com/BepInEx/BepInEx/discussions/969)
- [BepInEx Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [GamesTranslator.it](https://www.gamestranslator.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Everyeye — Giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
- [Q-Gin — Control Resonant doppiaggio ITA](https://www.q-gin.info/control-resonant-avra-il-doppiaggio-italiano/)
- [UAGNA — Tomb Raider: Legacy of Atlantis (no ITA)](https://www.uagna.it/videogiochi/tomb-raider-legacy-of-atlantis-sara-doppiato-anche-in-polacco-ma-ancora-niente-italiano-214841)
- [LLM Stats — AI Updates July 2026](https://llm-stats.com/llm-updates)
