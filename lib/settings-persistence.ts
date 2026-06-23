'use client';

/**
 * Settings persistence bridge.
 *
 * Il blob `gameStringerSettings` (API key + preferenze) vive in localStorage
 * come cache sincrona, letta da ~30 componenti. localStorage nel webview Tauri
 * però non persiste in modo affidabile tra i riavvii: questo modulo usa il
 * disco come fonte di verità, tramite i comandi Rust GIÀ esistenti
 * `save_app_settings` / `load_app_settings` (commands/utilities.rs), che
 * scrivono in data_dir()/GameStringer/settings.json.
 *
 * - hydrateSettingsFromDisk(): all'avvio copia il blob da disco a localStorage.
 * - persistSettingsToDisk(): copia il blob corrente da localStorage al disco.
 *
 * In ambiente non-Tauri (dev browser) invoke() lancia: gli errori sono
 * silenziati e l'app continua col solo localStorage.
 */

import { invoke } from '@/lib/tauri-api';
import { clientLogger } from '@/lib/client-logger';

const LS_KEY = 'gameStringerSettings';

let hydrated = false;

/**
 * Idrata localStorage dal file su disco. Da chiamare il prima possibile
 * all'avvio, PRIMA che i componenti leggano le impostazioni.
 * Il disco è la fonte di verità; se il disco è vuoto ma localStorage ha già
 * dati (es. primo avvio dopo l'aggiornamento), li promuove su disco.
 */
export async function hydrateSettingsFromDisk(): Promise<void> {
  if (typeof window === 'undefined' || hydrated) return;
  hydrated = true;
  try {
    // load_app_settings ritorna {} se non esiste ancora alcun file.
    const disk = await invoke<Record<string, unknown>>('load_app_settings');
    if (disk && typeof disk === 'object' && Object.keys(disk).length > 0) {
      localStorage.setItem(LS_KEY, JSON.stringify(disk));
    } else {
      // Migrazione una-tantum: localStorage esistente → disco
      const existing = localStorage.getItem(LS_KEY);
      if (existing) {
        await invoke('save_app_settings', { settings: JSON.parse(existing) });
      }
    }
  } catch (e: unknown) {
    // Non-Tauri o errore disco: si prosegue col solo localStorage.
    clientLogger.debug('hydrateSettingsFromDisk skipped:', String(e));
  }
}

/**
 * Persiste il blob corrente di localStorage su disco.
 * Sicuro da chiamare spesso; no-op se non c'è nulla da salvare.
 */
export async function persistSettingsToDisk(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const json = localStorage.getItem(LS_KEY);
    if (json) {
      await invoke('save_app_settings', { settings: JSON.parse(json) });
    }
  } catch (e: unknown) {
    clientLogger.debug('persistSettingsToDisk skipped:', String(e));
  }
}
