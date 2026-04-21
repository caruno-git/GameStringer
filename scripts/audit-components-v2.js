#!/usr/bin/env node
/**
 * Audit componenti React v2 — logica inversa robusta.
 *
 * 1. Scansiona TUTTI i file sorgente del progetto per estrarre gli import.
 * 2. Risolve ogni import (alias `@/...`, relativo `./`, `../`) al path assoluto.
 * 3. Il set di path risolti = file effettivamente usati.
 * 4. I file in components/ non presenti in tale set = candidati morti.
 *
 * Gestisce:
 *  - static: `import X from '...'`, `import { X } from '...'`
 *  - dynamic: `import('...')`
 *  - require: `require('...')`
 *  - re-export: `export * from '...'`, `export { X } from '...'`
 *  - alias `@/...` -> rootDir (da tsconfig paths / vitest config)
 *  - barrel resolution: cartella -> cartella/index.{tsx,ts,jsx,js}
 *  - estensioni: .tsx, .ts, .jsx, .js, .mjs
 *
 * Limiti:
 *  - Import con template string dinamica (`import(`@/components/${name}`)`) non risolvibile.
 *  - Config files (next.config, tailwind) non tracciati ma considerati nei sources.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const EXCLUDE_DIRS = new Set([
  'node_modules', '.next', '.git', 'out', 'dist', '.claude',
  'src-tauri', 'coverage', 'target', '.cache', '.turbo',
]);
const SRC_EXTS = ['.tsx', '.ts', '.jsx', '.js', '.mjs'];
const SRC_EXT_SET = new Set(SRC_EXTS);

function listFiles(dir, filter, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      listFiles(path.join(dir, entry.name), filter, out);
    } else {
      const full = path.join(dir, entry.name);
      if (filter(full, entry.name)) out.push(full);
    }
  }
  return out;
}

// Regex catturano tutti i tipi di specifier di import
const IMPORT_REGEXES = [
  // import X from '...'
  /(?:^|\s|;)import\s+[^'"`;]*?from\s*['"`]([^'"`]+)['"`]/g,
  // import '...'  (side effect)
  /(?:^|\s|;)import\s*['"`]([^'"`]+)['"`]/g,
  // export ... from '...'
  /(?:^|\s|;)export\s+(?:\*|\{[^}]*\})\s*(?:as\s+\w+\s*)?from\s*['"`]([^'"`]+)['"`]/g,
  // import('...')
  /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  // require('...')
  /\brequire\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
];

function extractImports(content) {
  const specifiers = [];
  for (const re of IMPORT_REGEXES) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) specifiers.push(m[1]);
  }
  return specifiers;
}

function resolveAlias(spec) {
  // `@/foo/bar` -> `<ROOT>/foo/bar`
  if (spec.startsWith('@/')) return path.join(ROOT, spec.slice(2));
  return null;
}

function tryPaths(base) {
  // base può essere file (senza ext), file con ext, o directory (cerca index.*)
  if (fs.existsSync(base)) {
    const stat = fs.statSync(base);
    if (stat.isFile()) return base;
    if (stat.isDirectory()) {
      for (const ext of SRC_EXTS) {
        const p = path.join(base, 'index' + ext);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  for (const ext of SRC_EXTS) {
    const p = base + ext;
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function resolveImport(sourceFile, spec) {
  if (!spec) return null;
  // Ignora package npm, URL, data:, node:, virtuali
  if (
    !spec.startsWith('.') &&
    !spec.startsWith('/') &&
    !spec.startsWith('@/')
  ) return null;

  let baseAbs;
  if (spec.startsWith('@/')) {
    baseAbs = resolveAlias(spec);
  } else if (spec.startsWith('/')) {
    baseAbs = path.join(ROOT, spec);
  } else {
    // relativo
    baseAbs = path.resolve(path.dirname(sourceFile), spec);
  }
  if (!baseAbs) return null;
  return tryPaths(baseAbs);
}

// --- Esecuzione ---
const allSources = listFiles(
  ROOT,
  (_full, name) => SRC_EXT_SET.has(path.extname(name))
);

const componentFiles = listFiles(
  COMPONENTS_DIR,
  (_full, name) => SRC_EXT_SET.has(path.extname(name))
);

console.log(`Indicizzo ${allSources.length} file sorgente, ${componentFiles.length} in components/...\n`);

const usedFiles = new Set();
// Mappa file -> set di file che lo importano (per dare un hint se interessa dopo)
const importersByTarget = new Map();

for (const src of allSources) {
  let content = '';
  try { content = fs.readFileSync(src, 'utf8'); } catch { continue; }
  const specs = extractImports(content);
  for (const spec of specs) {
    const resolved = resolveImport(src, spec);
    if (resolved) {
      usedFiles.add(resolved);
      if (!importersByTarget.has(resolved)) importersByTarget.set(resolved, []);
      importersByTarget.get(resolved).push(path.relative(ROOT, src).replace(/\\/g, '/'));
    }
  }
}

// Un file si considera "alive" se è nel set used
const dead = [];
const alive = [];
for (const f of componentFiles) {
  if (usedFiles.has(f)) alive.push(f);
  else dead.push(f);
}

console.log('='.repeat(70));
console.log(`CANDIDATI MORTI (${dead.length}/${componentFiles.length}):`);
console.log('='.repeat(70));

const byDir = new Map();
for (const f of dead) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const dir = path.dirname(rel);
  if (!byDir.has(dir)) byDir.set(dir, []);
  byDir.get(dir).push(path.basename(rel));
}
for (const [dir, files] of [...byDir.entries()].sort()) {
  console.log(`\n  ${dir}/`);
  for (const f of files.sort()) console.log(`    ${f}`);
}

console.log('\n' + '='.repeat(70));
console.log(`RIEPILOGO`);
console.log('='.repeat(70));
console.log(`Totale file in components/: ${componentFiles.length}`);
console.log(`Alive:                      ${alive.length}`);
console.log(`Dead candidates:            ${dead.length}`);
console.log(`% dead:                     ${((dead.length / componentFiles.length) * 100).toFixed(1)}%`);
