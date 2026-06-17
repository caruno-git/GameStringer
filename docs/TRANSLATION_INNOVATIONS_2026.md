# Translation Innovations 2026

Guida completa alle nuove funzionalità di traduzione AI integrate in GameStringer (Aprile–Maggio 2026).

> **Aggiornamento 23/05/2026**: bump del default Google da `gemini-2.0-flash` a **`gemini-3.5-flash`** (frontier model annunciato al Google I/O 2026, GA dal 19/05/2026). Il modello è parametrizzabile via `NEXT_PUBLIC_GEMINI_MODEL` (stesso pattern di `NEXT_PUBLIC_ANTHROPIC_MODEL`).
>
> **Verifica 27/05/2026**: pricing `gemini-3.5-flash` confermato a **$1.50 / $9.00 per MTok (input / output)**, ~40% più economico di Gemini 3.1 Pro e ~4× più veloce sui benchmark coding/agentic (Google I/O 2026). Nessuna nuova release Gemini nelle ultime 24h.
>
> **Stato 14/06/2026**: bump completato nei sorgenti. Tutti i file rilevanti (`lib/ai/ai-translate-direct.ts`, `lib/ai/ai-post-edit.ts`, `lib/ocr/vision-translate.ts`, `lib/lore-assistant.ts`, `lib/ai/smart-content-router.ts`) leggono `NEXT_PUBLIC_GEMINI_MODEL` con default `gemini-3.5-flash`; nessun `gemini-2.0-flash` hard-coded residuo.

## Indice

1. [Gemini 3.5 Flash (default 2026)](#gemini-35-flash-default-2026)
2. [Gemini 3.1 Flash-Lite (low-cost long-context)](#gemini-31-flash-lite-low-cost-long-context)
3. [Claude Sonnet 4.6 (creative/narrative)](#claude-sonnet-46)
4. [DeepL Voice API](#deepl-voice-api)
5. [Custom Prompt System](#custom-prompt-system)
6. [Best Practices](#best-practices)

---

## Gemini 3.5 Flash (default 2026)

### Cos'è

**Gemini 3.5 Flash** è il nuovo frontier model di Google, annunciato al Google I/O 2026 (19/05/2026) e GA via Gemini API / AI Studio / Antigravity / Gemini Enterprise. È il **default Google** di GameStringer dal 23/05/2026 (provider key `gemini` nel codice e nei chain preset).

### Specifiche Tecniche

| Caratteristica | Gemini 2.0 Flash (vecchio default) | **Gemini 3.5 Flash (nuovo default)** | Gemini 3.1 Flash-Lite |
|----------------|------------------------------------|--------------------------------------|----------------------|
| Context Window | 1M token | **1M token (1.048.576)** | 1M token |
| Max Output | 8.192 token | **65.536 token (8×)** | 32.768 token |
| Costo input | $0.075 / 1M token | **$1.50 / 1M token** | ~$0.035 / 1M token |
| Costo output | $0.30 / 1M token | **$9.00 / 1M token** | ~$0.14 / 1M token |
| Velocità | Molto veloce | Veloce (frontier intelligence) | Veloce |
| Lingue | 100+ | **100+** | 100+ |

> 📌 **Note pricing**: 3.5 Flash è ~20× più caro di 3.1 Flash-Lite in input. Per batch RPG molto grandi vale ancora la pena restare su `gemini-3.1` nel preset `long_context`. La leva forte di 3.5 è il **max output 8×** che riduce meccanicamente il numero di chiamate API.

### Quando Usarlo

✅ **Ideale per:**
- Traduzioni creative dove serve un default solido e moderno
- Pipeline OCR vision (`lib/ocr/vision-translate.ts`) — multimodale potenziato
- Post-edit (`lib/ai/ai-post-edit.ts`) — instruction-following più obbediente di 2.0
- Lore assistant — comprensione contestuale migliorata

❌ **Quando preferire `gemini-3.1`:**
- Batch grandi (decine di migliaia di stringhe) → 3.1 costa ~20× meno in input
- Documenti molto lunghi dove la qualità "frontier" non aggiunge valore percepibile

### Come Attivarlo

```typescript
// Già attivo di default (provider key 'gemini' → gemini-3.5-flash).
// Override globale via env var:
//   NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash npm run dev   ← rollback al vecchio default
//   NEXT_PUBLIC_GEMINI_MODEL=gemini-3.5-flash               ← esplicito nuovo default

// Via codice
import { translateWithFallback } from '@/lib/ai/ai-translate-direct';

const result = await translateWithFallback({
  texts,
  targetLanguage: 'it',
  sourceLanguage: 'en',
});
```

### Smoke test consigliato

Prima di promuovere oltre dev, fare un round-trip su 50 stringhe e verificare che il regex parser
`responseText.match(/\[[\s\S]*\]/)` di `ai-translate-direct.ts` regga (3.5 dovrebbe rispettare il JSON-only system prompt anche meglio di 2.0, ma vale lo step di QA).

---

## Gemini 3.1 Flash-Lite (low-cost long-context)

### Cos'è

Gemini 3.1 Flash-Lite resta il modello Google ottimizzato per **contesti lunghi a basso costo**. Continua a essere disponibile come provider esplicito (`gemini-3.1`), separato dal default `gemini` che ora punta a 3.5 Flash.

### Quando Usarlo

✅ **Ideale per:**
- Script completi di giochi RPG con migliaia di stringhe
- Documentazione tecnica estesa
- Traduzione batch di multipli file simultaneamente quando il costo conta più della qualità "frontier"

❌ **Non consigliato per:**
- Singole stringhe corte (UI elements)
- Traduzioni che richiedono creatività elevata o sfumature narrative

### Chain Preset "📚 Long Context"

Ordine provider:
1. `gemini-3.1` (prima scelta — low-cost, 32k output)
2. `gemini` (= gemini-3.5-flash — fallback frontier, 65k output)
3. `anthropic-claude4` (fallback creativo)
4. `openai` (fallback finale)

---

## Claude Sonnet 4.6

### Cos'è

Claude Sonnet 4.6 (Anthropic, 17/02/2026) è il modello Anthropic specializzato in traduzioni narrative e creative, default dal 22/05/2026 in GameStringer. Parametrizzabile via `NEXT_PUBLIC_ANTHROPIC_MODEL` (es. `claude-opus-4-6` come opzione premium, `claude-haiku-4-5-20251001` come opzione veloce).

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

### Gemini 3.5 / 3.1 non disponibile

**Sintomo**: Rate limit o errore 429
**Soluzione**: Fallback automatico nella chain — default `gemini` (3.5 Flash) → `gemini-3.1` (Flash-Lite, low-cost). `gemini-2.0-flash` resta utilizzabile come override via `NEXT_PUBLIC_GEMINI_MODEL=gemini-2.0-flash` per rollback.

### Claude troppo lento

**Sintomo**: Timeout su traduzioni lunghe
**Soluzione**: Usa `gemini-3.1` (Flash-Lite, preset `long_context`) per contesti >100KB. In alternativa, `claude-haiku-4-5-20251001` come scelta veloce in chain creativi.

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
// Provider keys
'gemini'               // Default Google → gemini-3.5-flash (override: NEXT_PUBLIC_GEMINI_MODEL)
'gemini-3.1'           // Gemini 3.1 Flash-Lite (low-cost long-context)
'anthropic-claude4'    // Claude Sonnet 4.6 (default) — override: NEXT_PUBLIC_ANTHROPIC_MODEL
                       // Opzioni: claude-opus-4-7 (premium $5/$25 MTok), claude-haiku-4-5-20251001 (veloce)
'deepl-voice'          // DeepL Voice API (GA 15/04/2026)
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
