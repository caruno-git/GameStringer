const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "translateTo": "Traduci in",
    "uploadAudioFile": "Carica File Audio",
    "processing": "Elaborazione",
    "transcriptions": "Trascrizioni",
    "translations": "Traduzioni"
  },
  en: {
    "translateTo": "Translate to",
    "uploadAudioFile": "Upload Audio File",
    "processing": "Processing",
    "transcriptions": "Transcriptions",
    "translations": "Translations"
  },
  es: {
    "translateTo": "Traducir a",
    "uploadAudioFile": "Subir archivo de audio",
    "processing": "Procesando",
    "transcriptions": "Transcripciones",
    "translations": "Traducciones"
  },
  fr: {
    "translateTo": "Traduire en",
    "uploadAudioFile": "Télécharger fichier audio",
    "processing": "Traitement",
    "transcriptions": "Transcriptions",
    "translations": "Traductions"
  },
  de: {
    "translateTo": "Übersetzen in",
    "uploadAudioFile": "Audio-Datei hochladen",
    "processing": "Verarbeitung",
    "transcriptions": "Transkriptionen",
    "translations": "Übersetzungen"
  },
  ja: {
    "translateTo": "翻訳先",
    "uploadAudioFile": "音声ファイルをアップロード",
    "processing": "処理中",
    "transcriptions": "文字起こし",
    "translations": "翻訳"
  },
  ko: {
    "translateTo": "번역 대상",
    "uploadAudioFile": "오디오 파일 업로드",
    "processing": "처리 중",
    "transcriptions": "전사",
    "translations": "번역"
  },
  zh: {
    "translateTo": "翻译为",
    "uploadAudioFile": "上传音频文件",
    "processing": "处理中",
    "transcriptions": "转录",
    "translations": "翻译"
  },
  pt: {
    "translateTo": "Traduzir para",
    "uploadAudioFile": "Carregar arquivo de áudio",
    "processing": "Processando",
    "transcriptions": "Transcrições",
    "translations": "Traduções"
  },
  ru: {
    "translateTo": "Перевести на",
    "uploadAudioFile": "Загрузить аудиофайл",
    "processing": "Обработка",
    "transcriptions": "Транскрипции",
    "translations": "Переводы"
  },
  pl: {
    "translateTo": "Przetłumacz na",
    "uploadAudioFile": "Prześlij plik audio",
    "processing": "Przetwarzanie",
    "transcriptions": "Transkrypcje",
    "translations": "Tłumaczenia"
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
