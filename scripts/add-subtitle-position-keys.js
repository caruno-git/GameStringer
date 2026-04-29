const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const positionKeys = {
  it: {
    "positionTop": "Alto",
    "positionCenter": "Centro",
    "positionBottom": "Basso",
    "positionAbove": "Sopra",
    "positionBelow": "Sotto",
    "positionInline": "In linea"
  },
  en: {
    "positionTop": "Top",
    "positionCenter": "Center",
    "positionBottom": "Bottom",
    "positionAbove": "Above",
    "positionBelow": "Below",
    "positionInline": "Inline"
  },
  es: {
    "positionTop": "Arriba",
    "positionCenter": "Centro",
    "positionBottom": "Abajo",
    "positionAbove": "Encima",
    "positionBelow": "Debajo",
    "positionInline": "En línea"
  },
  fr: {
    "positionTop": "Haut",
    "positionCenter": "Centre",
    "positionBottom": "Bas",
    "positionAbove": "Au-dessus",
    "positionBelow": "En-dessous",
    "positionInline": "En ligne"
  },
  de: {
    "positionTop": "Oben",
    "positionCenter": "Mitte",
    "positionBottom": "Unten",
    "positionAbove": "Darüber",
    "positionBelow": "Darunter",
    "positionInline": "Inline"
  },
  ja: {
    "positionTop": "上",
    "positionCenter": "中央",
    "positionBottom": "下",
    "positionAbove": "上に",
    "positionBelow": "下に",
    "positionInline": "インライン"
  },
  ko: {
    "positionTop": "상단",
    "positionCenter": "중앙",
    "positionBottom": "하단",
    "positionAbove": "위",
    "positionBelow": "아래",
    "positionInline": "인라인"
  },
  zh: {
    "positionTop": "顶部",
    "positionCenter": "居中",
    "positionBottom": "底部",
    "positionAbove": "上方",
    "positionBelow": "下方",
    "positionInline": "内联"
  },
  pt: {
    "positionTop": "Topo",
    "positionCenter": "Centro",
    "positionBottom": "Fundo",
    "positionAbove": "Acima",
    "positionBelow": "Abaixo",
    "positionInline": "Em linha"
  },
  ru: {
    "positionTop": "Верх",
    "positionCenter": "Центр",
    "positionBottom": "Низ",
    "positionAbove": "Над",
    "positionBelow": "Под",
    "positionInline": "В строке"
  },
  pl: {
    "positionTop": "Góra",
    "positionCenter": "Środek",
    "positionBottom": "Dół",
    "positionAbove": "Powyżej",
    "positionBelow": "Poniżej",
    "positionInline": "W linii"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.subtitleOverlay) {
    const keys = positionKeys[lang] || positionKeys.en;
    Object.assign(data.subtitleOverlay, keys);
    console.log(`✓ ${file}: aggiunte chiavi posizione a subtitleOverlay`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi posizione sottotitoli aggiunte a tutti i file locale!');
