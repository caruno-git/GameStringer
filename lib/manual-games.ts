'use client';

/**
 * Manual games store.
 *
 * Giochi aggiunti a mano dall'utente selezionando una cartella dal disco.
 * Persistiti in IndexedDB (idb-keyval), separati dalla cache di scan Steam/Epic,
 * e uniti alla libreria al momento del render. Sopravvivono ai riavvii.
 */

import { get, set } from 'idb-keyval';

export interface ManualGame {
  id: string;
  app_id: string;
  title: string;
  platform: string;
  header_image: string | null;
  engine?: string | null;
  is_installed: boolean;
  install_dir: string;
  added_date: number;
  isManual: true;
}

const KEY = 'gs_manual_games';

export async function getManualGames(): Promise<ManualGame[]> {
  try {
    const list = await get<ManualGame[]>(KEY);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Aggiunge un gioco manuale (dedup per cartella di installazione). */
export async function addManualGame(game: ManualGame): Promise<ManualGame[]> {
  const list = await getManualGames();
  if (!list.some((g) => g.install_dir === game.install_dir)) {
    list.push(game);
    await set(KEY, list);
  }
  return list;
}

export async function removeManualGame(id: string): Promise<ManualGame[]> {
  const list = (await getManualGames()).filter((g) => g.id !== id);
  await set(KEY, list);
  return list;
}
