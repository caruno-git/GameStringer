/**
 * Script per aggiungere le chiavi i18n per Ollama Advanced Features
 */

const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'lib', 'i18n', 'locales');

const newKeys = {
  ollama: {
    advancedFeatures: "Advanced Features",
    advancedDescription: "Unlock the full power of Ollama with GPU optimization, custom parameters, and multi-model ensemble",
    poweredByOllama: "Powered by Ollama",
    gpuAdvisor: "GPU Advisor",
    gpuAdvisorTitle: "GPU Advisor",
    gpuAdvisorDesc: "Detect your GPU and get model recommendations based on available VRAM",
    detectGPU: "Detect GPU",
    gpuDetected: "GPU Detected",
    gpuDetectionFailed: "GPU Detection Failed",
    gpuName: "GPU Name",
    totalVRAM: "Total VRAM",
    availableVRAM: "Available VRAM",
    cudaSupport: "CUDA Support",
    vramUsage: "VRAM Usage",
    recommendedModels: "Recommended Models",
    quality: "Quality",
    speed: "Speed",
    parameters: "Parameters",
    advancedParameters: "Advanced Parameters",
    parametersDesc: "Fine-tune your translation with temperature, top_p, top_k, and more",
    temperature: "Temperature",
    temperatureDesc: "Lower values = more focused, higher = more creative",
    topP: "Top P",
    topK: "Top K",
    repeatPenalty: "Repeat Penalty",
    preset: {
      precise: "Precise",
      balanced: "Balanced",
      creative: "Creative",
      fast: "Fast"
    },
    templates: "Templates",
    promptTemplates: "Prompt Templates",
    templatesDesc: "Game genre-specific prompt templates for better translations",
    systemPrompt: "System Prompt",
    examples: "Examples",
    ensemble: "Ensemble",
    ensembleTitle: "Multi-Model Ensemble",
    ensembleDesc: "Combine multiple models for better translation accuracy",
    howEnsembleWorks: "How Ensemble Works",
    ensembleExplanation: "Multiple models translate the same text, and votes determine the best output based on your strategy",
    selectModels: "Select Models",
    max3Models: "Maximum 3 models allowed",
    selectedCount: "Selected {{count}} of {{max}} models",
    votingStrategy: "Voting Strategy",
    bestQuality: "Best Quality",
    majorityVote: "Majority Vote",
    speedPriority: "Speed Priority",
    streaming: "Streaming",
    streamingTitle: "Streaming Translation",
    streamingDesc: "Real-time translation with token-by-token streaming",
    enterTextToTranslate: "Enter text to translate...",
    translation: "Translation",
    translationWillAppear: "Translation will appear here...",
    totalTokens: "Total Tokens",
    duration: "Duration",
    cache: "Cache",
    translationCache: "Translation Cache",
    cacheDesc: "Persistent SQLite cache for faster repeated translations",
    cachedTranslations: "Cached Translations",
    cacheSizeKB: "Cache Size (KB)",
    cacheHitRate: "Cache Hit Rate",
    clearCache: "Clear Cache",
    cacheCleared: "Cache cleared successfully",
    notRunning: "Ollama is not running",
    startToUseAdvanced: "Start Ollama to use advanced features",
    yes: "Yes",
    no: "No"
  },
  ollamaManagerPage: {
    advancedFeatures: "Advanced Features",
    goToAdvanced: "Go to Advanced"
  }
};

const locales = [
  'en.json', 'it.json', 'de.json', 'es.json', 'fr.json', 
  'ja.json', 'ko.json', 'pt.json', 'ru.json', 'zh.json', 'ar.json'
];

const translations = {
  'en.json': newKeys,
  'it.json': {
    ollama: {
      advancedFeatures: "Funzionalità Avanzate",
      advancedDescription: "Sblocca tutta la potenza di Ollama con ottimizzazione GPU, parametri personalizzati e ensemble multi-modello",
      poweredByOllama: "Powered by Ollama",
      gpuAdvisor: "GPU Advisor",
      gpuAdvisorTitle: "GPU Advisor",
      gpuAdvisorDesc: "Rileva la tua GPU e ricevi raccomandazioni basate sulla VRAM disponibile",
      detectGPU: "Rileva GPU",
      gpuDetected: "GPU Rilevata",
      gpuDetectionFailed: "Rilevamento GPU Fallito",
      gpuName: "Nome GPU",
      totalVRAM: "VRAM Totale",
      availableVRAM: "VRAM Disponibile",
      cudaSupport: "Supporto CUDA",
      vramUsage: "Utilizzo VRAM",
      recommendedModels: "Modelli Consigliati",
      quality: "Qualità",
      speed: "Velocità",
      parameters: "Parametri",
      advancedParameters: "Parametri Avanzati",
      parametersDesc: "Affina la traduzione con temperature, top_p, top_k e altro",
      temperature: "Temperature",
      temperatureDesc: "Valori bassi = più preciso, alti = più creativo",
      topP: "Top P",
      topK: "Top K",
      repeatPenalty: "Penalità Ripetizione",
      preset: {
        precise: "Preciso",
        balanced: "Bilanciato",
        creative: "Creativo",
        fast: "Veloce"
      },
      templates: "Template",
      promptTemplates: "Template di Prompt",
      templatesDesc: "Template specifici per genere di gioco per traduzioni migliori",
      systemPrompt: "Prompt di Sistema",
      examples: "Esempi",
      ensemble: "Ensemble",
      ensembleTitle: "Ensemble Multi-Modello",
      ensembleDesc: "Combina più modelli per migliorare l'accuratezza della traduzione",
      howEnsembleWorks: "Come Funziona Ensemble",
      ensembleExplanation: "Più modelli traducono lo stesso testo, e il voto determina il miglior output basato sulla tua strategia",
      selectModels: "Seleziona Modelli",
      max3Models: "Massimo 3 modelli consentiti",
      selectedCount: "Selezionati {{count}} di {{max}} modelli",
      votingStrategy: "Strategia di Voto",
      bestQuality: "Miglior Qualità",
      majorityVote: "Maggioranza",
      speedPriority: "Priorità Velocità",
      streaming: "Streaming",
      streamingTitle: "Traduzione Streaming",
      streamingDesc: "Traduzione in tempo reale token per token",
      enterTextToTranslate: "Inserisci testo da tradurre...",
      translation: "Traduzione",
      translationWillAppear: "La traduzione apparirà qui...",
      totalTokens: "Token Totali",
      duration: "Durata",
      cache: "Cache",
      translationCache: "Cache Traduzioni",
      cacheDesc: "Cache SQLite persistente per traduzioni ripetute più veloci",
      cachedTranslations: "Traduzioni in Cache",
      cacheSizeKB: "Dimensione Cache (KB)",
      cacheHitRate: "Hit Rate Cache",
      clearCache: "Svuota Cache",
      cacheCleared: "Cache svuotata con successo",
      notRunning: "Ollama non è in esecuzione",
      startToUseAdvanced: "Avvia Ollama per usare le funzionalità avanzate",
      yes: "Sì",
      no: "No"
    },
    ollamaManagerPage: {
      advancedFeatures: "Funzionalità Avanzate",
      goToAdvanced: "Vai ad Avanzate"
    }
  }
  // Per gli altri linguaggi userò l'inglese come fallback
};

function mergeDeep(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      mergeDeep(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

for (const locale of locales) {
  const filePath = path.join(localesDir, locale);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${locale} not found, skipping`);
    continue;
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const localeKey = locale;
  const translationsToUse = translations[localeKey] || translations['en.json'];
  
  mergeDeep(content, translationsToUse);
  
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
  console.log(`✅ Updated ${locale}`);
}

console.log('\n🎉 All locale files updated with Ollama Advanced keys!');
