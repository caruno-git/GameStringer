/**
 * Adaptive Translation System - Real-time content analysis
 * Analizza il contenuto e suggerisce/sceglie automaticamente le impostazioni ottimali
 */

import { clientLogger } from '../client-logger';

export type ContentType = 
  | 'ui'           // UI elements, menu, buttons
  | 'dialogue'     // Character dialogue
  | 'narrative'    // Narrative text, descriptions
  | 'technical'    // Technical terms, documentation
  | 'humor'        // Jokes, puns, wordplay
  | 'poetry'       // Rhyme, meter, artistic
  | 'system'       // System messages, errors
  | 'item'         // Item names, stats
  | 'tutorial'     // Tutorial text, instructions
  | 'emotion';     // Emotional, dramatic scenes

export interface ContentAnalysis {
  type: ContentType;
  confidence: number;
  recommendedChain: string;
  recommendedPersona?: string;
  recommendedTone?: string;
  complexity: 'simple' | 'medium' | 'complex';
  urgency: 'low' | 'medium' | 'high';
  explanation: string;
}

interface ContentPattern {
  type: ContentType;
  patterns: RegExp[];
  weight: number;
}

const CONTENT_PATTERNS: ContentPattern[] = [
  {
    type: 'ui',
    patterns: [
      /^\[.*\]$/i,                    // [Button], [Menu]
      /^(Click|Press|Select|Choose)/i, // Action words
      /\b(Menu|Button|Option|Setting|Toggle)\b/i,
      /^[A-Z][a-z]+:$/i,              // Label:
    ],
    weight: 1.0,
  },
  {
    type: 'dialogue',
    patterns: [
      /^["'].*["']$/i,                // "Quoted text"
      /\b(said|replied|asked|shouted|whispered)\b/i,
      /^[A-Z][a-z]+:\s*["']/,        // Name: "text"
      /\b(I|you|he|she|we|they)\s+(will|would|can|could|should|must)\b/i,
    ],
    weight: 1.2,
  },
  {
    type: 'narrative',
    patterns: [
      /\b(Once upon|Long ago|In a|There was|There were)\b/i,
      /\b(suddenly|meanwhile|however|therefore|thus)\b/i,
      /[.]{3}$/i,                     // Trailing ellipsis
      /\b(story|tale|legend|history|chronicle)\b/i,
    ],
    weight: 1.1,
  },
  {
    type: 'technical',
    patterns: [
      /\b(CPU|GPU|RAM|API|URL|HTTP|JSON|XML)\b/i,
      /\b(version|update|patch|bug|fix|release)\b/i,
      /\d+\.\d+\.\d+/,                // Version numbers
      /\b(config|setting|parameter|variable)\b/i,
    ],
    weight: 0.9,
  },
  {
    type: 'humor',
    patterns: [
      /[!]{2,}/i,                     // Multiple !!!
      /\b(haha|lol|lmao|rofl)\b/i,
      /\b(joke|pun|funny|hilarious)\b/i,
      /\b(ironically|sarcastically)\b/i,
      /[?][!]|[!][?]/i,              // ?! or !?
    ],
    weight: 1.3,
  },
  {
    type: 'emotion',
    patterns: [
      /[!]{2,}/i,
      /[.]{3}/i,
      /\b(love|hate|angry|sad|happy|cry|tears|heart)\b/i,
      /\b(please|help|save|mercy|forgive)\b/i,
      /\b(death|die|kill|destroy|save|protect)\b/i,
    ],
    weight: 1.4,
  },
  {
    type: 'item',
    patterns: [
      /^\[.*\]\s+\+?\d+/i,            // [Item] +10
      /\b(damage|defense|speed|health|mana|level)\s*[:+]\s*\d+/i,
      /\b(rare|legendary|epic|common|uncommon)\b/i,
      /\b(sword|shield|potion|armor|ring|amulet)\b/i,
    ],
    weight: 0.8,
  },
  {
    type: 'tutorial',
    patterns: [
      /\b(How to|Tutorial|Guide|Step|Instruction)\b/i,
      /^(First|Next|Then|Finally|Lastly)/i,
      /\b(press|hold|click|drag|select)\s+\w+/i,
      /\b(tip|hint|note|remember|don't forget)\b/i,
    ],
    weight: 0.9,
  },
];

const CHAIN_RECOMMENDATIONS: Record<ContentType, string> = {
  ui: 'balanced',
  dialogue: 'creative',
  narrative: 'creative',
  technical: 'long_context',
  humor: 'creative',
  poetry: 'creative',
  system: 'balanced',
  item: 'balanced',
  tutorial: 'balanced',
  emotion: 'creative',
};

const PERSONA_RECOMMENDATIONS: Record<ContentType, string | undefined> = {
  ui: undefined,
  dialogue: undefined,
  narrative: 'a storyteller',
  technical: undefined,
  humor: 'a witty comedian',
  poetry: 'a poet',
  system: undefined,
  item: undefined,
  tutorial: 'a patient teacher',
  emotion: undefined,
};

const TONE_RECOMMENDATIONS: Record<ContentType, string | undefined> = {
  ui: 'technical',
  dialogue: undefined,
  narrative: 'epic',
  technical: 'technical',
  humor: 'humorous',
  poetry: 'romantic',
  system: 'formal',
  item: 'technical',
  tutorial: 'formal',
  emotion: 'dark',
};

/**
 * Analizza un testo per determinarne il tipo di contenuto
 */
export function analyzeContent(text: string): ContentAnalysis {
  const scores: Record<ContentType, number> = {
    ui: 0, dialogue: 0, narrative: 0, technical: 0,
    humor: 0, poetry: 0, system: 0, item: 0, tutorial: 0, emotion: 0,
  };

  // Calcola punteggi per ogni pattern
  for (const pattern of CONTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(text)) {
        scores[pattern.type] += pattern.weight;
      }
    }
  }

  // Bonus per lunghezza
  const wordCount = text.split(/\s+/).length;
  if (wordCount > 50) scores.narrative += 0.5;
  if (wordCount < 5) scores.ui += 0.5;

  // Trova il tipo con punteggio più alto
  let maxType: ContentType = 'dialogue';
  let maxScore = 0;
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = type as ContentType;
    }
  }

  // Calcola complessità
  let complexity: 'simple' | 'medium' | 'complex' = 'medium';
  if (wordCount < 10) complexity = 'simple';
  else if (wordCount > 100 || /\b(however|therefore|nevertheless|furthermore)\b/i.test(text)) {
    complexity = 'complex';
  }

  // Calcola urgenza (tempi verbali)
  let urgency: 'low' | 'medium' | 'high' = 'low';
  if (/\b(now|immediately|urgent|hurry|quick|fast|asap)\b/i.test(text)) {
    urgency = 'high';
  } else if (/\b(soon|shortly|coming up|prepare)\b/i.test(text)) {
    urgency = 'medium';
  }

  const confidence = Math.min(maxScore / 2, 1); // Normalizza a 0-1

  clientLogger.debug(`[AdaptiveTranslation] Analyzed: "${text.substring(0, 50)}..." → ${maxType} (confidence: ${confidence.toFixed(2)})`);

  return {
    type: maxType,
    confidence,
    recommendedChain: CHAIN_RECOMMENDATIONS[maxType],
    recommendedPersona: PERSONA_RECOMMENDATIONS[maxType],
    recommendedTone: TONE_RECOMMENDATIONS[maxType],
    complexity,
    urgency,
    explanation: `Detected ${maxType} content with ${complexity} complexity`,
  };
}

/**
 * Analizza un batch di testi e restituisce il tipo dominante
 */
export function analyzeBatch(texts: string[]): ContentAnalysis & { distribution: Record<ContentType, number> } {
  const analyses = texts.map(analyzeContent);
  const distribution: Record<ContentType, number> = {
    ui: 0, dialogue: 0, narrative: 0, technical: 0,
    humor: 0, poetry: 0, system: 0, item: 0, tutorial: 0, emotion: 0,
  };

  for (const analysis of analyses) {
    distribution[analysis.type]++;
  }

  // Trova tipo dominante
  let dominantType: ContentType = 'dialogue';
  let maxCount = 0;
  
  for (const [type, count] of Object.entries(distribution)) {
    if (count > maxCount) {
      maxCount = count;
      dominantType = type as ContentType;
    }
  }

  const dominantAnalysis = analyses.find(a => a.type === dominantType)!;
  const percentage = (maxCount / texts.length) * 100;

  return {
    ...dominantAnalysis,
    distribution,
    explanation: `${percentage.toFixed(0)}% ${dominantType} content detected`,
  };
}

/**
 * Suggerisce le impostazioni ottimali per una traduzione
 */
export function suggestTranslationSettings(
  text: string,
  currentChain?: string,
  currentPersona?: string,
  currentTone?: string
): {
  shouldAdapt: boolean;
  suggestions: {
    chain?: string;
    persona?: string;
    tone?: string;
  };
  analysis: ContentAnalysis;
} {
  const analysis = analyzeContent(text);
  const suggestions: { chain?: string; persona?: string; tone?: string } = {};
  let shouldAdapt = false;

  // Suggerisci chain se diverso da quello corrente
  if (currentChain && currentChain !== analysis.recommendedChain) {
    suggestions.chain = analysis.recommendedChain;
    shouldAdapt = true;
  }

  // Suggerisci persona se utile e diversa
  if (analysis.recommendedPersona && analysis.recommendedPersona !== currentPersona) {
    suggestions.persona = analysis.recommendedPersona;
    shouldAdapt = true;
  }

  // Suggerisci tone se utile e diverso
  if (analysis.recommendedTone && analysis.recommendedTone !== currentTone) {
    suggestions.tone = analysis.recommendedTone;
    shouldAdapt = true;
  }

  return { shouldAdapt, suggestions, analysis };
}

/**
 * Applica automaticamente le impostazioni suggerite
 */
export function autoAdaptSettings(
  text: string,
  setChain: (chain: string) => void,
  setPersona: (persona: string) => void,
  setTone: (tone: string) => void
): ContentAnalysis {
  const analysis = analyzeContent(text);
  
  setChain(analysis.recommendedChain);
  
  if (analysis.recommendedPersona) {
    setPersona(analysis.recommendedPersona);
  }
  
  if (analysis.recommendedTone) {
    setTone(analysis.recommendedTone);
  }

  clientLogger.info(`[AdaptiveTranslation] Auto-adapted to ${analysis.type} mode`);
  
  return analysis;
}

