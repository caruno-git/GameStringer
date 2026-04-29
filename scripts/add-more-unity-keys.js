const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "selectGameFolder": "Seleziona cartella del gioco",
    "blobInk": "Blob Ink",
    "unique": "Uniche",
    "proceedToInjection": "Procedi all'Iniezione",
    "translationPreview": "Preview Traduzioni",
    "coveragePercent": "% copertura",
    "step1": "Seleziona la cartella <code>_Data</code> del gioco Unity",
    "step2": "Estrai le stringhe Ink (dialoghi) dai file assets",
    "extractionComplete": "Estrazione completata",
    "uniqueStringsFound": "{{count}} stringhe uniche trovate"
  },
  en: {
    "selectGameFolder": "Select game folder",
    "blobInk": "Ink Blobs",
    "unique": "Unique",
    "proceedToInjection": "Proceed to Injection",
    "translationPreview": "Translation Preview",
    "coveragePercent": "% coverage",
    "step1": "Select the Unity game <code>_Data</code> folder",
    "step2": "Extract Ink strings (dialogues) from assets files",
    "extractionComplete": "Extraction complete",
    "uniqueStringsFound": "{{count}} unique strings found"
  },
  es: {
    "selectGameFolder": "Selecciona carpeta del juego",
    "blobInk": "Blobs Ink",
    "unique": "Únicas",
    "proceedToInjection": "Proceder a la Inyección",
    "translationPreview": "Vista previa de traducción",
    "coveragePercent": "% cobertura",
    "step1": "Selecciona la carpeta <code>_Data</code> del juego Unity",
    "step2": "Extrae cadenas Ink (diálogos) de los archivos assets",
    "extractionComplete": "Extracción completada",
    "uniqueStringsFound": "{{count}} cadenas únicas encontradas"
  },
  fr: {
    "selectGameFolder": "Sélectionnez le dossier du jeu",
    "blobInk": "Blobs Ink",
    "unique": "Uniques",
    "proceedToInjection": "Procéder à l'Injection",
    "translationPreview": "Aperçu des traductions",
    "coveragePercent": "% couverture",
    "step1": "Sélectionnez le dossier <code>_Data</code> du jeu Unity",
    "step2": "Extrayez les chaînes Ink (dialogues) des fichiers assets",
    "extractionComplete": "Extraction terminée",
    "uniqueStringsFound": "{{count}} chaînes uniques trouvées"
  },
  de: {
    "selectGameFolder": "Spielordner auswählen",
    "blobInk": "Ink Blobs",
    "unique": "Eindeutig",
    "proceedToInjection": "Zur Injektion fortfahren",
    "translationPreview": "Übersetzungsvorschau",
    "coveragePercent": "% Abdeckung",
    "step1": "Wählen Sie den Unity-Spiel <code>_Data</code> Ordner",
    "step2": "Extrahieren Sie Ink-Zeichenfolgen (Dialoge) aus Asset-Dateien",
    "extractionComplete": "Extraktion abgeschlossen",
    "uniqueStringsFound": "{{count}} eindeutige Zeichenfolgen gefunden"
  },
  ja: {
    "selectGameFolder": "ゲームフォルダを選択",
    "blobInk": "Inkブロブ",
    "unique": "ユニーク",
    "proceedToInjection": "注入を続行",
    "translationPreview": "翻訳プレビュー",
    "coveragePercent": "% カバレッジ",
    "step1": "Unityゲームの<code>_Data</code>フォルダを選択",
    "step2": "アセットファイルからInk文字列（会話）を抽出",
    "extractionComplete": "抽出完了",
    "uniqueStringsFound": "{{count}}個のユニークな文字列が見つかりました"
  },
  ko: {
    "selectGameFolder": "게임 폴더 선택",
    "blobInk": "Ink 블롭",
    "unique": "고유",
    "proceedToInjection": "주입 진행",
    "translationPreview": "번역 미리보기",
    "coveragePercent": "% 커버리지",
    "step1": "Unity 게임의 <code>_Data</code> 폴더 선택",
    "step2": "에셋 파일에서 Ink 문자열(대화) 추출",
    "extractionComplete": "추출 완료",
    "uniqueStringsFound": "{{count}}개의 고유 문자열을 찾았습니다"
  },
  zh: {
    "selectGameFolder": "选择游戏文件夹",
    "blobInk": "Ink 块",
    "unique": "唯一",
    "proceedToInjection": "继续注入",
    "translationPreview": "翻译预览",
    "coveragePercent": "% 覆盖率",
    "step1": "选择 Unity 游戏的 <code>_Data</code> 文件夹",
    "step2": "从资源文件中提取 Ink 字符串（对话）",
    "extractionComplete": "提取完成",
    "uniqueStringsFound": "找到 {{count}} 个唯一字符串"
  },
  pt: {
    "selectGameFolder": "Selecione a pasta do jogo",
    "blobInk": "Blobs Ink",
    "unique": "Únicas",
    "proceedToInjection": "Proceder à Injeção",
    "translationPreview": "Pré-visualização de tradução",
    "coveragePercent": "% cobertura",
    "step1": "Selecione a pasta <code>_Data</code> do jogo Unity",
    "step2": "Extraia cadeias Ink (diálogos) dos arquivos de assets",
    "extractionComplete": "Extração concluída",
    "uniqueStringsFound": "{{count}} textos únicos encontrados"
  },
  ru: {
    "selectGameFolder": "Выберите папку игры",
    "blobInk": "Ink Blobs",
    "unique": "Уникальные",
    "proceedToInjection": "Перейти к внедрению",
    "translationPreview": "Предпросмотр перевода",
    "coveragePercent": "% покрытие",
    "step1": "Выберите папку <code>_Data</code> игры Unity",
    "step2": "Извлеките строки Ink (диалоги) из файлов ресурсов",
    "extractionComplete": "Извлечение завершено",
    "uniqueStringsFound": "Найдено {{count}} уникальных строк"
  },
  pl: {
    "selectGameFolder": "Wybierz folder gry",
    "blobInk": "Bloby Ink",
    "unique": "Unikalne",
    "proceedToInjection": "Przejdź do wstrzyknięcia",
    "translationPreview": "Podgląd tłumaczenia",
    "coveragePercent": "% pokrycia",
    "step1": "Wybierz folder <code>_Data</code> gry Unity",
    "step2": "Wyodrębnij ciągi Ink (dialogi) z plików zasobów",
    "extractionComplete": "Wyodrębnianie zakończone",
    "uniqueStringsFound": "Znaleziono {{count}} unikalnych ciągów"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.unityInkTranslator) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.unityInkTranslator, keys);
    console.log(`✓ ${file}: aggiunte chiavi aggiuntive`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi aggiuntive aggiunte a tutti i file locale!');
