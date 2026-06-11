# 📰 Digest Traduzioni Videogiochi — 21 Maggio 2026

> Digest generato automaticamente. Copre: novità su tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 20 Maggio**: poche novità sui tool (tutti i 4 hard-coded di `unity_patcher.rs` restano upstream-aligned), una sola patch ITA realmente nuova (Blue Prince Director's Cut, 11 mag), e una **azione concreta nuova** scoperta lato codice: identificatore modello Anthropic ancora a `claude-3-5-sonnet-20241022`.

---

## 🔥 Azione consigliata per GameStringer

### 🆕 Bump modello Anthropic (concretizzato dal digest di ieri)

Il digest del 20 maggio segnalava di "verificare se l'app punta a 4.5/4.6 o ancora 3.5". **Verificato oggi**: il file `lib/ai/ai-translate-direct.ts` riga **404** ha l'identificatore hard-coded a:

```ts
model: 'claude-3-5-sonnet-20241022',
```

Su Anthropic API i modelli correnti (maggio 2026) sono:

| Modello | Release | Identifier |
|---|---|---|
| Claude Opus 4.6 | 5 feb 2026 | `claude-opus-4-6` |
| **Claude Sonnet 4.6** | 17 feb 2026 | `claude-sonnet-4-6` |
| Claude Haiku 4.5 | ott 2025 | `claude-haiku-4-5-20251001` |

**Proposta**: aggiornare `lib/ai/ai-translate-direct.ts:404` da `claude-3-5-sonnet-20241022` a `claude-sonnet-4-6` (best value, miglior instruction following, ottimo su traduzioni creative/narrative — caso d'uso primario di GameStringer). Se possibile, parametrizzare via env / settings invece di hard-codare, così bump futuri non richiedono ricompilare. Da considerare anche un fallback a `claude-haiku-4-5-20251001` per batch grandi.

> Nota: l'header `anthropic-version: 2023-06-01` (riga 399) resta valido per il modello 4.6 — non serve toccarlo.

### ✅ Drift versioni tool — nessun drift

Riconfermo lo stato di ieri: tutte le versioni hard-coded in `src-tauri/src/commands/unity_patcher.rs` sono allineate a upstream.

| Componente | In progetto | Upstream latest | Stato |
|---|---|---|---|
| XUnity.AutoTranslator (BepInEx) | `v5.6.1` (righe 35, 38) | `v5.6.1` (19/04/2026) | ✅ |
| XUnity.AutoTranslator (IPA) | `v5.6.1` (riga 21) | `v5.6.1` | ✅ |
| BepInEx 5 | `v5.4.23.4` (righe 10–11) | `v5.4.23.4` | ✅ |
| BepInEx 5 Legacy | `v5.4.11` (righe 14–15) | `v5.4.11` | ✅ |
| BepInEx 6 Mono | `v6.0.0-pre.2` (righe 25, 27) | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 IL2CPP | `v6.0.0-pre.2` (righe 30–31) | `v6.0.0-pre.2` | ✅ |
| IPA (Illusion) | `3.4.1` (riga 18) | `3.4.1` | ✅ |
| UnrealLocres | `v1.1.1` | `v1.1.1` (nessuna release 2026) | ✅ |

Nessuna nuova release dal 20 maggio per nessuno di questi tool. Bleeding edge BepInEx fermo a `be.755` del 7 marzo (continua a non essere consigliata).

### 🆕 MelonLoader v0.7.3 — nuova release upstream (14 mag 2026)

[MelonLoader](https://github.com/LavaGang/MelonLoader/releases) è passato a **v0.7.3** (rispetto al v0.7.0 menzionato nel digest precedente). GameStringer **non integra** MelonLoader, quindi non c'è alcun drift da correggere; segnalato solo come informazione per la roadmap. Se in futuro si vorrà aggiungere supporto MelonLoader come alternativa BepInEx per Unity IL2CPP (utile su alcuni giochi dove BepInEx 6 IL2CPP non aggancia), partire dalla v0.7.3 + Il2CppInterop `1.5.1-ci.845` (aggiornato 15 mag 2026).

---

## 📡 Proposte fonti RSS

Nessuna nuova proposta oggi. Le 5 fonti aggiunte il 20 maggio (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) restano `enabled: false` in `lib/news-feeds.ts` (righe 115–119) — il test manuale dall'app **Gestisci feed** è ancora pendente.

Le candidate aggiuntive del digest di ieri (`q_gin`, `rulesless`) restano da valutare; non sono state ancora aggiunte al file.

> ⚠️ **OldGamesItalia in "hibernation"**: come notato oggi, il sito sta pubblicando con minore regolarità (forum ancora attivo, ma sezione frontale lenta). Il feed `oldgamesitalia` potrebbe restituire pochi item — non sorprenderti se in app risulta povero.

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 15–21 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **11 mag 2026** | **Blue Prince — Director's Cut** | **Nuova patch ITA pubblicata** (frames + final puzzle) | GamesTranslator.it |
| 15 mag 2026 | Cyberpunk 2077 — Phantom Liberty Director's Cut | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 12 mag 2026 | (vari) — aggiornamenti minori catalogo | Patch in revisione | GamesTranslator.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA community (vista 20 mag) | RomHack Plaza |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata | GamesTranslator.it |
| Maggio 2026 | Wild West Supermarket Simulator | Community (Coccoloco + Godran65) | Steam Community |
| 2 mag 2026 (rifer.) | DLC "Loose Cannon" | Patch riallineata (+2.400 frasi) | GamesTranslator.it |
| In corso | FOUNDRY 2.2 | Patch ITA inclusa via portale community | Steam |

> ⚠️ La **vera novità rispetto a ieri** è solo **Blue Prince — Director's Cut** (11 mag, scoperta cercando "gamestranslator.it nuova patch maggio 2026" — non era stata indicizzata nel digest del 20 mag). Tutto il resto è ripreso dal digest precedente perché GamesTranslator.it non ha pubblicato altre patch nuove tra 20 e 21 maggio.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live ora: Sabotage Studio ha integrato ieri (20/05/2026) la localizzazione ITA ufficiale per il gioco principale + DLC *Throes of the Watchmaker*. Niente di nuovo oggi su questo fronte.
- *Nessun altro annuncio ufficiale ITA tracciabile nelle ultime 24h*. Il calendario `everyeye.it` su "doppiaggio italiano 2026" non riporta altre novità di rilievo immediato.

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ Aggiornato |
| BepInEx 5 | `v5.4.23.4` | stabile | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | `be.755` (07/03/2026) | non consigliata | n/a | ➖ |
| UnrealLocres | `v1.1.1` | nessuna release 2026 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | 🆕 v0.7.3 disponibile |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ Aggiornato upstream |
| DeepL Voice API | `v1/voice/realtime` GA | 15/04/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Verifica manuale |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (`long_context` chain) | ✅ |
| Claude (Anthropic) | `claude-sonnet-4-6` (17/02/2026) / `claude-opus-4-6` (05/02/2026) | 2026 | `claude-3-5-sonnet-20241022` hard-coded | 🔴 **Drift modello — vedi 🔥 Azione consigliata** |

---

## 📝 Cose NON verificate (da controllare manualmente)

- Funzionamento effettivo dei 5 feed RSS aggiunti il 20 maggio (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) — pendente test in app.
- Se la pipeline DeepL usa già l'endpoint `v1/voice/realtime` o ancora i legacy (vedere `lib/deepl-*.ts` o equivalente).
- Patch ITA su forum **OldGamesItalia** (sito in "hibernation": pochi annunci pubblici) e **Romhacking.it**: meglio scoprire in app via i feed se funzionanti.
- Effetto del bump modello Anthropic su prompt esistenti: Sonnet 4.6 ha instruction-following migliore di 3.5 → controllare che i prompt JSON-only (vedi riga 419 `jsonMatch = responseText.match(/\[[\s\S]*\]/)`) restino parsabili. Sonnet 4.6 di solito è *più* obbediente, non meno.

---

## Fonti

- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [XUnity.AutoTranslator — Release v5.6.1](https://github.com/bbepis/XUnity.AutoTranslator/releases/tag/v5.6.1)
- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [BepInEx — Releases](https://github.com/bepinex/bepinex/releases)
- [BepInEx Bleeding Edge builds](https://builds.bepinex.dev/projects/bepinex_be)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [MelonLoader — Releases](https://github.com/LavaGang/MelonLoader/releases)
- [Anthropic — Claude Sonnet 4.6](https://www.anthropic.com/news/claude-sonnet-4-6)
- [Anthropic — Models overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [Anthropic — Release Notes (May 2026)](https://releasebot.io/updates/anthropic)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [PCGamingWiki — Italian fan translations](https://www.pcgamingwiki.com/wiki/List_of_Italian_fan_translations)
- [Ctrl+Trad (itch.io)](https://ctrltrad.itch.io/)
- [Le traduzioni di Rulesless](https://letraduzionidirulesless.wordpress.com/)
- [Q-Gin — Sea of Stars patch ITA](https://www.q-gin.info/traduzione-italiana-sea-of-stars-nuovo-aggiornamento-gratuito/)
- [Steam — Blue Prince Italian translation discussion](https://steamcommunity.com/app/1569580/discussions/0/830458962613714632/)
- [OldGamesItalia — Traduzioni](https://www.oldgamesitalia.net/traduzioni)
- [Everyeye — Giochi 2026 con doppiaggio italiano](https://www.everyeye.it/notizie/giochi-uscita-2026-doppiaggio-italiano-875513.html)
