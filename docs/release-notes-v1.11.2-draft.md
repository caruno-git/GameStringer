# v1.11.2 — curated release notes (draft)

Authoring language: English. Curated from ~100 commits since v1.11.1.
Use these entries in place of the auto-generated blob (CHANGELOG.md + in-app `changelog.v1_11_2`).

## ✨ New

- **More stores detected**: GameStringer now finds local installs from **Humble App, Game Jolt and Big Fish Games**, alongside the existing launchers.
- **Translation lookup**: check whether a game already ships your language via **PCGamingWiki**, and get quick **search links for Italian fan-patches** straight from the game view.
- **Publish to Patch Hub**: send a completed project to the community **Patch Hub** in one step, right from the Projects page.
- **Community Hub overview**: a new landing panel with recent activity, latest packs and categories — a guided experience instead of an empty scaffold.
- **Italian translation news**: added curated **fan-translation RSS feeds** (Ctrl+Trad, OldGamesItalia, Romhacking.it, Language Pack Italia, Q-Gin and more).

## 🎮 Engines

- **Godot**: rewritten `.pck` parser — correctly reads real Godot **4.4+** archives (directory-at-end / `dir_offset`), fixes phantom offsets and inverted flags, rejects encrypted dirs. Verified on *Slay the Spire 2* (15,658 files, JSON localization found).
- **TyranoScript**: `.ks` parser is now iscript-aware — skips `[iscript]`/`[html]` blocks and inline JS/config so only real dialogue is extracted.
- **String it! everywhere**: one-click routing wired for **Unity, Unreal and Godot**, plus a **TyranoScript** cloud pipeline.
- **Unity**: local **Ollama** translation bridge for XUnity (CustomTranslate); download assets for **BepInEx, XUnity, TMP and UABEA** now resolve from the GitHub API (no more hardcoded 404s).

## 🖥️ Desktop reliability

- **Fully native calls**: removed the last `fetch('/api')` paths in the packaged app — editor translations now use the local IndexedDB TM, and stream-translate, export-patch, voice transcribe, injekt stats and store/LLM calls all go through the Rust backend. Fewer silent failures in the desktop build.
- **API keys & cloud calls** saved and routed via Rust (survive restarts).
- **Checkpoints**: game-path identity keys are normalized (separators, casing, trailing slash) with legacy-key migration, so resume works reliably.
- **Projects**: hero jobs register immediately (id falls back to path) so they always appear in Projects.
- **Fine-tuning panel** is now usable without a selected game (game picker, generate feedback, locale-aware dates).

## 🤝 Community

- Forum **likes** work (reaction read/delete policies + like-count trigger).
- Forum/Community migrations are **replay-safe** on Supabase preview branches.

## 🔧 Under the hood

- CI on `actions/checkout@v5` + `setup-node@v5`; fixed test teardown leaks, lint escapes and the hardcoded-strings baseline.
- Big Fish registry reads gated behind `cfg(windows)` so the Linux build stays green.

---

Notes:
- Keep the user-facing sections (New / Engines / Desktop / Community); "Under the hood" can be trimmed or dropped for the in-app dialog.
- After `release-all.js patch --yes` generates the raw entries, replace them with the above, then re-run the i18n translate step (or hand-fix `en.json` authoring before it fans out to the other 10 locales).
