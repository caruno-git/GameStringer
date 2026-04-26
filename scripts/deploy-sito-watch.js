#!/usr/bin/env node

/**
 * Watch automatico per deploy sito gamestringer.ai
 * 
 * Monitora i file in docs/sito/ e esegue deploy automatico
 * quando ci sono cambiamenti (con debounce di 3 secondi)
 * 
 * Uso: node scripts/deploy-sito-watch.js
 */

const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

const watchPath = path.join(__dirname, '..', 'docs', 'sito');
let deployTimeout = null;
let isDeploying = false;

console.log('👀 Monitorando file in:', watchPath);
console.log('⏱️  Deploy automatico con debounce di 3 secondi');
console.log('🔄 Premi Ctrl+C per fermare\n');

// Esegui deploy
async function runDeploy() {
  if (isDeploying) {
    console.log('⏳ Deploy già in corso, attendo...');
    return;
  }

  isDeploying = true;
  console.log('\n🚀 Avvio deploy automatico...');
  
  exec('npm run deploy:sito', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    
    if (error) {
      console.error('❌ Deploy fallito:', error.message);
    } else {
      console.log('✅ Deploy completato');
    }
    
    isDeploying = false;
  });
}

// Configura watcher
const watcher = chokidar.watch(watchPath, {
  ignored: [
    /(^|[\/\\])\../,  // Ignora file nascosti
    'README.md',
    'README_HOSTING.md',
    'node_modules',
    '.git'
  ],
  persistent: true,
  ignoreInitial: true
});

watcher
  .on('change', (filePath) => {
    console.log(`📝 File modificato: ${path.relative(watchPath, filePath)}`);
    
    // Debounce: cancella timeout precedente e programma nuovo deploy
    if (deployTimeout) {
      clearTimeout(deployTimeout);
    }
    
    deployTimeout = setTimeout(() => {
      runDeploy();
    }, 3000); // 3 secondi di debounce
  })
  .on('add', (filePath) => {
    console.log(`➕ File aggiunto: ${path.relative(watchPath, filePath)}`);
    
    if (deployTimeout) {
      clearTimeout(deployTimeout);
    }
    
    deployTimeout = setTimeout(() => {
      runDeploy();
    }, 3000);
  })
  .on('error', (error) => {
    console.error('❌ Errore watcher:', error);
  });

// Gestione Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Arresto watcher...');
  watcher.close();
  process.exit(0);
});
