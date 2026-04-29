const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "advancedSettings": "Impostazioni Avanzate",
    "contextSensitivity": "Sensibilità Contesto",
    "creativityLevel": "Livello Creatività"
  },
  en: {
    "advancedSettings": "Advanced Settings",
    "contextSensitivity": "Context Sensitivity",
    "creativityLevel": "Creativity Level"
  },
  es: {
    "advancedSettings": "Configuración Avanzada",
    "contextSensitivity": "Sensibilidad al Contexto",
    "creativityLevel": "Nivel de Creatividad"
  },
  fr: {
    "advancedSettings": "Paramètres Avancés",
    "contextSensitivity": "Sensibilité au Contexte",
    "creativityLevel": "Niveau de Créativité"
  },
  de: {
    "advancedSettings": "Erweiterte Einstellungen",
    "contextSensitivity": "Kontextsensitivität",
    "creativityLevel": "Kreativitätslevel"
  },
  ja: {
    "advancedSettings": "詳細設定",
    "contextSensitivity": "コンテキスト感度",
    "creativityLevel": "創造性レベル"
  },
  ko: {
    "advancedSettings": "고급 설정",
    "contextSensitivity": "컨텍스트 민감도",
    "creativityLevel": "창의성 수준"
  },
  zh: {
    "advancedSettings": "高级设置",
    "contextSensitivity": "上下文敏感度",
    "creativityLevel": "创意级别"
  },
  pt: {
    "advancedSettings": "Configurações Avançadas",
    "contextSensitivity": "Sensibilidade ao Contexto",
    "creativityLevel": "Nível de Criatividade"
  },
  ru: {
    "advancedSettings": "Расширенные настройки",
    "contextSensitivity": "Чувствительность к контексту",
    "creativityLevel": "Уровень Креативности"
  },
  pl: {
    "advancedSettings": "Ustawienia Zaawansowane",
    "contextSensitivity": "Czułość Kontekstowa",
    "creativityLevel": "Poziom Kreatywności"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.contextAwareTranslation) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.contextAwareTranslation, keys);
    console.log(`✓ ${file}: aggiunte chiavi contextAwareTranslation`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi aggiunte a tutti i file locale!');
