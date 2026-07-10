/**
 * Semantic Retriever — RAG semantico locale su Translation Memory e Glossario.
 *
 * Layer semantico SOPRA il matching keyword esistente (rag-glossary.ts e
 * getRelevantTMContext): usa embeddings locali via Ollama (/api/embed) per
 * recuperare traduzioni passate e voci di glossario CONCETTUALMENTE simili al
 * batch corrente, anche quando la forma superficiale è diversa (parafrasi,
 * flessioni, sinonimi). Approccio ibrido:
 *   - keyword matching → termini esatti (già coperto altrove)
 *   - cosine similarity → tono/contesto/parafrasi (questo modulo)
 *
 * Design:
 *   - Fail-open SEMPRE: senza Ollama o senza modello embedding installato si
 *     degrada silenziosamente al solo keyword matching. Nessun errore risale.
 *   - Indicizzazione lazy e incrementale: al primo retrieval si embeddano le
 *     voci mancanti (con cap per chiamata per non bloccare la traduzione);
 *     le successive chiamate riusano i vettori persistiti.
 *   - Persistenza vettori in IndexedDB (idb-keyval): i vettori sono una cache
 *     ricostruibile, la perdita non è mai un errore.
 *   - Modello embedding auto-rilevato tra quelli installati in Ollama, con
 *     override utente via gameStringerSettings.translation.embeddingModel.
 *
 * Aggancio: translateWithFallback (ai-translate-direct.ts) accoda il blocco
 * semantico a opts.tmContext, che prompt-builder inietta nel prompt.
 */

import { ollamaFetch } from './ollama-http';
import { clientLogger } from '@/lib/client-logger';

// ---------------------------------------------------------------------------
// Tipi e costanti
// ---------------------------------------------------------------------------

export type SemanticTMMode = 'auto' | 'off';

export interface SemanticMatch {
  source: string;
  target: string;
  kind: 'tm' | 'glossary';
  similarity: number; // 0-1
  verified?: boolean;
  context?: string;
}

export interface SemanticContextParams {
  texts: string[];
  sourceLang: string;
  targetLang: string;
  gameId?: string;
  /** Blocco contesto già presente (es. TM keyword RAG) — usato per dedupe. */
  existingContext?: string;
  /** Max voci totali nel blocco (default 8). */
  maxTotal?: number;
}

/** Modelli embedding supportati, in ordine di preferenza. */
export const EMBEDDING_MODEL_PREFERENCES = [
  'bge-m3',              // multilingue top (~1.2GB) — ideale per JA/ZH/KO → IT
  'nomic-embed-text',    // leggero e veloce (~270MB), ottimo per EN
  'mxbai-embed-large',
  'snowflake-arctic-embed',
  'embeddinggemma',
  'granite-embedding',
  'all-minilm',
];

// Cap e soglie (sintonizzabili)
const MODEL_CACHE_TTL_MS = 5 * 60_000;      // cache positiva rilevamento modello
const MODEL_NEG_CACHE_TTL_MS = 60_000;      // cache negativa (Ollama giù / nessun modello)
const MAX_BATCH_TEXTS = 50;                 // oltre, il retrieval viene saltato (batch enormi)
const MAX_QUERY_TEXTS = 32;                 // testi del batch effettivamente embeddati come query
const MAX_INDEXED_TM = 4000;                // unità TM più recenti mantenute nell'indice
const MAX_INDEXED_GLOSSARY = 2000;
const MAX_EMBED_PER_CALL = 256;             // nuove voci embeddate per singolo retrieval
const EMBED_CHUNK_SIZE = 64;                // dimensione chunk verso /api/embed
const MIN_SIM_TM = 0.66;
const MIN_SIM_GLOSSARY = 0.6;
const NEAR_EXACT_SIM = 0.985;               // quasi-identici: già gestiti da exact/fuzzy match
const SAME_GAME_BOOST = 0.02;

// ---------------------------------------------------------------------------
// Impostazioni
// ---------------------------------------------------------------------------

/** Legge la modalità TM semantica dalle impostazioni utente (default: 'auto') */
export function getSemanticTMMode(): SemanticTMMode {
  try {
    const settings = JSON.parse(localStorage.getItem('gameStringerSettings') || '{}');
    const mode = settings?.translation?.semanticTM;
    if (mode === 'off' || mode === 'auto') return mode;
  } catch {
    // localStorage non disponibile (SSR/test) → default
  }
  return 'auto';
}

function getPreferredEmbeddingModel(): string {
  try {
    const settings = JSON.parse(localStorage.getItem('gameStringerSettings') || '{}');
    const m = settings?.translation?.embeddingModel;
    if (typeof m === 'string' && m.trim()) return m.trim();
  } catch {
    // default sotto
  }
  return '';
}

// ---------------------------------------------------------------------------
// Rilevamento modello embedding
// ---------------------------------------------------------------------------

let modelCache: { model: string | null; ts: number } | null = null;

/**
 * Rileva il modello embedding da usare: preferenza utente se installata,
 * altrimenti il primo di EMBEDDING_MODEL_PREFERENCES presente in Ollama.
 * Ritorna null (con cache negativa) se Ollama è giù o nessun modello è installato.
 */
export async function detectEmbeddingModel(forceRefresh = false): Promise<string | null> {
  if (!forceRefresh && modelCache) {
    const ttl = modelCache.model ? MODEL_CACHE_TTL_MS : MODEL_NEG_CACHE_TTL_MS;
    if (Date.now() - modelCache.ts < ttl) return modelCache.model;
  }

  let found: string | null = null;
  try {
    const res = await ollamaFetch('/api/tags', { timeoutMs: 2500 });
    if (res.ok) {
      const data = await res.json();
      const names: string[] = ((data.models || []) as { name: string }[]).map(m => m.name);
      const matches = (candidate: string) => (n: string) =>
        n === candidate || n.startsWith(`${candidate}:`);

      const preferred = getPreferredEmbeddingModel();
      if (preferred) {
        found = names.find(matches(preferred)) || null;
      }
      if (!found) {
        for (const pref of EMBEDDING_MODEL_PREFERENCES) {
          const hit = names.find(matches(pref));
          if (hit) { found = hit; break; }
        }
      }
    }
  } catch {
    // Ollama non raggiungibile → cache negativa
  }

  modelCache = { model: found, ts: Date.now() };
  return found;
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * nomic-embed-text è addestrato con prefissi task-specific: applicarli
 * migliora sensibilmente il retrieval. Gli altri modelli non li richiedono.
 */
function taskPrefix(model: string, task: 'document' | 'query'): string {
  if (model.startsWith('nomic-embed-text')) {
    return task === 'document' ? 'search_document: ' : 'search_query: ';
  }
  return '';
}

/**
 * Embedda un array di testi via Ollama /api/embed.
 * Ritorna null su qualsiasi errore (fail-open).
 */
export async function embedTexts(
  model: string,
  texts: string[],
  task: 'document' | 'query' = 'document'
): Promise<number[][] | null> {
  if (texts.length === 0) return [];
  const prefix = taskPrefix(model, task);
  try {
    const res = await ollamaFetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: texts.map(t => prefix + t) }),
      timeoutMs: 20_000,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const embeddings = data?.embeddings;
    if (!Array.isArray(embeddings) || embeddings.length !== texts.length) return null;
    return embeddings as number[][];
  } catch {
    return null;
  }
}

/** Similarità coseno tra due vettori (0 se dimensioni incompatibili). */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Hash veloce e stabile (base36) per chiavi voce — stesso stile della TM. */
export function hashKey(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// ---------------------------------------------------------------------------
// Vector store (IndexedDB via idb-keyval, con cache in memoria)
// ---------------------------------------------------------------------------

interface StoredItem {
  v: number[];      // vettore embedding
  s: string;        // testo sorgente / termine
  t: string;        // traduzione
  g?: string;       // gameId (per boost same-game)
  ok?: boolean;     // verified (TM)
  c?: string;       // context (glossario)
}

interface StoredIndex {
  model: string;
  items: Record<string, StoredItem>;
}

const memoryIndexCache = new Map<string, StoredIndex>();

/** Reset cache in memoria (modello + indici). Usato nei test e al cambio modello. */
export function invalidateSemanticCaches(): void {
  modelCache = null;
  memoryIndexCache.clear();
}

async function loadIndex(key: string): Promise<StoredIndex | null> {
  const cached = memoryIndexCache.get(key);
  if (cached) return cached;
  try {
    const { get } = await import('idb-keyval');
    const stored = (await get(key)) as StoredIndex | undefined;
    if (stored && stored.items) {
      memoryIndexCache.set(key, stored);
      return stored;
    }
  } catch {
    // IndexedDB non disponibile → si lavora solo in memoria
  }
  return null;
}

async function saveIndex(key: string, index: StoredIndex): Promise<void> {
  memoryIndexCache.set(key, index);
  try {
    const { set } = await import('idb-keyval');
    await set(key, index);
  } catch {
    // Persistenza fallita: l'indice resta valido in memoria per la sessione
  }
}

interface SourceEntry {
  id: string;
  text: string;     // testo da embeddare
  item: Omit<StoredItem, 'v'>;
}

/**
 * Garantisce che l'indice contenga i vettori per le voci correnti:
 * - rimuove voci non più presenti nella sorgente (pruning)
 * - embedda le voci mancanti (fino a MAX_EMBED_PER_CALL per chiamata)
 * - resetta l'indice se il modello embedding è cambiato
 * Ritorna l'indice aggiornato e il numero di voci ancora in attesa.
 */
async function ensureIndex(
  key: string,
  model: string,
  sources: SourceEntry[]
): Promise<{ index: StoredIndex; pending: number }> {
  let index = await loadIndex(key);
  if (!index || index.model !== model) {
    index = { model, items: {} };
  }

  const sourceIds = new Set(sources.map(s => s.id));
  let dirty = false;

  // Pruning: voci rimosse/aggiornate a monte
  for (const id of Object.keys(index.items)) {
    if (!sourceIds.has(id)) {
      delete index.items[id];
      dirty = true;
    }
  }

  // Voci mancanti da embeddare
  const missing = sources.filter(s => !index!.items[s.id]);
  const toEmbed = missing.slice(0, MAX_EMBED_PER_CALL);
  for (let i = 0; i < toEmbed.length; i += EMBED_CHUNK_SIZE) {
    const chunk = toEmbed.slice(i, i + EMBED_CHUNK_SIZE);
    const vectors = await embedTexts(model, chunk.map(c => c.text), 'document');
    if (!vectors) break; // fail-open: si riproverà al prossimo retrieval
    for (let j = 0; j < chunk.length; j++) {
      index.items[chunk[j].id] = { ...chunk[j].item, v: vectors[j] };
      dirty = true;
    }
  }

  if (dirty) await saveIndex(key, index);

  const pending = sources.filter(s => !index!.items[s.id]).length;
  return { index, pending };
}

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

interface QueryOptions {
  minSim: number;
  topKPerQuery: number;
  gameId?: string;
  queryTexts: string[]; // testi originali (per escludere self-match)
}

function queryIndex(
  index: StoredIndex,
  queryVecs: number[][],
  kind: 'tm' | 'glossary',
  opts: QueryOptions
): SemanticMatch[] {
  const items = Object.values(index.items);
  if (items.length === 0) return [];

  const normalizedQueries = new Set(opts.queryTexts.map(t => t.trim().toLowerCase()));
  const best = new Map<string, SemanticMatch>();

  for (const qv of queryVecs) {
    const scored: SemanticMatch[] = [];
    for (const item of items) {
      const baseSim = cosineSimilarity(qv, item.v);
      if (baseSim >= NEAR_EXACT_SIM) continue; // quasi-identico: già coperto da exact/fuzzy
      let sim = baseSim;
      if (opts.gameId && item.g && item.g === opts.gameId) sim += SAME_GAME_BOOST;
      if (sim < opts.minSim) continue;
      if (normalizedQueries.has(item.s.trim().toLowerCase())) continue; // self-match
      scored.push({
        source: item.s,
        target: item.t,
        kind,
        similarity: Math.min(sim, 1),
        verified: item.ok,
        context: item.c,
      });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    for (const m of scored.slice(0, opts.topKPerQuery)) {
      const k = `${m.source}|||${m.target}`;
      const prev = best.get(k);
      if (!prev || m.similarity > prev.similarity) best.set(k, m);
    }
  }

  return Array.from(best.values()).sort((a, b) => b.similarity - a.similarity);
}

/** Campiona al massimo `max` testi distribuiti uniformemente sul batch. */
function sampleTexts(texts: string[], max: number): string[] {
  if (texts.length <= max) return texts;
  const out: string[] = [];
  const step = texts.length / max;
  for (let i = 0; i < max; i++) {
    out.push(texts[Math.floor(i * step)]);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sorgenti dati (TM + Glossario)
// ---------------------------------------------------------------------------

async function collectTMSources(sourceLang: string, targetLang: string): Promise<SourceEntry[]> {
  try {
    // Lazy import per evitare dipendenze circolari (translation-memory importa
    // ai-translate-direct, che importa questo modulo dinamicamente).
    const { translationMemory } = await import('@/lib/translation-memory');
    await translationMemory.initialize(sourceLang, targetLang);
    const units = translationMemory.getAllUnits();
    // Le più recenti sono in coda: manteniamo le ultime MAX_INDEXED_TM
    const recent = units.length > MAX_INDEXED_TM ? units.slice(-MAX_INDEXED_TM) : units;
    return recent
      .filter(u => u.sourceText && u.targetText)
      .map(u => ({
        id: `tm:${hashKey(`${u.sourceText}→${u.targetText}`)}`,
        text: u.sourceText,
        item: { s: u.sourceText, t: u.targetText, g: u.gameId, ok: u.verified || undefined },
      }));
  } catch {
    return [];
  }
}

function collectGlossarySources(gameId: string): SourceEntry[] {
  try {
    // Stesso formato di RagGlossary.loadFromStorage (dict_${gameId})
    const savedDicts = JSON.parse(localStorage.getItem(`dict_${gameId}`) || '[]');
    if (!Array.isArray(savedDicts)) return [];
    return savedDicts
      .filter((d: { original?: string; translated?: string; isRegex?: boolean }) =>
        d && typeof d.original === 'string' && d.original.trim() &&
        typeof d.translated === 'string' && !d.isRegex) // le regex non si embeddano
      .slice(0, MAX_INDEXED_GLOSSARY)
      .map((d: { original: string; translated: string; context?: string }) => {
        // Termine + contesto: il contesto arricchisce l'embedding del concetto
        const text = d.context ? `${d.original} — ${d.context}` : d.original;
        return {
          id: `gl:${hashKey(`${d.original}→${d.translated}|${d.context || ''}`)}`,
          text,
          item: { s: d.original, t: d.translated, g: gameId, c: d.context || undefined },
        };
      });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// API principale
// ---------------------------------------------------------------------------

let unavailabilityLogged = false;

/**
 * Costruisce il blocco di contesto semantico da iniettare nel prompt.
 * Ritorna '' se disabilitato, non disponibile o senza match (fail-open).
 */
export async function getSemanticContext(params: SemanticContextParams): Promise<string> {
  const { texts, sourceLang, targetLang, gameId, existingContext = '', maxTotal = 8 } = params;

  if (getSemanticTMMode() === 'off') return '';
  if (!texts || texts.length === 0 || texts.length > MAX_BATCH_TEXTS) return '';

  const model = await detectEmbeddingModel();
  if (!model) {
    if (!unavailabilityLogged) {
      unavailabilityLogged = true;
      clientLogger.debug(
        '[Semantic-RAG] Nessun modello embedding disponibile in Ollama — retrieval semantico disattivato. ' +
        `Suggerito: ollama pull ${EMBEDDING_MODEL_PREFERENCES[1]} (leggero) o ${EMBEDDING_MODEL_PREFERENCES[0]} (multilingue).`
      );
    }
    return '';
  }

  try {
    // 1. Sorgenti
    const tmSources = await collectTMSources(sourceLang, targetLang);
    const glossarySources = gameId ? collectGlossarySources(gameId) : [];
    if (tmSources.length === 0 && glossarySources.length === 0) return '';

    // 2. Indici (lazy, incrementali)
    const tmKey = `gs-semvec:v1:tm:${sourceLang}:${targetLang}`;
    const glKey = `gs-semvec:v1:gl:${gameId}:${targetLang}`;
    const [tmResult, glResult] = await Promise.all([
      tmSources.length > 0 ? ensureIndex(tmKey, model, tmSources) : Promise.resolve(null),
      glossarySources.length > 0 ? ensureIndex(glKey, model, glossarySources) : Promise.resolve(null),
    ]);

    const totalPending = (tmResult?.pending || 0) + (glResult?.pending || 0);
    if (totalPending > 0) {
      clientLogger.debug(`[Semantic-RAG] Indicizzazione incrementale: ${totalPending} voci in coda per i prossimi batch`);
    }

    // 3. Query embeddings
    const queryTexts = sampleTexts(texts.filter(t => t && t.trim().length > 0), MAX_QUERY_TEXTS);
    if (queryTexts.length === 0) return '';
    const queryVecs = await embedTexts(model, queryTexts, 'query');
    if (!queryVecs) return '';

    // 4. Retrieval
    const combinedLower = texts.join(' ').toLowerCase();
    const tmMatches = tmResult
      ? queryIndex(tmResult.index, queryVecs, 'tm', {
          minSim: MIN_SIM_TM, topKPerQuery: 2, gameId, queryTexts,
        })
        // Dedupe contro il blocco keyword già iniettato
        .filter(m => !existingContext.includes(`"${m.source}"`))
      : [];
    const glossaryMatches = glResult
      ? queryIndex(glResult.index, queryVecs, 'glossary', {
          minSim: MIN_SIM_GLOSSARY, topKPerQuery: 2, gameId, queryTexts,
        })
        // I termini presenti verbatim nel batch sono già coperti dal RAG keyword
        .filter(m => !combinedLower.includes(m.source.toLowerCase()))
      : [];

    if (tmMatches.length === 0 && glossaryMatches.length === 0) return '';

    // 5. Blocco prompt (budget condiviso, TM prioritaria)
    const tmTake = tmMatches.slice(0, maxTotal);
    const glTake = glossaryMatches.slice(0, Math.max(2, maxTotal - tmTake.length));

    let block = `\n--- SEMANTIC CONTEXT (AI-retrieved, local) ---\n`;
    if (tmTake.length > 0) {
      block += `Semantically similar past translations (use as style/terminology reference):\n`;
      for (const m of tmTake) {
        block += `- "${m.source}" → "${m.target}"${m.verified ? ' ✓' : ''}\n`;
      }
    }
    if (glTake.length > 0) {
      block += `Related glossary concepts (apply these translations when the concept appears):\n`;
      for (const m of glTake) {
        block += `- "${m.source}" → "${m.target}"${m.context ? ` (Context: ${m.context})` : ''}\n`;
      }
    }
    block += `----------------------------------------------\n`;

    clientLogger.debug(
      `[Semantic-RAG] ${tmTake.length} TM + ${glTake.length} glossario (modello: ${model})`
    );
    return block;
  } catch (e: unknown) {
    clientLogger.debug('[Semantic-RAG] Retrieval fallito (fail-open):', e);
    return '';
  }
}

// ---------------------------------------------------------------------------
// Stato (per UI impostazioni / diagnostica)
// ---------------------------------------------------------------------------

export interface SemanticStatus {
  mode: SemanticTMMode;
  model: string | null;
  available: boolean;
}

/** Stato corrente del retrieval semantico (per UI/diagnostica). */
export async function getSemanticStatus(): Promise<SemanticStatus> {
  const mode = getSemanticTMMode();
  const model = mode === 'off' ? null : await detectEmbeddingModel();
  return { mode, model, available: mode !== 'off' && !!model };
}

// ---------------------------------------------------------------------------
// Pre-indicizzazione ("indicizza ora")
// ---------------------------------------------------------------------------

export interface WarmIndexResult {
  ok: boolean;              // false se disattivato o nessun modello embedding
  model: string | null;
  tmTotal: number;          // unità TM candidate all'indicizzazione
  tmIndexed: number;        // unità TM effettivamente vettorializzate
  glTotal: number;          // voci glossario candidate (0 se nessun gameId)
  glIndexed: number;
}

/**
 * Pre-calcola gli embedding della TM (e del glossario se `gameId`) per la coppia
 * indicata, così i primi batch di traduzione trovano l'indice già pronto invece
 * di costruirlo incrementalmente. Cicla `ensureIndex` (cap MAX_EMBED_PER_CALL per
 * giro) fino a esaurire le voci pendenti; si ferma se un giro non produce
 * progresso (Ollama caduto a metà) per non entrare in loop. Fail-open.
 */
export async function warmSemanticIndex(
  params: { sourceLang: string; targetLang: string; gameId?: string },
  onProgress?: (indexed: number, total: number) => void
): Promise<WarmIndexResult> {
  const { sourceLang, targetLang, gameId } = params;
  const empty: WarmIndexResult = { ok: false, model: null, tmTotal: 0, tmIndexed: 0, glTotal: 0, glIndexed: 0 };

  if (getSemanticTMMode() === 'off') return empty;
  const model = await detectEmbeddingModel(true);
  if (!model) return empty;

  const tmSources = await collectTMSources(sourceLang, targetLang);
  const glossarySources = gameId ? collectGlossarySources(gameId) : [];
  const total = tmSources.length + glossarySources.length;
  if (total === 0) {
    return { ok: true, model, tmTotal: 0, tmIndexed: 0, glTotal: 0, glIndexed: 0 };
  }

  const tmKey = `gs-semvec:v1:tm:${sourceLang}:${targetLang}`;
  const glKey = `gs-semvec:v1:gl:${gameId}:${targetLang}`;

  // Indicizza completamente un set di sorgenti, ciclando ensureIndex.
  const indexAll = async (key: string, sources: SourceEntry[], baseDone: number): Promise<number> => {
    if (sources.length === 0) return 0;
    let prevPending = Number.POSITIVE_INFINITY;
    // Ogni giro embedda al più MAX_EMBED_PER_CALL voci → un tetto ai giri evita loop.
    const maxRounds = Math.ceil(sources.length / MAX_EMBED_PER_CALL) + 2;
    for (let round = 0; round < maxRounds; round++) {
      const { pending } = await ensureIndex(key, model, sources);
      const done = sources.length - pending;
      onProgress?.(baseDone + done, total);
      if (pending === 0) return done;
      if (pending >= prevPending) return done; // nessun progresso (embed fallito) → stop
      prevPending = pending;
    }
    return sources.length - (prevPending === Number.POSITIVE_INFINITY ? sources.length : prevPending);
  };

  const tmIndexed = await indexAll(tmKey, tmSources, 0);
  const glIndexed = await indexAll(glKey, glossarySources, tmSources.length);

  return {
    ok: true,
    model,
    tmTotal: tmSources.length,
    tmIndexed,
    glTotal: glossarySources.length,
    glIndexed,
  };
}
