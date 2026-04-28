/**
 * 🎙️ Voice Profiles — Character Style Preservation System
 * 
 * Estrae e gestisce profili di "voce" per i personaggi dei giochi,
 * permettendo di preservare il tono, lo stile e la personalità
 * durante la traduzione.
 * 
 * Funzionalità:
 * - Estrazione automatica profili da stringhe di dialogo
 * - Profili manuali con attributi personalizzabili
 * - Iniezione nel prompt di traduzione via persona/tone
 * - Persistenza per gioco in localStorage
 * - Integrazione con emotion-analyzer per stile dinamico
 */

import { clientLogger } from '@/lib/client-logger';

// ============================================================================
// TYPES
// ============================================================================

export type VoiceTone = 
  | 'formal' | 'casual' | 'aggressive' | 'gentle' 
  | 'mysterious' | 'comedic' | 'dramatic' | 'stoic'
  | 'sarcastic' | 'wise' | 'childish' | 'noble'
  | 'pirate' | 'military' | 'academic' | 'street';

export type VoiceFormality = 'very_formal' | 'formal' | 'neutral' | 'informal' | 'very_informal';

export type VoiceAgeGroup = 'child' | 'teen' | 'young_adult' | 'adult' | 'elder';

export interface VoiceProfile {
  id: string;
  gameId: string;
  characterName: string;
  
  // Core attributes
  tone: VoiceTone;
  formality: VoiceFormality;
  ageGroup: VoiceAgeGroup;
  
  // Style descriptors
  personality: string;       // e.g., "A wise old wizard who speaks in riddles"
  speechPatterns: string[];  // e.g., ["Uses archaic words", "Speaks slowly", "References nature"]
  catchphrases: string[];    // e.g., ["By the gods!", "Hmm, interesting..."]
  avoidPatterns: string[];   // e.g., ["Never uses contractions", "Avoids slang"]
  
  // Sample dialogues for LLM context
  sampleDialogues: string[]; // Original language examples of this character's speech
  
  // Metadata
  autoExtracted: boolean;    // true if extracted automatically
  confidence: number;        // 0-1, how confident the extraction is
  createdAt: number;
  updatedAt: number;
}

export interface VoiceProfileCollection {
  gameId: string;
  profiles: VoiceProfile[];
  defaultProfileId: string | null; // fallback profile for unnamed characters
  updatedAt?: number;
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_PREFIX = 'gs_voice_profiles_';

function getStorageKey(gameId: string): string {
  return `${STORAGE_PREFIX}${gameId}`;
}

export function loadVoiceProfiles(gameId: string): VoiceProfileCollection {
  try {
    const raw = localStorage.getItem(getStorageKey(gameId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    clientLogger.warn('[VoiceProfiles] Errore caricamento profili:', String(err));
  }
  return { gameId, profiles: [], defaultProfileId: null };
}

export function saveVoiceProfiles(collection: VoiceProfileCollection): void {
  try {
    collection.updatedAt = Date.now();
    localStorage.setItem(getStorageKey(collection.gameId), JSON.stringify(collection));
  } catch (err) {
    clientLogger.warn('[VoiceProfiles] Errore salvataggio profili:', String(err));
  }
}

// ============================================================================
// VOICE PROFILE CRUD
// ============================================================================

export function getVoiceProfile(gameId: string, characterName: string): VoiceProfile | null {
  const collection = loadVoiceProfiles(gameId);
  return collection.profiles.find(p => 
    p.characterName.toLowerCase() === characterName.toLowerCase()
  ) || null;
}

export function getDefaultVoiceProfile(gameId: string): VoiceProfile | null {
  const collection = loadVoiceProfiles(gameId);
  if (collection.defaultProfileId) {
    return collection.profiles.find(p => p.id === collection.defaultProfileId) || null;
  }
  return null;
}

export function upsertVoiceProfile(gameId: string, profile: Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>): VoiceProfile {
  const collection = loadVoiceProfiles(gameId);
  
  const existing = collection.profiles.find(p => 
    p.characterName.toLowerCase() === profile.characterName.toLowerCase()
  );

  if (existing) {
    // Update existing
    Object.assign(existing, profile, { updatedAt: Date.now() });
    saveVoiceProfiles(collection);
    return existing;
  }

  // Create new
  const newProfile: VoiceProfile = {
    ...profile,
    id: `vp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  collection.profiles.push(newProfile);
  saveVoiceProfiles(collection);
  return newProfile;
}

export function deleteVoiceProfile(gameId: string, profileId: string): void {
  const collection = loadVoiceProfiles(gameId);
  collection.profiles = collection.profiles.filter(p => p.id !== profileId);
  if (collection.defaultProfileId === profileId) {
    collection.defaultProfileId = null;
  }
  saveVoiceProfiles(collection);
}

export function setDefaultVoiceProfile(gameId: string, profileId: string): void {
  const collection = loadVoiceProfiles(gameId);
  if (collection.profiles.some(p => p.id === profileId)) {
    collection.defaultProfileId = profileId;
    saveVoiceProfiles(collection);
  }
}

// ============================================================================
// AUTO-EXTRACTION
// ============================================================================

/** Pattern per identificare dialoghi con speaker */
const SPEAKER_PATTERNS = [
  /^(.+?):\s*(.+)$/,                    // "Character: dialogue"
  /^\[(.+?)\]\s*(.+)$/,                 // "[Character] dialogue"
  /^<(.+?)>\s*(.+)$/,                   // "<Character> dialogue"
  /^\{(.+?)\}\s*(.+)$/,                 // "{Character} dialogue"
  /^(.+?)\s*—\s*(.+)$/,                 // "Character — dialogue"
  /^(.+?)\s*:\s*"(.+)"$/,              // 'Character: "dialogue"'
];

/** Keywords che suggeriscono tono/personalità */
const TONE_KEYWORDS: Record<VoiceTone, string[]> = {
  formal: ['sir', 'madam', 'therefore', 'henceforth', 'pursuant', 'respectfully', 'indeed', 'shall'],
  casual: ['hey', 'yeah', 'nah', 'gonna', 'wanna', 'dude', 'cool', 'awesome', 'sup'],
  aggressive: ['fool', 'die', 'destroy', 'crush', 'annihilate', 'worthless', 'pathetic', 'weakling'],
  gentle: ['please', 'kindly', 'dear', 'softly', 'gentle', 'care', 'love', 'comfort'],
  mysterious: ['perhaps', 'maybe', 'who knows', 'hidden', 'secret', 'shadow', 'veil', 'unknown'],
  comedic: ['haha', 'lol', 'joke', 'funny', 'laugh', 'silly', 'ridiculous', 'absurd'],
  dramatic: ['must', 'never', 'forever', 'destiny', 'fate', 'doom', 'triumph', 'sacrifice'],
  stoic: ['hm', 'indeed', 'very well', 'understood', 'noted', 'as expected', 'irrelevant'],
  sarcastic: ['oh really', 'how nice', 'brilliant', 'sure', 'obviously', 'of course', 'wow'],
  wise: ['remember', 'learn', 'understand', 'wisdom', 'ancient', 'knowledge', 'truth', 'insight'],
  childish: ['mommy', 'yay', 'boo', 'eww', 'cool', 'neat', 'wanna', 'big'],
  noble: ['honor', 'duty', 'kingdom', 'loyalty', 'sworn', 'crown', 'noble', 'chivalry'],
  pirate: ['matey', 'arr', 'ye', 'treasure', 'sea', 'ship', 'plunder', 'scurvy'],
  military: ['sir', 'soldier', 'mission', 'objective', 'report', 'deploy', 'engage', 'unit'],
  academic: ['theory', 'hypothesis', 'evidence', 'analysis', 'research', 'phenomenon', 'data'],
  street: ['yo', 'homie', 'cash', 'deal', 'gang', 'hood', 'street', 'crew'],
};

/**
 * Estrae automaticamente profili voce dalle stringhe di dialogo del gioco.
 * Analizza pattern di speaker e stile linguistico.
 */
export function extractVoiceProfilesFromStrings(
  gameId: string,
  strings: string[],
  maxProfiles: number = 20
): VoiceProfile[] {
  const speakerDialogues = new Map<string, string[]>();

  // Parse speaker from dialogue strings
  for (const str of strings) {
    for (const pattern of SPEAKER_PATTERNS) {
      const match = str.trim().match(pattern);
      if (match && match[1].length < 30 && match[2].length > 5) {
        const speaker = match[1].trim();
        const dialogue = match[2].trim();
        if (!speakerDialogues.has(speaker)) {
          speakerDialogues.set(speaker, []);
        }
        speakerDialogues.get(speaker)!.push(dialogue);
        break;
      }
    }
  }

  // Only extract profiles for characters with enough dialogue
  const profiles: VoiceProfile[] = [];
  for (const [speaker, dialogues] of speakerDialogues) {
    if (dialogues.length < 3) continue; // Need at least 3 lines
    if (profiles.length >= maxProfiles) break;

    const tone = detectTone(dialogues);
    const formality = detectFormality(dialogues);
    const ageGroup = detectAgeGroup(dialogues, speaker);
    const speechPatterns = extractSpeechPatterns(dialogues);
    const catchphrases = extractCatchphrases(dialogues);

    const profile = upsertVoiceProfile(gameId, {
      gameId,
      characterName: speaker,
      tone,
      formality,
      ageGroup,
      personality: buildPersonalityDesc(speaker, tone, formality, ageGroup),
      speechPatterns,
      catchphrases,
      avoidPatterns: [],
      sampleDialogues: dialogues.slice(0, 5),
      autoExtracted: true,
      confidence: Math.min(dialogues.length / 10, 1),
    });

    profiles.push(profile);
  }

  clientLogger.info(`[VoiceProfiles] Estratti ${profiles.length} profili da ${strings.length} stringhe per gioco ${gameId}`);
  return profiles;
}

// ============================================================================
// PROMPT INJECTION
// ============================================================================

/**
 * Genera le istruzioni di voce per il prompt di traduzione.
 * Da iniettare nel prompt builder come persona/tone/customPrompt.
 */
export function buildVoicePromptInjection(
  profile: VoiceProfile,
  targetLanguage: string
): { persona: string; tone: string; customPrompt: string } {
  const toneMap: Record<VoiceTone, string> = {
    formal: 'formal and proper',
    casual: 'casual and relaxed',
    aggressive: 'aggressive and forceful',
    gentle: 'gentle and caring',
    mysterious: 'mysterious and enigmatic',
    comedic: 'comedic and humorous',
    dramatic: 'dramatic and intense',
    stoic: 'stoic and reserved',
    sarcastic: 'sarcastic and witty',
    wise: 'wise and thoughtful',
    childish: 'childish and playful',
    noble: 'noble and dignified',
    pirate: 'pirate-like with nautical slang',
    military: 'military and disciplined',
    academic: 'academic and precise',
    street: 'street-smart and colloquial',
  };

  const formalityMap: Record<VoiceFormality, string> = {
    very_formal: 'very formal language, no contractions',
    formal: 'formal language',
    neutral: 'neutral register',
    informal: 'informal, everyday language',
    very_informal: 'very informal, slang acceptable',
  };

  let persona = `${profile.characterName}, a character who speaks in a ${toneMap[profile.tone]} manner`;
  let tone = `${formalityMap[profile.formality]}, ${toneMap[profile.tone]} tone`;

  let customPrompt = `You are translating dialogue for the character "${profile.characterName}".`;
  
  if (profile.personality) {
    customPrompt += `\nCharacter personality: ${profile.personality}`;
  }
  
  if (profile.speechPatterns.length > 0) {
    customPrompt += `\nSpeech patterns to maintain in ${targetLanguage}: ${profile.speechPatterns.join('; ')}`;
  }
  
  if (profile.catchphrases.length > 0) {
    customPrompt += `\nCharacter catchphrases/signature expressions: ${profile.catchphrases.join('; ')}`;
  }

  if (profile.avoidPatterns.length > 0) {
    customPrompt += `\nAVOID in translation: ${profile.avoidPatterns.join('; ')}`;
  }

  if (profile.sampleDialogues.length > 0) {
    customPrompt += `\nExample dialogues showing this character's voice:\n${profile.sampleDialogues.map((d, i) => `  ${i + 1}. "${d}"`).join('\n')}`;
  }

  return { persona, tone, customPrompt };
}

/**
 * Cerca un profilo voce per una stringa di dialogo.
 * Se la stringa contiene uno speaker identificato, usa quel profilo.
 * Altrimenti usa il profilo default del gioco.
 */
export function findVoiceProfileForString(
  gameId: string,
  text: string
): VoiceProfile | null {
  // Try to identify speaker from the string
  for (const pattern of SPEAKER_PATTERNS) {
    const match = text.trim().match(pattern);
    if (match && match[1].length < 30) {
      const speaker = match[1].trim();
      const profile = getVoiceProfile(gameId, speaker);
      if (profile) return profile;
    }
  }

  // Fallback to default profile
  return getDefaultVoiceProfile(gameId);
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function detectTone(dialogues: string[]): VoiceTone {
  const scores: Record<VoiceTone, number> = {} as Record<VoiceTone, number>;
  
  for (const tone of Object.keys(TONE_KEYWORDS) as VoiceTone[]) {
    scores[tone] = 0;
    const keywords = TONE_KEYWORDS[tone];
    for (const d of dialogues) {
      const lower = d.toLowerCase();
      for (const kw of keywords) {
        if (lower.includes(kw)) scores[tone]++;
      }
    }
  }

  let bestTone: VoiceTone = 'neutral' as VoiceTone;
  // 'neutral' isn't in the map, default to 'casual'
  bestTone = 'casual';
  let bestScore = 0;

  for (const [tone, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTone = tone as VoiceTone;
    }
  }

  return bestScore > 0 ? bestTone : 'casual';
}

function detectFormality(dialogues: string[]): VoiceFormality {
  let formalScore = 0;
  let informalScore = 0;

  for (const d of dialogues) {
    const lower = d.toLowerCase();
    // Formal indicators
    if (/\b(shall|would|mighth|therefore|hence|whom|upon)\b/i.test(d)) formalScore++;
    if (/\b(sir|madam|lord|lady)\b/i.test(d)) formalScore++;
    // Contractions = informal
    if (/\b(don't|can't|won't|isn't|aren't|I'm|you're|it's|we're)\b/i.test(d)) informalScore++;
    if (/\b(gonna|wanna|gotta|kinda|sorta)\b/i.test(d)) informalScore++;
    // Short sentences = informal
    if (d.split(/[.!?]/).filter(s => s.trim()).length > 3) formalScore++;
  }

  const ratio = formalScore / (formalScore + informalScore + 1);
  if (ratio > 0.7) return 'very_formal';
  if (ratio > 0.5) return 'formal';
  if (ratio > 0.3) return 'neutral';
  if (ratio > 0.1) return 'informal';
  return 'very_informal';
}

function detectAgeGroup(dialogues: string[], speakerName: string): VoiceAgeGroup {
  const lower = speakerName.toLowerCase();
  
  // Name-based heuristics
  if (/\b(kid|child|boy|girl|little|young|baby|tot)\b/i.test(speakerName)) return 'child';
  if (/\b(elder|old|grand|ancient|sage|master|chief)\b/i.test(speakerName)) return 'elder';
  
  // Dialogue-based heuristics
  let childishScore = 0;
  for (const d of dialogues) {
    if (/\b(mommy|daddy|yay|boo|eww|cool|neat)\b/i.test(d)) childishScore++;
    if (d.length < 20) childishScore += 0.3; // Short = childish
  }

  if (childishScore > 2) return 'child';
  if (childishScore > 0.5) return 'teen';
  return 'adult';
}

function extractSpeechPatterns(dialogues: string[]): string[] {
  const patterns: string[] = [];
  
  // Check for recurring patterns
  const avgLength = dialogues.reduce((sum, d) => sum + d.length, 0) / dialogues.length;
  if (avgLength < 20) patterns.push('Speaks in very short sentences');
  else if (avgLength > 100) patterns.push('Speaks at length, elaborate sentences');
  
  // Ellipsis = hesitation
  if (dialogues.some(d => d.includes('...'))) patterns.push('Uses ellipsis for pauses/hesitation');
  
  // Exclamation = emphatic
  const exclamationRatio = dialogues.filter(d => d.includes('!')).length / dialogues.length;
  if (exclamationRatio > 0.5) patterns.push('Frequently emphatic/exclamatory');
  
  // Questions = inquisitive
  const questionRatio = dialogues.filter(d => d.includes('?')).length / dialogues.length;
  if (questionRatio > 0.4) patterns.push('Often asks questions, inquisitive');
  
  // Uppercase words = shouting
  if (dialogues.some(d => /[A-Z]{2,}/.test(d))) patterns.push('Sometimes shouts or emphasizes words in caps');
  
  return patterns.slice(0, 5);
}

function extractCatchphrases(dialogues: string[]): string[] {
  const phrases: string[] = [];
  
  // Find repeated short expressions
  const shortExprs = dialogues
    .map(d => d.trim())
    .filter(d => d.length < 30 && d.length > 3);
  
  // Count occurrences
  const counts = new Map<string, number>();
  for (const expr of shortExprs) {
    const lower = expr.toLowerCase().replace(/[.!?]+$/, '');
    counts.set(lower, (counts.get(lower) || 0) + 1);
  }
  
  // Repeated = catchphrase
  for (const [phrase, count] of counts) {
    if (count >= 2) {
      phrases.push(phrase);
    }
  }
  
  return phrases.slice(0, 5);
}

function buildPersonalityDesc(
  name: string, 
  tone: VoiceTone, 
  formality: VoiceFormality, 
  ageGroup: VoiceAgeGroup
): string {
  const toneDesc: Record<VoiceTone, string> = {
    formal: 'formal and proper',
    casual: 'casual and friendly',
    aggressive: 'aggressive and confrontational',
    gentle: 'gentle and compassionate',
    mysterious: 'mysterious and secretive',
    comedic: 'comedic and lighthearted',
    dramatic: 'dramatic and intense',
    stoic: 'stoic and reserved',
    sarcastic: 'sarcastic and sharp-tongued',
    wise: 'wise and contemplative',
    childish: 'playful and innocent',
    noble: 'noble and dignified',
    pirate: 'rough and nautical',
    military: 'disciplined and direct',
    academic: 'intellectual and precise',
    street: 'street-smart and tough',
  };

  const ageDesc: Record<VoiceAgeGroup, string> = {
    child: 'young character',
    teen: 'teenager',
    young_adult: 'young adult',
    adult: 'adult',
    elder: 'elderly character',
  };

  return `A ${ageDesc[ageGroup]} who speaks in a ${toneDesc[tone]} manner`;
}

