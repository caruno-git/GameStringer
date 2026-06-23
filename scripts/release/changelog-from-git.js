#!/usr/bin/env node
/**
 * changelog-from-git.js
 *
 * Estrae i commit dall'ultimo tag a HEAD e li trasforma in voci changelog
 * pronte per il dialog in-app (version.json) e per CHANGELOG.md.
 *
 * Convenzione commit supportata (Conventional Commits, ma tollerante):
 *   feat: ...        -> nuova funzionalità  (minor)
 *   fix: ...         -> bug fix             (patch)
 *   perf: ...        -> performance
 *   refactor: ...    -> refactor (incluso solo se nient'altro)
 *   feat!: / BREAKING CHANGE -> breaking    (major)
 *   chore/ci/docs/test/style/build -> rumore, scartati di default
 *
 * Export:
 *   getLastTag()                  -> string|null
 *   getCommits(sinceTag)          -> [{hash, subject, body, type, scope, breaking}]
 *   buildChanges(commits)         -> { changes: string[], bumpType, grouped }
 */

const { execSync } = require('child_process');

const TYPE_LABELS = {
  feat: '✨',
  fix: '🐛',
  perf: '⚡',
  refactor: '♻️',
  security: '🔒',
  revert: '⏪',
};

// Tipi considerati "rumore": esclusi dal changelog pubblico se ci sono cose migliori.
const NOISE_TYPES = new Set(['chore', 'ci', 'docs', 'test', 'style', 'build']);

const CONVENTIONAL_RE = /^(\w+)(\(([^)]+)\))?(!)?:\s*(.+)$/;

function sh(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

function getLastTag() {
  try {
    return sh('git describe --tags --abbrev=0');
  } catch {
    return null; // nessun tag ancora
  }
}

function getCommits(sinceTag) {
  const range = sinceTag ? `${sinceTag}..HEAD` : 'HEAD';
  // Separatore non stampabile per spezzare i record in modo affidabile.
  const SEP = '\x1e';
  const FIELD = '\x1f';
  let raw;
  try {
    raw = sh(`git log ${range} --no-merges --pretty=format:%H${FIELD}%s${FIELD}%b${SEP}`);
  } catch {
    raw = '';
  }
  if (!raw) return [];

  return raw
    .split(SEP)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash = '', subject = '', body = ''] = record.split(FIELD);
      const m = subject.match(CONVENTIONAL_RE);
      let type = 'other';
      let scope = null;
      let breaking = false;
      let description = subject.trim();

      if (m) {
        type = m[1].toLowerCase();
        scope = m[3] || null;
        breaking = Boolean(m[4]);
        description = m[5].trim();
      }
      if (/BREAKING CHANGE/i.test(body)) breaking = true;

      return { hash: hash.slice(0, 7), subject: subject.trim(), body: body.trim(), type, scope, breaking, description };
    })
    // Scarta i commit di release automatici per non avvelenare il prossimo changelog.
    .filter((c) => !/^chore\(release\)/i.test(c.subject) && !/^v\d+\.\d+\.\d+$/.test(c.subject));
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function toBullet(commit) {
  const icon = TYPE_LABELS[commit.type] || '•';
  const scopePart = commit.scope ? `${commit.scope}: ` : '';
  const text = capitalize(commit.description);
  // Es: "✨ Vision LLM Translator" oppure "🐛 unity: fix crash all'avvio"
  return `${icon} ${scopePart}${text}`.replace(/\s+/g, ' ').trim();
}

function buildChanges(commits) {
  const meaningful = commits.filter((c) => !NOISE_TYPES.has(c.type));
  const pool = meaningful.length > 0 ? meaningful : commits; // se solo rumore, usa tutto

  // Ordine: feat, fix, perf, security, refactor, revert, other
  const order = ['feat', 'fix', 'perf', 'security', 'refactor', 'revert', 'other'];
  const grouped = {};
  for (const c of pool) {
    const key = order.includes(c.type) ? c.type : 'other';
    (grouped[key] ||= []).push(c);
  }

  const changes = [];
  for (const t of order) {
    for (const c of grouped[t] || []) changes.push(toBullet(c));
  }

  // bump type
  let bumpType = 'patch';
  if (commits.some((c) => c.breaking)) bumpType = 'major';
  else if (commits.some((c) => c.type === 'feat')) bumpType = 'minor';

  return { changes, bumpType, grouped };
}

module.exports = { getLastTag, getCommits, buildChanges };

// CLI: stampa l'anteprima
if (require.main === module) {
  const tag = getLastTag();
  const commits = getCommits(tag);
  const { changes, bumpType } = buildChanges(commits);
  console.log(`Ultimo tag: ${tag || '(nessuno)'}`);
  console.log(`Commit trovati: ${commits.length}`);
  console.log(`Bump suggerito: ${bumpType}`);
  console.log('\nVoci changelog:');
  changes.forEach((c) => console.log('  ' + c));
}
