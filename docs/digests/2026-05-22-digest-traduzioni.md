# 📰 Digest Traduzioni Videogiochi — 22 Maggio 2026

> Digest generato automaticamente. Copre: novità sui tool di traduzione, patch fan-made ITA, localizzazioni ufficiali annunciate, suggerimenti di implementazione per GameStringer.
>
> **Δ vs. 21 Maggio**: due novità sostanziali. (1) Il bump del modello Anthropic suggerito ieri **è stato implementato** — `lib/ai/ai-translate-direct.ts:392` ora punta a `claude-sonnet-4-6` ed è parametrizzabile via `NEXT_PUBLIC_ANTHROPIC_MODEL` ✅. (2) **Nuova drift identificata**: Google ha rilasciato **Gemini 3.5 Flash** al Google I/O (20/05/2026), GameStringer continua a usare `gemini-3.1-flash-lite` e `gemini-2.0-flash` in più punti. Nessuna novità sui tool Unity (XUnity 5.6.1, BepInEx 5.4.23.4 / 6.0.0-pre.2, MelonLoader 0.7.3, UnrealLocres 1.1.1 — tutti upstream-aligned). Sul fronte traduzioni ITA, **Ace Combat 3 v4.0** (romhacking.it) come unica patch realmente nuova rispetto a ieri.

---

## 🔥 Azione consigliata per GameStringer

### 🆕 Nuova drift: Gemini 3.5 Flash (rilasciato 20/05/2026 al Google I/O 2026)

Google ha pubblicato due giorni fa **Gemini 3.5 Flash** (model id API: `gemini-3.5-flash`) come parte della famiglia Gemini 3.5 "frontier intelligence with action". Vantaggi rilevanti per GameStringer: ~4× più veloce su token/s rispetto ai frontier model concorrenti, miglior reasoning agentic, instruction-following più solido. Disponibile via Gemini API in Google AI Studio.

**Drift rilevato nel codice** (grep `gemini-` in `lib/`):

| File | Riga | Identifier corrente | Proposta |
|---|---|---|---|
| `lib/ai/ai-translate-direct.ts` | 136 | `gemini-2.0-flash` (default Gemini) | `gemini-3.5-flash` |
| `lib/ai/ai-translate-direct.ts` | 177 | `gemini-3.1-flash-lite` (long-context chain) | mantenere o spostare a `gemini-3.5-flash` (long-context) |
| `lib/ai/ai-translate-direct.ts` | 1614 | provider key `'gemini-3.1'` | aggiungere nuovo provider `'gemini-3.5'` |
| `lib/ai/ai-post-edit.ts` | 131 | `gemini-2.0-flash` (post-edit pipeline) | `gemini-3.5-flash` |
| `lib/ocr/vision-translate.ts` | 176 | `gemini-2.0-flash` (vision OCR) | `gemini-3.5-flash` |
| `lib/lore-assistant.ts` | 152 | `gemini-2.0-flash` (lore assistant) | `gemini-3.5-flash` |
| `lib/ai/smart-content-router.ts` | 343, 356 | default `gemini-2.0-flash` | `gemini-3.5-flash` |
| `lib/translation/chain-presets.ts` | 55, 64, 73, 82, 91, 100, 109 | provider key `'gemini-3.1'` | aggiungere `'gemini-3.5'` in testa nei preset `long_context`, `creative`, `precision`, `speech` |
| `lib/translation/language-mappings.ts` | 124, 156 | label `'gemini-3.1': 'Gemini 3.1 Flash-Lite (Long Context)'` | aggiungere entry per `gemini-3.5` |

**Proposta pragmatica** (sotto allineata allo stile del bump Anthropic già fatto ieri):

1. Aggiungere una env var `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash` per `lib/ai/ai-translate-direct.ts` linea 136, `lib/ai/ai-post-edit.ts` linea 131, `lib/ocr/vision-translate.ts` linea 176, `lib/lore-assistant.ts` linea 152, `lib/ai/smart-content-router.ts` linea 356 → cinque siti hard-coded, tutti su `gemini-2.0-flash`, tutti omogeneizzabili.
2. Tenere `gemini-3.1-flash-lite` come opzione esplicita "lite long-context low-cost" (utile per batch grandi RPG dove il costo conta più della qualità) e affiancarci `gemini-3.5-flash` come "long-context premium".
3. Aggiornare i preset chain in `lib/translation/chain-presets.ts` per spostare `gemini-3.5` davanti a `gemini-3.1` nei preset `creative` e `precision` (linee 73 e 91), e dietro a `gemini-3.1` in `long_context` (linea 55) perché 3.5 costa di più ma il 3.1 Flash-Lite rimane ottimo su prezzo/contesto.
4. Aggiornare la label in `lib/translation/language-mappings.ts:124` per la nuova entry `gemini-3.5` → `'Google Gemini 3.5 Flash (Frontier)'`.

> ⚠️ Test consigliato prima del merge: verificare che lo schema risposta JSON di Gemini 3.5 sia identico a 2.0/3.1 (regex `jsonMatch = responseText.match(/\[[\s\S]*\]/)` in `ai-translate-direct.ts` — stessa precauzione del bump Claude). Indicativamente 3.5 dovrebbe essere *più* obbediente, ma vale una smoke test su 50 stringhe in CI.

### ✅ Bump Anthropic — **già implementato** (delta vs. ieri)

Il digest del 21 maggio segnalava il drift `claude-3-5-sonnet-20241022` → `claude-sonnet-4-6` come 🔴 azione prioritaria. Verifica odierna:

```ts
// lib/ai/ai-translate-direct.ts:388–392
/* Modello parametrizzabile via NEXT_PUBLIC_ANTHROPIC_MODEL (es. `claude-opus-4-6`,
 *  `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`). */
model: process.env.NEXT_PUBLIC_ANTHROPIC_MODEL ??
  'claude-sonnet-4-6';
```

Risolto e fatto correttamente (env var + default sensato). Non resta nulla da fare lato Claude. Buona la scelta di Sonnet 4.6 (non Opus 4.6) come default: 4.6 Sonnet ha rapporto qualità/costo migliore per traduzioni narrative; Opus 4.6 conviene solo se l'utente lo seleziona esplicitamente. **Idea collegata**: replicare lo stesso pattern env var per Gemini (vedi punto sopra) e OpenAI.

### ✅ Drift versioni tool Unity — nessun drift

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
| MelonLoader | `n/a` (non integrato) | `v0.7.3` (14/05/2026) | ➖ |

Nessuna nuova release dal 21 maggio per nessuno di questi tool. La roadmap MelonLoader (vedi `docs/TODO.md` voce attiva) resta condizionata a ≥3 segnalazioni utente di giochi Unity IL2CPP non patchabili con BepInEx 6.

---

## 📡 Proposte fonti RSS

Nessuna nuova proposta oggi. Le 5 fonti aggiunte il 20 maggio (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) restano `enabled: false` in `lib/news-feeds.ts` (righe 115–119) — il test manuale dall'app *Gestisci feed* è ancora pendente da due giorni.

**Candidate aggiuntive (low priority)**:

- **Language Pack Italia** (`languagepack.it`): community attiva di traduzioni amatoriali con un proprio "Hub" (programma PC che gestisce download/aggiornamento delle patch). Hanno tradotto Pathfinder: Wrath of the Righteous, Throne and Liberty, Warhammer 40k: Rogue Trader. Il sito ha probabilmente un feed RSS WordPress standard (`https://www.languagepack.it/feed/`) — vale la verifica.
- **Q-Gin** (`q-gin.info`): testata italiana indipendente che copre **specificamente** annunci di localizzazioni ITA. È già citata ricorrentemente nelle fonti di questo digest. Feed WordPress standard probabilmente disponibile (`https://www.q-gin.info/feed/`).

Aggiunta proposta a `DEFAULT_FEED_SOURCES` in `lib/news-feeds.ts` (con `enabled: false`):

```ts
{ id: 'languagepack_it', name: 'Language Pack Italia', url: 'https://www.languagepack.it', rssUrl: 'https://www.languagepack.it/feed/', category: 'translations', icon: '🇮🇹', enabled: false, language: 'it', description: 'Community italiana di traduzioni amatoriali con tool Hub dedicato (WordPress RSS — da verificare in app)' },
{ id: 'qgin', name: 'Q-Gin', url: 'https://www.q-gin.info', rssUrl: 'https://www.q-gin.info/feed/', category: 'translations', icon: '🇮🇹', enabled: false, language: 'it', description: 'Testata italiana indipendente focalizzata su localizzazioni ITA fan e ufficiali (WordPress RSS — da verificare in app)' },
```

> ℹ️ `rulesless` (segnalato il 20 maggio, blog WordPress su `letraduzionidirulesless.wordpress.com`) resta candidato. Feed standard WordPress: `https://letraduzionidirulesless.wordpress.com/feed/`.

---

## 🇮🇹 Traduzioni amatoriali ITA pubblicate / aggiornate (settimana 16–22 maggio 2026)

| Data | Gioco | Stato | Fonte |
|------|-------|-------|-------|
| **~maggio 2026** | **Ace Combat 3 (PS1) — Patch ITA v4.0** | **NUOVA**: include traduzione AppendDisc e Mission 00, menu + sottotitoli ITA per filmati esclusivi disco | romhacking.it |
| ~maggio 2026 | Mizzurna Falls (PS1) | Trad. ITA completa da RickTM + Grandpa Theobald (2 anni di lavoro) | romhacking.it |
| 11 mag 2026 | Blue Prince — Director's Cut | Patch ITA pubblicata (frames + final puzzle) | GamesTranslator.it |
| 15 mag 2026 | Cyberpunk 2077 — Phantom Liberty DC | Aggiornata per Steam 1.7.1 e Game Pass 1.1.10.0 | GamesTranslator.it |
| 9 mag 2026 | Racing Lagoon (PS1) | Patch ITA Scorpio2k17 + Nick1995 | RomHack Plaza / romhacking.it |
| 8 mag 2026 | Card Artisan | Trad. 0.95beta in EA | GamesTranslator.it |
| Maggio 2026 | IMPETUM | 99,9% completata | GamesTranslator.it |

> ⚠️ La **vera novità rispetto a ieri** è **Ace Combat 3 (PS1) v4.0** su romhacking.it. Le altre patch sono ripresa dal digest precedente per continuità — il flusso pubblico delle community ITA è stato leggero nelle 24h dal digest del 21 mag.

---

## 🏢 Localizzazioni ufficiali annunciate / aggiunte

- **Sea of Stars** — live dal 20/05/2026: Sabotage Studio ha integrato la localizzazione ITA ufficiale per il gioco principale + DLC gratuito *Throes of the Watchmaker*. Stato confermato anche oggi su multiple fonti italiane (Q-Gin, GamingTalker, GameSource, Multiplayer.it, Everyeye). Nessuna novità di rilievo nelle ultime 24h.
- *Nessun altro annuncio ufficiale ITA tracciabile nelle ultime 24h.*

---

## 🛠 Stato tool (versione attuale upstream vs versione usata nel progetto)

| Tool | Ultima upstream | Data | GameStringer | Stato |
|------|-----------------|------|--------------|-------|
| XUnity.AutoTranslator | `v5.6.1` | 19/04/2026 | `v5.6.1` | ✅ Aggiornato |
| BepInEx 5 | `v5.4.23.4` | stabile | `v5.4.23.4` | ✅ |
| BepInEx 6 (Mono + IL2CPP) | `v6.0.0-pre.2` | pre-release stabile | `v6.0.0-pre.2` | ✅ |
| BepInEx 6 Bleeding Edge | `be.755` (07/03/2026) | non consigliata | n/a | ➖ |
| UnrealLocres | `v1.1.1` | nessuna release 2026 | `v1.1.1` | ✅ |
| MelonLoader | `v0.7.3` | 14/05/2026 | n/a (non integrato) | ➖ |
| Il2CppInterop | `1.5.1-ci.845` | 15/05/2026 | n/a (via BepInEx) | ℹ️ |
| DeepL Voice API | `v1/voice/realtime` GA | 02/02/2026 + voice-to-voice 28/04/2026 | DeepL integrato (endpoint da verificare) | ⚠️ Verifica manuale |
| **Gemini 3.5 Flash** | **`gemini-3.5-flash`** | **20/05/2026 (I/O 2026)** | **`gemini-2.0-flash` / `gemini-3.1-flash-lite` hard-coded** | 🔴 **Drift — vedi 🔥 Azione consigliata** |
| Gemini 3.2 Flash | corrente | 05/05/2026 (silent drop) | n/a | ℹ️ Superato da 3.5 |
| Gemini 3.1 Flash-Lite | corrente | 2026 | già integrato (`long_context` chain) | ✅ (mantenere come opzione low-cost) |
| Claude (Anthropic) | `claude-sonnet-4-6` (17/02/2026), `claude-opus-4-6` (05/02/2026), `claude-opus-4-7` (corrente) | 2026 | `claude-sonnet-4-6` parametrizzato via env | ✅ **Fixed oggi** |
| OpenAI GPT-5.5 | corrente 2026 | — | `openai` provider (modello specifico da verificare in `lib/ai/`) | ⚠️ Verifica manuale |

> 📌 Nota: il digest segnala anche `claude-opus-4-7` come modello Anthropic *successore* di 4.6 (visto nella pagina annuncio Anthropic). Non urgente — Sonnet 4.6 default va benissimo per traduzioni; 4.7 Opus eventualmente come opzione "premium narrativa" tra qualche settimana.

---

## 📝 Cose NON verificate (da controllare manualmente)

- Funzionamento effettivo dei 5 feed RSS aggiunti il 20 maggio (`ctrltrad`, `oldgamesitalia`, `romhacking_it`, `pcgw_italian_translations`, `2duerighe`) — pendente test in app da 2 giorni.
- Se la pipeline DeepL usa già l'endpoint `v1/voice/realtime` (GA dal 02/02/2026) o ancora i legacy.
- Schema JSON di risposta di **Gemini 3.5 Flash** vs `gemini-2.0-flash`: prima di bumpare il default, fare un round-trip di test su 50 stringhe e confrontare il diff (potenziale problema su `responseText.match(/\[[\s\S]*\]/)`).
- Quale identifier OpenAI viene usato attualmente nel codice (`gpt-4o`? `gpt-5`? `gpt-5.5`?) — non è stato indagato in questo digest.
- Stato esatto delle patch ITA aggiunte ieri: Blue Prince DC, Cyberpunk 2077 DC — non verificate live oggi.
- `docs/TRANSLATION_INNOVATIONS_2026.md` riga 25 cita ancora "Gemini 3.1 Flash-Lite" come "il nuovo modello" — aggiornare il doc dopo eventuale bump 3.5.

---

## Fonti

- [Google — Gemini 3.5 Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [DeepMind — Gemini Flash](https://deepmind.google/models/gemini/flash/)
- [Gemini API — Models documentation](https://ai.google.dev/gemini-api/docs/models)
- [Anthropic — Claude Sonnet 4.6](https://www.anthropic.com/news/claude-sonnet-4-6)
- [Anthropic — Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)
- [Anthropic — Claude Opus 4.7](https://www.anthropic.com/news/claude-opus-4-7)
- [XUnity.AutoTranslator — Releases](https://github.com/bbepis/XUnity.AutoTranslator/releases)
- [BepInEx — Releases](https://github.com/bepinex/bepinex/releases)
- [MelonLoader — Release v0.7.3](https://github.com/LavaGang/MelonLoader/releases/tag/v0.7.3)
- [UnrealLocres v1.1.1](https://github.com/akintos/UnrealLocres/releases/tag/1.1.1)
- [DeepL — Voice API press release](https://www.deepl.com/en/press-release/deepl_launches_voice_api_for_real_time_speech_transcription_and_translation)
- [Games Translator — Home](https://www.gamestranslator.it/)
- [Games Translator — Altre Traduzioni](https://www.gamestranslator.it/index.php?%2Fcategory%2F1-altre-traduzioni%2F=)
- [Romhacking.it — Home](https://romhacking.it/)
- [RomHack Plaza — Translations](https://romhackplaza.org/translations/)
- [Q-Gin — Sea of Stars ITA con DLC Throes of the Watchmaker](https://www.q-gin.info/il-nuovo-dlc-di-sea-of-stars-throes-of-the-watchmaker-introduce-la-localizzazione-italiana/)
- [Q-Gin — Language Pack Italia tool Hub](https://www.q-gin.info/language-pack-italia-ha-rilasciato-un-tool-per-facilitare-la-gestione-delle-traduzioni-italiane/)
- [Language Pack Italia](https://www.languagepack.it/)
- [Steam — Blue Prince Italian translation discussion](https://steamcommunity.com/app/1569580/discussions/0/830458962613714632/)
- [Everyeye — Sea of Stars italiano con DLC gratis](https://www.everyeye.it/notizie/sea-of-stars-arriva-italiano-dlc-gratis-throes-of-the-watchmaker-801864.html)
