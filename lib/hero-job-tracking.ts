'use client';

/**
 * Tracking trasversale per i job di traduzione "hero" (Ren'Py, Hendrix, RPG Maker,
 * Visionaire…). Centralizza:
 *  - guardia anti-duplicato GLOBALE (sopravvive a navigazione/smontaggio);
 *  - operazione nel ProgressProvider globale (resta visibile e continua a
 *    cambiare pagina, perché il provider è montato nel layout);
 *  - badge/notifiche tray (job attivi + notifica a fine lavoro);
 *  - registrazione/aggiornamento nella pagina "Progetti" (IndexedDB).
 *
 * Il loop di traduzione resta nell'orchestratore del motore: qui si agganciano
 * solo gli "effetti" trasversali tramite onProgress/done/fail.
 */

import { projectService } from '@/lib/services/translation-projects';
import type { ProgressState } from '@/lib/types/progress';

export interface HeroTrackMeta {
  engineId: string;     // 'renpy' | 'hendrix' | 'rpgmaker' | 'visionaire'
  engineLabel: string;  // "Ren'Py", "Hendrix", "RPG Maker"…
  gamePath: string;
  gameId?: string;
  gameName?: string;
  gameImage?: string;
  sourceLang?: string;
  targetLang: string;
  // Testi già tradotti per l'operazione di progress (dal componente, via t()).
  opTitle?: string;
  opDesc?: string;
}

export interface HeroTracker {
  onProgress: (done: number, total: number) => void;
  done: (translated: number, total: number) => Promise<void>;
  fail: (err: unknown) => Promise<void>;
}

const _g = globalThis as unknown as { __gsHeroRunning?: Set<string> };
if (!_g.__gsHeroRunning) _g.__gsHeroRunning = new Set<string>();
const RUNNING = _g.__gsHeroRunning;

export function heroKey(engineId: string, gamePath: string): string {
  return `${engineId}:${gamePath}`;
}

export function isHeroJobRunning(engineId: string, gamePath: string): boolean {
  return RUNNING.has(heroKey(engineId, gamePath));
}

/**
 * Avvia il tracking trasversale. Ritorna null se un job per lo stesso
 * motore+gioco è già in corso (così il chiamante evita di lanciarne un altro).
 */
export function startHeroTracking(progress: ProgressState, meta: HeroTrackMeta): HeroTracker | null {
  const key = heroKey(meta.engineId, meta.gamePath);
  if (RUNNING.has(key)) return null;
  RUNNING.add(key);

  const opId = `${meta.engineId}-${meta.gamePath}`;
  progress.startOperation(opId, {
    title: meta.opTitle || `Translation — ${meta.gameName || meta.engineLabel}`,
    description: meta.opDesc || `${meta.engineLabel} · background`,
    isBackground: true,
    canMinimize: true,
  });
  void import('@/lib/notifications/tray-notifications').then(m => m.incrementActiveTranslations()).catch(() => {});

  let projectId: string | null = null;
  let created = false;

  const ensureProject = async (total: number) => {
    if (created || !meta.gameId || total <= 0) return;
    created = true; // set sincrono: evita doppia creazione su progressi ravvicinati
    try {
      const proj = await projectService.createOrGetProject({
        gameId: meta.gameId,
        gameName: meta.gameName || meta.gameId,
        gameImage: meta.gameImage,
        engine: meta.engineLabel,
        sourceLanguage: meta.sourceLang || 'en',
        targetLanguage: meta.targetLang,
        files: [{ path: meta.gamePath, name: meta.engineLabel, type: meta.engineId, strings: total }],
      });
      projectId = proj.id;
      if (proj.totalStrings !== total) { proj.totalStrings = total; await projectService.saveProject(proj); }
    } catch { /* progetto non disponibile: si prosegue */ }
  };

  const releaseGuardAndBadge = async () => {
    RUNNING.delete(key);
    try {
      const tray = await import('@/lib/notifications/tray-notifications');
      await tray.decrementActiveTranslations();
    } catch { /* tray non disponibile */ }
  };

  return {
    onProgress: (done: number, total: number) => {
      void ensureProject(total);
      progress.updateProgress(opId, total > 0 ? (done / total) * 100 : 0, `${done}/${total}`);
      if (projectId) void projectService.updateProgress(projectId, done).catch(() => {});
    },
    done: async (translated: number, total: number) => {
      await ensureProject(total);
      progress.completeOperation(opId, { translated, total });
      if (projectId) await projectService.updateProgress(projectId, translated).catch(() => {});
      await releaseGuardAndBadge();
      try {
        const tray = await import('@/lib/notifications/tray-notifications');
        await tray.notifyTranslationCompleted(meta.gameName || 'Gioco', translated);
      } catch { /* ignore */ }
    },
    fail: async (err: unknown) => {
      progress.failOperation(opId, err instanceof Error ? err : new Error(String(err)));
      await releaseGuardAndBadge();
      try {
        const tray = await import('@/lib/notifications/tray-notifications');
        await tray.notifyTranslationFailed(meta.gameName || 'Gioco', String(err));
      } catch { /* ignore */ }
    },
  };
}
