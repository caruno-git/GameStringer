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
import {
  loadVoiceProfiles,
  getVoiceProfile,
  extractVoiceProfilesFromStrings,
  type VoiceProfile,
} from '@/lib/voice/voice-profiles';

// Descrittore voce compatto (una riga) per il contesto per-stringa: tono,
// registro, personalità e pattern del parlante. Va a finire nel prompt LLM
// (offline_translation.rs build_context_prompt) come voce del personaggio.
function buildVoiceDescriptor(p: VoiceProfile): string {
  const parts: string[] = [p.characterName];
  if (p.tone) parts.push(`${p.tone} tone`);
  if (p.formality) parts.push(`${p.formality.replace(/_/g, ' ')} register`);
  if (p.personality) parts.push(p.personality);
  if (p.speechPatterns?.length) parts.push(`speech: ${p.speechPatterns.slice(0, 3).join('; ')}`);
  if (p.catchphrases?.length) parts.push(`catchphrases: ${p.catchphrases.slice(0, 2).join('; ')}`);
  if (p.avoidPatterns?.length) parts.push(`avoid: ${p.avoidPatterns.slice(0, 2).join('; ')}`);
  return parts.join(' — ').replace(/\s+/g, ' ').trim();
}

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

// Placeholder Ren'Py da preservare: tag testo {..} e interpolazione [var].
// Niente masking: il modello mantiene meglio i codici se istruito nel prompt
// (vedi offline_translation.rs) che sostituendoli con token che poi altera. Qui i codici
// servono solo a VALIDARE: se la traduzione li altera, la scartiamo (no codici rotti nei tl/).
const CODE = /(\{[^}]*\}|\[[^\]]*\])/g;
function codeKey(s: string): string {
  return (s.match(CODE) ?? []).slice().sort().join('');
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
}): Promise<{ translated: number; total: number; files: string; glossaryTerms: number; voiceProfiles: number }> {
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

  // Profili voce personaggio (coerenza di tono/personalità per parlante).
  // Se il gioco non ha profili, li auto-estraiamo dai dialoghi (Speaker: testo).
  // Per ogni parlante con profilo costruiamo un descrittore ricco da iniettare nel
  // prompt al posto del solo nome. Fallback: nome del parlante (comportamento base).
  const voiceDescOf: Record<string, string> = {};
  let voiceProfilesUsed = 0;
  if (opts.gameId) {
    try {
      const existing = loadVoiceProfiles(opts.gameId);
      if (existing.profiles.length === 0) {
        const synth: string[] = [];
        for (const r of rows) {
          if (r.character && (r.string_type === 'Dialogue' || r.string_type === 'Menu')) {
            synth.push(`${r.character}: ${unescapeRenpy(r.original)}`);
          }
        }
        if (synth.length) extractVoiceProfilesFromStrings(opts.gameId, synth);
      }
      const speakers = new Set(Object.values(speakerOf));
      for (const sp of speakers) {
        const prof = getVoiceProfile(opts.gameId, sp);
        if (prof) { voiceDescOf[sp] = buildVoiceDescriptor(prof); voiceProfilesUsed++; }
      }
    } catch { /* voce non disponibile → fallback al nome */ }
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
    const raws = slice.map(orig => unescapeRenpy(orig));
    // Contesto per riga: descrittore voce ricco se il parlante ha un profilo,
    // altrimenti il solo nome del parlante (o null per narrazione/UI senza parlante).
    const contexts = slice.map(orig => {
      const sp = speakerOf[orig];
      if (!sp) return null;
      return voiceDescOf[sp] ?? sp;
    });
    const res = await invoke<{ translated: string }[]>('offline_translate_batch_context', {
      texts: raws, contexts, glossary, sourceLang: src, targetLang: tgt, model,
    });
    res.forEach((tr, k) => {
      const out = (tr.translated || '').trim();
      const bad = !out || out.startsWith('[ERRORE]');
      // Accetta solo se i tag {..}/[..] combaciano; altrimenti lascia non tradotto (retry al resume).
      if (!bad && codeKey(out) === codeKey(raws[k])) byOriginal[slice[k]] = out;
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
  return { translated, total, files, glossaryTerms: glossary.length, voiceProfiles: voiceProfilesUsed };
}
