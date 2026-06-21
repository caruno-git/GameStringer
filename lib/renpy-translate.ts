// Flusso condiviso per la traduzione di giochi Ren'Py (visual novel).
// Usato dal pulsante hero "STRING IT!" (game-detail-client) per il branch Ren'Py.
//
// Pipeline: extract_all_renpy_strings -> traduzione LLM offline (Ollama) a chunk
// con masking dei placeholder Ren'Py, iniettando glossario (coerenza termini/nomi)
// e voce del personaggio (coerenza di tono per parlante) -> generate_renpy_translation.
// Include checkpoint/resume su JSON cosi' un job lungo sopravvive a interruzioni.
//
// Nota correttezza: l'estrazione conserva gli escape sorgente (\" \n ...) nel campo
// `original`. Per la traduzione serve il testo RAW, quindi de-escapiamo prima di
// mandarlo all'LLM e lasciamo `original` invariato (lato Rust generate_renpy_translation
// de-escapa la chiave e ri-escapa il valore in modo coerente).

import { invoke } from '@/lib/tauri-api';

export interface RenpyProgress {
  phase: 'extract' | 'glossary' | 'translate' | 'generate' | 'done';
  done: number;
  total: number;
}

type RenpyStringType = 'Dialogue' | 'Menu' | 'Narration' | 'String' | 'Label';

interface RenpyString {
  id: string;
  original: string;
  translated: string;
  file: string;
  line_number: number;
  string_type: RenpyStringType;
  character: string | null;
}

interface RenpyExtractionResult {
  success: boolean;
  message: string;
  strings: RenpyString[];
  total_count: number;
}

// Coppia glossario inviata al comando Rust (camelCase: doNotTranslate).
export interface GlossaryPair { source: string; target: string; doNotTranslate: boolean; }

// Forma (parziale) di SmartGlossary restituito da load_smart_glossary (camelCase).
interface SmartGlossaryTerm { sourceTerm: string; targetTerm: string; doNotTranslate?: boolean; tier?: string; }
interface SmartGlossary { terms?: SmartGlossaryTerm[]; }

// Placeholder Ren'Py da NON tradurre: tag testo, interpolazione [var], escape \n \t \" \\.
const MASK = /(\{[^}]*\}|\[[^\]]*\]|\\[nt"\\])/g;
function mask(txt: string, store: string[]): string {
  return txt.replace(MASK, (m) => { store.push(m); return `@@GS${store.length - 1}@@`; });
}
function unmask(txt: string, store: string[]): string {
  return txt.replace(/@@GS(\d+)@@/g, (_m, i) => store[Number(i)] ?? '');
}

// De-escape mirror di unescape_renpy_string (Rust): \\->\, \"->", \n->newline, \t->tab.
function unescapeRenpy(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      const n = s[i + 1];
      if (n === '\\') { out += '\\'; i++; }
      else if (n === '"') { out += '"'; i++; }
      else if (n === 'n') { out += '\n'; i++; }
      else if (n === 't') { out += '\t'; i++; }
      else { out += '\\'; }
    } else {
      out += s[i];
    }
  }
  return out;
}

function lsGet(key: string): string | null {
  try { return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null; } catch { return null; }
}

// Carica il glossario del gioco e lo converte in GlossaryPair[] (cap a 80 termini,
// priorita' a locked/synced per la coerenza di nomi/UI).
async function loadGlossary(sourceLang: string, targetLang: string, gameId?: string): Promise<GlossaryPair[]> {
  try {
    const gl = await invoke<SmartGlossary>('load_smart_glossary', {
      sourceLang, targetLang, gameId: gameId ?? null,
    });
    const terms = gl?.terms || [];
    const ranked = [...terms].sort((a, b) => {
      const w = (t?: string) => (t === 'locked' ? 0 : t === 'synced' ? 1 : 2);
      return w(a.tier) - w(b.tier);
    });
    const pairs: GlossaryPair[] = [];
    for (const t of ranked) {
      if (!t.sourceTerm) continue;
      if (t.doNotTranslate || t.targetTerm) {
        pairs.push({ source: t.sourceTerm, target: t.targetTerm || '', doNotTranslate: !!t.doNotTranslate });
      }
      if (pairs.length >= 80) break;
    }
    return pairs;
  } catch {
    return [];
  }
}

export async function runRenpyTranslation(opts: {
  gamePath: string;
  targetLang?: string;
  sourceLang?: string;
  gameId?: string;
  glossary?: GlossaryPair[];
  model?: string;
  chunkSize?: number;
  onProgress?: (p: RenpyProgress) => void;
}): Promise<{ translated: number; total: number; files: string; glossaryTerms: number }> {
  const tgt = (opts.targetLang || 'it').toLowerCase();
  const src = (opts.sourceLang || 'en').toLowerCase();
  const model = opts.model || lsGet('gs_renpy_model') || lsGet('gs_hendrix_model') || 'gemma4:e4b';
  const CHUNK = opts.chunkSize || Number(lsGet('gs_renpy_chunk')) || 30;
  const SAVE_EVERY = 300;
  const report = opts.onProgress || (() => {});

  // -- Estrazione --
  report({ phase: 'extract', done: 0, total: 0 });
  const extraction = await invoke<RenpyExtractionResult>('extract_all_renpy_strings', {
    gamePath: opts.gamePath,
  });
  if (!extraction.success) throw new Error(extraction.message || "Estrazione Ren'Py fallita");
  const rows = extraction.strings;
  const total = rows.length;
  if (total === 0) throw new Error('Nessuna stringa traducibile trovata (.rpy)');

  // -- Glossario (coerenza termini/nomi) --
  report({ phase: 'glossary', done: 0, total });
  const glossary = opts.glossary ?? await loadGlossary(src, tgt, opts.gameId);

  // Contesto voce: mappa original -> primo personaggio incontrato.
  const speakerOf: Record<string, string> = {};
  for (const r of rows) {
    if (r.character && !speakerOf[r.original]) speakerOf[r.original] = r.character;
  }

  const progressPath = `${opts.gamePath}/gs_renpy_progress_${tgt}.json`;

  // -- Resume: carica checkpoint precedente --
  const byOriginal: Record<string, string> = {};
  try {
    const saved = await invoke<RenpyString[]>('load_renpy_translations', { inputPath: progressPath });
    for (const r of saved) if (r.translated) byOriginal[r.original] = r.translated;
  } catch { /* nessun checkpoint */ }

  for (const r of rows) if (byOriginal[r.original]) r.translated = byOriginal[r.original];

  let done = rows.filter(r => r.translated).length;
  report({ phase: 'translate', done, total });

  const pendingOriginals = Array.from(new Set(
    rows.filter(r => !r.translated).map(r => r.original)
  ));

  const applyAndSave = async () => {
    for (const r of rows) if (byOriginal[r.original]) r.translated = byOriginal[r.original];
    await invoke('save_renpy_translations', { outputPath: progressPath, strings: rows }).catch(() => {});
  };

  // -- Traduzione a chunk via Ollama, con masking + glossario + voce --
  let sinceSave = 0;
  for (let i = 0; i < pendingOriginals.length; i += CHUNK) {
    const slice = pendingOriginals.slice(i, i + CHUNK);
    const stores: string[][] = [];
    const masked = slice.map(orig => {
      const st: string[] = [];
      stores.push(st);
      return mask(unescapeRenpy(orig), st);
    });
    const contexts = slice.map(orig => speakerOf[orig] ?? null);
    const res = await invoke<{ translated: string }[]>('offline_translate_batch_context', {
      texts: masked, contexts, glossary, sourceLang: src, targetLang: tgt, model,
    });
    res.forEach((tr, k) => {
      const out = (tr.translated || '').startsWith('[ERRORE]') ? '' : unmask(tr.translated || '', stores[k]);
      if (out) byOriginal[slice[k]] = out;
    });
    done = rows.filter(r => byOriginal[r.original] || r.translated).length;
    sinceSave += slice.length;
    report({ phase: 'translate', done, total });

    if (sinceSave >= SAVE_EVERY) { await applyAndSave(); sinceSave = 0; }
  }

  // -- Genera i file tl/ --
  for (const r of rows) if (byOriginal[r.original]) r.translated = byOriginal[r.original];
  await invoke('save_renpy_translations', { outputPath: progressPath, strings: rows }).catch(() => {});

  report({ phase: 'generate', done, total });
  const files = await invoke<string>('generate_renpy_translation', {
    gamePath: opts.gamePath, language: tgt, strings: rows,
  });

  const translated = rows.filter(r => r.translated).length;
  report({ phase: 'done', done: translated, total });
  return { translated, total, files, glossaryTerms: glossary.length };
}
