/**
 * Store locale (IndexedDB via storageManager) dei record di traduzione dell'editor —
 * la "Translation Memory" per-stringa. Sostituisce le /api/translations, che nel
 * desktop impacchettato sono stub 501. Lo shape è quello che l'editor già usa
 * (id, gameId, originalText, translatedText, status, sourceLanguage, targetLanguage…).
 */

import { storageManager } from '@/lib/storage-manager';

export interface EditorTranslationFilter {
  gameId?: string; // 'all' o assente = tutti
  status?: string; // 'all' o assente = tutti
}

type Row = Record<string, unknown>;

async function readAll(): Promise<Row[]> {
  const data = await storageManager.getTranslations();
  return Array.isArray(data) ? (data as Row[]) : [];
}

/** Lista i record, filtrati per gioco/stato (client-side). */
export async function listEditorTranslations(filter: EditorTranslationFilter = {}): Promise<Row[]> {
  let rows = await readAll();
  if (filter.gameId && filter.gameId !== 'all') rows = rows.filter((r) => r.gameId === filter.gameId);
  if (filter.status && filter.status !== 'all') rows = rows.filter((r) => r.status === filter.status);
  return rows;
}

/** Inserisce o aggiorna un record per id. */
export async function upsertEditorTranslation(rec: Row): Promise<void> {
  const rows = await readAll();
  const idx = rows.findIndex((r) => r.id === rec.id);
  if (idx >= 0) rows[idx] = { ...rows[idx], ...rec };
  else rows.push(rec);
  await storageManager.saveTranslations(rows);
}

/** Rimuove un record per id. */
export async function removeEditorTranslation(id: string): Promise<void> {
  const rows = (await readAll()).filter((r) => r.id !== id);
  await storageManager.saveTranslations(rows);
}

/** Costruisce il contenuto di export client-side (JSON / CSV / PO minimale). */
export function buildTranslationExport(rows: Row[], format: 'json' | 'csv' | 'po'): { content: string; mime: string } {
  if (format === 'csv') {
    const esc = (s: unknown) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const header = 'original,translated,status,targetLanguage';
    const lines = rows.map((r) => [r.originalText, r.translatedText, r.status, r.targetLanguage].map(esc).join(','));
    return { content: [header, ...lines].join('\n'), mime: 'text/csv' };
  }
  if (format === 'po') {
    const po = rows
      .map((r) => `msgid ${JSON.stringify(String(r.originalText ?? ''))}\nmsgstr ${JSON.stringify(String(r.translatedText ?? ''))}\n`)
      .join('\n');
    return { content: po, mime: 'text/plain' };
  }
  return { content: JSON.stringify(rows, null, 2), mime: 'application/json' };
}
