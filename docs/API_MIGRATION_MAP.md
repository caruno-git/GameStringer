# Mappa di migrazione `fetch('/api')` → Tauri `invoke()`

> Contesto: il build desktop usa `output: 'export'` (static export) → **le route `/api/*` non esistono nel desktop**. Ogni `fetch('/api')` non guardato fallisce nell'app desktop (vedi nota in `API_REFERENCE.md`). Questa mappa classifica ogni chiamata e indica come migrarla. Obiettivo: rispettare la regola "0 `fetch('/api/')` attive".
>
> Pattern consigliato (cross-mode): in desktop usa `invoke(...)`, in web/dev fallback a `fetch('/api/...')`. Guard: `isTauri()` da `lib/tauri-api.ts`. Esempio funzionante: `proxyJson()` in `components/cover-picker.tsx`.

## Legenda
- ✅ **invoke pronto** — esiste già un comando Tauri equivalente, swap diretto.
- 🔁 **proxy → fetch_url_content** — route proxy anti-CORS, instradare via il comando Rust `fetch_url_content(url) -> String`.
- ⚠️ **verifica/nuovo comando** — serve confermare il comando Tauri o crearne uno nuovo (lavoro Rust).
- 🗑️ **drop/local** — funzione eliminabile o sostituibile con logica locale.

## Tabella

| Endpoint | File chiamanti | Classe | Azione |
|---|---|---|---|
| `/api/covers/proxy` | `components/cover-picker.tsx` | 🔁 | **FATTO (pilota)** → `fetch_url_content` + fallback web |
| `/api/llm-proxy` | `lib/ai/ai-translate-direct.ts` | 🔁 | proxy LLM anti-CORS → `fetch_url_content` (o chiamata diretta provider) |
| `/api/read-file` | (vari) | ✅ | `read_file_content(file_path)` |
| `/api/games` | `app/editor/page.tsx`, `app/projects/page.tsx` | ✅ | `get_games` / `get_games_fast` |
| `/api/translations` (GET/POST/DELETE) | `app/editor/page.tsx`, `app/projects/page.tsx` | ✅ | `load_translations` / `load_translation_strings` / `save_translation_strings` |
| `/api/translations/export` | `app/editor/page.tsx` | ✅ | `export_translations` / `export_to_*` |
| `/api/translations/suggestions` | `app/editor/page.tsx` | ⚠️ | verificare comando suggerimenti (probabile TM: `load_translation_memory`) |
| `/api/dictionaries/add` | `app/editor/page.tsx` | ✅ | `dictionary` / `dictionary_auto` |
| `/api/export/patch` | `app/translator/pro/page.tsx` | ✅ | `export_patch` |
| `/api/secrets` | `app/translator/pro/page.tsx` | ⚠️ | gestione API key: confermare comando secrets/keyring; se assente, **creare** |
| `/api/translate` | `app/subtitles/page.tsx`, altri | ⚠️ | traduzione: `offline_translate_*` o libreria AI diretta (`lib/ai/*`) |
| `/api/voice/transcribe` | `lib/voice/dubbing-pipeline.ts` (Labs) | ⚠️ | Whisper STT: nessun comando Tauri trovato → **creare** o chiamata diretta provider (feature Labs, bassa priorità) |
| `/api/stores/test-connection`, `/api/auth/disconnect` | `app/stores/page.tsx` | ⚠️ | store/auth: verificare comandi store (Steam/Epic/…) |
| `/api/injekt/stats/<id>` | `components/injekt-realtime-stats.tsx` | ⚠️ | modulo `injekt`: verificare comando stats |
| `/api/unity-ink/*` (detect, extract, preview, translate, inject, restore, steam-scan, ollama-status, translate-progress) | `components/tools/unity-ink-translator.tsx` | ⚠️ | tool Unity Ink: mappare su `unity_asset_injector` / `unity_csv` (per-comando) |
| `/api/monitoring/error` | (logging) | 🗑️ | sostituire con `clientLogger` locale o comando log Rust |

## Ordine consigliato

1. **Pilota (fatto)**: `cover-picker` proxy → `fetch_url_content`. Stabilisce il pattern `proxyJson`/`isTauri`.
2. **Quick win ✅** (swap diretto, comando già esistente): `read-file`, `games`, `export/patch`, `dictionaries/add`, `translations` (load/save/export). Un file alla volta, con verifica tsc/eslint.
3. **Proxy 🔁**: `llm-proxy` → `fetch_url_content`.
4. **⚠️ con lavoro Rust**: `secrets`, `voice/transcribe`, `unity-ink/*`, `stores/auth`, `injekt/stats` — richiedono conferma/creazione comandi; da fare con test mirati.
5. **🗑️**: `monitoring/error`.

> Nota: i file `app/editor` e `app/projects` sono i più pesanti (CRUD games/translations); verificare che i comandi `load_translations`/`save_translation_strings` espongano lo stesso shape dei dati delle route `/api/translations` prima dello swap.
