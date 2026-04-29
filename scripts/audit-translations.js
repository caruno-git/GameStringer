const fs = require('fs');
const path = require('path');

// Configurazione
const COMPONENTS_DIR = path.join(__dirname, '..', 'components');
const LOCALES_DIR = path.join(__dirname, '..', 'lib', 'i18n', 'locales');

// Pattern per trovare stringhe hardcoded
const HARDCODED_PATTERNS = [
  // Stringhe tra JSX tags: >Stringa non tradotta<
  />([A-Z][a-zA-Z\s]{2,50})</g,
  // Placeholder, label, title, aria-label con valori hardcoded
  /placeholder=["']([A-Z][a-zA-Z\s]{2,50})["']/g,
  /label=["']([A-Z][a-zA-Z\s]{2,50})["']/g,
  /title=["']([A-Z][a-zA-Z\s]{2,50})["']/g,
  /aria-label=["']([A-Z][a-zA-Z\s]{2,50})["']/g,
  // Altri testi comuni
  /toast\.\w+\(["']([A-Z][a-zA-Z\s]{2,100})["']/g,
  /TooltipContent>\s*([A-Z][a-zA-Z\s]{2,50})\s*<\/TooltipContent>/g,
];

// Parole da ignorare (nomi propri, termini tecnici, ecc.)
const IGNORE_LIST = [
  'GameStringer', 'Steam', 'Epic', 'GOG', 'Unity', 'Unreal', 'Godot',
  'RPG Maker', "Ren'Py", 'Danganronpa', 'Bethesda', 'CRI', 'Ollama',
  'GPT-4', 'Claude', 'Gemini', 'DeepSeek', 'HY-MT', 'TranslateGemma',
  'XUnity', 'BepInEx', 'Tauri', 'Next.js', 'React', 'TypeScript',
  'Rust', 'Supabase', 'Postgres', 'SQL', 'BSA', 'BA2', 'ESP', 'ESM',
  'CPK', 'CRILAYLA', 'MSG', 'BMD', 'FTD', 'Shift-JIS', 'UTF-8', 'UTF-16',
  'True', 'False', 'null', 'undefined', 'TODO', 'FIXME', 'OK', 'URL',
  'ID', 'API', 'UI', 'AI', 'TM', 'GPT', 'OCR', 'TTS', 'LLM', 'VRAM',
  'GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'GB', 'MB', 'KB', 'TB', 'px',
  'v1', 'v2', 'x64', 'x86', 'x32', 'ARM64', 'aarch64', 'HTTPS', 'HTTP',
  'CSS', 'HTML', 'JS', 'TS', 'JSX', 'TSX', 'JSON', 'CSV', 'XML', 'YAML',
  'PNG', 'JPG', 'JPEG', 'GIF', 'SVG', 'ICO', 'PDF', 'ZIP', 'RAR', '7Z',
  'GitHub', 'Git', 'npm', 'yarn', 'pnpm', 'npx', 'CLI', 'GUI',
];

const results = {
  hardcodedStrings: [],
  filesAnalyzed: 0,
  totalMatches: 0,
};

// Funzione per verificare se una stringa deve essere ignorata
function shouldIgnore(str) {
  const trimmed = str.trim();
  if (trimmed.length < 3) return true;
  if (/^\d+$/.test(trimmed)) return true; // Solo numeri
  if (/^v\d+\.\d+/.test(trimmed)) return true; // Versioni
  if (IGNORE_LIST.some(ignore => trimmed.includes(ignore))) return true;
  return false;
}

// Funzione ricorsiva per trovare file .tsx
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !item.includes('node_modules')) {
      findTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Analizza un file
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(process.cwd(), filePath);
  const matches = [];

  // Cerca pattern hardcoded
  for (const pattern of HARDCODED_PATTERNS) {
    let match;
    const regex = new RegExp(pattern);
    while ((match = regex.exec(content)) !== null) {
      const str = match[1] || match[2];
      if (str && !shouldIgnore(str)) {
        // Verifica che non sia già tradotto (non deve contenere t(' o t(")
        const contextStart = Math.max(0, match.index - 200);
        const context = content.substring(contextStart, match.index);
        if (!context.includes("t('") && !context.includes('t("') && !context.includes('t(`')) {
          matches.push({
            string: str.trim(),
            line: content.substring(0, match.index).split('\n').length,
            context: content.substring(Math.max(0, match.index - 50), match.index + str.length + 50).replace(/\n/g, ' '),
          });
        }
      }
    }
  }

  if (matches.length > 0) {
    results.hardcodedStrings.push({
      file: relativePath,
      matches: matches,
    });
    results.totalMatches += matches.length;
  }

  results.filesAnalyzed++;
}

// Esegui analisi
console.log('🔍 Audit Traduzioni - GameStringer\n');
console.log('Analizzo componenti React...\n');

const tsxFiles = findTsxFiles(COMPONENTS_DIR);
for (const file of tsxFiles) {
  analyzeFile(file);
}

// Ordina per numero di match
results.hardcodedStrings.sort((a, b) => b.matches.length - a.matches.length);

// Report
console.log(`📊 RISULTATI AUDIT:\n`);
console.log(`File analizzati: ${results.filesAnalyzed}`);
console.log(`File con stringhe hardcoded: ${results.hardcodedStrings.length}`);
console.log(`Totali stringhe potenziali: ${results.totalMatches}\n`);

if (results.hardcodedStrings.length > 0) {
  console.log(`⚠️  FILE CON STRINGHE HARDCODED (top 30):\n`);
  
  results.hardcodedStrings.slice(0, 30).forEach((item, idx) => {
    console.log(`${idx + 1}. ${item.file} (${item.matches.length} stringhe)`);
    item.matches.slice(0, 5).forEach(m => {
      console.log(`   L${m.line}: "${m.string.substring(0, 60)}${m.string.length > 60 ? '...' : ''}"`);
    });
    if (item.matches.length > 5) {
      console.log(`   ... e altre ${item.matches.length - 5} stringhe`);
    }
    console.log('');
  });

  // Salva report completo
  const reportPath = path.join(__dirname, '..', 'translation-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📄 Report completo salvato in: ${reportPath}`);
} else {
  console.log('✅ Nessuna stringa hardcoded trovata! Tutto è tradotto.');
}

// Verifica locale files
console.log('\n📁 Verifica file di localizzazione...\n');
const localeFiles = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.json'));
const itContent = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, 'it.json'), 'utf8'));

let missingInOther = [];
localeFiles.forEach(file => {
  if (file === 'it.json') return;
  const content = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, file), 'utf8'));
  const missing = [];
  
  function findMissingKeys(obj, path = '') {
    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (!content[key]) {
          missing.push(currentPath);
        } else {
          findMissingKeys(obj[key], currentPath);
        }
      } else if (!content[key]) {
        missing.push(currentPath);
      }
    }
  }
  
  findMissingKeys(itContent);
  if (missing.length > 0) {
    missingInOther.push({
      file: file,
      missingKeys: missing.slice(0, 20),
      totalMissing: missing.length,
    });
  }
});

if (missingInOther.length > 0) {
  console.log(`⚠️  CHIAVI MANCANTI NEI FILE LOCALE:\n`);
  missingInOther.forEach(item => {
    console.log(`${item.file}: ${item.totalMissing} chiavi mancanti`);
    item.missingKeys.forEach(k => console.log(`  - ${k}`));
    if (item.totalMissing > 20) {
      console.log(`  ... e altre ${item.totalMissing - 20} chiavi`);
    }
    console.log('');
  });
} else {
  console.log('✅ Tutti i file locale sono completi e sincronizzati!');
}
