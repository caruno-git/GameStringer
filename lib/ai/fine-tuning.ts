/**
 * 🧠 Fine-Tuning Infrastructure
 * 
 * Sistema per generare dataset di fine-tuning dalle correzioni umane
 * e gestire modelli per-game personalizzati.
 * 
 * Funzionalità:
 * - Export dataset JSONL da correzioni umane (adaptive-mt)
 * - Export dataset da traduzioni approvate (QA)
 * - Model management per-game (versioni, metadati)
 * - Integrazione con Ollama per modelli locali
 * - Statistiche dataset e qualità
 */

import { clientLogger } from '@/lib/client-logger';
import { getCorrections, type HumanCorrection } from './adaptive-mt';

// ============================================================================
// TYPES
// ============================================================================

export interface FineTuningDataset {
  id: string;
  gameId: string;
  name: string;
  description: string;
  sourceLanguage: string;
  targetLanguage: string;
  exampleCount: number;
  approvedOnly: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FineTuningExample {
  /** System prompt per l'esempio */
  instruction: string;
  /** Testo sorgente (input) */
  input: string;
  /** Traduzione target (output) */
  output: string;
}

export interface FineTuningModel {
  id: string;
  gameId: string;
  name: string;
  baseModel: string;       // e.g., "llama3.2:3b"
  datasetId: string;
  version: number;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;        // 0-100
  createdAt: number;
  completedAt: number | null;
  error: string | null;
  metrics: {
    loss?: number;
    evalLoss?: number;
    trainingTimeSec?: number;
  };
}

export interface FineTuningConfig {
  /** Base model to fine-tune */
  baseModel: string;
  /** Number of epochs */
  epochs: number;
  /** Learning rate */
  learningRate: number;
  /** Batch size */
  batchSize: number;
  /** Max sequence length */
  maxSeqLength: number;
  /** Use LoRA (efficient fine-tuning) */
  useLora: boolean;
  /** LoRA rank */
  loraRank: number;
  /** LoRA alpha */
  loraAlpha: number;
}

export const DEFAULT_CONFIG: FineTuningConfig = {
  baseModel: 'llama3.2:3b',
  epochs: 3,
  learningRate: 0.00002,
  batchSize: 4,
  maxSeqLength: 512,
  useLora: true,
  loraRank: 8,
  loraAlpha: 16,
};

// ============================================================================
// STORAGE
// ============================================================================

const DATASETS_KEY = 'gs_finetune_datasets';
const MODELS_KEY = 'gs_finetune_models';

function loadFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

// ============================================================================
// DATASET MANAGEMENT
// ============================================================================

/**
 * Genera un dataset JSONL dalle correzioni umane per un gioco specifico.
 */
export function generateDatasetFromCorrections(
  gameId: string,
  sourceLanguage: string,
  targetLanguage: string,
  options: { approvedOnly?: boolean; minUsageCount?: number } = {}
): { dataset: FineTuningDataset; examples: FineTuningExample[] } {
  const corrections = getCorrections({ gameId, sourceLanguage, targetLanguage });
  
  let filtered = corrections;
  if (options.approvedOnly) {
    filtered = filtered.filter(c => c.approved);
  }
  if (options.minUsageCount) {
    filtered = filtered.filter(c => c.usageCount >= options.minUsageCount!);
  }

  const examples: FineTuningExample[] = filtered.map(c => ({
    instruction: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the tone, style and terminology of the original.`,
    input: c.sourceText,
    output: c.humanCorrection,
  }));

  const dataset: FineTuningDataset = {
    id: `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    name: `${gameId}_${sourceLanguage}-${targetLanguage}_${filtered.length}ex`,
    description: `Auto-generated from ${filtered.length} human corrections (${options.approvedOnly ? 'approved only' : 'all'})`,
    sourceLanguage,
    targetLanguage,
    exampleCount: examples.length,
    approvedOnly: options.approvedOnly ?? false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  // Save dataset metadata
  const datasets = loadFromStorage<FineTuningDataset>(DATASETS_KEY);
  datasets.push(dataset);
  saveToStorage(DATASETS_KEY, datasets);

  // Save examples separately (could be large)
  localStorage.setItem(`gs_finetune_examples_${dataset.id}`, JSON.stringify(examples));

  clientLogger.info(`[FineTuning] Dataset generato: ${dataset.name} (${examples.length} esempi)`);
  return { dataset, examples };
}

/**
 * Genera dataset da traduzioni approvate nel QA.
 */
export function generateDatasetFromApproved(
  gameId: string,
  translations: Array<{ source: string; target: string; sourceLang: string; targetLang: string; approved: boolean }>,
  sourceLanguage: string,
  targetLanguage: string
): { dataset: FineTuningDataset; examples: FineTuningExample[] } {
  const approved = translations.filter(t => t.approved && t.sourceLang === sourceLanguage && t.targetLang === targetLanguage);

  const examples: FineTuningExample[] = approved.map(t => ({
    instruction: `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Maintain the tone, style and terminology of the original.`,
    input: t.source,
    output: t.target,
  }));

  const dataset: FineTuningDataset = {
    id: `ds_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    name: `${gameId}_${sourceLanguage}-${targetLanguage}_qa_${approved.length}ex`,
    description: `Generated from ${approved.length} QA-approved translations`,
    sourceLanguage,
    targetLanguage,
    exampleCount: examples.length,
    approvedOnly: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const datasets = loadFromStorage<FineTuningDataset>(DATASETS_KEY);
  datasets.push(dataset);
  saveToStorage(DATASETS_KEY, datasets);
  localStorage.setItem(`gs_finetune_examples_${dataset.id}`, JSON.stringify(examples));

  clientLogger.info(`[FineTuning] Dataset QA generato: ${dataset.name} (${examples.length} esempi)`);
  return { dataset, examples };
}

/**
 * Ottieni tutti i dataset salvati.
 */
export function getDatasets(gameId?: string): FineTuningDataset[] {
  const datasets = loadFromStorage<FineTuningDataset>(DATASETS_KEY);
  if (gameId) return datasets.filter(d => d.gameId === gameId);
  return datasets;
}

/**
 * Ottieni gli esempi di un dataset.
 */
export function getDatasetExamples(datasetId: string): FineTuningExample[] {
  try {
    const raw = localStorage.getItem(`gs_finetune_examples_${datasetId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Elimina un dataset e i suoi esempi.
 */
export function deleteDataset(datasetId: string): void {
  const datasets = loadFromStorage<FineTuningDataset>(DATASETS_KEY);
  saveToStorage(DATASETS_KEY, datasets.filter(d => d.id !== datasetId));
  localStorage.removeItem(`gs_finetune_examples_${datasetId}`);
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Esporta il dataset in formato JSONL (OpenAI fine-tuning format).
 * Formato: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
 */
export function exportToJsonlOpenAI(examples: FineTuningExample[]): string {
  return examples.map(ex => JSON.stringify({
    messages: [
      { role: 'system', content: ex.instruction },
      { role: 'user', content: ex.input },
      { role: 'assistant', content: ex.output },
    ],
  })).join('\n');
}

/**
 * Esporta il dataset in formato JSONL (Ollama/LLaMA format).
 * Formato: {"system": "...", "prompt": "...", "response": "..."}
 */
export function exportToJsonlOllama(examples: FineTuningExample[]): string {
  return examples.map(ex => JSON.stringify({
    system: ex.instruction,
    prompt: ex.input,
    response: ex.output,
  })).join('\n');
}

/**
 * Esporta il dataset in formato Alpaca.
 * Formato: {"instruction": "...", "input": "...", "output": "..."}
 */
export function exportToAlpaca(examples: FineTuningExample[]): string {
  return JSON.stringify(examples, null, 2);
}

/**
 * Esporta il dataset in formato ChatML.
 */
export function exportToChatML(examples: FineTuningExample[]): string {
  return examples.map(ex => 
    `<|im_start|>system\n${ex.instruction}<|im_end|>\n<|im_start|>user\n${ex.input}<|im_end|>\n<|im_start|>assistant\n${ex.output}<|im_end|>`
  ).join('\n\n');
}

/**
 * Scarica un dataset come file.
 */
export function downloadDataset(
  examples: FineTuningExample[],
  filename: string,
  format: 'openai' | 'ollama' | 'alpaca' | 'chatml' = 'openai'
): void {
  let content: string;
  let extension: string;

  switch (format) {
    case 'openai':
      content = exportToJsonlOpenAI(examples);
      extension = 'jsonl';
      break;
    case 'ollama':
      content = exportToJsonlOllama(examples);
      extension = 'jsonl';
      break;
    case 'alpaca':
      content = exportToAlpaca(examples);
      extension = 'json';
      break;
    case 'chatml':
      content = exportToChatML(examples);
      extension = 'txt';
      break;
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${extension}`;
  a.click();
  URL.revokeObjectURL(url);

  clientLogger.info(`[FineTuning] Dataset scaricato: ${filename}.${extension} (${examples.length} esempi)`);
}

// ============================================================================
// MODEL MANAGEMENT
// ============================================================================

/**
 * Ottieni tutti i modelli.
 */
export function getModels(gameId?: string): FineTuningModel[] {
  const models = loadFromStorage<FineTuningModel>(MODELS_KEY);
  if (gameId) return models.filter(m => m.gameId === gameId);
  return models;
}

/**
 * Registra un nuovo modello.
 */
export function registerModel(model: Omit<FineTuningModel, 'id' | 'createdAt'>): FineTuningModel {
  const newModel: FineTuningModel = {
    ...model,
    id: `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };

  const models = loadFromStorage<FineTuningModel>(MODELS_KEY);
  models.push(newModel);
  saveToStorage(MODELS_KEY, models);

  return newModel;
}

/**
 * Aggiorna lo stato di un modello.
 */
export function updateModelStatus(
  modelId: string,
  status: FineTuningModel['status'],
  updates: Partial<FineTuningModel> = {}
): void {
  const models = loadFromStorage<FineTuningModel>(MODELS_KEY);
  const model = models.find(m => m.id === modelId);
  if (model) {
    Object.assign(model, updates, { status });
    if (status === 'completed') model.completedAt = Date.now();
    saveToStorage(MODELS_KEY, models);
  }
}

/**
 * Elimina un modello.
 */
export function deleteModel(modelId: string): void {
  const models = loadFromStorage<FineTuningModel>(MODELS_KEY);
  saveToStorage(MODELS_KEY, models.filter(m => m.id !== modelId));
}

/**
 * Verifica se Ollama è disponibile per il fine-tuning.
 */
export async function checkOllamaAvailability(): Promise<{
  available: boolean;
  models: string[];
  version: string | null;
}> {
  try {
    const resp = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) return { available: false, models: [], version: null };
    
    const data = await resp.json();
    const models: string[] = (data.models || []).map((m: { name: string }) => m.name);
    
    // Check version
    let version: string | null = null;
    try {
      const verResp = await fetch('http://localhost:11434/api/version', {
        signal: AbortSignal.timeout(2000),
      });
      if (verResp.ok) {
        const verData = await verResp.json();
        version = verData.version || null;
      }
    } catch { /* ignore */ }

    return { available: true, models, version };
  } catch {
    return { available: false, models: [], version: null };
  }
}

// ============================================================================
// DATASET STATISTICS
// ============================================================================

export interface DatasetStats {
  totalExamples: number;
  avgInputLength: number;
  avgOutputLength: number;
  uniqueInputs: number;
  duplicateCount: number;
  languagePair: string;
  qualityScore: number; // 0-1, based on approved ratio and usage count
}

/**
 * Calcola statistiche per un dataset.
 */
export function calculateDatasetStats(examples: FineTuningExample[], corrections: HumanCorrection[]): DatasetStats {
  const inputLengths = examples.map(e => e.input.length);
  const outputLengths = examples.map(e => e.output.length);
  const uniqueInputs = new Set(examples.map(e => e.input)).size;
  const duplicateCount = examples.length - uniqueInputs;
  
  const approvedCount = corrections.filter(c => c.approved).length;
  const avgUsage = corrections.reduce((sum, c) => sum + c.usageCount, 0) / (corrections.length || 1);
  const qualityScore = Math.min(
    (approvedCount / (corrections.length || 1)) * 0.5 +
    Math.min(avgUsage / 3, 1) * 0.3 +
    (uniqueInputs / (examples.length || 1)) * 0.2,
    1
  );

  return {
    totalExamples: examples.length,
    avgInputLength: inputLengths.reduce((a, b) => a + b, 0) / (inputLengths.length || 1),
    avgOutputLength: outputLengths.reduce((a, b) => a + b, 0) / (outputLengths.length || 1),
    uniqueInputs,
    duplicateCount,
    languagePair: corrections[0] ? `${corrections[0].sourceLanguage}-${corrections[0].targetLanguage}` : 'unknown',
    qualityScore,
  };
}

