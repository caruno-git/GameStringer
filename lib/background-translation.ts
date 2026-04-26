/**
 * 🔄 Background Translation Manager
 * 
 * Sistema globale per eseguire traduzioni in background.
 * Permette all'utente di navigare nell'app mentre le traduzioni lavorano.
 * 
 * Architettura:
 * - Singleton globale accessibile da qualsiasi componente
 * - Event-based progress updates (CustomEvent su window)
 * - Persistenza stato in localStorage per sopravvivere a navigazione
 * - Integrazione con il sistema di notifiche Tauri
 */

import { translateSmart, type TranslateResult } from './ai-translate-direct';
import { runQualityGates, type QualityReport } from './quality-gates';
import { harvestBatch, type HarvestInput } from './context-harvester';
import { clientLogger } from '@/lib/client-logger';

// ============================================================================
// TYPES
// ============================================================================

export type BGJobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface BGTranslationJob {
  id: string;
  gameId: string;
  gameName: string;
  gameImage?: string;
  sourceLang: string;
  targetLang: string;
  status: BGJobStatus;
  
  // File data
  files: BGJobFile[];
  
  // Progress
  totalStrings: number;
  translatedCount: number;
  failedCount: number;
  percent: number;
  currentFile?: string;
  currentBatch?: number;
  totalBatches?: number;
  lastProvider?: string;
  lastTranslated?: { original: string; translation: string };
  errors: string[];
  
  // Timing
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  
  // Options
  useContextHarvest: boolean;
}

export interface BGJobFile {
  name: string;
  format: string;
  strings: BGJobString[];
}

export interface BGJobString {
  key: string;
  value: string;
  comment?: string;
  maxLength?: number;
}

export interface BGTranslatedString {
  key: string;
  original: string;
  translation: string;
  qaScore: number;
  qaPassed: boolean;
  qaReport?: QualityReport;
  isEdited: boolean;
}

export type BGJobEvent = 
  | { type: 'job_added'; job: BGTranslationJob }
  | { type: 'job_updated'; job: BGTranslationJob }
  | { type: 'job_completed'; job: BGTranslationJob }
  | { type: 'job_failed'; job: BGTranslationJob }
  | { type: 'job_removed'; jobId: string }
  | { type: 'jobs_changed' };

type BGJobListener = (event: BGJobEvent) => void;

// ============================================================================
// HELPER — filter code strings (same as auto-translate)
// ============================================================================

function isCodeString(value: string): boolean {
  const v = value.trim();
  if (v.length <= 1) return true;
  if (/^[\d\s.,;:!?@#$%^&*()\-+=<>{}[\]/\\|~`'"]+$/.test(v)) return true;
  if (/^[A-Z_][A-Z0-9_]{2,}$/.test(v)) return true;
  if (/^\{[\d%]\}$/.test(v)) return true;
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return true;
  if (/^(https?:\/\/|ftp:\/\/|www\.)/.test(v)) return true;
  if (/^[a-zA-Z]+\.[a-zA-Z]+(\.[a-zA-Z]+)*$/.test(v) && !v.includes(' ')) return true;
  return false;
}

// ============================================================================
// STORAGE KEYS
// ============================================================================

const JOBS_KEY = 'gs_bg_translation_jobs';
const RESULTS_KEY_PREFIX = 'gs_bg_results_';

// ============================================================================
// BACKGROUND TRANSLATION MANAGER
// ============================================================================

class BackgroundTranslationManager {
  private jobs: Map<string, BGTranslationJob> = new Map();
  private results: Map<string, Map<string, BGTranslatedString[]>> = new Map();
  private abortFlags: Map<string, boolean> = new Map();
  private pauseFlags: Map<string, boolean> = new Map();
  private listeners: Set<BGJobListener> = new Set();
  private initialized = false;

  // ── Init ────────────────────────────────────────────────────

  initialize() {
    if (this.initialized) return;
    this.initialized = true;
    this.loadFromStorage();
    clientLogger.debug('[BGTranslation] Manager inizializzato');
  }

  // ── Event System ────────────────────────────────────────────

  on(listener: BGJobListener): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(event: BGJobEvent) {
    for (const listener of this.listeners) {
      try { listener(event); } catch (e) { clientLogger.error('[BGTranslation] Listener error:', e); }
    }
    // Also dispatch on window for cross-component reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bg-translation-event', { detail: event }));
    }
  }

  // ── Job CRUD ────────────────────────────────────────────────

  getJobs(): BGTranslationJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  getJob(id: string): BGTranslationJob | undefined {
    return this.jobs.get(id);
  }

  getActiveJobs(): BGTranslationJob[] {
    return this.getJobs().filter(j => j.status === 'running' || j.status === 'queued' || j.status === 'paused');
  }

  getResults(jobId: string): Map<string, BGTranslatedString[]> | undefined {
    return this.results.get(jobId);
  }

  /**
   * Crea un nuovo job di traduzione in background
   */
  createJob(params: {
    gameId: string;
    gameName: string;
    gameImage?: string;
    sourceLang: string;
    targetLang: string;
    files: BGJobFile[];
    useContextHarvest?: boolean;
  }): BGTranslationJob {
    this.initialize();
    
    const totalStrings = params.files.reduce((s, f) => s + f.strings.length, 0);
    
    const job: BGTranslationJob = {
      id: `bg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      gameId: params.gameId,
      gameName: params.gameName,
      gameImage: params.gameImage,
      sourceLang: params.sourceLang,
      targetLang: params.targetLang,
      status: 'queued',
      files: params.files,
      totalStrings,
      translatedCount: 0,
      failedCount: 0,
      percent: 0,
      errors: [],
      createdAt: Date.now(),
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      useContextHarvest: params.useContextHarvest ?? true,
    };

    this.jobs.set(job.id, job);
    this.results.set(job.id, new Map());
    this.abortFlags.set(job.id, false);
    this.pauseFlags.set(job.id, false);
    this.saveToStorage();
    this.emit({ type: 'job_added', job });
    this.emit({ type: 'jobs_changed' });

    clientLogger.debug(`[BGTranslation] Job creato: ${job.gameName} (${totalStrings} stringhe)`);
    return job;
  }

  /**
   * Avvia un job — esegue in background, ritorna immediatamente
   */
  startJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== 'queued' && job.status !== 'paused')) return;

    job.status = 'running';
    job.startedAt = job.startedAt || Date.now();
    this.abortFlags.set(jobId, false);
    this.pauseFlags.set(jobId, false);
    this.updateJob(job);

    // Fire and forget — the translation runs async
    this.runTranslation(jobId).catch(err => {
      clientLogger.error(`[BGTranslation] Job ${jobId} crashed:`, err);
      const j = this.jobs.get(jobId);
      if (j) {
        j.status = 'failed';
        j.errors.push(String(err));
        this.updateJob(j);
        this.emit({ type: 'job_failed', job: j });
      }
    });
  }

  /**
   * Mette in pausa un job
   */
  pauseJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'running') return;
    this.pauseFlags.set(jobId, true);
    job.status = 'paused';
    this.updateJob(job);
  }

  /**
   * Riprende un job in pausa
   */
  resumeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'paused') return;
    this.startJob(jobId);
  }

  /**
   * Cancella un job
   */
  cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;
    this.abortFlags.set(jobId, true);
    this.pauseFlags.set(jobId, false);
    job.status = 'cancelled';
    this.updateJob(job);
  }

  /**
   * Rimuove un job completato/fallito/cancellato
   */
  removeJob(jobId: string): void {
    this.jobs.delete(jobId);
    this.results.delete(jobId);
    this.abortFlags.delete(jobId);
    this.pauseFlags.delete(jobId);
    this.saveToStorage();
    this.removeResultsFromStorage(jobId);
    this.emit({ type: 'job_removed', jobId });
    this.emit({ type: 'jobs_changed' });
  }

  // ── Translation Engine ──────────────────────────────────────

  private async runTranslation(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const allTranslated = this.results.get(jobId) || new Map<string, BGTranslatedString[]>();
    const startTime = job.startedAt || Date.now();
    let globalTranslated = job.translatedCount;
    let consecutiveFailedBatches = 0;
    const batchSize = 20;
    const garbageResponses = /^(NO QUERY SPECIFIED|PLEASE SELECT TWO LANGUAGES|QUERY LENGTH LIMIT|MYMEMORY WARNING|YOU USED ALL AVAILABLE FREE)/i;

    for (let fi = 0; fi < job.files.length; fi++) {
      const file = job.files[fi];
      const strings = file.strings;
      if (strings.length === 0) continue;

      // Skip already completed files
      const existingFile = allTranslated.get(file.name);
      if (existingFile && existingFile.length === strings.length && existingFile.every(t => t.translation)) {
        continue;
      }

      consecutiveFailedBatches = 0;
      const fileTranslations: BGTranslatedString[] = existingFile ? existingFile.filter(t => t.translation) : [];
      const alreadyDoneMap = new Map(fileTranslations.map(t => [t.key, t]));

      const pendingStrings = strings.filter(s => {
        if (!s.value || s.value.trim().length === 0 || isCodeString(s.value)) return false;
        const existing = alreadyDoneMap.get(s.key);
        if (!existing) return true;
        if (existing.original !== s.value) {
          const idx = fileTranslations.findIndex(t => t.key === s.key);
          if (idx >= 0) fileTranslations.splice(idx, 1);
          return true;
        }
        return false;
      });

      if (pendingStrings.length === 0) continue;

      const totalBatches = Math.ceil(pendingStrings.length / batchSize);

      for (let bi = 0; bi < totalBatches; bi++) {
        // Check abort/pause
        if (this.abortFlags.get(jobId)) {
          job.status = 'cancelled';
          this.updateJob(job);
          return;
        }

        // Pausa: aspetta resume
        while (this.pauseFlags.get(jobId)) {
          await new Promise(r => setTimeout(r, 500));
          if (this.abortFlags.get(jobId)) {
            job.status = 'cancelled';
            this.updateJob(job);
            return;
          }
        }

        const batch = pendingStrings.slice(bi * batchSize, (bi + 1) * batchSize);
        const batchTexts = batch.map(s => s.value);

        // Update progress
        job.currentFile = file.name;
        job.currentBatch = bi + 1;
        job.totalBatches = totalBatches;
        job.elapsedMs = Date.now() - startTime;
        job.percent = job.totalStrings > 0 ? Math.round((globalTranslated / job.totalStrings) * 100) : 0;

        // ETA
        if (globalTranslated > 0 && job.elapsedMs > 0) {
          const msPerString = job.elapsedMs / globalTranslated;
          job.estimatedRemainingMs = Math.round(msPerString * (job.totalStrings - globalTranslated));
        }

        this.updateJob(job);

        try {
          // Optional context harvest
          let harvestedContext: ReturnType<typeof harvestBatch> | undefined;
          if (job.useContextHarvest) {
            try {
              const inputs: HarvestInput[] = batch.map((s, idx) => ({
                text: s.value, key: s.key, filename: file.name,
                comment: s.comment, maxLength: s.maxLength,
                previousText: idx > 0 ? batch[idx - 1].value : undefined,
                nextText: idx < batch.length - 1 ? batch[idx + 1].value : undefined,
              }));
              harvestedContext = harvestBatch(inputs);
            } catch { /* ignore */ }
          }

          const result: TranslateResult = await translateSmart({
            texts: batchTexts,
            sourceLanguage: job.sourceLang,
            targetLanguage: job.targetLang,
            harvestedContext,
            gameId: job.gameId,
          });

          job.lastProvider = result.provider;

          if (!result.success) {
            consecutiveFailedBatches++;
            for (const s of batch) {
              fileTranslations.push({ key: s.key, original: s.value, translation: '', qaScore: 0, qaPassed: false, isEdited: false });
              globalTranslated++;
            }
            job.failedCount += batch.length;
            if (consecutiveFailedBatches >= 3) {
              job.errors.push('Tutti i provider bloccati. Traduzione fermata.');
              break;
            }
          } else {
            let batchHasOutput = 0;
            for (let si = 0; si < batch.length; si++) {
              const original = batch[si].value;
              const rawTranslation = result.translations[si] || '';
              const translation = garbageResponses.test(rawTranslation) ? '' : rawTranslation;
              const hasOutput = !!translation;
              if (hasOutput) batchHasOutput++;

              let qaScore = hasOutput ? (translation !== original ? 100 : 95) : 0;
              let qaPassed = hasOutput;
              let qaReport: QualityReport | undefined;

              if (translation && translation !== original) {
                try {
                  qaReport = runQualityGates({ sourceText: original, translatedText: translation, targetLanguage: job.targetLang });
                  qaScore = qaReport.overallScore;
                  qaPassed = qaReport.passed;
                } catch { /* ignore */ }
              }

              fileTranslations.push({ key: batch[si].key, original, translation: hasOutput ? translation : '', qaScore, qaPassed, qaReport, isEdited: false });
              globalTranslated++;

              if (hasOutput && translation !== original) {
                job.lastTranslated = { original, translation };
              }
            }

            if (batchHasOutput === 0) {
              consecutiveFailedBatches++;
              if (consecutiveFailedBatches >= 5) {
                job.errors.push('5 batch senza output. Fermata automatica.');
                break;
              }
            } else {
              consecutiveFailedBatches = 0;
            }
          }
        } catch (err: unknown) {
          job.errors.push(`${file.name} batch ${bi + 1}: ${err instanceof Error ? err.message : 'Errore'}`);
          for (const s of batch) {
            fileTranslations.push({ key: s.key, original: s.value, translation: '', qaScore: 0, qaPassed: false, isEdited: false });
            globalTranslated++;
          }
          job.failedCount += batch.length;
          consecutiveFailedBatches++;
          if (consecutiveFailedBatches >= 3) {
            job.errors.push('Troppi errori. Fermata automatica.');
            break;
          }
        }

        // Update counts
        job.translatedCount = globalTranslated;
        allTranslated.set(file.name, [...fileTranslations]);
        this.results.set(jobId, allTranslated);

        // Persist every 5 batches
        if (bi % 5 === 0) {
          this.saveResultsToStorage(jobId);
          this.saveToStorage();
        }
      }

      allTranslated.set(file.name, [...fileTranslations]);

      if (this.abortFlags.get(jobId)) {
        job.status = 'cancelled';
        this.updateJob(job);
        this.saveResultsToStorage(jobId);
        return;
      }
    }

    // Completed
    job.translatedCount = globalTranslated;
    job.percent = 100;
    job.completedAt = Date.now();
    job.elapsedMs = Date.now() - startTime;
    job.status = job.errors.length > 0 && globalTranslated === 0 ? 'failed' : 'completed';
    
    this.updateJob(job);
    this.saveResultsToStorage(jobId);

    if (job.status === 'completed') {
      this.emit({ type: 'job_completed', job });
      // Notifica OS
      this.notifyCompletion(job);
    } else {
      this.emit({ type: 'job_failed', job });
    }

    clientLogger.debug(`[BGTranslation] Job ${job.gameName}: ${job.status} — ${globalTranslated}/${job.totalStrings} stringhe`);
  }

  // ── Notifications ───────────────────────────────────────────

  private async notifyCompletion(job: BGTranslationJob) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('notify_background_operation_completed', {
        operationType: 'translation',
        operationId: job.gameId,
        success: true,
        details: `Traduzione completata: ${job.translatedCount} stringhe per ${job.gameName}`,
      });
    } catch {
      // Not in Tauri environment
    }
  }

  // ── Storage ─────────────────────────────────────────────────

  private updateJob(job: BGTranslationJob) {
    this.jobs.set(job.id, { ...job });
    this.emit({ type: 'job_updated', job: { ...job } });
    this.emit({ type: 'jobs_changed' });
  }

  private saveToStorage() {
    try {
      const serializable = Array.from(this.jobs.values()).map(j => ({
        ...j,
        files: j.files.map(f => ({ name: f.name, format: f.format, stringCount: f.strings.length })),
      }));
      localStorage.setItem(JOBS_KEY, JSON.stringify(serializable));
    } catch { /* storage full */ }
  }

  private saveResultsToStorage(jobId: string) {
    try {
      const results = this.results.get(jobId);
      if (!results) return;
      const data: Record<string, BGTranslatedString[]> = {};
      results.forEach((v, k) => { data[k] = v; });
      localStorage.setItem(`${RESULTS_KEY_PREFIX}${jobId}`, JSON.stringify(data));
    } catch { /* storage full */ }
  }

  private removeResultsFromStorage(jobId: string) {
    try { localStorage.removeItem(`${RESULTS_KEY_PREFIX}${jobId}`); } catch { /* ignore */ }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(JOBS_KEY);
      if (!saved) return;
      const jobs = JSON.parse(saved) as BGTranslationJob[];
      for (const j of jobs) {
        // Restore files as empty (no raw strings in localStorage)
        if (!j.files?.[0]?.strings) {
          j.files = (j.files || []).map((f: BGJobFile & { stringCount?: number }) => ({
            name: f.name,
            format: f.format,
            strings: new Array(f.stringCount || 0),
          }));
        }
        // Mark running jobs as paused (they were interrupted)
        if (j.status === 'running' || j.status === 'queued') {
          j.status = 'paused';
        }
        this.jobs.set(j.id, j);
        this.abortFlags.set(j.id, false);
        this.pauseFlags.set(j.id, false);
      }

      // Load results
      for (const j of jobs) {
        try {
          const resultsRaw = localStorage.getItem(`${RESULTS_KEY_PREFIX}${j.id}`);
          if (resultsRaw) {
            const data = JSON.parse(resultsRaw) as Record<string, BGTranslatedString[]>;
            const map = new Map<string, BGTranslatedString[]>();
            for (const [k, v] of Object.entries(data)) map.set(k, v);
            this.results.set(j.id, map);
          }
        } catch { /* ignore */ }
      }
    } catch { /* corrupt data */ }
  }

  // ── Utility ─────────────────────────────────────────────────

  formatTime(ms: number): string {
    if (ms <= 0) return '—';
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
    const h = Math.floor(ms / 3600000);
    const m = Math.round((ms % 3600000) / 60000);
    return `${h}h ${m}min`;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let _instance: BackgroundTranslationManager | null = null;

export function getBackgroundTranslationManager(): BackgroundTranslationManager {
  if (!_instance) {
    _instance = new BackgroundTranslationManager();
    _instance.initialize();
  }
  return _instance;
}
