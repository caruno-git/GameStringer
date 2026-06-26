# GameStringer — Launch kit v1.11.0

Tone: technical, understated. Honest about scope and limits. Open source (source on GitHub, non-commercial license). Solo project — gentle, optional support ask.

**Links**
- Site: https://gamestringer.ai
- Repo: https://github.com/rouges78/GameStringer
- Latest release: https://github.com/rouges78/GameStringer/releases/latest
- Support (optional): https://buymeacoffee.com/gamestringer · https://ko-fi.com/gamestringer · https://github.com/sponsors/rouges78

---

## Positioning (one line)

A desktop tool that detects a game's engine, extracts its text, translates it with the AI provider of your choice (including local models), and re-applies it — with a backup before every write.

---

## Hacker News — Show HN

**Title:**
Show HN: GameStringer – detect a game's engine, extract text, translate, re-patch

**Body:**
GameStringer is a desktop app (Tauri: Rust backend, Next.js frontend) that automates the boring parts of fan-translating a game.

The flow is the same regardless of the game: fingerprint the engine from on-disk markers, route to a format-aware parser, extract strings keeping their original path, translate, then write back and repackage. There are three patching strategies depending on the engine — file rewriting, runtime injection (BepInEx + XUnity.AutoTranslator, or a DLL hook on Windows), or an on-screen OCR overlay for older titles.

Some technical notes that might be interesting:
- Engine coverage is parser-based with fixtures: Unity, Unreal (.locres / _P.pak), Godot, RPG Maker MV/MZ, Ren'Py, Bethesda (BSA/BA2), CRI (CPK), Wolf RPG, and others.
- Translation can run fully local through Ollama (one call per string), or via cloud providers (OpenAI, Claude, Gemini, DeepSeek, DeepL…). A provider chain with automatic fallback handles rate limits.
- A local Translation Memory + glossary keep terminology consistent and avoid re-translating the same string twice. In-game control codes are preserved.
- There's a hard anti-cheat gate: runtime injection is blocked on online games (EAC/BattlEye). It's meant for single-player/offline only.
- A backup is taken before any file is modified, and an update tracker re-checks patch integrity after a game updates on a store.

The source is on GitHub (non-commercial license). It's a solo side project — feedback on the architecture and the engine coverage is very welcome.

Site: https://gamestringer.ai
Code: https://github.com/rouges78/GameStringer

---

## Reddit

> Note: read each subreddit's self-promo rules first. Post as a "here's a tool I built" with technical detail, engage in comments, and don't cross-post the same text everywhere. Keep the support link out of the post body on subs that disallow it — put it in a comment or your profile.

### r/RPGMaker

**Title:** Built a desktop tool that auto-translates RPG Maker MV/MZ projects (and 20+ other engines)

**Body:**
I've been working on GameStringer, a desktop app that handles the extraction → translation → re-apply loop for game text.

For RPG Maker specifically: it parses `data/*.json` for MV/MZ, runs a dedicated file-based pipeline with glossary support, backs up before writing, applies in place, and can resume an interrupted job. Classic RM2k/2k3 (RPG_RT) falls back to an on-screen OCR overlay instead of silently failing.

Translation can be fully local via Ollama if you don't want to send text to a cloud provider, or you can use OpenAI/Claude/Gemini/DeepL. A local Translation Memory keeps names and terms consistent across the whole game.

It's open source (source on GitHub, non-commercial license) and free to use. Happy to answer technical questions about how the parsing/patching works.

Site: https://gamestringer.ai · Code: https://github.com/rouges78/GameStringer

### r/visualnovels

**Title:** A tool for translating Ren'Py / TyranoScript / engine-based VNs (extract → AI → re-patch)

**Body:**
GameStringer detects the engine and extracts dialogue from native formats — `.rpy` for Ren'Py, JSON fast-path for TyranoScript, plus Unity/Unreal-based VNs. It keeps each string's original path so it can write the translation straight back.

For Ren'Py it can also inject per-character voice profiles (tone/personality) into the translation prompt, which helps keep character voice consistent. You can run it on a local model (Ollama) for privacy or use a cloud provider, and a per-line 0–100 quality score with a heatmap shows where a human pass is worth it.

Fan translations are community work — this just removes the manual grind. Backup before every write. Open source, free.

Site: https://gamestringer.ai · Code: https://github.com/rouges78/GameStringer

### r/romhacking

**Title:** Engine-aware translation tool: file patchers + OCR fallback for retro titles

**Body:**
GameStringer is a desktop app that auto-detects the engine and picks a translation strategy: dedicated file parsers (Unity, Unreal, Godot, RPG Maker, Ren'Py, Bethesda BSA/BA2, CRI CPK, Wolf RPG, Danganronpa WAD/STX…) or an on-screen OCR overlay for retro/DOS/classic RPG Maker where there's nothing extractable.

Everything can run locally through Ollama. Translation Memory + glossary for consistency, control-code preservation, automatic backups, and a strict anti-cheat gate so it stays on single-player titles. Source on GitHub, non-commercial license.

Site: https://gamestringer.ai · Code: https://github.com/rouges78/GameStringer

---

## Product Hunt

**Name:** GameStringer
**Tagline:** Detect any game's engine, translate it with AI, re-apply the patch

**Description:**
GameStringer is a desktop app (Windows/macOS/Linux) that automates fan game translation. It fingerprints the engine, extracts text from native formats, translates with the provider you choose — including fully local models via Ollama — and writes it back with a backup before every change. 20+ engines with dedicated parsers, 20+ AI providers, a local Translation Memory + glossary for consistency, per-line quality scoring, and a community Patch Hub for sharing translation packs. Open source, free, single-player focused (anti-cheat gate built in).

**First comment (maker):**
Hi PH 👋 I built GameStringer because translating a game by hand means hunting down the right files for every engine and pasting strings back one by one. This does the engine detection and the extract/translate/re-apply loop for you, and keeps a Translation Memory so you never translate the same line twice.

It's a solo, source-available project. The translation can run entirely offline through Ollama if you'd rather not use a cloud API. Honest about limits: runtime injection is blocked on online games, and it always backs up before touching anything.

Hosting and API costs come out of my own pocket — if it's useful there's a Buy Me a Coffee / Ko-fi / GitHub Sponsors link, but it's entirely optional. Feedback welcome, especially on engine coverage.

---

## X / Twitter thread

1/ GameStringer v1.11.0 is out. It's a desktop tool that detects a game's engine, extracts the text, translates it (local or cloud AI), and re-applies the patch — with a backup before every write. Open source. https://gamestringer.ai

2/ The pipeline is engine-agnostic: fingerprint the engine → format-aware parser → extract strings (keeping their path) → translate → write back & repackage. 20+ engines with dedicated parsers and fixtures.

3/ Three patching paths depending on the game: file rewriting, runtime injection (BepInEx + XUnity.AutoTranslator / DLL hook), or an on-screen OCR overlay for older titles with nothing extractable.

4/ Translation can run fully local via Ollama (one call per string) or through OpenAI / Claude / Gemini / DeepSeek / DeepL, with automatic fallback across providers. A local Translation Memory + glossary keep terms consistent.

5/ Honest by design: a hard anti-cheat gate blocks injection on online games (EAC/BattlEye), and an update tracker re-checks patch integrity after a store update. Single-player only.

6/ v1.11.0 adds the Patch Hub — publish your translation packs and download the community's. Source on GitHub (non-commercial license), free to use. Solo project; optional coffee link if it saves you time. https://github.com/rouges78/GameStringer

---

## Short blurb (itch.io / Steam community / forum signature)

GameStringer — a free desktop tool that auto-detects a game's engine, extracts the text, translates it with the AI of your choice (local Ollama or cloud), and re-applies the patch with a backup. 20+ engines, 11 UI languages, local Translation Memory, single-player focused. https://gamestringer.ai

---

## Reusable support line (drop in wherever appropriate)

GameStringer is free and source-available. It's a solo project and the site + API costs are out of pocket — if it saved you time, a coffee is appreciated but never expected: https://buymeacoffee.com/gamestringer
