const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "stories": "Storie",
    "launchToVerify": "Avvia il gioco per verificare!"
  },
  en: {
    "stories": "Stories",
    "launchToVerify": "Launch the game to verify!"
  },
  es: {
    "stories": "Historias",
    "launchToVerify": "¡Inicia el juego para verificar!"
  },
  fr: {
    "stories": "Histoires",
    "launchToVerify": "Lancez le jeu pour vérifier!"
  },
  de: {
    "stories": "Geschichten",
    "launchToVerify": "Starten Sie das Spiel zum Überprüfen!"
  },
  ja: {
    "stories": "ストーリー",
    "launchToVerify": "ゲームを起動して確認してください!"
  },
  ko: {
    "stories": "스토리",
    "launchToVerify": "게임을 시작하여 확인하세요!"
  },
  zh: {
    "stories": "故事",
    "launchToVerify": "启动游戏以验证!"
  },
  pt: {
    "stories": "Histórias",
    "launchToVerify": "Inicie o jogo para verificar!"
  },
  ru: {
    "stories": "Истории",
    "launchToVerify": "Запустите игру для проверки!"
  },
  pl: {
    "stories": "Historie",
    "launchToVerify": "Uruchom grę, aby zweryfikować!"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.unityInkTranslator) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.unityInkTranslator, keys);
    console.log(`✓ ${file}: aggiunte chiavi stories e launchToVerify`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi aggiunte a tutti i file locale!');
