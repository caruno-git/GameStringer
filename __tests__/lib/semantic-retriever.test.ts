/**
 * Test per il Semantic Retriever (RAG semantico su TM + glossario):
 * - similarità coseno e hashing
 * - rilevamento modello embedding (preferenze, cache negativa)
 * - embedTexts (fail-open su errori)
 * - getSemanticContext: happy path, dedupe, fail-open, setting off,
 *   indicizzazione incrementale
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Stato condiviso dei mock (hoisted: vi.mock viene sollevato in cima al file)
// ---------------------------------------------------------------------------

const h = vi.hoisted(() => ({
  tagsModels: [] as string[],
  vocab: new Map<string, number[]>(),
  tagsCalls: 0,
  embedInputs: [] as string[][],
  ollamaDown: false,
  embedFails: false,
}));

const idbStore = vi.hoisted(() => new Map<string, unknown>());

const tmUnits = vi.hoisted(() => [] as Array<{
  sourceText: string; targetText: string; gameId?: string; verified?: boolean;
}>);

vi.mock('@/lib/ai/ollama-http', () => ({
  ollamaFetch: vi.fn(async (path: string, init?: { body?: string }) => {
    if (h.ollamaDown) throw new Error('ECONNREFUSED');
    if (path === '/api/tags') {
      h.tagsCalls++;
      return {
        ok: true, status: 200,
        json: async () => ({ models: h.tagsModels.map(name => ({ name })) }),
        text: async () => '',
      };
    }
    if (path === '/api/embed') {
      if (h.embedFails) return { ok: false, status: 500, json: async () => ({}), text: async () => '' };
      const body = JSON.parse(init?.body || '{}');
      const input: string[] = body.input || [];
      h.embedInputs.push(input);
      const embeddings = input.map(t => {
        const clean = t.replace(/^search_(document|query): /, '');
        return h.vocab.get(clean) || [0.01, 0.01, 0.01];
      });
      return { ok: true, status: 200, json: async () => ({ embeddings }), text: async () => '' };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
  }),
}));

vi.mock('idb-keyval', () => ({
  get: async (k: string) => idbStore.get(k),
  set: async (k: string, v: unknown) => { idbStore.set(k, v); },
}));

vi.mock('@/lib/translation-memory', () => ({
  translationMemory: {
    initialize: vi.fn(async () => {}),
    getAllUnits: vi.fn(() => tmUnits),
  },
}));

import {
  cosineSimilarity,
  hashKey,
  detectEmbeddingModel,
  embedTexts,
  getSemanticContext,
  getSemanticStatus,
  invalidateSemanticCaches,
  EMBEDDING_MODEL_PREFERENCES,
} from '@/lib/ai/semantic-retriever';

/**
 * Forza localStorage.getItem a rispondere per-chiave, robusto sia con il mock
 * inerte del setup di progetto sia con la Storage reale di jsdom.
 */
function mockLS(map: Record<string, string>) {
  const impl = (key: string) => (key in map ? map[key] : null);
  const getItem = window.localStorage.getItem as unknown;
  if (vi.isMockFunction(getItem)) {
    getItem.mockImplementation(impl);
  } else {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(impl as (key: string) => string | null);
  }
}

beforeEach(() => {
  h.tagsModels = [];
  h.vocab.clear();
  h.tagsCalls = 0;
  h.embedInputs = [];
  h.ollamaDown = false;
  h.embedFails = false;
  idbStore.clear();
  tmUnits.length = 0;
  invalidateSemanticCaches();
  mockLS({});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Primitive
// ---------------------------------------------------------------------------

describe('cosineSimilarity', () => {
  it('1 per vettori identici, 0 per ortogonali', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0, 0], [0, 1, 0])).toBeCloseTo(0);
  });

  it('0 per dimensioni incompatibili o vettori nulli', () => {
    expect(cosineSimilarity([1, 0], [1, 0, 0])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });
});

describe('hashKey', () => {
  it('è stabile e distingue testi diversi', () => {
    expect(hashKey('Health Potion')).toBe(hashKey('Health Potion'));
    expect(hashKey('Health Potion')).not.toBe(hashKey('Mana Potion'));
  });
});

// ---------------------------------------------------------------------------
// Rilevamento modello
// ---------------------------------------------------------------------------

describe('detectEmbeddingModel', () => {
  it('sceglie il modello con priorità più alta tra gli installati', async () => {
    h.tagsModels = ['llama3:8b', 'nomic-embed-text:latest', 'bge-m3:latest'];
    expect(await detectEmbeddingModel()).toBe('bge-m3:latest');
    expect(EMBEDDING_MODEL_PREFERENCES[0]).toBe('bge-m3');
  });

  it('rispetta la preferenza utente se installata', async () => {
    h.tagsModels = ['bge-m3:latest', 'all-minilm:latest'];
    mockLS({ gameStringerSettings: JSON.stringify({ translation: { embeddingModel: 'all-minilm' } }) });
    expect(await detectEmbeddingModel()).toBe('all-minilm:latest');
  });

  it('null senza modelli embedding, con cache negativa (una sola fetch)', async () => {
    h.tagsModels = ['llama3:8b'];
    expect(await detectEmbeddingModel()).toBeNull();
    expect(await detectEmbeddingModel()).toBeNull();
    expect(h.tagsCalls).toBe(1);
  });

  it('null se Ollama è giù (fail-open)', async () => {
    h.ollamaDown = true;
    expect(await detectEmbeddingModel()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// embedTexts
// ---------------------------------------------------------------------------

describe('embedTexts', () => {
  it('embedda con prefissi task-specific per nomic-embed-text', async () => {
    h.vocab.set('hello', [1, 0, 0]);
    const out = await embedTexts('nomic-embed-text:latest', ['hello'], 'query');
    expect(out).toEqual([[1, 0, 0]]);
    expect(h.embedInputs[0][0]).toBe('search_query: hello');
  });

  it('nessun prefisso per bge-m3', async () => {
    h.vocab.set('hello', [1, 0, 0]);
    await embedTexts('bge-m3:latest', ['hello'], 'document');
    expect(h.embedInputs[0][0]).toBe('hello');
  });

  it('null su risposta non-ok o Ollama giù (fail-open)', async () => {
    h.embedFails = true;
    expect(await embedTexts('bge-m3', ['x'])).toBeNull();
    h.embedFails = false;
    h.ollamaDown = true;
    expect(await embedTexts('bge-m3', ['x'])).toBeNull();
  });

  it('array vuoto per input vuoto, senza chiamate', async () => {
    expect(await embedTexts('bge-m3', [])).toEqual([]);
    expect(h.embedInputs).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getSemanticContext
// ---------------------------------------------------------------------------

/** Setup standard: modello nomic + una TM unit semanticamente simile alla query. */
function setupHappyPath() {
  h.tagsModels = ['nomic-embed-text:latest'];
  tmUnits.push(
    { sourceText: 'Health Potion restores your HP', targetText: 'La Pozione di Vita ripristina i tuoi PS', verified: true },
    { sourceText: 'Open the inventory', targetText: 'Apri l\'inventario' },
  );
  // Vettori sintetici: la query "potion" è vicina alla prima unit, lontana dalla seconda
  h.vocab.set('Health Potion restores your HP', [1, 0, 0]);
  h.vocab.set('Open the inventory', [0, 1, 0]);
  h.vocab.set('A potion that heals your wounds', [0.8, 0.2, 0]);
  h.vocab.set('Press START', [0, 0, 1]);
}

describe('getSemanticContext', () => {
  it('recupera traduzioni TM semanticamente simili (happy path)', async () => {
    setupHappyPath();
    const block = await getSemanticContext({
      texts: ['A potion that heals your wounds'],
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).toContain('SEMANTIC CONTEXT');
    expect(block).toContain('"Health Potion restores your HP" → "La Pozione di Vita ripristina i tuoi PS" ✓');
    expect(block).not.toContain('Open the inventory');
  });

  it('nessun match sotto soglia → blocco vuoto', async () => {
    setupHappyPath();
    const block = await getSemanticContext({
      texts: ['Press START'],
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).toBe('');
  });

  it('include voci glossario correlate dal dizionario del gioco', async () => {
    h.tagsModels = ['nomic-embed-text:latest'];
    mockLS({
      [`dict_game1`]: JSON.stringify([
        { original: 'Ebon Blade', translated: 'Lama d\'Ebano', context: 'Legendary sword' },
        { original: '\\d+ gold', translated: 'oro', isRegex: true }, // le regex si saltano
      ]),
    });
    h.vocab.set('Ebon Blade — Legendary sword', [0, 0.9, 0.44]);
    h.vocab.set('The dark sword of legends awaits', [0, 0.6, 0.8]);
    const block = await getSemanticContext({
      texts: ['The dark sword of legends awaits'],
      sourceLang: 'en',
      targetLang: 'it',
      gameId: 'game1',
    });
    expect(block).toContain('"Ebon Blade" → "Lama d\'Ebano" (Context: Legendary sword)');
    expect(block).not.toContain('gold');
  });

  it('esclude match già presenti nel blocco keyword (dedupe)', async () => {
    setupHappyPath();
    const block = await getSemanticContext({
      texts: ['A potion that heals your wounds'],
      sourceLang: 'en',
      targetLang: 'it',
      existingContext: '- "Health Potion restores your HP" → "La Pozione di Vita ripristina i tuoi PS"',
    });
    expect(block).toBe('');
  });

  it('esclude self-match (stessa stringa del batch)', async () => {
    setupHappyPath();
    h.vocab.set('Health Potion restores your HP', [1, 0, 0]);
    const block = await getSemanticContext({
      texts: ['Health Potion restores your HP'],
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).not.toContain('Health Potion restores your HP');
  });

  it('rispetta semanticTM off dalle impostazioni: zero chiamate Ollama', async () => {
    setupHappyPath();
    mockLS({ gameStringerSettings: JSON.stringify({ translation: { semanticTM: 'off' } }) });
    const block = await getSemanticContext({
      texts: ['A potion that heals your wounds'],
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).toBe('');
    expect(h.tagsCalls).toBe(0);
    expect(h.embedInputs).toHaveLength(0);
  });

  it('fail-open: nessun modello embedding installato → blocco vuoto', async () => {
    h.tagsModels = ['llama3:8b'];
    tmUnits.push({ sourceText: 'x', targetText: 'y' });
    const block = await getSemanticContext({ texts: ['x?'], sourceLang: 'en', targetLang: 'it' });
    expect(block).toBe('');
  });

  it('fail-open: /api/embed fallisce → blocco vuoto, nessuna eccezione', async () => {
    setupHappyPath();
    h.embedFails = true;
    const block = await getSemanticContext({
      texts: ['A potion that heals your wounds'],
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).toBe('');
  });

  it('salta batch enormi (>50 testi) senza chiamate', async () => {
    setupHappyPath();
    const block = await getSemanticContext({
      texts: Array.from({ length: 51 }, (_, i) => `line ${i}`),
      sourceLang: 'en',
      targetLang: 'it',
    });
    expect(block).toBe('');
    expect(h.tagsCalls).toBe(0);
  });

  it('indicizzazione incrementale: il secondo retrieval non ri-embedda i documenti', async () => {
    setupHappyPath();
    const params = {
      texts: ['A potion that heals your wounds'],
      sourceLang: 'en',
      targetLang: 'it',
    };
    await getSemanticContext(params);
    const docEmbedsFirst = h.embedInputs.filter(
      batch => batch.some(t => t.startsWith('search_document: '))
    ).length;
    expect(docEmbedsFirst).toBeGreaterThan(0);

    h.embedInputs = [];
    await getSemanticContext(params);
    const docEmbedsSecond = h.embedInputs.filter(
      batch => batch.some(t => t.startsWith('search_document: '))
    ).length;
    expect(docEmbedsSecond).toBe(0); // solo la query viene ri-embeddata
    const queryEmbeds = h.embedInputs.filter(
      batch => batch.some(t => t.startsWith('search_query: '))
    ).length;
    expect(queryEmbeds).toBe(1);
  });

  it('ri-embedda tutto se il modello embedding cambia', async () => {
    setupHappyPath();
    await getSemanticContext({ texts: ['A potion that heals your wounds'], sourceLang: 'en', targetLang: 'it' });

    // Cambio modello: bge-m3 diventa disponibile (priorità più alta)
    h.tagsModels = ['nomic-embed-text:latest', 'bge-m3:latest'];
    invalidateSemanticCaches();
    h.embedInputs = [];
    await getSemanticContext({ texts: ['A potion that heals your wounds'], sourceLang: 'en', targetLang: 'it' });
    // Con bge-m3 non c'è prefisso: i documenti sono ri-embeddati come testo puro
    const flat = h.embedInputs.flat();
    expect(flat).toContain('Health Potion restores your HP');
  });
});

// ---------------------------------------------------------------------------
// getSemanticStatus
// ---------------------------------------------------------------------------

describe('getSemanticStatus', () => {
  it('riporta disponibilità e modello rilevato', async () => {
    h.tagsModels = ['bge-m3:latest'];
    const status = await getSemanticStatus();
    expect(status).toEqual({ mode: 'auto', model: 'bge-m3:latest', available: true });
  });

  it('off → non disponibile, senza chiamate', async () => {
    mockLS({ gameStringerSettings: JSON.stringify({ translation: { semanticTM: 'off' } }) });
    const status = await getSemanticStatus();
    expect(status).toEqual({ mode: 'off', model: null, available: false });
    expect(h.tagsCalls).toBe(0);
  });
});
