#!/usr/bin/env node
/**
 * validate-rpgmaker.js — QA oggettiva della traduzione RPG Maker MV/MZ.
 *
 * Dopo aver tradotto un gioco MV/MZ col pulsante "String it!", lancia:
 *   node scripts/validate-rpgmaker.js "<percorso gioco>" <lang>
 *   node scripts/validate-rpgmaker.js "C:/Games/ToTheMoon" it
 *
 * Verifica (standalone, senza app/Ollama):
 *   1) i file data/*.json sono JSON VALIDI (l'apply in-place non li ha corrotti)
 *   2) esiste il BACKUP ripristinabile (data/.gamestringer_backups con ≥1 copia)
 *   3) dal checkpoint gs_rpgmaker_progress_<lang>.json: n. stringhe tradotte, codici
 *      \C[n]/%d integri (originale vs tradotto), eventuali traduzioni vuote/uguali
 *
 * Exit code 0 = PASS, 1 = FAIL, 2 = uso/percorso errato.
 */

const fs = require('fs');
const path = require('path');

const CODE = /(\\[A-Za-z]\[[^\]]*\]|%\d)/g;
const codeKey = (s) => (s.match(CODE) || []).slice().sort().join('');

function resolveDataDir(gamePath) {
  for (const c of [path.join(gamePath, 'data'), path.join(gamePath, 'www', 'data')]) {
    if (fs.existsSync(c) && fs.statSync(c).isDirectory()) return c;
  }
  return null;
}

function main() {
  const [, , gamePath, lang] = process.argv;
  if (!gamePath || !lang) {
    console.error('Uso: node scripts/validate-rpgmaker.js "<percorso gioco>" <lang>');
    process.exit(2);
  }
  const dataDir = resolveDataDir(gamePath);
  if (!dataDir) {
    console.error(`✗ Cartella data/ (o www/data/) non trovata sotto "${gamePath}".`);
    process.exit(2);
  }

  // 1) JSON validi
  const jsonFiles = fs.readdirSync(dataDir).filter(f => f.toLowerCase().endsWith('.json'));
  let invalidJson = 0;
  const invalidSamples = [];
  for (const f of jsonFiles) {
    try { JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')); }
    catch (e) { invalidJson++; if (invalidSamples.length < 8) invalidSamples.push(`${f}: ${e.message}`); }
  }

  // 2) backup
  const backupDir = path.join(dataDir, '.gamestringer_backups');
  const backups = fs.existsSync(backupDir) ? fs.readdirSync(backupDir).filter(f => f.toLowerCase().endsWith('.json')) : [];

  // 3) checkpoint
  const progressPath = path.join(gamePath, `gs_rpgmaker_progress_${lang}.json`);
  let translated = 0, codeBroken = 0, emptyOrSame = 0;
  const brokenSamples = [];
  let haveProgress = false;
  if (fs.existsSync(progressPath)) {
    haveProgress = true;
    let map = {};
    try { map = JSON.parse(fs.readFileSync(progressPath, 'utf8')); } catch { map = {}; }
    for (const [orig, tr] of Object.entries(map)) {
      if (typeof tr !== 'string' || !tr.trim() || tr === orig) { emptyOrSame++; continue; }
      translated++;
      if (codeKey(orig) !== codeKey(tr)) {
        codeBroken++;
        if (brokenSamples.length < 8) brokenSamples.push(`${orig.slice(0, 40)}  →  ${tr.slice(0, 40)}`);
      }
    }
  }

  console.log(`\nGameStringer — QA traduzione RPG Maker MV/MZ`);
  console.log(`Cartella dati: ${dataDir}`);
  console.log(`File .json: ${jsonFiles.length}  |  JSON non validi: ${invalidJson}`);
  console.log(`Backup (.gamestringer_backups): ${backups.length} copie${backups.length ? '' : '  ⚠️ nessun backup!'}`);
  if (haveProgress) {
    console.log(`Checkpoint: stringhe tradotte ${translated}, vuote/uguali ${emptyOrSame}, codici \\C[n]/%d rotti ${codeBroken}`);
  } else {
    console.log(`Checkpoint gs_rpgmaker_progress_${lang}.json: assente (impossibile contare le stringhe tradotte da qui).`);
  }
  if (invalidSamples.length) console.log(`  JSON corrotti:\n    - ${invalidSamples.join('\n    - ')}`);
  if (brokenSamples.length) console.log(`  Esempi codici rotti:\n    - ${brokenSamples.join('\n    - ')}`);

  const pass = invalidJson === 0 && backups.length > 0 && codeBroken === 0 && (!haveProgress || translated > 0);
  console.log(`\nESITO: ${pass ? '✅ PASS' : '❌ FAIL'}  (JSON validi, backup presente, 0 codici rotti${haveProgress ? ', >0 tradotte' : ''})`);
  process.exit(pass ? 0 : 1);
}

main();
