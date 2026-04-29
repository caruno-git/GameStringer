const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

// Carica il file italiano come riferimento
const itFile = path.join(localesDir, 'it.json');
const itData = JSON.parse(fs.readFileSync(itFile, 'utf8'));

console.log('🔄 Sincronizzazione Locale Files\n');
console.log(`File di riferimento: it.json (${Object.keys(itData).length} chiavi top-level)\n`);

// Funzione per ottenere tutte le chiavi di un oggetto
function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Funzione per impostare un valore in un oggetto annidato
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

// Funzione per ottenere un valore da un oggetto annidato
function getNestedValue(obj, keyPath) {
  const keys = keyPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return current;
}

// Sincronizza ogni file
let totalAdded = 0;

files.forEach(file => {
  if (file === 'it.json') return;
  
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const lang = file.replace('.json', '');
  
  let added = 0;
  const allItKeys = getAllKeys(itData);
  
  for (const keyPath of allItKeys) {
    const existingValue = getNestedValue(data, keyPath);
    if (existingValue === undefined) {
      // Copia il valore italiano come fallback
      const itValue = getNestedValue(itData, keyPath);
      setNestedValue(data, keyPath, itValue);
      added++;
    }
  }
  
  if (added > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`${file}: +${added} chiavi aggiunte`);
    totalAdded += added;
  } else {
    console.log(`${file}: ✓ già completo`);
  }
});

console.log(`\n📊 Totale: ${totalAdded} chiavi aggiunte in tutti i file`);
console.log('\n✅ Sincronizzazione completata!');
console.log('\nNota: Le chiavi aggiunte contengono il testo italiano come placeholder.');
console.log('Per tradurre, modifica i valori nei file .json per ogni lingua.');
