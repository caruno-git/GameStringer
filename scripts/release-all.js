#!/usr/bin/env node
/**
 * release-all.js — Orchestratore di release "un comando e basta".
 *
 * Incatena tutto il processo per pubblicare una nuova versione di GameStringer
 * su Windows / Linux / macOS con auto-update, changelog in-app (11+ lingue),
 * CHANGELOG.md, README/guide e sito aggiornati.
 *
 *   npm run ship                 # auto: bump dedotto dai commit
 *   npm run ship -- patch        # forza patch
 *   npm run ship -- minor        # forza minor
 *   npm run ship -- major        # forza major
 *   npm run ship -- --dry-run    # mostra tutto, NON scrive/committa/pubblica
 *   npm run ship -- --no-publish # fa tutto MA non lancia la build pubblica
 *   npm run ship -- --yes        # salta la conferma interattiva
 *
 * Passi:
 *   0. Preflight (branch, working tree pulito, gh disponibile)
 *   1. Raccoglie commit dall'ultimo tag -> voci changelog + bump type
 *   2. Conferma
 *   3. version-manager bump (+ sync package.json/Cargo.toml/tauri.conf.json)
 *   4. Rigenera CHANGELOG.md
 *   5. Scrive changelog i18n in tutte le lingue (traduzione automatica)
 *   6. senior-versioning-agent fix (README badge/footer + versione guide)
 *   7. Aggiorna versione nel sito (docs/sito) se presente
 *   8. commit + push main + tag + push tag
 *   9. Dispatch release.yml (build & publish multi-OS) — se non --no-publish
 *  10. Stampa link al run e i comandi di verifica
 */

const { execSync, execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const VERSION_FILE = path.join(ROOT, 'version.json');
const VM = path.join(__dirname, 'version-manager.js');
const AGENT = path.join(__dirname, 'senior-versioning-agent.js');
const { getLastTag, getCommits, buildChanges } = require('./release/changelog-from-git');
const { writeChangelogKeys } = require('./release/translate-changelog');

const C = { r: '\x1b[0m', b: '\x1b[1m', red: '\x1b[31m', grn: '\x1b[32m', yel: '\x1b[33m', cya: '\x1b[36m', dim: '\x1b[2m' };
const log = {
  step: (n, m) => console.log(`\n${C.b}${C.cya}[${n}]${C.r} ${C.b}${m}${C.r}`),
  ok: (m) => console.log(`   ${C.grn}✅${C.r} ${m}`),
  warn: (m) => console.log(`   ${C.yel}⚠️ ${C.r} ${m}`),
  err: (m) => console.log(`   ${C.red}❌${C.r} ${m}`),
  info: (m) => console.log(`   ${m}`),
};

function sh(cmd, opts = {}) { return execSync(cmd, { encoding: 'utf8', stdio: opts.capture ? 'pipe' : 'inherit', cwd: ROOT, ...opts }); }
function shOut(cmd) { return execSync(cmd, { encoding: 'utf8', cwd: ROOT }).trim(); }
function have(bin) { return spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding: 'utf8' }).status === 0; }

function parseArgs(argv) {
  const a = { bump: null, dryRun: false, noPublish: false, yes: false };
  for (const t of argv) {
    if (t === '--dry-run' || t === '-n') a.dryRun = true;
    else if (t === '--no-publish') a.noPublish = true;
    else if (t === '--yes' || t === '-y') a.yes = true;
    else if (['patch', 'minor', 'major', 'auto'].includes(t)) a.bump = t === 'auto' ? null : t;
  }
  return a;
}

function confirm(question) {
  // Conferma sincrona via /dev/stdin (no dipendenze). In CI usa --yes.
  try {
    process.stdout.write(`${question} [y/N] `);
    const buf = fs.readFileSync(0, 'utf8'); // legge stdin
    return /^\s*y(es)?\s*$/i.test(buf.split('\n')[0] || '');
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`${C.b}🚀 GameStringer — release-all${C.r}${args.dryRun ? `  ${C.yel}(DRY-RUN)${C.r}` : ''}`);

  // ---- 0. Preflight -------------------------------------------------------
  log.step(0, 'Preflight');
  let branch = 'unknown';
  try { branch = shOut('git rev-parse --abbrev-ref HEAD'); } catch {}
  log.info(`branch: ${branch}`);
  if (branch !== 'main' && branch !== 'master') log.warn(`non sei su main/master (sei su "${branch}").`);

  const dirty = shOut('git status --porcelain');
  if (dirty && !args.dryRun) {
    log.err('working tree non pulito. Committa o stasha le modifiche prima di rilasciare.');
    console.log(dirty.split('\n').slice(0, 10).map((l) => '      ' + l).join('\n'));
    process.exit(1);
  } else if (dirty) {
    log.warn('working tree non pulito (ignorato in dry-run).');
  } else {
    log.ok('working tree pulito');
  }

  const ghOk = have('gh');
  if (!ghOk) {
    if (!args.noPublish && !args.dryRun) { log.err('GitHub CLI "gh" non trovato: serve per lanciare la build. Installa gh o usa --no-publish.'); process.exit(1); }
    log.warn('gh non trovato (ok perché non si pubblica).');
  } else {
    const auth = spawnSync('gh', ['auth', 'status'], { encoding: 'utf8' });
    if (auth.status !== 0 && !args.noPublish && !args.dryRun) { log.err('gh non autenticato. Esegui `gh auth login`.'); process.exit(1); }
    log.ok('gh disponibile e autenticato');
  }

  // ---- 1. Changelog dai commit -------------------------------------------
  log.step(1, 'Raccolta commit dall\'ultimo tag');
  const lastTag = getLastTag();
  const commits = getCommits(lastTag);
  log.info(`ultimo tag: ${lastTag || '(nessuno)'}`);
  log.info(`commit dal tag: ${commits.length}`);
  if (commits.length === 0) { log.err('Nessun commit nuovo dall\'ultimo tag: niente da rilasciare.'); process.exit(1); }

  const { changes, bumpType: autoBump } = buildChanges(commits);
  const bumpType = args.bump || autoBump;
  if (changes.length === 0) { log.err('Nessuna voce changelog significativa generata.'); process.exit(1); }

  const cur = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  const next = (() => {
    let { major, minor, patch } = cur;
    if (bumpType === 'major') { major++; minor = 0; patch = 0; }
    else if (bumpType === 'minor') { minor++; patch = 0; }
    else { patch++; }
    return `${major}.${minor}.${patch}`;
  })();

  console.log(`\n   ${C.dim}versione:${C.r} ${cur.version} → ${C.b}${next}${C.r}  ${C.dim}(${bumpType}${args.bump ? ', forzato' : ', auto'})${C.r}`);
  console.log(`   ${C.dim}voci changelog:${C.r}`);
  changes.forEach((c) => console.log('     ' + c));

  // ---- 2. Conferma --------------------------------------------------------
  if (!args.dryRun && !args.yes) {
    const what = args.noPublish ? 'preparare la release (senza pubblicare)' : 'PUBBLICARE la release su tutti gli OS';
    if (!confirm(`\n${C.yel}Procedo a ${what} v${next}?${C.r}`)) { log.warn('Annullato.'); process.exit(0); }
  }
  if (args.dryRun) { log.step('✓', 'Dry-run completato: nessuna modifica scritta.'); printVerify(next, args); return; }

  // ---- 3. Bump versione + sync -------------------------------------------
  log.step(3, 'Bump versione e sync (package.json, Cargo.toml, tauri.conf.json)');
  execFileSync('node', [VM, bumpType, ...changes], { stdio: 'inherit', cwd: ROOT });
  const after = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  if (after.version !== next) log.warn(`versione attesa ${next}, ottenuta ${after.version} — proseguo con ${after.version}.`);
  const version = after.version;

  // ---- 4. CHANGELOG.md ----------------------------------------------------
  log.step(4, 'Rigenero CHANGELOG.md');
  execFileSync('node', [VM, 'changelog'], { stdio: 'inherit', cwd: ROOT });

  // ---- 5. Changelog i18n (traduzione) ------------------------------------
  log.step(5, 'Scrivo changelog in-app in tutte le lingue');
  const tr = await writeChangelogKeys(version, changes, {});
  if (tr.translated) log.ok(`tradotto con ${tr.provider} → ${tr.langs.join(', ')}`);
  else log.warn('changelog i18n: solo italiano (fallback grezzo per le altre lingue).');

  // ---- 6. README / guide --------------------------------------------------
  log.step(6, 'Aggiorno README e versione guide (senior-versioning-agent fix)');
  try { execFileSync('node', [AGENT, 'fix'], { stdio: 'inherit', cwd: ROOT }); }
  catch { log.warn('senior-versioning-agent fix ha segnalato problemi (non bloccante).'); }

  // ---- 7. Sito ------------------------------------------------------------
  log.step(7, 'Aggiorno versione nel sito (docs/sito)');
  bumpSiteVersion(version);

  // ---- 8. Commit + tag + push --------------------------------------------
  log.step(8, 'Commit, tag e push');
  sh('git add -A');
  sh(`git commit -m "chore(release): v${version}"`);
  sh(`git push origin ${branch}`);
  sh(`git tag v${version} -m "Release v${version}"`);
  sh(`git push origin v${version}`);
  log.ok(`commit + tag v${version} pushati`);

  // ---- 9. Dispatch build pubblica ----------------------------------------
  if (args.noPublish) {
    log.step(9, 'Pubblicazione saltata (--no-publish)');
    log.info(`Per pubblicare quando vuoi:\n      gh workflow run release.yml -f version=v${version} -f create_release=true`);
  } else {
    log.step(9, 'Lancio build & publish multi-OS (release.yml)');
    sh(`gh workflow run release.yml -f version=v${version} -f create_release=true`);
    log.ok('workflow dispatchato');
    try {
      execSync('sleep 4');
      const runId = shOut('gh run list --workflow=release.yml -L 1 --json databaseId -q ".[0].databaseId"');
      const url = shOut(`gh run view ${runId} --json url -q ".url"`);
      log.info(`run: ${url}`);
      log.info(`segui con:  gh run watch ${runId} --exit-status`);
    } catch { log.warn('Non sono riuscito a recuperare l\'URL del run (controlla con `gh run list`).'); }
  }

  printVerify(version, args);
}

function bumpSiteVersion(version) {
  const siteDir = path.join(ROOT, 'docs', 'sito');
  if (!fs.existsSync(siteDir)) { log.info('docs/sito assente, salto.'); return; }
  let touched = 0;
  const files = fs.readdirSync(siteDir).filter((f) => /\.(html|js|json)$/.test(f));
  for (const f of files) {
    const p = path.join(siteDir, f);
    let txt = fs.readFileSync(p, 'utf8');
    const before = txt;
    // Sostituisce pattern di versione "vX.Y.Z" o "version": "X.Y.Z" / data-version
    txt = txt.replace(/v\d+\.\d+\.\d+/g, `v${version}`);
    txt = txt.replace(/("version"\s*:\s*")\d+\.\d+\.\d+(")/g, `$1${version}$2`);
    txt = txt.replace(/(data-version=")\d+\.\d+\.\d+(")/g, `$1${version}$2`);
    if (txt !== before) { fs.writeFileSync(p, txt); touched++; }
  }
  if (touched) log.ok(`sito: versione aggiornata in ${touched} file (deploy automatico via deploy-site.yml al push)`);
  else log.info('sito: nessun riferimento di versione trovato da aggiornare.');
}

function printVerify(version, args) {
  console.log(`\n${C.b}${C.grn}━━ Fatto ━━${C.r}`);
  if (args.dryRun) { console.log('Dry-run: rilancia senza --dry-run per eseguire davvero.'); return; }
  console.log(`Verifica post-release (2 min):`);
  console.log(`  gh release view v${version}`);
  console.log(`  gh release download v${version} -p latest.json -O -   ${C.dim}# 4 piattaforme con signature non vuota${C.r}`);
  console.log(`  ${C.dim}poi testa l'auto-update da una copia installata.${C.r}`);
}

main().catch((e) => { console.error(`\n${C.red}Errore:${C.r} ${e.stack || e.message}`); process.exit(1); });
