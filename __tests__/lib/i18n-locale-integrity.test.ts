/**
 * Guardia anti-regressione sui file locale (issue #47).
 *
 * Un utente russo ha segnalato che l'app era "al 20% in russo, il resto in
 * italiano": ru.json conteneva centinaia di valori copiati 1:1 da it.json.
 *
 * Regole:
 * 1. Nessuna chiave di it.json può mancare in un altro locale (fallback → en,
 *    ma la chiave deve esistere per non degradare silenziosamente).
 * 2. "Leftover italiano" = valore identico a it.json quando it.json ≠ en.json
 *    (i nomi propri/prodotti sono identici anche in en e quindi non contano).
 *    Per i locale già bonificati (ru) la tolleranza è zero; per gli altri vale
 *    la baseline attuale: il numero può solo scendere, mai salire.
 */
import { describe, expect, it as test } from 'vitest';

import itJson from '../../lib/i18n/locales/it.json';
import enJson from '../../lib/i18n/locales/en.json';
import esJson from '../../lib/i18n/locales/es.json';
import frJson from '../../lib/i18n/locales/fr.json';
import deJson from '../../lib/i18n/locales/de.json';
import jaJson from '../../lib/i18n/locales/ja.json';
import zhJson from '../../lib/i18n/locales/zh.json';
import koJson from '../../lib/i18n/locales/ko.json';
import ptJson from '../../lib/i18n/locales/pt.json';
import ruJson from '../../lib/i18n/locales/ru.json';
import plJson from '../../lib/i18n/locales/pl.json';

type Json = Record<string, unknown>;

function flatten(obj: Json, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of flatten(value as Json, full)) out.set(k, v);
    } else if (typeof value === 'string') {
      out.set(full, value);
    }
  }
  return out;
}

const it = flatten(itJson as Json);
const en = flatten(enJson as Json);

// Baseline aggiornata il 2026-06-23 dopo il completamento delle traduzioni
// (es/fr/de/pt/pl/ja/zh/ko portati a copertura quasi piena). Può solo SCENDERE,
// tranne quando la bonifica traduce correttamente in un cognato identico all'IT.
// I leftover residui di es/pt/fr/pl sono cognati legittimi: parole corrette nella
// lingua target ma identiche all'italiano (es. "Sistema", "Data", "Tipo", "Tema",
// "Formato", "Temperatura", "Lista", "Legenda", "Filtro", "Grande"). L'euristica
// non può distinguerli dall'italiano non tradotto, quindi restano in baseline.
// 2026-06-24 Fase B i18n: es 33→35, pt 43→45 per i cognati legittimi introdotti
// traducendo i placeholder (es. settingsPage.fontLarge = "Grande (18px)").
// 2026-06-25 Fase B i18n (completamento bulk 10 lingue): fr resta a 2 — i cognati
// romanzi corretti identici all'IT sono library.notInstalled "Non inst." e
// gspack.qualityFinal "Finale". (common.notifications non conta più: corretto il
// refuso "Notificationtions"→"Notifications" in en.json, quindi en==it.)
// de/ja/zh/ko/ru restano a 0 anche dopo il bulk.
// 2026-06-25 Fase A+B prediction-tool (namespace predictionToolPage, 73 chiavi):
// es 35→36 (binary "Binario") e pt 45→47 (time "Tempo"/"tempo") per cognati
// romanzi corretti identici all'IT. de/ja/zh/ko/ru/fr/pl invariati.
// 2026-06-25 Bonifica authoring EN (en.json): corretti 56 valori ancora in
// italiano in en.json. Effetto collaterale atteso: fissando en.completo
// "Completo"→"Complete", il cognato corretto es/pt "Completo" (= it) viene ora
// conteggiato come leftover. Baseline: es 36→37, pt 47→48. Sono cognati romanzi
// legittimi, non italiano non tradotto.
const locales: { name: string; json: Json; maxMissing: number; maxLeftover: number }[] = [
  { name: 'en', json: enJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'ru', json: ruJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'es', json: esJson as Json, maxMissing: 0, maxLeftover: 37 },
  { name: 'fr', json: frJson as Json, maxMissing: 0, maxLeftover: 2 },
  { name: 'de', json: deJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'ja', json: jaJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'zh', json: zhJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'ko', json: koJson as Json, maxMissing: 0, maxLeftover: 0 },
  { name: 'pt', json: ptJson as Json, maxMissing: 0, maxLeftover: 48 },
  { name: 'pl', json: plJson as Json, maxMissing: 0, maxLeftover: 11 },
];

describe('integrità dei locale i18n', () => {
  for (const { name, json, maxMissing, maxLeftover } of locales) {
    const loc = flatten(json);

    test(`${name}: nessuna nuova chiave mancante rispetto a it.json (baseline ${maxMissing})`, () => {
      const missing = [...it.keys()].filter((k) => !loc.has(k));
      expect(
        missing.length,
        `Chiavi mancanti in ${name}.json (prime 10): ${missing.slice(0, 10).join(', ')}`
      ).toBeLessThanOrEqual(maxMissing);
    });

    test(`${name}: nessun nuovo leftover italiano (baseline ${maxLeftover})`, () => {
      const leftovers = [...it.entries()]
        .filter(([k, v]) => loc.get(k) === v && en.get(k) !== undefined && en.get(k) !== v)
        .map(([k]) => k);
      expect(
        leftovers.length,
        `Valori italiani non tradotti in ${name}.json (primi 10): ${leftovers.slice(0, 10).join(', ')}`
      ).toBeLessThanOrEqual(maxLeftover);
    });
  }
});
