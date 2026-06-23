#!/usr/bin/env node
/**
 * validate-renpy-tl.js — QA oggettiva dei file di traduzione Ren'Py generati.
 *
 * Dopo aver tradotto un gioco Ren'Py col pulsante "String it!", lancia:
 *   node scripts/validate-renpy-tl.js "<percorso gioco>" <lang>
 *   node scripts/validate-renpy-tl.js "C:/Games/DDLC" it
 * Oppure passa direttamente la cartella tl:
 *   node scripts/validate-renpy-tl.js "C:/Games/DDLC/game/tl/it"
 *
 * Controlla i file generati da generate_renpy_translation:
 *   - file UI  <name>_<lang>.rpy  → coppie  old "..." / new "..."
 *   - filtro   gamestringer_say_filter.rpy → dict  u"orig": u"trad"
 *
 * Verifica per ogni voce:
 *   1) traduzione non vuota
 *   2) traduzione != originale (niente leftover non tradotto)
 *   3) codici Ren'Py {..} / [..] preservati (stesso set in old e new)
 *   4) file leggibile come UTF-8
 *
 * Exit code 0 = PASS (>= soglia tradotte e 0 codici rotti), 1 = FAIL, 2 = uso errato.
 */

const fs = require('fs');
const path = require('path');

const PASS_RATIO = Number(process.env.GS_TL_MIN_RATIO || 0.9); // % minima tradotta
const CODE = /(\{[^}]*\}|\[[^\]]*\])/g;
const codeKey = (s) => (s.match(CODE) || []).slice().sort().join('');

// Cattura una stringa literal Ren'Py con escape: "((?:[^"\\]|\\.)*)"
const STR = '"((?:[^"\\\\]|\\\\.)*)"';
const RE_OLD = new RegExp('^\\s*old\\s+' + STR, 'm');
const RE_NEW = new RegExp('^\\s*new\\s+' + STR, 'm');
const RE_DICT = new RegExp('u' + STR + '\\s*:\\s*u' + STR, 'g');

function resolveTlDir(arg, lang) {
  if (!arg) return null;
  // Caso 1: già una cartella tl/<lang>
  if (fs.existsSync(arg) && fs.statSync(arg).isDirectory() && fs.existsSync(path.join(arg, '.')) && /tl[\\/][^\\/]+$/.test(arg)) {
    return arg;
  }
  // Caso 2: percorso gioco → <arg>/game/tl/<lang> oppure <arg>/tl/<lang>
  const cands = [];
  if (lang) {
    cands.push(path.join(arg, 'game', 'tl', lang));
    cands.push(path.join(arg, 'tl', lang));
  }
  for (const c of cands) if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
  // Caso 3: arg è già una cartella tl/<lang> qualunque
  if (fs.existsSync(arg) && fs.statSync(arg).isDirectory()) return arg;
  return null;
}

function parseEntries(file, text) {
  const entries = []; // { original, translated }
  const base = path.basename(file);
  if (base === 'gamestringer_say_filter.rpy') {
    let m;
    while ((m = RE_DICT.exec(text)) !== null) entries.push({ original: m[1], translated: m[2] });
    return entries;
  }
  // file UI: appaia old/new in ordine
  const lines = text.split(/\r?\n/);
  let pendingOld = null;
  for (const line of lines) {
    const mo = line.match(RE_OLD);
    if (mo) { pendingOld = mo[1]; continue; }
    const mn = line.match(RE_NEW);
    if (mn && pendingOld !== null) { entries.push({ original: pendingOld, translated: mn[1] }); pendingOld = null; }
  }
  return entries;
}

function main() {
  const [, , arg, lang] = process.argv;
  if (!arg) {
    console.error('Uso: node scripts/validate-renpy-tl.js "<percorso gioco>" <lang>   (oppure la cartella tl/<lang>)');
    process.exit(2);
  }
  const dir = resolveTlDir(arg, lang);
  if (!dir) {
    console.error(`✗ Cartella di traduzione non trovata. Cercato game/tl/${lang || '<lang>'} sotto "${arg}".`);
    process.exit(2);
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.rpy'));
  if (files.length === 0) {
    console.error(`✗ Nessun file .rpy in ${dir}`);
    process.exit(1);
  }

  let total = 0, translated = 0, untranslated = 0, emptyNew = 0, codeBroken = 0;
  const brokenSamples = [];
  const untransSamples = [];

  for (const f of files) {
    const full = path.join(dir, f);
    let text;
    try { text = fs.readFileSync(full, 'utf8'); }
    catch (e) { console.error(`✗ ${f}: non leggibile come UTF-8 (${e.message})`); codeBroken++; continue; }
    const entries = parseEntries(f, text);
    for (const e of entries) {
      total++;
      const isEmpty = !e.translated || !e.translated.trim();
      const same = e.translated === e.original;
      if (isEmpty) { emptyNew++; untranslated++; if (untransSamples.length < 8) untransSamples.push(`[vuoto] ${e.original.slice(0, 50)}`); continue; }
      if (same) { untranslated++; if (untransSamples.length < 8) untransSamples.push(`[== orig] ${e.original.slice(0, 50)}`); continue; }
      translated++;
      if (codeKey(e.original) !== codeKey(e.translated)) {
        codeBroken++;
        if (brokenSamples.length < 8) brokenSamples.push(`${e.original.slice(0, 40)}  →  ${e.translated.slice(0, 40)}`);
      }
    }
  }

  const ratio = total ? translated / total : 0;
  console.log(`\nGameStringer — QA traduzione Ren'Py`);
  console.log(`Cartella: ${dir}`);
  console.log(`File .rpy: ${files.length}`);
  console.log(`Voci totali: ${total}`);
  console.log(`Tradotte: ${translated} (${(ratio * 100).toFixed(1)}%)`);
  console.log(`Non tradotte: ${untranslated} (vuote: ${emptyNew}, == originale: ${untranslated - emptyNew})`);
  console.log(`Codici {..}/[..] rotti: ${codeBroken}`);
  if (untransSamples.length) console.log(`  Esempi non tradotti:\n    - ${untransSamples.join('\n    - ')}`);
  if (brokenSamples.length) console.log(`  Esempi codici rotti:\n    - ${brokenSamples.join('\n    - ')}`);

  const pass = ratio >= PASS_RATIO && codeBroken === 0 && total > 0;
  console.log(`\nESITO: ${pass ? '✅ PASS' : '❌ FAIL'}  (soglia tradotte ${(PASS_RATIO * 100).toFixed(0)}%, codici rotti 0)`);
  process.exit(pass ? 0 : 1);
}

main();
