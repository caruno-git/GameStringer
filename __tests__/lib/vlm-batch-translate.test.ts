import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock del logger
vi.mock('@/lib/client-logger', () => ({
  clientLogger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

// Mock del transport Ollama
const ollamaFetchMock = vi.fn();
vi.mock('@/lib/ai/ollama-http', () => ({
  ollamaFetch: (...args: unknown[]) => ollamaFetchMock(...args),
  OLLAMA_BASE_URL: 'http://127.0.0.1:11434',
}));

import {
  vlmBatchTranslate,
  vlmFullTranslate,
  buildBatchPrompt,
  buildFullPrompt,
  parseVlmResponse,
  vlmBatchResultSchema,
  type VlmLineInput,
} from '@/lib/ocr/vlm-batch-translate';

const bbox = { x0: 0, y0: 0, x1: 100, y1: 20 };
const lines: VlmLineInput[] = [
  { id: 0, text: 'Open the chest', bbox },
  { id: 1, text: 'Attack', bbox },
];

function okResponse(response: string) {
  return { ok: true, status: 200, json: async () => ({ response }), text: async () => response };
}

describe('vlm-batch-translate', () => {
  beforeEach(() => {
    ollamaFetchMock.mockReset();
  });

  describe('parseVlmResponse', () => {
    it('valida e restituisce un batch corretto', () => {
      const raw = JSON.stringify({
        scene: 'dungeon',
        lines: [
          { id: 0, translated: 'Apri il forziere', confidence: 0.95, disambiguation: 'chest = forziere' },
          { id: 1, translated: 'Attacca', confidence: 0.9 },
        ],
      });
      const res = parseVlmResponse(raw);
      expect(res.scene).toBe('dungeon');
      expect(res.lines).toHaveLength(2);
      expect(res.lines[0].translated).toBe('Apri il forziere');
    });

    it('accetta bbox normalizzati (path full)', () => {
      const raw = JSON.stringify({
        scene: 'menu',
        lines: [{ id: 0, translated: 'Gioca', confidence: 0.9, bbox: { x: 0.1, y: 0.2, w: 0.3, h: 0.05 } }],
      });
      const res = parseVlmResponse(raw);
      expect(res.lines[0].bbox).toEqual({ x: 0.1, y: 0.2, w: 0.3, h: 0.05 });
    });

    it('estrae il JSON anche con testo di contorno', () => {
      const raw = 'Ecco il risultato: {"scene":"town","lines":[{"id":0,"translated":"Ciao","confidence":0.8}]} grazie';
      const res = parseVlmResponse(raw);
      expect(res.lines[0].translated).toBe('Ciao');
    });

    it('applica il default di confidence quando fuori range', () => {
      const parsed = vlmBatchResultSchema.parse({
        scene: 's',
        lines: [{ id: 0, translated: 'x', confidence: 5 }],
      });
      expect(parsed.lines[0].confidence).toBe(0.8);
    });

    it('lancia su JSON non parsabile', () => {
      expect(() => parseVlmResponse('non è json')).toThrow(/invalid JSON/);
    });

    it('lancia su output non conforme allo schema', () => {
      const raw = JSON.stringify({ scene: 'x', lines: [{ id: 'zero', translated: 'y' }] });
      expect(() => parseVlmResponse(raw)).toThrow(/schema/);
    });
  });

  describe('buildBatchPrompt', () => {
    it('include lingua target, righe e contesto', () => {
      const p = buildBatchPrompt(lines, 'Italian', 'English', ['Line before']);
      expect(p).toContain('Italian');
      expect(p).toContain('English');
      expect(p).toContain('Open the chest');
      expect(p).toContain('Line before');
    });

    it('non emette il testo bbox nel payload (solo id + text)', () => {
      const p = buildBatchPrompt(lines, 'Italian', undefined, []);
      expect(p).not.toContain('x0');
    });
  });

  describe('buildFullPrompt', () => {
    it('chiede il rilevamento del testo e i bbox, senza righe OCR', () => {
      const p = buildFullPrompt('Italian', 'English', ['Prev']);
      expect(p).toContain('Italian');
      expect(p).toContain('Detect ALL readable text');
      expect(p).toContain('normalized bounding boxes');
      expect(p).toContain('Prev');
    });
  });

  describe('vlmBatchTranslate (hybrid)', () => {
    it('ritorna subito su lista vuota senza chiamare il modello', async () => {
      const res = await vlmBatchTranslate({ imageBase64: 'abc', lines: [], targetLanguage: 'Italian' });
      expect(res.lines).toHaveLength(0);
      expect(ollamaFetchMock).not.toHaveBeenCalled();
    });

    it('chiama Ollama e mappa 1:1 le traduzioni sugli id', async () => {
      ollamaFetchMock.mockResolvedValue(
        okResponse(JSON.stringify({
          scene: 'dungeon',
          lines: [
            { id: 0, translated: 'Apri il forziere', confidence: 0.95 },
            { id: 1, translated: 'Attacca', confidence: 0.9 },
          ],
        })),
      );

      const res = await vlmBatchTranslate({
        imageBase64: 'data:image/png;base64,AAAA',
        lines,
        targetLanguage: 'Italian',
        provider: 'ollama',
        downscaleMaxPx: 0,
      });

      expect(ollamaFetchMock).toHaveBeenCalledOnce();
      const [path, init] = ollamaFetchMock.mock.calls[0];
      expect(path).toBe('/api/generate');
      const body = JSON.parse(init.body);
      expect(body.format).toBe('json');
      expect(body.images[0]).toBe('AAAA');
      expect(res.lines.map(l => l.id)).toEqual([0, 1]);
      expect(res.lines[0].translated).toBe('Apri il forziere');
    });

    it('propaga errore HTTP di Ollama', async () => {
      ollamaFetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}), text: async () => '' });
      await expect(
        vlmBatchTranslate({ imageBase64: 'AAAA', lines, targetLanguage: 'Italian', downscaleMaxPx: 0 }),
      ).rejects.toThrow(/500/);
    });
  });

  describe('vlmFullTranslate (no OCR)', () => {
    it('chiama Ollama con il prompt full e restituisce righe con bbox', async () => {
      ollamaFetchMock.mockResolvedValue(
        okResponse(JSON.stringify({
          scene: 'title screen',
          lines: [{ id: 0, translated: 'Nuova partita', confidence: 0.88, bbox: { x: 0.4, y: 0.5, w: 0.2, h: 0.06 } }],
        })),
      );

      const res = await vlmFullTranslate({
        imageBase64: 'AAAA',
        targetLanguage: 'Italian',
        provider: 'ollama',
        downscaleMaxPx: 0,
      });

      expect(ollamaFetchMock).toHaveBeenCalledOnce();
      const body = JSON.parse(ollamaFetchMock.mock.calls[0][1].body);
      expect(body.prompt).toContain('detect every readable text region');
      expect(res.lines[0].bbox).toEqual({ x: 0.4, y: 0.5, w: 0.2, h: 0.06 });
    });
  });
});
