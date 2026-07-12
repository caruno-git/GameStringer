/**
 * Scan robusto delle lingue supportate dai giochi Steam.
 *
 * Interroga il comando `fetch_game_languages` (Steam appdetails) per ogni gioco NON
 * ancora in cache, con backoff esponenziale sul rate-limit (429/403) e retry sullo
 * stesso gioco. NON si ferma in blocco su errori sporadici: gli errori non-rate-limit
 * saltano solo quel gioco. Aggiornamento incrementale via onItem/onProgress; abortabile.
 */
import { invoke } from '@/lib/tauri-api';

export interface LangScanProgress {
  done: number;
  total: number;
  found: number;
}

export interface LangScanOptions {
  onItem?: (appId: string, langs: string[]) => void;
  onProgress?: (p: LangScanProgress) => void;
  signal?: AbortSignal;
  /** Numero massimo di giochi da interrogare in una passata (default 500). */
  maxGames?: number;
  /** Pausa base tra un gioco e l'altro, in ms (default 700). */
  baseDelayMs?: number;
}

interface ScannableGame {
  app_id?: string | null;
  platform?: string | null;
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) { resolve(); return; }
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}

/**
 * Scansiona le lingue dei giochi passati (solo Steam con app_id, saltando quelli gia' in cache).
 * Ritorna una NUOVA mappa cache aggiornata (non muta l'input).
 */
export async function scanGameLanguages(
  games: ScannableGame[],
  existingCache: Record<string, string[]>,
  opts: LangScanOptions = {},
): Promise<Record<string, string[]>> {
  const { onItem, onProgress, signal, maxGames = 500, baseDelayMs = 700 } = opts;
  const cache: Record<string, string[]> = { ...existingCache };

  const targets = games
    .filter((g) => g.platform === 'Steam' && !!g.app_id && !cache[g.app_id as string])
    .slice(0, maxGames);

  const total = targets.length;
  let done = 0;
  let found = 0;
  onProgress?.({ done, total, found });

  for (const g of targets) {
    if (signal?.aborted) break;
    const appId = g.app_id as string;

    let attempt = 0;
    // Fino a 4 tentativi sullo STESSO gioco quando e' rate-limit; gli altri errori saltano il gioco.
    while (attempt < 4 && !signal?.aborted) {
      try {
        const langs = await invoke<string[]>('fetch_game_languages', { appId });
        if (langs && langs.length > 0) {
          cache[appId] = langs;
          found++;
          onItem?.(appId, langs);
        }
        break;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        const rateLimited = msg.includes('429') || msg.includes('403');
        if (rateLimited) {
          attempt++;
          // Backoff esponenziale: 8s, 16s, 32s (cap 45s).
          await sleep(Math.min(8000 * 2 ** (attempt - 1), 45000), signal);
        } else {
          // Errore specifico del gioco (404 / parse / timeout): salta e prosegui.
          break;
        }
      }
    }

    done++;
    onProgress?.({ done, total, found });
    if (!signal?.aborted) await sleep(baseDelayMs, signal);
  }

  return cache;
}
