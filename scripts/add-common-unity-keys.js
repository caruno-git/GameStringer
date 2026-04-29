const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "translateWithOllama": "Traduci con Ollama locale (hy-mt1.5, qwen, ecc.)",
    "injectWithAssetsTools": "Inietta le traduzioni con AssetsTools.NET"
  },
  en: {
    "translateWithOllama": "Translate with local Ollama (hy-mt1.5, qwen, etc.)",
    "injectWithAssetsTools": "Inject translations with AssetsTools.NET"
  },
  es: {
    "translateWithOllama": "Traduce con Ollama local (hy-mt1.5, qwen, etc.)",
    "injectWithAssetsTools": "Inyecta traducciones con AssetsTools.NET"
  },
  fr: {
    "translateWithOllama": "Traduisez avec Ollama local (hy-mt1.5, qwen, etc.)",
    "injectWithAssetsTools": "Injectez les traductions avec AssetsTools.NET"
  },
  de: {
    "translateWithOllama": "Übersetzen mit lokalem Ollama (hy-mt1.5, qwen, etc.)",
    "injectWithAssetsTools": "Injizieren Sie Übersetzungen mit AssetsTools.NET"
  },
  ja: {
    "translateWithOllama": "ローカルOllamaで翻訳（hy-mt1.5、qwenなど）",
    "injectWithAssetsTools": "AssetsTools.NETで翻訳を注入"
  },
  ko: {
    "translateWithOllama": "로컬 Ollama로 번역(hy-mt1.5, qwen 등)",
    "injectWithAssetsTools": "AssetsTools.NET으로 번역 주입"
  },
  zh: {
    "translateWithOllama": "使用本地 Ollama 翻译（hy-mt1.5、qwen 等）",
    "injectWithAssetsTools": "使用 AssetsTools.NET 注入翻译"
  },
  pt: {
    "translateWithOllama": "Traduza com Ollama local (hy-mt1.5, qwen, etc.)",
    "injectWithAssetsTools": "Injete traduções com AssetsTools.NET"
  },
  ru: {
    "translateWithOllama": "Переводите с локальным Ollama (hy-mt1.5, qwen и др.)",
    "injectWithAssetsTools": "Внедряйте переводы с AssetsTools.NET"
  },
  pl: {
    "translateWithOllama": "Tłumacz za pomocą lokalnego Ollama (hy-mt1.5, qwen itp.)",
    "injectWithAssetsTools": "Wstrzykuj tłumaczenia za pomocą AssetsTools.NET"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.common) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.common, keys);
    console.log(`✓ ${file}: aggiunte chiavi common`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi common aggiunte a tutti i file locale!');
