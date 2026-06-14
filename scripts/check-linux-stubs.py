#!/usr/bin/env python3
"""
check-linux-stubs.py — Guardia anti-E0433 per la build Linux (check-linux).

GameStringer si sviluppa su Windows: il codice sotto #[cfg(not(windows))] non
viene mai compilato in locale, quindi un comando Windows-only registrato
nell'invoke_handler senza il relativo stub Linux passa inosservato fino alla CI
(errore E0433, check-linux rosso).

Questo script replica staticamente quel controllo in ~0.5s, senza toolchain Rust:
per ogni comando registrato in `generate_handler![...]` che appartiene a un
modulo Windows-only, verifica che esista uno stub corrispondente in
platform_stubs.rs (nel namespace giusto). Esce con codice 1 se manca uno stub.

Uso:
    python scripts/check-linux-stubs.py
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAIN_RS = os.path.join(ROOT, "src-tauri", "src", "main.rs")
MOD_RS = os.path.join(ROOT, "src-tauri", "src", "commands", "mod.rs")
STUBS_RS = os.path.join(ROOT, "src-tauri", "src", "commands", "platform_stubs.rs")


def read(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def parse_stub_modules(mod_src):
    """Mappa i moduli Windows-only -> namespace stub atteso.

    Ritorna dict: nome_modulo -> ("top" | "<submod>" | None)
    None = modulo non-windows vuoto (nessuno stub disponibile).
    """
    mapping = {}
    pattern = re.compile(
        r'#\[cfg\(not\(windows\)\)\]\s*pub mod (\w+)\s*\{([^}]*)\}'
    )
    for name, body in pattern.findall(mod_src):
        if name == "platform_stubs":
            continue
        sub = re.search(r'platform_stubs::(\w+)::\*', body)
        if sub:
            mapping[name] = sub.group(1)
        elif "platform_stubs::*" in body:
            mapping[name] = "top"
        elif body.strip() == "":
            mapping[name] = None  # modulo vuoto: nessuno stub
        else:
            mapping[name] = "top"
    return mapping


def parse_stub_fns(stubs_src):
    """Ritorna dict namespace -> set(fn). 'top' = livello file."""
    fns = {"top": set()}
    # rimuovi i blocchi submod per il conteggio top-level
    submod_pattern = re.compile(r'pub mod (\w+)\s*\{(.*?)\n\}', re.S)
    top_src = stubs_src
    for sub_name, sub_body in submod_pattern.findall(stubs_src):
        fns.setdefault(sub_name, set())
        for fn in re.findall(r'pub (?:async )?fn (\w+)', sub_body):
            fns[sub_name].add(fn)
        top_src = top_src.replace(sub_body, "")
    for fn in re.findall(r'pub (?:async )?fn (\w+)', top_src):
        fns["top"].add(fn)
    return fns


def parse_handler_entries(main_src):
    m = re.search(r'generate_handler!\[(.*?)\]\s*\)', main_src, re.S)
    if not m:
        return []
    block = m.group(1)
    # Rimuovi i commenti di riga (//...) PRIMA di splittare per virgola:
    # i commenti sono su righe a sé, ma le entry sono separate da virgola, quindi
    # un commento finirebbe nello stesso chunk dell'entry successiva.
    block = re.sub(r'//[^\n]*', '', block)
    entries = []
    for raw in block.split(","):
        e = raw.strip()
        if e:
            entries.append(e)
    return entries


def main():
    mod_src = read(MOD_RS)
    main_src = read(MAIN_RS)
    stubs_src = read(STUBS_RS)

    stub_mods = parse_stub_modules(mod_src)
    stub_fns = parse_stub_fns(stubs_src)
    entries = parse_handler_entries(main_src)

    missing = []
    for e in entries:
        parts = e.split("::")
        if len(parts) < 2:
            continue
        mod = parts[-2]
        fn = parts[-1]
        if mod not in stub_mods:
            continue
        ns = stub_mods[mod]
        if ns is None:
            missing.append((mod, fn, "modulo non-windows vuoto"))
            continue
        if fn not in stub_fns.get(ns, set()):
            missing.append((mod, fn, f"stub assente in platform_stubs ({ns})"))

    if missing:
        print("X check-linux-stubs: stub Linux mancanti (causerebbero E0433):")
        for mod, fn, why in missing:
            print(f"   - commands::{mod}::{fn}  ->  {why}")
        print("\nAggiungi lo stub in src-tauri/src/commands/platform_stubs.rs")
        return 1

    print("OK check-linux-stubs: tutti i comandi Windows-only hanno lo stub Linux.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
