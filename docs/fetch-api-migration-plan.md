# Migrazione `fetch('/api/…')` → Tauri invoke / librerie dirette

> Obiettivo regola progetto: **0 `fetch('/api/')` attive** (nel pacchetto Tauri non
> esiste un server Next: `output: export`, quindi ogni `/api/*` fallisce).
> NON è un rename uniforme: ogni route ha logica propria. Procedere a **lotti**,
> con `npm run tauri:dev` tra un lotto e l'altro.

Legenda target: **[EXISTS]** comando Rust già presente · **[NEW]** serve nuovo comando ·
**[LIB]** libreria/route Rust esistente da adattare.

## Lotto 1 — GET verso URL esterni → `fetch_url_content` (basso rischio) ✅ già disponibile
Comando Rust: `commands::rss_proxy::fetch_url_content(url) -> String` **[EXISTS]**

| Call-site | Route | Note |
|---|---|---|
| (vari già migrati) | `/api/rss-proxy` | GET→testo, mappa 1:1 |
| `lib/.../howlongtobeat` | `/api/utilities/howlongtobeat` | scraping HTML → testo |

⚠️ `covers/proxy` restituisce **byte immagine**, non testo → NON usare fetch_url_content:
serve un comando `fetch_url_bytes(url) -> base64` **[NEW]**.

## Lotto 2 — Chiavi/segreti → `secure-key-store` ✅ FATTO (parziale)
- `app/translator/pro/page.tsx` → **già convertito** a `setSecureKey` (invoke `set_secure_key`).
- Gli altri `fetch('/api/secrets')` sono **dentro** `lib/secure-key-store.ts` come *fallback
  non-Tauri*: vanno lasciati (in Tauri usano già invoke).

## Lotto 3 — Store test connection → comandi `test_*_connection` **[EXISTS]**
| Call-site | Route | Comando |
|---|---|---|
| `app/stores/page.tsx` | `/api/stores/test-connection` | `test_steam_connection` / `test_epic_connection` / `test_gog_connection` / `test_store_connection_for_profile` (scegliere per store) |

## Lotto 4 — Proxy LLM cloud (POST) → **[NEW]**
`lib/ai/ai-translate-direct.ts` → `/api/llm-proxy` (POST a OpenAI/DeepSeek/… per aggirare CORS).
`fetch_url_content` è solo GET → serve un comando generico
`http_post_json(url, headers, body) -> String` **[NEW]** (stessa idea del proxy Ollama).
Coinvolge anche `/api/translate`, `/api/translate/stream` (streaming → evento Tauri o non-stream).

## Lotto 5 — CRUD traduzioni/giochi (DB) → **[EXISTS]/[NEW]**
| Call-site | Route | Target |
|---|---|---|
| `app/editor/page.tsx`, `app/projects/page.tsx` | `/api/games` | `get_games` **[EXISTS]** (attenzione ai parametri) |
| idem | `/api/translations` (list/CRUD) | comandi DB **[NEW]** (vedi `translation_api.rs`, `db-queries.ts`) |
| `hooks/use-batch-operations.ts` | `/api/translations/{translate,export,update-status}` | export → `export_translations` **[EXISTS]**; translate/update-status **[NEW]** |
| `app/editor/page.tsx` | `/api/translations/suggestions`, `/api/dictionaries/add` | **[NEW]** |
| `app/translator/pro/page.tsx` | `/api/export/patch` | `export_translations`/`save_translation_strings` **[LIB]** |

## Lotto 6 — Unity Ink (7 route) → **[NEW]/[LIB]**
`components/tools/unity-ink-translator.tsx` + `app/.../unity-ink` →
`/api/unity-ink/{detect,extract,inject,preview,restore,steam-scan,translate,ollama-status}`.
Verificare `commands/unity_localization.rs`: parte potrebbe già esistere; il resto **[NEW]**.

## Lotto 7 — Voce → **[NEW]**
`lib/voice/dubbing-pipeline.ts` → `/api/voice/{transcribe,tts}`. STT ora passa da Ollama
(`speech-to-text.ts`); allineare TTS/transcribe a comandi Rust o librerie dirette.

## Altri
- `components/tools/wad-extractor.tsx`: `/api/read-file` → comando fs Rust; `/api/translate` → vedi Lotto 4.
- `components/injekt-realtime-stats.tsx`: `/api/injekt/stats/:id` → comando Rust o evento Tauri **[NEW]**.
- `lib/error-handler.ts`: la `fetch('/api/monitoring/error')` è **già commentata** → nessuna azione.

---
### Ordine consigliato
1. **Lotto 1 + 3** (basso rischio, comandi esistenti) → build+test.
2. **Lotto 4** (`http_post_json` generico) → sblocca llm-proxy/translate.
3. **Lotto 5/6/7** (richiedono più comandi Rust) → uno alla volta, con test.

Dimmi da quale lotto partire e lo implemento (leggendo ogni coppia call-site↔comando per
allineare firme e shape), così lo compili subito dopo.
