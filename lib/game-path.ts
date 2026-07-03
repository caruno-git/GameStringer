/**
 * Normalizzazione gamePath.
 *
 * Lo stesso gioco può arrivare con forme diverse del path a seconda della
 * provenienza (scan Steam, selezione manuale, query param decodificato):
 * separatori misti (`E:\Games\Foo` vs `E:/Games/Foo`), slash finale, casing
 * diverso (il filesystem Windows è case-insensitive). Senza normalizzazione:
 *  - le chiavi identità (guardia anti-duplicato hero, checkpoint keyed-by-path,
 *    progetti con gameId di fallback) NON matchano tra un lancio e l'altro
 *    → resume mancati, progetti/checkpoint duplicati, guardie bypassate;
 *  - i join `${gamePath}/file` producono separatori misti o doppi.
 */

/**
 * Path FS pulito per i join (`${cleanGamePath(p)}/file.json`):
 * trim + rimozione dei separatori finali. Preserva caso e separatori interni
 * (il path deve restare valido per i comandi Rust).
 */
export function cleanGamePath(p: string): string {
  return (p || '').trim().replace(/[\\/]+$/, '');
}

/**
 * Chiave identità stabile per lookup/dedup (NON è un path FS):
 * separatori unificati a '/', niente separatore finale, lowercase
 * (Windows è case-insensitive). Da usare per heroKey, chiavi checkpoint,
 * id progetto di fallback.
 */
export function gamePathKey(p: string): string {
  return cleanGamePath(p).replace(/\\/g, '/').toLowerCase();
}
