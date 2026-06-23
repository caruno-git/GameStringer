# GameStringer - Project Architecture (v1.10.2)

## Vision

Professional desktop software for video game localization that automatically analyzes installed games and suggests the best translation method. It includes live overlay translation, AI dubbing, a community marketplace, and an extensible plugin system.

---

## v1.9.x Updates

- **Tauri static build**: Next.js with `output: export`, frontend served from `../out` (no Node server in production)
- **Parameterizable AI models**: default Gemini 3.5 Flash / Claude Sonnet 4.6, override via `NEXT_PUBLIC_GEMINI_MODEL` / `NEXT_PUBLIC_ANTHROPIC_MODEL`; new `anthropic-premium` provider (Opus 4.8) in the creative chains
- **Updated patcher tools**: XUnity.AutoTranslator 5.6.1, BepInEx 5.4.23.5; 5 new Italian translation RSS feeds
- **Daily digests**: automatic monitoring of version-drift and amateur translations in `docs/digests/`
- **Quality gate**: blocking TypeScript typecheck in CI (0 errors), removed dead dependencies (`sqlx`, `zustand`, `yup`), eliminated orphan files
- **Repo hygiene**: user profile data and study clones (`research/`) kept out of git tracking

---

## v1.10.x Updates

- **Reliable settings persistence**: app settings and AI provider API keys are saved to disk in `data_dir/GameStringer/settings.json` through the Tauri commands `save_app_settings` / `load_app_settings` (`src-tauri/src/commands/utilities.rs`). On the frontend: `lib/settings-persistence.ts`, `components/providers/settings-boot-gate.tsx`, `app/settings/page.tsx`. Previously some settings were not persisted.
- **Manual game addition from disk**: the Library can add a game by selecting the folder from disk, without relying solely on the auto-detection of libraries (Steam/Epic/etc.) — `lib/manual-games.ts`, `app/library/page.tsx`.
- **Auto-updater fix**: resolved the freeze on "Preparing…" (stale update state passed to `downloadAndInstall` + `updating` flag never reset) in `components/notifications/auto-updater.tsx` and `hooks/use-tauri-updater.ts`.

---

## Security: Anti-Cheat Gate (INVARIANT)

**Binding rule:** every path that injects at runtime into a game process (DLL injection, in-memory hooks, `WriteProcessMemory`/`CreateRemoteThread`) **must** go through the single choke-point `anti_cheat::assert_injection_allowed(pid)` **before** touching the process. There are no exceptions and no bypass strategies: if any anti-cheat is detected (EAC/BattlEye/VAC, etc.) the injection is **denied** (hard block). Failed detection is **fail-closed** (blocks).

Reason: injection has the signature of a cheat; in competitive multiplayer this means a ban for the user.

- **Centralized gate**: `src-tauri/src/anti_cheat.rs` → `assert_injection_allowed()`, `AntiCheatManager::evaluate_injection_gate()`, `gate_decision()` (pure logic, unit-tested).
- **Pre-flight UI**: Tauri command `check_injection_gate(pid)` to show the blocked state without attempting injection.
- **Paths already hooked in**: `ue_translator::injector::inject_translator_dll`, `commands::unity_injector::inject_dll`, `commands::injekt::{start_injection, force_inject_process}`, `injekt::InjektTranslator::start`.
- **For every new injector/engine**: add `crate::anti_cheat::assert_injection_allowed(pid)?` as the first instruction, before `OpenProcess`/alloc/write. (See also the rule on `startAutoTranslate()` for frontend orchestration.)

---

## New Modules v1.8.1

### LIVE TRANSLATION OVERLAY
- **Engine**: `lib/live-translation-engine.ts` — Capture→OCR→diff→translate→overlay loop
- **UI**: `app/live-translate/page.tsx` — Control panel
- **Overlay**: `app/ocr-overlay/page.tsx` — Transparent window with translations

### MARKETPLACE HUB
- **Backend**: `lib/community-hub-backend.ts` — Supabase CRUD (packs, reviews, comments, moderation)
- **Installer**: `lib/marketplace-installer.ts` — Download→validate→import 1-click
- **Schema**: `docs/supabase-schema.sql` — 10 PostgreSQL tables + RLS

### TRANSLATION MEMORY NETWORK
- **Network**: `lib/tm-network.ts` — Federated pull/push/lookup via Supabase
- **Integration**: auto-inject in `lib/ai-translate-direct.ts` → `translateWithFallback()`

### AI DUBBING PIPELINE
- **Pipeline**: `lib/dubbing-pipeline.ts` — 7 steps: scan→STT→translate→TTS→patch→lipsync→subtitles
- **UI**: `app/dubbing/page.tsx` — Configuration and monitoring

### PLUGIN SYSTEM
- **Registry**: `lib/plugin-system.ts` — PatcherPlugin interface + template generator
- **Template**: `lib/plugin-template.ts` — Scaffold for new community plugins

### EXTRACTED MODULES (Refactoring)
- `lib/translation/language-mappings.ts` — Language code maps
- `lib/translation/chain-presets.ts` — Provider chains
- `lib/translation/provider-blocking.ts` — Provider blocking/cooldown
- `lib/translation/provider-quality-tracker.ts` — Quality tracking
- `lib/translation/prompt-builder.ts` — AI prompt building
- `components/game-detail/` — 8 extracted sub-components
- `components/translator-pro/` — 4 sub-components + cost calculator

---

## Module Structure

### 1. STORES (Configuration)

**Purpose**: Configure the sources for scanning installed games.

- Steam (library paths, optional API key)
- Epic Games (installation path)
- GOG Galaxy (database)
- Xbox/Microsoft Store
- Custom paths

**Current status**: ✅ Implemented

---

### 2. LIBRARY (Control Center)

**Purpose**: Central hub that shows all games and guides the user toward translation.

#### For each game it must show

1. **Info from the Internet**
   - Cover, description, genre
   - Officially supported languages
   - Links to existing fan translations (if available)

2. **Installed File Analysis**
   - Game engine (Unity, Unreal, Godot, RPG Maker, etc.)
   - Localization files found (JSON, PO, RESX, CSV, etc.)
   - Game folder structure

3. **Translation Recommendation**
   - Best method suggested automatically
   - Estimated reliability
   - Recommended AI for that type of content

#### Translation Options (from the Library)

| Method | Description | When to use it |
|--------|-------------|---------------|
| **On-the-Fly Translation** | BepInEx/XUnity (Unity), Overlay (others) | Games without modifiable files |
| **File Translation** | Direct editing of localization files | Games with accessible files |
| **Patch Creation** | Generates a distributable patch with a dictionary | To share translations |

> **Manual addition (v1.10.2)**: in addition to store auto-detection, a game can be added manually by selecting the folder from disk (`lib/manual-games.ts`, `app/library/page.tsx`).

**Current status**: ⚠️ Partial - missing analysis + recommendations integration

---

### 3. TRANSLATION MEMORY (TM)

**Purpose**: A single database shared by ALL translation methods.

- Saves every translation performed
- Reuses existing translations (API savings)
- Allows manual corrections by the user
- Exportable/importable

**Current status**: ✅ Implemented (but verify full integration)

---

### 4. TRANSLATION METHODS

#### 4.1 On-the-Fly Translation (Live)

- **Unity**: BepInEx + XUnity.AutoTranslator
- **Other engines**: OCR Translator (overlay)
- Uses Translation Memory for caching
- Calls AI for new texts

#### 4.2 File Translation (Batch)

- Neural Translator Pro
- Supports various formats (JSON, PO, RESX, CSV, XML)
- Uses Translation Memory
- Quality Gates for validation

#### 4.3 Patch Creation

- Generates a distributable package
- Includes an editable dictionary
- The user can correct/improve it
- Exportable for other users

**Current status**: ⚠️ Separate methods, not integrated from the Library

---

### 5. AI PROVIDERS

- Gemini (default)
- OpenAI (GPT-4)
- Claude (Anthropic)
- DeepSeek
- DeepL
- Others...

Configurable per profile, with personal API keys.

**Current status**: ✅ Implemented

---

## Ideal User Flow

```text
1. STORES → Configure game sources
           ↓
2. LIBRARY → Sees all installed games
           ↓
3. Select game → Sees full analysis:
   - Game info
   - Detected engine
   - Localization files found
   - RECOMMENDATION: "Use File Translation (JSON found)"
           ↓
4. Click "Translate" → Opens the recommended method
           ↓
5. Translation uses the single Translation Memory
           ↓
6. Optional: Create a distributable Patch
```

---

## Gaps to Fill

### High Priority

- [ ] Library: Integrate engine + file analysis into the game view
- [ ] Library: Add translation method recommendation
- [ ] Library: "Translate" button that opens the right method

### Medium Priority

- [ ] Patch Creation: System to generate distributable patches
- [ ] TM: Verify that all methods use it correctly

### Low Priority

- [ ] Search for existing fan translations online
- [ ] Translation reliability estimate

---

## Technical Notes

- Frontend: Next.js + React + TailwindCSS + shadcn/ui
- Backend: Tauri (Rust)
- Database: local SQLite for TM
- Settings/API keys: persisted to disk in `data_dir/GameStringer/settings.json` (`save_app_settings` / `load_app_settings`)
- AI: REST APIs for various providers
