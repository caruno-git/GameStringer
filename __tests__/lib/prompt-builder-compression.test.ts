/**
 * Test per la compressione deterministica del prompt di traduzione
 * (dedup glossario + clustering hint per-stringa) in lib/translation/prompt-builder.ts.
 * Obiettivo: ridurre i token del contesto auto-generato senza perdere informazione
 * (lossless: nessun termine/hint distinto va perso).
 */
import { describe, expect, it } from 'vitest';

import {
  dedupeGlossaryHint,
  formatIndexRanges,
  clusterPerStringHints,
} from '../../lib/translation/prompt-builder';

describe('dedupeGlossaryHint', () => {
  it('collassa le voci di glossario ripetute mantenendo la prima occorrenza e l\'ordine', () => {
    const repeated = Array(40)
      .fill('- "HP" -> "PV"\n- "Sword" -> "Spada"\n- "Cancel" -> "Annulla"')
      .join('\n');
    const input = `[GLOSSARY]\n${repeated}`;
    const out = dedupeGlossaryHint(input);

    // Ogni voce distinta compare una sola volta
    expect(out.split('\n').filter((l) => l.trim() !== '')).toEqual([
      '[GLOSSARY]',
      '- "HP" -> "PV"',
      '- "Sword" -> "Spada"',
      '- "Cancel" -> "Annulla"',
    ]);
    // Forte riduzione di dimensione
    expect(out.length).toBeLessThan(input.length * 0.1);
  });

  it('è lossless: nessun termine distinto viene perso', () => {
    const input = '- "A" -> "1"\n- "B" -> "2"\n- "A" -> "1"\n- "C" -> "3"';
    const out = dedupeGlossaryHint(input);
    for (const term of ['"A" -> "1"', '"B" -> "2"', '"C" -> "3"']) {
      expect(out).toContain(term);
    }
    expect(out.split('\n').filter((l) => l.includes('"A" -> "1"'))).toHaveLength(1);
  });

  it('non altera un glossario già privo di duplicati', () => {
    const input = '[GLOSSARY]\n- "A" -> "1"\n- "B" -> "2"';
    expect(dedupeGlossaryHint(input)).toBe(input);
  });

  it('collassa righe vuote multiple in un solo separatore', () => {
    const input = 'a\n\n\n\nb';
    expect(dedupeGlossaryHint(input)).toBe('a\n\nb');
  });
});

describe('formatIndexRanges', () => {
  it('comprime indici contigui in range', () => {
    expect(formatIndexRanges([1, 2, 3, 5, 6, 9])).toBe('1-3, 5-6, 9');
  });

  it('ordina e deduplica gli indici', () => {
    expect(formatIndexRanges([9, 1, 2, 2, 3])).toBe('1-3, 9');
  });

  it('gestisce indice singolo e lista vuota', () => {
    expect(formatIndexRanges([7])).toBe('7');
    expect(formatIndexRanges([])).toBe('');
  });
});

describe('clusterPerStringHints', () => {
  it('accorpa hint identici su più stringhe in una riga con range', () => {
    const pairs = [
      ...Array.from({ length: 30 }, (_, i) => ({ index: i + 1, hint: 'Menu screen, UI button' })),
      ...Array.from({ length: 5 }, (_, i) => ({ index: i + 31, hint: 'Dialogue, NPC' })),
      { index: 38, hint: 'Title screen' },
    ];
    const out = clusterPerStringHints(pairs);
    expect(out).toEqual([
      '1-30: Menu screen, UI button',
      '31-35: Dialogue, NPC',
      '38: Title screen',
    ]);
  });

  it('preserva tutti gli hint distinti (lossless sui contenuti)', () => {
    const pairs = [
      { index: 1, hint: 'A' },
      { index: 2, hint: 'B' },
      { index: 3, hint: 'A' },
    ];
    const out = clusterPerStringHints(pairs).join('\n');
    expect(out).toContain('A');
    expect(out).toContain('B');
    // 'A' (indici 1,3) accorpato in un'unica riga
    expect(clusterPerStringHints(pairs)).toContain('1, 3: A');
  });
});
