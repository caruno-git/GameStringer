const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "screenshot": "Screenshot",
    "zoomOut": "Riduci zoom",
    "zoomIn": "Aumenta zoom",
    "fitToScreen": "Adatta allo schermo",
    "download": "Download",
    "close": "Chiudi"
  },
  en: {
    "screenshot": "Screenshot",
    "zoomOut": "Zoom out",
    "zoomIn": "Zoom in",
    "fitToScreen": "Fit to screen",
    "download": "Download",
    "close": "Close"
  },
  es: {
    "screenshot": "Captura",
    "zoomOut": "Alejar",
    "zoomIn": "Acercar",
    "fitToScreen": "Ajustar a pantalla",
    "download": "Descargar",
    "close": "Cerrar"
  },
  fr: {
    "screenshot": "Capture",
    "zoomOut": "Dézoomer",
    "zoomIn": "Zoomer",
    "fitToScreen": "Ajuster à l'écran",
    "download": "Télécharger",
    "close": "Fermer"
  },
  de: {
    "screenshot": "Screenshot",
    "zoomOut": "Rauszoomen",
    "zoomIn": "Reinzoomen",
    "fitToScreen": "An Bildschirm anpassen",
    "download": "Herunterladen",
    "close": "Schließen"
  },
  ja: {
    "screenshot": "スクリーンショット",
    "zoomOut": "縮小",
    "zoomIn": "拡大",
    "fitToScreen": "画面に合わせる",
    "download": "ダウンロード",
    "close": "閉じる"
  },
  ko: {
    "screenshot": "스크린샷",
    "zoomOut": "축소",
    "zoomIn": "확대",
    "fitToScreen": "화면에 맞춤",
    "download": "다운로드",
    "close": "닫기"
  },
  zh: {
    "screenshot": "截图",
    "zoomOut": "缩小",
    "zoomIn": "放大",
    "fitToScreen": "适应屏幕",
    "download": "下载",
    "close": "关闭"
  },
  pt: {
    "screenshot": "Captura",
    "zoomOut": "Afastar",
    "zoomIn": "Aproximar",
    "fitToScreen": "Ajustar à tela",
    "download": "Baixar",
    "close": "Fechar"
  },
  ru: {
    "screenshot": "Скриншот",
    "zoomOut": "Отдалить",
    "zoomIn": "Приблизить",
    "fitToScreen": "По размеру экрана",
    "download": "Скачать",
    "close": "Закрыть"
  },
  pl: {
    "screenshot": "Zrzut ekranu",
    "zoomOut": "Pomniejsz",
    "zoomIn": "Powiększ",
    "fitToScreen": "Dopasuj do ekranu",
    "download": "Pobierz",
    "close": "Zamknij"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.common) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.common, keys);
    console.log(`✓ ${file}: aggiunte chiavi screenshot`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi screenshot aggiunte a tutti i file locale!');
