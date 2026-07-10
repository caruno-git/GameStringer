/**
 * Test per la pipeline reflection (write → reflect → refine):
 * - euristica di selezione delle stringhe a rischio
 * - estrazione termini di glossario e placeholder
 * - guardia deterministica sulle revisioni del critico
 * - ciclo maybeReflect con provider mockato (fetch)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractPlaceholders,
  extractGlossaryTerms,
  selectReflectionCandidates,
  guardRevision,
  isReflectionCapable,
  maybeReflect,
} from '@/lib/ai/reflection-translator';

describe('extractPlaceholders', () => {
  it('estrae variabili printf, curly, tag e placeholder Unreal', () => {
    expect(extractPlaceholders('Hai %d monete, %s!')).toEqual(['%d', '%s']);
    expect(extractPlaceholders('Premi {key} per {0}')).toEqual(['{key}', '{0}']);
    expect(extractPlaceholders('<b>Attacco</b> [[T0]] \\n fine')).toEqual(['<b>', '</b>', '[[T0]]', '\\n']);
  });

  it('ritorna array vuoto senza placeholder', () => {
    expect(extractPlaceholders('Solo testo semplice')).toEqual([]);
  });
});

describe('extractGlossaryTerms', () => {
  it('estrae i termini sorgente da vari formati di glossario', () => {
    const hint = [
      'Health Potion -> Pozione di Vita',
      'Mana → Mana',
      'Iron Sword = Spada di Ferro',
      '[GLOSSARY]',
      '',
      'Guild: Gilda',
    ].join('\n');
    expect(extractGlossaryTerms(hint)).toEqual(['Health Potion', 'Mana', 'Iron Sword', 'Guild']);
  });

  it('gestisce hint vuoto o assente', () => {
    expect(extractGlossaryTerms(undefined)).toEqual([]);
    expect(extractGlossaryTerms('')).toEqual([]);
  });
});

describe('selectReflectionCandidates', () => {
  it('seleziona stringhe con placeholder mancanti (critico)', () => {
    const texts = ['You gained %d gold!'];
    const translations = ['Hai guadagnato oro!']; // %d perso
    const out = selectReflectionCandidates(texts, translations);
    expect(out).toHaveLength(1);
    expect(out[0].reasons).toContain('placeholder-mismatch');
  });

  it('seleziona anomalie di lunghezza', () => {
    const texts = ['A short line of text'];
    const translations = ['Una riga molto molto molto molto molto molto molto molto molto lunga che esplode oltre ogni limite ragionevole di interfaccia'];
    const out = selectReflectionCandidates(texts, translations);
    expect(out[0]?.reasons).toContain('length-anomaly');
  });

  it('seleziona stringhe lunghe non tradotte', () => {
    const texts = ['The ancient dragon sleeps beneath the mountain'];
    const translations = ['The ancient dragon sleeps beneath the mountain'];
    const out = selectReflectionCandidates(texts, translations);
    expect(out[0]?.reasons).toContain('untranslated');
  });

  it('seleziona stringhe con termini di glossario', () => {
    const texts = ['Use the Health Potion now'];
    const translations = ['Usa la pozione adesso'];
    const out = selectReflectionCandidates(texts, translations, {
      glossaryHint: 'Health Potion -> Pozione di Vita',
    });
    expect(out[0]?.reasons).toContain('glossary-term');
  });

  it('seleziona dialoghi lunghi', () => {
    const long = 'I have walked these lands for a hundred years, and never once have I seen such darkness fall upon us.';
    const out = selectReflectionCandidates([long], ['Trad qualunque abbastanza lunga da non essere anomala e con parole in più qui.']);
    expect(out[0]?.reasons).toContain('long-dialogue');
  });

  it('NON seleziona stringhe corte e banali senza rischi', () => {
    const out = selectReflectionCandidates(['Play', 'Settings', 'OK'], ['Gioca', 'Impostazioni', 'OK']);
    expect(out).toHaveLength(0);
  });

  it('mode off → nessun candidato; mode always → tutte le stringhe non banali', () => {
    const texts = ['Continue the story', 'Play'];
    const translations = ['Continua la storia', 'Gioca'];
    expect(selectReflectionCandidates(texts, translations, { mode: 'off' })).toHaveLength(0);
    const always = selectReflectionCandidates(texts, translations, { mode: 'always' });
    expect(always.length).toBe(2);
  });

  it('applica il cap in modalità auto ordinando per severità', () => {
    const texts = Array.from({ length: 30 }, (_, i) => `A fairly long dialogue line number ${i} with enough characters to qualify, right?`);
    const translations = texts.map(() => 'Una traduzione plausibile e abbastanza lunga da non sembrare anomala, giusto?');
    const out = selectReflectionCandidates(texts, translations, { maxCandidates: 5 });
    expect(out.length).toBeLessThanOrEqual(5);
  });
});

describe('guardRevision', () => {
  const source = 'You gained %d gold, {name}!';
  const current = 'Hai guadagnato %d oro, {name}!';

  it('accetta una revisione valida', () => {
    const revised = 'Hai ottenuto %d monete d\'oro, {name}!';
    expect(guardRevision(source, current, revised)).toBe(revised);
  });

  it('rifiuta revisioni che perdono placeholder', () => {
    expect(guardRevision(source, current, 'Hai ottenuto oro, {name}!')).toBe(current);
  });

  it('rifiuta revisioni che inventano placeholder', () => {
    expect(guardRevision(source, current, 'Hai %d oro, {name} e {bonus}!')).toBe(current);
  });

  it('rifiuta revisioni vuote, non-stringa o esplosive in lunghezza', () => {
    expect(guardRevision(source, current, '')).toBe(current);
    expect(guardRevision(source, current, undefined)).toBe(current);
    expect(guardRevision(source, current, null)).toBe(current);
    const explosive = 'x'.repeat(source.length * 3) + ' %d {name}';
    expect(guardRevision(source, current, explosive)).toBe(current);
  });
});

describe('isReflectionCapable', () => {
  it('true per provider LLM, false per MT puri', () => {
    for (const p of ['gemini', 'groq', 'deepseek', 'openai', 'anthropic', 'mistral', 'ollama']) {
      expect(isReflectionCapable(p)).toBe(true);
    }
    for (const p of ['deepl', 'mymemory', 'lingva', 'nllb', 'libretranslate', 'hymt', 'translategemma']) {
      expect(isReflectionCapable(p)).toBe(false);
    }
  });
});

/**
 * Forza il valore restituito da localStorage.getItem in modo robusto sia con il
 * mock inerte del setup di progetto (plain object con vi.fn) sia con la vera
 * Storage di jsdom (Proxy: lo spy sull'istanza non intercetta → serve il prototype).
 */
function mockLocalStorageGetItem(value: string | null) {
  const getItem = window.localStorage.getItem as unknown;
  if (vi.isMockFunction(getItem)) {
    getItem.mockReturnValue(value);
  } else {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(value);
  }
}

describe('maybeReflect (provider mockato)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    // Default: nessuna impostazione salvata → getReflectionMode() = 'auto'
    mockLocalStorageGetItem(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockGroqCritic(verdicts: unknown) {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: JSON.stringify(verdicts) } }] }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;
  }

  it('riscrive una traduzione difettosa quando il critico la corregge', async () => {
    mockGroqCritic([
      { i: 1, ok: false, issues: 'missing placeholder', revised: 'Hai guadagnato %d oro!' },
    ]);

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
        sourceLanguage: 'en',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.candidates).toBe(1);
    expect(outcome.refined).toBe(1);
    expect(outcome.translations[0]).toBe('Hai guadagnato %d oro!');
  });

  it('mantiene la traduzione quando il critico dice ok', async () => {
    mockGroqCritic([{ i: 1, ok: true }]);

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato %d oro!'],
        targetLanguage: 'it',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.refined).toBe(0);
    expect(outcome.translations[0]).toBe('Hai guadagnato %d oro!');
  });

  it('scarta revisioni del critico che rompono i placeholder (guardia)', async () => {
    mockGroqCritic([
      { i: 1, ok: false, issues: 'style', revised: 'Hai guadagnato tanto oro!' }, // %d perso!
    ]);

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro! %d'],
        targetLanguage: 'it',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.refined).toBe(0);
    expect(outcome.translations[0]).toBe('Hai guadagnato oro! %d');
  });

  it('è fail-open: errore di rete → traduzioni originali intatte', async () => {
    global.fetch = vi.fn(async () => {
      throw new Error('network down');
    }) as unknown as typeof fetch;

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.refined).toBe(0);
    expect(outcome.translations[0]).toBe('Hai guadagnato oro!');
  });

  it('skip totale per provider MT puri (nessuna chiamata fetch)', async () => {
    const spy = vi.fn();
    global.fetch = spy as unknown as typeof fetch;

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
      },
      'deepl',
      'fake-key'
    );

    expect(outcome.candidates).toBe(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('rispetta mode off da input', async () => {
    const spy = vi.fn();
    global.fetch = spy as unknown as typeof fetch;

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
        mode: 'off',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.candidates).toBe(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('rispetta reflectionMode off dalle impostazioni utente', async () => {
    mockLocalStorageGetItem(JSON.stringify({ translation: { reflectionMode: 'off' } }));
    const spy = vi.fn();
    global.fetch = spy as unknown as typeof fetch;

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.candidates).toBe(0);
    expect(spy).not.toHaveBeenCalled();
  });

  it('gestisce risposta del critico non-JSON senza rompere nulla', async () => {
    global.fetch = vi.fn(async () =>
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'Sorry, I cannot help with that.' } }] }),
        { status: 200 }
      )
    ) as unknown as typeof fetch;

    const outcome = await maybeReflect(
      {
        texts: ['You gained %d gold!'],
        translations: ['Hai guadagnato oro!'],
        targetLanguage: 'it',
      },
      'groq',
      'fake-key'
    );

    expect(outcome.refined).toBe(0);
    expect(outcome.translations[0]).toBe('Hai guadagnato oro!');
  });
});
