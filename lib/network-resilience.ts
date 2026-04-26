/**
 * 🌐 Network Resilience
 * 
 * Monitor della connessione di rete con:
 * - Rilevamento online/offline + Supabase health check
 * - Retry con exponential backoff
 * - Coda offline per operazioni (eseguite quando torna la connessione)
 * - Eventi su window per reattività cross-component
 * - Barra stato connessione (componente separato)
 */

import { clientLogger } from '@/lib/client-logger';

// ============================================================================
// TYPES
// ============================================================================

export interface NetworkStatus {
  isOnline: boolean;
  isSupabaseOnline: boolean;
  latencyMs: number | null;
  lastCheckedAt: number;
  offlineSince: number | null;
}

export interface RetryOptions {
  maxRetries?: number;       // default: 3
  baseDelayMs?: number;      // default: 1000
  maxDelayMs?: number;       // default: 10000
  retryOn?: (err: unknown) => boolean;  // which errors to retry
}

export interface QueuedOperation {
  id: string;
  key: string;               // group key for batch processing
  fn: () => Promise<unknown>;
  args?: unknown;
  queuedAt: number;
  retries: number;
}

type NetworkListener = (status: NetworkStatus) => void;

// ============================================================================
// STATE
// ============================================================================

let _status: NetworkStatus = {
  isOnline: true,
  isSupabaseOnline: true,
  latencyMs: null,
  lastCheckedAt: Date.now(),
  offlineSince: null,
};

let _listeners: Set<NetworkListener> = new Set();
let _supabaseCheckInterval: ReturnType<typeof setInterval> | null = null;
let _offlineQueue: QueuedOperation[] = [];
let _isProcessingQueue = false;

// ============================================================================
// NETWORK MONITOR
// ============================================================================

function updateStatus(partial: Partial<NetworkStatus>): void {
  const prev = { ..._status };
  _status = { ..._status, ...partial, lastCheckedAt: Date.now() };

  // Track offline since
  if (!_status.isOnline && prev.isOnline) {
    _status.offlineSince = Date.now();
  } else if (_status.isOnline && !prev.isOnline) {
    _status.offlineSince = null;
  }

  // Notify listeners
  for (const listener of _listeners) {
    try { listener(_status); } catch { /* ignore */ }
  }

  // Dispatch window event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gs-network-status', { detail: _status }));
  }

  // If back online, process queue
  if (_status.isOnline && !prev.isOnline) {
    clientLogger.info('[NetworkResilience] Connessione ripristinata — processo coda offline');
    processOfflineQueue();
  }
}

/**
 * Inizializza il monitor di rete.
 * Da chiamare una volta all'avvio dell'app.
 */
let _monitorInitialized = false;

// Store listener references for cleanup
let _onlineHandler: (() => void) | null = null;
let _offlineHandler: (() => void) | null = null;

export function initNetworkMonitor(supabaseUrl?: string): void {
  if (typeof window === 'undefined') return;
  if (_monitorInitialized) return;
  _monitorInitialized = true;

  // Browser online/offline events
  _onlineHandler = () => {
    clientLogger.info('[NetworkResilience] Browser: online');
    updateStatus({ isOnline: true });
  };
  _offlineHandler = () => {
    clientLogger.info('[NetworkResilience] Browser: offline');
    updateStatus({ isOnline: false, isSupabaseOnline: false });
  };
  window.addEventListener('online', _onlineHandler);
  window.addEventListener('offline', _offlineHandler);

  // Initial state
  updateStatus({ isOnline: navigator.onLine });

  // Periodic Supabase health check (every 30s)
  if (supabaseUrl) {
    const checkSupabase = async () => {
      if (!navigator.onLine) {
        updateStatus({ isSupabaseOnline: false });
        return;
      }
      
      try {
        const start = Date.now();
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'HEAD',
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        });
        const latency = Date.now() - start;
        
        // 200 or 401 (unauthorized but server is up) = online
        const isUp = response.status === 200 || response.status === 401;
        updateStatus({ isSupabaseOnline: isUp, latencyMs: latency });
      } catch {
        updateStatus({ isSupabaseOnline: false, latencyMs: null });
      }
    };

    checkSupabase();
    _supabaseCheckInterval = setInterval(checkSupabase, 30000);
  }

  clientLogger.info('[NetworkResilience] Monitor inizializzato');
}

/**
 * Ferma il monitor di rete.
 */
export function stopNetworkMonitor(): void {
  _monitorInitialized = false;
  if (_onlineHandler) {
    window.removeEventListener('online', _onlineHandler);
    _onlineHandler = null;
  }
  if (_offlineHandler) {
    window.removeEventListener('offline', _offlineHandler);
    _offlineHandler = null;
  }
  if (_supabaseCheckInterval) {
    clearInterval(_supabaseCheckInterval);
    _supabaseCheckInterval = null;
  }
  _listeners.clear();
}

/**
 * Ottieni lo stato corrente della rete.
 */
export function getNetworkStatus(): NetworkStatus {
  return { ..._status };
}

/**
 * Iscriviti agli aggiornamenti dello stato di rete.
 */
export function onNetworkStatusChange(listener: NetworkListener): () => void {
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
}

// ============================================================================
// RETRY WITH BACKOFF
// ============================================================================

/**
 * Esegue una funzione con retry automatico e exponential backoff.
 * 
 * @example
 * const data = await withRetry(() => supabase.from('table').select('*'), {
 *   maxRetries: 3,
 *   baseDelayMs: 1000,
 * });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    retryOn = defaultRetryFilter,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      // Don't retry if error doesn't match filter
      if (!retryOn(err)) throw err;

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        clientLogger.warn(`[NetworkResilience] withRetry: ${maxRetries} tentativi falliti`, String(err));
        throw err;
      }

      // Calculate delay with exponential backoff + jitter
      const delay = Math.min(
        baseDelayMs * Math.pow(2, attempt) + Math.random() * 500,
        maxDelayMs
      );

      clientLogger.debug(`[NetworkResilience] withRetry: tentativo ${attempt + 1}/${maxRetries} fallito, retry in ${Math.round(delay)}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Filtro di default: ritenta solo su errori di rete (non su errori logici).
 */
function defaultRetryFilter(err: unknown): boolean {
  if (err instanceof TypeError && err.message.includes('fetch')) return true;
  if (err instanceof TypeError && err.message.includes('network')) return true;
  if (err instanceof TypeError && err.message.includes('Failed to fetch')) return true;
  
  // Supabase errors
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (e.status === 0 || e.status === 502 || e.status === 503 || e.status === 504) return true;
    if (e.code === 'NETWORK_ERROR' || e.code === 'CONNECTION_ERROR') return true;
    if (e.message && typeof e.message === 'string') {
      const msg = e.message.toLowerCase();
      if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch') || msg.includes('econnrefused')) return true;
    }
  }

  return false;
}

// ============================================================================
// OFFLINE QUEUE
// ============================================================================

/**
 * Accoda un'operazione per essere eseguita quando la connessione ritorna.
 * Se online, esegue immediatamente.
 * 
 * @param key - gruppo per operazioni simili (es. 'chat-message', 'presence-update')
 * @param fn - funzione da eseguire
 * @param args - argomenti opzionali per debug
 */
export async function withOfflineQueue<T>(
  fn: () => Promise<T>,
  key: string,
  args?: unknown
): Promise<T> {
  // If online, execute immediately
  if (_status.isOnline) {
    return await fn();
  }

  // If offline, queue for later
  const operation: QueuedOperation = {
    id: `op_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key,
    fn: fn as () => Promise<unknown>,
    args,
    queuedAt: Date.now(),
    retries: 0,
  };

  _offlineQueue.push(operation);
  clientLogger.info(`[NetworkResilience] Operazione accodata: ${key} (coda: ${_offlineQueue.length})`);

  // Dispatch event for UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gs-offline-queue-update', {
      detail: { queueLength: _offlineQueue.length, operation }
    }));
  }

  // Return a promise that never resolves (operation will execute later)
  return new Promise<T>(() => {});
}

/**
 * Processa la coda offline quando la connessione ritorna.
 */
async function processOfflineQueue(): Promise<void> {
  if (_isProcessingQueue || _offlineQueue.length === 0) return;
  _isProcessingQueue = true;

  const queue = [..._offlineQueue];
  _offlineQueue = [];

  clientLogger.info(`[NetworkResilience] Processo coda: ${queue.length} operazioni`);

  for (const op of queue) {
    try {
      await withRetry(op.fn as () => Promise<unknown>, { maxRetries: 2 });
      clientLogger.debug(`[NetworkResilience] Operazione completata: ${op.key}`);
    } catch (err) {
      clientLogger.warn(`[NetworkResilience] Operazione fallita: ${op.key}`, String(err));
      // Re-queue with increment retry
      op.retries++;
      if (op.retries < 3) {
        _offlineQueue.push(op);
      }
    }
  }

  _isProcessingQueue = false;

  // Dispatch event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('gs-offline-queue-update', {
      detail: { queueLength: _offlineQueue.length }
    }));
  }
}

/**
 * Ottieni la lunghezza della coda offline.
 */
export function getOfflineQueueLength(): number {
  return _offlineQueue.length;
}

/**
 * Svuota la coda offline (senza eseguire).
 */
export function clearOfflineQueue(): void {
  _offlineQueue = [];
}

// ============================================================================
// CONVENIENCE
// ============================================================================

/**
 * Esegue una fetch con retry e fallback graceful.
 */
export async function resilientFetch<T>(
  url: string,
  options?: RequestInit,
  retryOptions?: RetryOptions
): Promise<T | null> {
  try {
    const response = await withRetry(() => fetch(url, options), retryOptions);
    if (!response.ok) {
      clientLogger.warn(`[NetworkResilience] HTTP ${response.status}: ${url}`);
      return null;
    }
    return await response.json() as T;
  } catch (err) {
    clientLogger.warn(`[NetworkResilience] fetch fallita: ${url}`, String(err));
    return null;
  }
}

/**
 * Esegue una Supabase query con retry.
 */
export async function resilientSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  retryOptions?: RetryOptions
): Promise<T | null> {
  try {
    const result = await withRetry(queryFn, retryOptions);
    if (result.error) {
      clientLogger.warn('[NetworkResilience] Supabase error:', String(result.error));
      return null;
    }
    return result.data;
  } catch (err) {
    clientLogger.warn('[NetworkResilience] Supabase query fallita:', String(err));
    return null;
  }
}
