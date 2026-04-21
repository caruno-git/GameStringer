#!/usr/bin/env node
/**
 * Esegue vitest in 10 shard separati per evitare OOM del master process.
 * 
 * Causa: il progetto GameStringer è molto grande (100+ componenti), e il module graph
 * di vitest+vite cumula memoria nel master process senza rilasciarla tra file.
 * Con ~35+ test file il master arriva a 8GB+ e crasha con heap OOM.
 * 
 * Soluzione: lanciare il run in shard piccoli (1/10 ciascuno ~4 file), così il processo
 * master termina dopo ogni shard e libera memoria. Ogni shard riparte pulito.
 * 
 * Uso: npm run test:safe
 */
const { spawnSync } = require('child_process');

const TOTAL_SHARDS = 15;
const SUMMARY = {
  files: { passed: 0, failed: 0, total: 0 },
  tests: { passed: 0, failed: 0, skipped: 0, total: 0 },
  shardFailures: [],
};

function parseSummary(output) {
  const stripped = output.replace(/\x1b\[[\d;]*m/g, '');
  const fileMatch = stripped.match(/Test Files\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed(?:\s*\|\s*(\d+)\s+skipped)?\s+\((\d+)\)/);
  const testMatch = stripped.match(/Tests\s+(?:(\d+)\s+failed\s*\|\s*)?(\d+)\s+passed(?:\s*\|\s*(\d+)\s+skipped)?\s+\((\d+)\)/);
  return {
    filesFailed: fileMatch ? parseInt(fileMatch[1] || '0', 10) : 0,
    filesPassed: fileMatch ? parseInt(fileMatch[2] || '0', 10) : 0,
    filesTotal: fileMatch ? parseInt(fileMatch[4] || '0', 10) : 0,
    testsFailed: testMatch ? parseInt(testMatch[1] || '0', 10) : 0,
    testsPassed: testMatch ? parseInt(testMatch[2] || '0', 10) : 0,
    testsSkipped: testMatch ? parseInt(testMatch[3] || '0', 10) : 0,
    testsTotal: testMatch ? parseInt(testMatch[4] || '0', 10) : 0,
    oom: /heap out of memory/i.test(stripped),
  };
}

let overallExitCode = 0;

for (let i = 1; i <= TOTAL_SHARDS; i++) {
  const label = `[Shard ${i}/${TOTAL_SHARDS}]`;
  process.stdout.write(`\n${label} avvio...\n`);

  const result = spawnSync(
    `npx vitest run --shard=${i}/${TOTAL_SHARDS} --reporter=default`,
    {
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=8192' },
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const output = (result.stdout || '') + (result.stderr || '');
  const stats = parseSummary(output);

  SUMMARY.files.passed += stats.filesPassed;
  SUMMARY.files.failed += stats.filesFailed;
  SUMMARY.files.total += stats.filesTotal;
  SUMMARY.tests.passed += stats.testsPassed;
  SUMMARY.tests.failed += stats.testsFailed;
  SUMMARY.tests.skipped += stats.testsSkipped;
  SUMMARY.tests.total += stats.testsTotal;

  if (stats.oom) {
    SUMMARY.shardFailures.push(`${label} OOM crash`);
    overallExitCode = 1;
  }
  // Ignora exit non-zero quando lo shard non ha test da eseguire (shard vuoto).
  if (result.status !== 0 && !stats.oom && stats.filesTotal > 0) {
    overallExitCode = overallExitCode || result.status || 1;
  }

  process.stdout.write(
    `${label} files: ${stats.filesPassed}/${stats.filesTotal} passed, ` +
    `tests: ${stats.testsPassed}/${stats.testsTotal} passed` +
    (stats.oom ? ' - OOM!' : '') + '\n'
  );
}

console.log('\n' + '='.repeat(60));
console.log('RIEPILOGO TEST SUITE COMPLETA');
console.log('='.repeat(60));
console.log(`File test:  ${SUMMARY.files.passed} passed | ${SUMMARY.files.failed} failed | totale ${SUMMARY.files.total}`);
console.log(`Test cases: ${SUMMARY.tests.passed} passed | ${SUMMARY.tests.failed} failed | ${SUMMARY.tests.skipped} skipped | totale ${SUMMARY.tests.total}`);
if (SUMMARY.shardFailures.length > 0) {
  console.log('\nShard con problemi:');
  SUMMARY.shardFailures.forEach((f) => console.log('  - ' + f));
}
console.log('='.repeat(60));

process.exit(overallExitCode);
