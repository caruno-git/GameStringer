const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const translations = {
  it: { "apiKeys": "API Keys" },
  en: { "apiKeys": "API Keys" },
  es: { "apiKeys": "Claves API" },
  fr: { "apiKeys": "Clés API" },
  de: { "apiKeys": "API-Schlüssel" },
  ja: { "apiKeys": "APIキー" },
  ko: { "apiKeys": "API 키" },
  zh: { "apiKeys": "API密钥" },
  pt: { "apiKeys": "Chaves API" },
  ru: { "apiKeys": "API-ключи" },
  pl: { "apiKeys": "Klucze API" }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.voiceClone) data.voiceClone = {};
  Object.assign(data.voiceClone, translations[lang] || translations.en);
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`✓ ${file}: aggiunta chiave apiKeys a voiceClone`);
});

console.log('\n✅ Chiavi voiceClone aggiornate!');
