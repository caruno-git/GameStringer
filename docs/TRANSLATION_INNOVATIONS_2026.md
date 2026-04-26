# Translation Innovations 2026

Guida completa alle nuove funzionalità di traduzione AI integrate in GameStringer (Aprile 2026).

## Indice

1. [Gemini 3.1 Flash-Lite](#gemini-31-flash-lite)
2. [Claude 3.5/4 Sonnet](#claude-354-sonnet)
3. [DeepL Voice API](#deepl-voice-api)
4. [Custom Prompt System](#custom-prompt-system)
5. [Best Practices](#best-practices)

---

## Gemini 3.1 Flash-Lite

### Cos'è

Gemini 3.1 Flash-Lite è il nuovo modello Google ottimizzato per contesti lunghi e costi ridotti.

### Specifiche Tecniche

| Caratteristica | Gemini 2.0 Flash | Gemini 3.1 Flash-Lite |
|----------------|------------------|----------------------|
| Context Window | 1M token | 1M token |
| Max Output | 8,192 token | 32,768 token |
| Costo | $0.075 / 1M token | ~$0.035 / 1M token |
| Velocità | Molto veloce | Veloce |
| Lingue | 100+ | 100+ |

### Quando Usarlo

✅ **Ideale per:**
- Script completi di giochi RPG
- Documentazione tecnica estesa
- File di localizzazione con migliaia di stringhe
- Traduzione batch di multipli file simultaneamente

❌ **Non consigliato per:**
- Singole stringhe corte (UI elements)
- Traduzioni che richiedono creatività elevata
- Dialoghi con sfumature emotive complesse

### Come Attivarlo

```typescript
// Via Chain Preset
setChainPreset('long_context');

// Via codice
import { translateWithFallback } from '@/lib/ai-translate-direct';

const result = await translateWithFallback({
  texts: longScript,
  targetLanguage: 'it',
  sourceLanguage: 'en',
});
```

### Chain Preset "📚 Long Context"

Ordine provider:
1. `gemini-3.1` (prima scelta)
2. `gemini` (fallback)
3. `anthropic-claude4` (fallback creativo)
4. `openai` (fallback finale)

---

## Claude 3.5/4 Sonnet

### Cos'è

Claude 3.5 Sonnet (2024-10-22) è il modello Anthropic specializzato in traduzioni narrative e creative.

### Vantaggi

- **Comprensione contestuale**: Capisce meglio le sfumature narrative
- **Adattamento stilistico**: Mantiene il tono del personaggio
- **Coerenza narrativa**: Consistenza tra dialoghi consecutivi
- **Espressioni idomatiche**: Traduzioni più naturali

### Quando Usarlo

✅ **Ideale per:**
- Visual Novel e giochi narrativi
- Dialoghi con personalità definite
- Testi con umorismo o sarcasmo
- Giochi RPG giapponesi con subtilità culturali

### Chain Preset "🎭 Creative/Narrative"

Ordine provider:
1. `anthropic-claude4` (prima scelta)
2. `anthropic` (fallback)
3. `openai` (fallback strutturato)
4. `gemini-3.1` (fallback cost-efficient)

### Esempio Pratico

```typescript
// Traduzione dialogo con tono emotivo
const result = await translateWithFallback({
  texts: ["I'm not angry, just... disappointed."],
  targetLanguage: 'it',
  sourceLanguage: 'en',
  gameGenre: 'visual_novel',
});
// Output: "Non sono arrabbiata, solo... delusa." (mantiene l'emotività)
```

---

## DeepL Voice API

### Cos'è

DeepL Voice API offre traduzione vocale real-time con TTS (Text-to-Speech) integrato.

### Funzionalità

- **40+ lingue supportate** per output vocale
- **Voice Preservation** (beta): Mantiene caratteristiche della voce originale
- **WebSocket Streaming**: Latenza minima per applicazioni real-time
- **Fallback Automatico**: DeepL text se Voice non disponibile

### Configurazione

```typescript
interface VoiceSettings {
  enableVoice: boolean;
  speakerVoice: 'auto' | 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  preserveVoice: boolean;
}
```

### Voci Disponibili

| Voce | Caratteristica | Use Case |
|------|---------------|----------|
| `auto` | DeepL automatico | Default |
| `nova` | Femminile, versatile | Narrativa |
| `alloy` | Maschile, neutro | UI/Documentazione |
| `echo` | Maschile, grave | Personaggi anziani |
| `fable` | Femminile, britannico | Personaggi eleganti |
| `onyx` | Maschile, profondo | Antagonisti |
| `shimmer` | Femminile, giovane | Personaggi giovani |

### Chain Preset "🎤 Voice"

Ordine provider:
1. `deepl-voice` (prima scelta)
2. `deepl` (fallback testo)
3. `gemini-3.1` (fallback AI)
4. `anthropic-claude4` (fallback creativo)
5. `openai` (fallback finale)

---

## Custom Prompt System

### Cos'è

Sistema globale per personalizzare i prompt di sistema inviati a tutti i provider LLM.

### Componenti

#### 1. Persona

Definisce "chi" sta traducendo:

```typescript
// Esempi di persona
'a wise old wizard'      // Usa lessico arcaico e saggio
'a medieval knight'      // Linguaggio formale e cavalleresco  
'a pirate captain'       // Gergo marinaro e colorito
'a sci-fi captain'       // Tecnico ma umano
'a horror narrator'      // Atmosfera inquietante
'a street-smart kid'     // Gergo giovanile urbano
```

#### 2. Tono

Definisce "come" tradurre:

```typescript
// Esempi di tono
'formal'      // Registro elevato, rispettoso
'casual'      // Informale, colloquiale
'humorous'    // Umoristico, divertente
'mysterious'  // Enigmatico, vago
'epic'        // Grandioso, epico
'dark'        // Cupo, sinistro
'romantic'    // Sentimentale, tenero
'sarcastic'   // Ironico, beffardo
```

#### 3. Custom Prompt

Istruzioni libere aggiunte al prompt:

```typescript
// Esempi
type CustomPrompt = string;

// Esempio 1: Lessico specifico
"Usa termini medievale come 'mylord', 'pergame', 'verily'."

// Esempio 2: Stile narrativo
"Traduci come se fosse un romanzo fantasy classico."

// Esempio 3: Vincoli tecnici  
"Mantieni tutti i placeholders {name}, {item}, ecc."
```

### Gerarchia delle Impostazioni

```
1. Override Dialog (più alta priorità)
   └─ persona, tone impostati nel dialog di traduzione

2. Custom Settings Globali
   └─ gs_custom_prompt_settings in localStorage

3. Default del provider (più bassa priorità)
   └─ Prompt standard di sistema
```

### Implementazione nel Codice

```typescript
// Carica settings globali
const customSettings = JSON.parse(
  localStorage.getItem('gs_custom_prompt_settings') || '{}'
);

// Traduzione con override
const result = await translateWithFallback({
  texts: ['Hello world'],
  targetLanguage: 'it',
  sourceLanguage: 'en',
  
  // Custom Prompt System
  persona: quickPersona || customSettings.persona,
  tone: quickTone || customSettings.tone,
  customPrompt: customSettings.customPrompt,
  
  // Voice
  enableVoice: enableVoiceOutput || customSettings.enableVoice,
  speakerVoice: customSettings.speakerVoice,
  preserveVoice: customSettings.preserveVoice,
});
```

### UI Settings Page

**Percorso**: Impostazioni → AI → Custom Prompt & Voice

**Componenti**:
- Toggle abilitazione Custom Prompt
- Select Persona (9 preset)
- Select Tono (10 preset)
- Textarea Custom Prompt
- Toggle DeepL Voice
- Select Voce TTS (7 opzioni)
- Toggle Voice Preservation

### UI Translation Dialog

**Percorso**: Dialog di conferma traduzione → Opzioni Avanzate

**Componenti**:
- Accordion espandibile
- Select Persona (override)
- Select Tono (override)
- Toggle Voice Output
- Badge "Attivo" quando configurate
- Anteprima impostazioni

---

## Best Practices

### Per Giochi RPG Giapponesi

```typescript
// Configurazione consigliata
{
  chain: 'creative',        // Claude 3.5/4 per sfumature
  persona: 'a wise master', // Rispetta gerarchie
  tone: 'formal',           // Onorevole
  // Aggiungi glossario nomi propri
}
```

### Per Visual Novel

```typescript
// Configurazione consigliata
{
  chain: 'creative',           // Claude 3.5/4
  persona: 'a character voice actor', // Mantiene personalità
  tone: 'romantic',            // O adatta al genere
  // Usa character profiles per coerenza
}
```

### Per Documentazione Tecnica

```typescript
// Configurazione consigliata
{
  chain: 'long_context',    // Gemini 3.1
  tone: 'technical',        // Preciso
  // Nessuna persona specifica
}
```

### Per UI/Menu Giochi

```typescript
// Configurazione consigliata
{
  chain: 'balanced',        // Economica ma precisa
  tone: 'formal',           // Chiara
  // Brevità prioritaria
}
```

### Combinazioni Persona + Tono

| Persona | Tono | Effetto |
|---------|------|---------|
| Wizard | Mysterious | Mago enigmatico |
| Pirate | Humorous | Pirata allegro |
| Knight | Epic | Cavaliere eroico |
| Sci-fi Captain | Technical | Capitano efficiente |
| Horror Narrator | Dark | Racconto horror |

### Ottimizzazione Costi

| Use Case | Chain | Costo/stima |
|----------|-------|-------------|
| UI/Menu | economy | ~$0.10 |
| Dialoghi standard | balanced | ~$0.25 |
| Narrativa importante | creative | ~$0.60 |
| Script interi | long_context | ~$0.30 |
| Voice + testo | voice | ~$0.40 |
| Massima qualità | max_quality | ~$1.00+ |

---

## Troubleshooting

### Gemini 3.1 non disponibile

**Sintomo**: Rate limit o errore 429
**Soluzione**: Fallback automatico a Gemini 2.0

### Claude 3.5 troppo lento

**Sintomo**: Timeout su traduzioni lunghe
**Soluzione**: Usa Gemini 3.1 per contesti >100KB

### DeepL Voice non funziona

**Sintomo**: Fallback a testo
**Causa**: API Voice in beta, non sempre disponibile
**Soluzione**: Fallback automatico attivo

### Custom Prompt ignorato

**Sintomo**: Traduzioni senza personalizzazione
**Verifica**: 
1. Toggle Custom Prompt abilitato?
2. Provider supporta system instructions?
3. Override nel dialog attivo?

---

## Riferimento API

### TranslateOptions Esteso

```typescript
interface TranslateOptions {
  // Base
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
  context?: string;
  
  // Custom Prompt System
  customPrompt?: string;
  customPromptProvider?: string[];
  persona?: string;
  tone?: string;
  
  // DeepL Voice API
  enableVoice?: boolean;
  speakerVoice?: string;
  preserveVoice?: boolean;
}
```

### Provider Keys

```typescript
// Nuovi provider
'gemini-3.1'           // Gemini 3.1 Flash-Lite
'anthropic-claude4'     // Claude 3.5/4 Sonnet  
'deepl-voice'           // DeepL Voice API
```

### Chain Preset IDs

```typescript
type ChainPreset = 
  | 'free'
  | 'economy' 
  | 'balanced'
  | 'quality'
  | 'max_quality'
  | 'creative'        // Nuovo
  | 'long_context'    // Nuovo
  | 'voice'           // Nuovo
  | 'auto';
```

---

**GameStringer Translation Innovations 2026**  
*Documentazione aggiornata: 25 Aprile 2026*
