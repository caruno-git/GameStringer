const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const additionalKeys = {
  it: {
    "transcribeTranslateGameAudio": "Trascrivi e traduci audio e dialoghi di gioco",
    "configureRecordingTranslation": "Configura le opzioni di registrazione e traduzione",
    "realTimeTranscription": "Trascrizione in tempo reale",
    "enableTextToSpeech": "Abilita Text-to-Speech",
    "voiceSpeed": "Velocità voce",
    "voicePitch": "Tono voce",
    "saveSettings": "Salva Impostazioni",
    "audioControls": "Controlli Audio",
    "microphone": "Microfono"
  },
  en: {
    "transcribeTranslateGameAudio": "Transcribe and translate game audio and dialogues",
    "configureRecordingTranslation": "Configure recording and translation options",
    "realTimeTranscription": "Real-time Transcription",
    "enableTextToSpeech": "Enable Text-to-Speech",
    "voiceSpeed": "Voice Speed",
    "voicePitch": "Voice Pitch",
    "saveSettings": "Save Settings",
    "audioControls": "Audio Controls",
    "microphone": "Microphone"
  },
  es: {
    "transcribeTranslateGameAudio": "Transcribe y traduce audio y diálogos del juego",
    "configureRecordingTranslation": "Configura opciones de grabación y traducción",
    "realTimeTranscription": "Transcripción en tiempo real",
    "enableTextToSpeech": "Habilitar texto a voz",
    "voiceSpeed": "Velocidad de voz",
    "voicePitch": "Tono de voz",
    "saveSettings": "Guardar configuración",
    "audioControls": "Controles de audio",
    "microphone": "Micrófono"
  },
  fr: {
    "transcribeTranslateGameAudio": "Transcrire et traduire l'audio et les dialogues du jeu",
    "configureRecordingTranslation": "Configurer les options d'enregistrement et de traduction",
    "realTimeTranscription": "Transcription en temps réel",
    "enableTextToSpeech": "Activer la synthèse vocale",
    "voiceSpeed": "Vitesse de la voix",
    "voicePitch": "Tonalité de la voix",
    "saveSettings": "Enregistrer les paramètres",
    "audioControls": "Contrôles audio",
    "microphone": "Microphone"
  },
  de: {
    "transcribeTranslateGameAudio": "Transkribieren und übersetzen Sie Spiel-Audio und Dialoge",
    "configureRecordingTranslation": "Aufnahme- und Übersetzungsoptionen konfigurieren",
    "realTimeTranscription": "Echtzeit-Transkription",
    "enableTextToSpeech": "Text-to-Speech aktivieren",
    "voiceSpeed": "Sprechgeschwindigkeit",
    "voicePitch": "Stimmlage",
    "saveSettings": "Einstellungen speichern",
    "audioControls": "Audio-Steuerung",
    "microphone": "Mikrofon"
  },
  ja: {
    "transcribeTranslateGameAudio": "ゲームの音声と会話を文字起こしして翻訳",
    "configureRecordingTranslation": "録音と翻訳のオプションを設定",
    "realTimeTranscription": "リアルタイム文字起こし",
    "enableTextToSpeech": "テキスト読み上げを有効化",
    "voiceSpeed": "音声速度",
    "voicePitch": "音声の高低",
    "saveSettings": "設定を保存",
    "audioControls": "音声コントロール",
    "microphone": "マイク"
  },
  ko: {
    "transcribeTranslateGameAudio": "게임 오디오와 대화를 전사하고 번역",
    "configureRecordingTranslation": "녹음 및 번역 옵션 구성",
    "realTimeTranscription": "실시간 전사",
    "enableTextToSpeech": "텍스트 음성 변환 활성화",
    "voiceSpeed": "음성 속도",
    "voicePitch": "음성 높낮이",
    "saveSettings": "설정 저장",
    "audioControls": "오디오 제어",
    "microphone": "마이크"
  },
  zh: {
    "transcribeTranslateGameAudio": "转录并翻译游戏音频和对话",
    "configureRecordingTranslation": "配置录音和翻译选项",
    "realTimeTranscription": "实时转录",
    "enableTextToSpeech": "启用文字转语音",
    "voiceSpeed": "语音速度",
    "voicePitch": "语音音调",
    "saveSettings": "保存设置",
    "audioControls": "音频控制",
    "microphone": "麦克风"
  },
  pt: {
    "transcribeTranslateGameAudio": "Transcreva e traduza áudio e diálogos do jogo",
    "configureRecordingTranslation": "Configurar opções de gravação e tradução",
    "realTimeTranscription": "Transcrição em tempo real",
    "enableTextToSpeech": "Ativar texto para fala",
    "voiceSpeed": "Velocidade da voz",
    "voicePitch": "Tom da voz",
    "saveSettings": "Salvar configurações",
    "audioControls": "Controles de áudio",
    "microphone": "Microfone"
  },
  ru: {
    "transcribeTranslateGameAudio": "Транскрибируйте и переводите игровое аудио и диалоги",
    "configureRecordingTranslation": "Настроить параметры записи и перевода",
    "realTimeTranscription": "Транскрипция в реальном времени",
    "enableTextToSpeech": "Включить текст в речь",
    "voiceSpeed": "Скорость голоса",
    "voicePitch": "Высота голоса",
    "saveSettings": "Сохранить настройки",
    "audioControls": "Управление аудио",
    "microphone": "Микрофон"
  },
  pl: {
    "transcribeTranslateGameAudio": "Transkrybuj i tłumacz audio i dialogi gry",
    "configureRecordingTranslation": "Konfiguruj opcje nagrywania i tłumaczenia",
    "realTimeTranscription": "Transkrypcja w czasie rzeczywistym",
    "enableTextToSpeech": "Włącz zamiany tekstu na mowę",
    "voiceSpeed": "Prędkość głosu",
    "voicePitch": "Ton głosu",
    "saveSettings": "Zapisz ustawienia",
    "audioControls": "Kontrola audio",
    "microphone": "Mikrofon"
  }
};

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (data.common) {
    const keys = additionalKeys[lang] || additionalKeys.en;
    Object.assign(data.common, keys);
    console.log(`✓ ${file}: aggiunte chiavi common audio`);
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
});

console.log('\n✅ Chiavi common audio aggiunte a tutti i file locale!');
