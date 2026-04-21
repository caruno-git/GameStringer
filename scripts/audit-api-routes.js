#!/usr/bin/env node
/**
 * Audit degli API routes Next.js: individua quali sono chiamati dal frontend
 * e quali sono potenzialmente morti.
 * 
 * Per ciascun route in app/api/<path>/route.ts, cerca riferimenti a "/api/<path>"
 * in tutti i .ts/.tsx/.js/.jsx del progetto (esclusi node_modules, .next, out,
 * e lo stesso file del route).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'app', 'api');
const EXCLUDE_DIRS = new Set(['node_modules', '.next', '.git', 'out', 'dist', '.claude', 'src-tauri', 'coverage']);
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

function listRouteFiles(dir, routes = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listRouteFiles(full, routes);
    else if (entry.name === 'route.ts' || entry.name === 'route.tsx' || entry.name === 'route.js') {
      routes.push(full);
    }
  }
  return routes;
}

function routeFileToUrlPath(routeFile) {
  const rel = path.relative(path.join(ROOT, 'app'), path.dirname(routeFile));
  return '/' + rel.split(path.sep).join('/');
}

function listAllSourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      listAllSourceFiles(path.join(dir, entry.name), out);
    } else {
      const ext = path.extname(entry.name);
      if (EXTENSIONS.has(ext)) out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function normalizeDynamicPath(p) {
  // /api/games/[id] -> regex che matcha /api/games/ (senza chiedere segment)
  return p.replace(/\[[^\]]+\]/g, '[^/\\s\'"`?]+');
}

const routes = listRouteFiles(API_DIR);
const sources = listAllSourceFiles(ROOT);
console.log(`Found ${routes.length} API routes, ${sources.length} source files.\n`);

const results = [];
for (const routeFile of routes) {
  const urlPath = routeFileToUrlPath(routeFile);
  // Pattern di ricerca:
  // 1. literal: "/api/xxx" or '/api/xxx' or `/api/xxx`
  // 2. dynamic segments [id] -> un any-segment
  const dynamicPattern = normalizeDynamicPath(urlPath);
  const pattern = new RegExp(`["'\`]${dynamicPattern}(?:[/?"\\\`'\\s])`);

  const refs = [];
  for (const src of sources) {
    if (src === routeFile) continue;
    // Escludi altri route.ts (non chiama se stesso)
    if (path.basename(src) === 'route.ts' && src.includes(path.join('app', 'api'))) continue;
    let content;
    try { content = fs.readFileSync(src, 'utf8'); } catch { continue; }
    if (pattern.test(content)) {
      refs.push(path.relative(ROOT, src).replace(/\\/g, '/'));
    }
  }

  results.push({ urlPath, routeFile: path.relative(ROOT, routeFile).replace(/\\/g, '/'), refs });
}

// Report
const dead = results.filter(r => r.refs.length === 0);
const alive = results.filter(r => r.refs.length > 0);

console.log('='.repeat(70));
console.log(`ALIVE routes (${alive.length}/${results.length}):`);
console.log('='.repeat(70));
for (const r of alive) {
  console.log(`  ${r.urlPath}  <- ${r.refs.length} ref(s)`);
}

console.log('\n' + '='.repeat(70));
console.log(`POTENZIALMENTE MORTI (${dead.length}/${results.length}):`);
console.log('='.repeat(70));
for (const r of dead) {
  console.log(`  ${r.urlPath}`);
  console.log(`    -> ${r.routeFile}`);
}

console.log(`\nTotale: ${alive.length} alive, ${dead.length} dead candidates`);
