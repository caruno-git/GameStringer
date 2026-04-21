#!/usr/bin/env node
/**
 * Audit dei componenti React: individua quali file .tsx in components/
 * non sono importati da nessun altro file del progetto.
 *
 * Logica:
 * 1. Lista tutti i .tsx sotto components/
 * 2. Per ciascuno, calcola i possibili specifier di import:
 *    - relativo: ../../components/tools/foo
 *    - alias: @/components/tools/foo
 * 3. Cerca in tutti i .ts/.tsx (esclusi il file stesso e node_modules)
 *    qualunque import/require che referenzi quel path, con o senza estensione.
 * 4. Considera "barrel": se dir/index.tsx è importata come dir/, conta come uso.
 *
 * Limiti noti:
 * - Import dinamici con template string (`import(`@/components/${name}`)`) non rilevati.
 * - File indicati in config (next, storybook) non rilevati automaticamente.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const EXCLUDE_DIRS = new Set([
  'node_modules', '.next', '.git', 'out', 'dist', '.claude',
  'src-tauri', 'coverage', 'target', '.cache', '.turbo',
]);
const SRC_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

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

const componentFiles = listFiles(
  COMPONENTS_DIR,
  (_full, name) => name.endsWith('.tsx') || name.endsWith('.ts')
);

const allSources = listFiles(
  ROOT,
  (_full, name) => SRC_EXTS.has(path.extname(name))
);

console.log(`Found ${componentFiles.length} files in components/`);
console.log(`Scanning ${allSources.length} source files...\n`);

// Cache: content per ogni source per evitare I/O ripetuto
const cache = new Map();
function readSource(file) {
  if (cache.has(file)) return cache.get(file);
  let content = '';
  try { content = fs.readFileSync(file, 'utf8'); } catch {}
  cache.set(file, content);
  return content;
}

function computeImportSpecifiers(componentFile) {
  // @/components/tools/foo.tsx -> ['@/components/tools/foo', 'components/tools/foo', '../tools/foo', etc.]
  const relFromRoot = path.relative(ROOT, componentFile).replace(/\\/g, '/');
  // Rimuove estensione
  const withoutExt = relFromRoot.replace(/\.(tsx|ts|jsx|js)$/, '');
  const alias = '@/' + withoutExt; // @/components/foo

  const specifiers = new Set([alias, withoutExt]);

  // Se il file è index.tsx, il suo genitore può essere importato come tale
  const base = path.basename(withoutExt);
  if (base === 'index') {
    const parent = withoutExt.replace(/\/index$/, '');
    specifiers.add('@/' + parent);
    specifiers.add(parent);
  }

  return [...specifiers];
}

const results = [];
for (const file of componentFiles) {
  const specifiers = computeImportSpecifiers(file);
  const refs = [];

  for (const src of allSources) {
    if (src === file) continue;
    const content = readSource(src);
    let found = false;
    for (const spec of specifiers) {
      // Pattern comuni:
      // from '@/components/foo'
      // from '@/components/foo.tsx'  (raro)
      // import('@/components/foo')
      // require('@/components/foo')
      // Attenzione a sotto-path: @/components/foo != @/components/foo-bar
      const re = new RegExp(
        `(?:from|import|require)\\s*\\(?\\s*['"\`]` +
        escapeRegex(spec) +
        `(?:\\.(?:tsx?|jsx?))?['"\`]`,
        'm'
      );
      if (re.test(content)) { found = true; break; }
    }
    if (found) refs.push(path.relative(ROOT, src).replace(/\\/g, '/'));
  }

  results.push({
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    refs,
    specifiers,
  });
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

const dead = results.filter(r => r.refs.length === 0);
const alive = results.filter(r => r.refs.length > 0);

console.log('='.repeat(70));
console.log(`POTENZIALMENTE MORTI (${dead.length}/${results.length}):`);
console.log('='.repeat(70));

// Raggruppa per sottocartella per leggibilità
const byDir = new Map();
for (const r of dead) {
  const dir = path.dirname(r.file);
  if (!byDir.has(dir)) byDir.set(dir, []);
  byDir.get(dir).push(r);
}
for (const [dir, files] of [...byDir.entries()].sort()) {
  console.log(`\n  ${dir}/`);
  for (const f of files) {
    console.log(`    ${path.basename(f.file)}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log(`RIEPILOGO`);
console.log('='.repeat(70));
console.log(`Totale file in components/: ${results.length}`);
console.log(`Alive (usati):              ${alive.length}`);
console.log(`Dead candidates:            ${dead.length}`);
console.log(`Percentuale dead:           ${((dead.length / results.length) * 100).toFixed(1)}%`);
