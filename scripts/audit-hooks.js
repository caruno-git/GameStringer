#!/usr/bin/env node
/**
 * Audit hooks non utilizzati - stessa logica di audit-components-v2.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOOKS_DIR = path.join(ROOT, 'hooks');
const EXCLUDE_DIRS = new Set([
  'node_modules', '.next', '.git', 'out', 'dist', '.claude',
  'src-tauri', 'coverage', 'target', '.cache', '.turbo', 'scripts'
]);
const SRC_EXTS = ['.tsx', '.ts', '.jsx', '.js', '.mjs'];
const SRC_EXT_SET = new Set(SRC_EXTS);

function listFiles(dir, filter, out = []) {
  if (!fs.existsSync(dir)) return out;
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

const IMPORT_REGEXES = [
  /(?:^|\s|;)import\s+[^'"`;]*?from\s*['"`]([^'"`]+)['"`]/g,
  /(?:^|\s|;)import\s*['"`]([^'"`]+)['"`]/g,
  /(?:^|\s|;)export\s+(?:\*|\{[^}]*\})\s*(?:as\s+\w+\s*)?from\s*['"`]([^'"`]+)['"`]/g,
  /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
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
  if (spec.startsWith('@/')) return path.join(ROOT, spec.slice(2));
  return null;
}

function tryPaths(base) {
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
  if (!spec.startsWith('.') && !spec.startsWith('/') && !spec.startsWith('@/')) return null;

  let baseAbs;
  if (spec.startsWith('@/')) {
    baseAbs = resolveAlias(spec);
  } else if (spec.startsWith('/')) {
    baseAbs = path.join(ROOT, spec);
  } else {
    baseAbs = path.resolve(path.dirname(sourceFile), spec);
  }
  if (!baseAbs) return null;
  return tryPaths(baseAbs);
}

// --- Esecuzione ---
const allSources = listFiles(ROOT, (_full, name) => SRC_EXT_SET.has(path.extname(name)));
const hookFiles = listFiles(HOOKS_DIR, (_full, name) => SRC_EXT_SET.has(path.extname(name)));

console.log(`Indicizzo ${allSources.length} file sorgente, ${hookFiles.length} in hooks/...\n`);

const usedFiles = new Set();
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

const dead = [];
const alive = [];
for (const f of hookFiles) {
  if (usedFiles.has(f)) alive.push(f);
  else dead.push(f);
}

console.log('='.repeat(70));
console.log(`CANDIDATI MORTI (${dead.length}/${hookFiles.length}):`);
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
console.log(`Totale file in hooks/: ${hookFiles.length}`);
console.log(`Alive:                 ${alive.length}`);
console.log(`Dead candidates:       ${dead.length}`);
console.log(`% dead:                ${((dead.length / hookFiles.length) * 100).toFixed(1)}%`);

// Dettaglio usati
console.log('\n' + '='.repeat(70));
console.log(`HOOK UTILIZZATI (${alive.length}):`);
console.log('='.repeat(70));
for (const f of alive.sort()) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const importers = importersByTarget.get(f) || [];
  console.log(`  ${path.basename(rel)} (${importers.length} import)`);
}
