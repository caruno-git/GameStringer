#!/usr/bin/env node

/**
 * Deploy automatico SFTP per sito gamestringer.ai su Ionos
 * 
 * Uso:
 * 1. Imposta le variabili d'ambiente nel file .env.local:
 *    FTP_HOST=ftp.tuo-dominio.com
 *    FTP_USER=tuo-username
 *    FTP_PASSWORD=tua-password
 *    FTP_PATH=/ (o il percorso remoto)
 * 
 * 2. Esegui: node scripts/deploy-sito.js
 */

const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');
const { glob } = require('glob');

// Carica variabili d'ambiente
require('dotenv').config({ path: '.env.local' });

const config = {
  host: process.env.FTP_HOST || 'ftp.gamestringer.ai',
  user: process.env.FTP_USER || '',
  password: process.env.FTP_PASSWORD || '',
  port: 22, // Porta SFTP
  localRoot: path.join(__dirname, '..', 'docs', 'sito'),
  remoteRoot: process.env.FTP_PATH || '/'
};

async function deploy() {
  const sftp = new SftpClient();

  try {
    console.log('🔌 Connessione al server SFTP...');
    await sftp.connect({
      host: config.host,
      username: config.user,
      password: config.password,
      port: config.port,
      readyTimeout: 20000
    });

    console.log(`✅ Connesso a ${config.host}:${config.port}`);
    console.log(`📂 Cartella locale: ${config.localRoot}`);
    console.log(`🌂 Cartella remota: ${config.remoteRoot}`);

    // Ottieni tutti i file da caricare
    const files = await glob('**/*', {
      cwd: config.localRoot,
      nodir: true,
      ignore: ['README.md', 'README_HOSTING.md', '.git', '.gitignore', 'node_modules']
    });

    console.log(`📦 Trovati ${files.length} file da caricare`);

    let uploaded = 0;
    let failed = 0;

    for (const file of files) {
      const localPath = path.join(config.localRoot, file);
      const remotePath = path.posix.join(config.remoteRoot, file.replace(/\\/g, '/'));
      const remoteDir = path.posix.dirname(remotePath);

      try {
        // Crea directory remote se necessario
        try {
          await sftp.mkdir(remoteDir, true);
        } catch (err) {
          // Directory potrebbe già esistere
        }
        
        // Carica il file
        await sftp.fastPut(localPath, remotePath);
        console.log(`✅ Uploaded: ${file}`);
        uploaded++;
      } catch (err) {
        console.error(`❌ Errore upload ${file}:`, err.message);
        failed++;
      }
    }

    console.log('\n📊 Riepilogo:');
    console.log(`✅ Caricati: ${uploaded}`);
    console.log(`❌ Falliti: ${failed}`);
    console.log(`📁 Totali: ${files.length}`);

    if (failed === 0) {
      console.log('\n🎉 Deploy completato con successo!');
    } else {
      console.log('\n⚠️ Deploy completato con errori');
    }

  } catch (err) {
    console.error('❌ Errore durante il deploy:', err);
    process.exit(1);
  } finally {
    await sftp.end();
  }
}

deploy();
