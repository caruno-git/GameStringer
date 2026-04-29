'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';
import { clientLogger } from '@/lib/client-logger';

export interface StreamingTranslationOptions {
  model: string;
  temperature?: number;
  topP?: number;
  topK?: number;
  context?: string;
  textType?: 'dialogue' | 'ui' | 'item' | 'quest' | 'lore' | 'system' | 'tutorial';
}

export interface StreamState {
  text: string;
  isStreaming: boolean;
  tokensPerSecond: number | null;
  totalTokens: number;
  totalDurationMs: number | null;
  error: string | null;
  isComplete: boolean;
}

export interface UseStreamingTranslationReturn {
  streamState: StreamState;
  startStreaming: (text: string, sourceLang: string, targetLang: string, options: StreamingTranslationOptions) => Promise<void>;
  stopStreaming: () => void;
  reset: () => void;
}

const initialState: StreamState = {
  text: '',
  isStreaming: false,
  tokensPerSecond: null,
  totalTokens: 0,
  totalDurationMs: null,
  error: null,
  isComplete: false,
};

export function useStreamingTranslation(): UseStreamingTranslationReturn {
  const [streamState, setStreamState] = useState<StreamState>(initialState);
  const unlistenersRef = useRef<UnlistenFn[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      unlistenersRef.current.forEach(unlisten => unlisten());
      unlistenersRef.current = [];
    };
  }, []);

  const setupListeners = useCallback(async () => {
    // Clean up previous listeners
    unlistenersRef.current.forEach(unlisten => unlisten());
    unlistenersRef.current = [];

    const listeners: UnlistenFn[] = [];

    // Start event
    const startUnlisten = await listen('ollama-stream-start', (event) => {
      clientLogger.info('[Streaming] Started', event.payload);
      setStreamState(prev => ({
        ...prev,
        isStreaming: true,
        isComplete: false,
        error: null,
      }));
    });
    listeners.push(startUnlisten);

    // Chunk event
    const chunkUnlisten = await listen('ollama-stream-chunk', (event) => {
      const payload = event.payload as {
        text: string;
        accumulated: string;
        done: boolean;
        tokens_per_second?: number;
        total_tokens: number;
      };

      setStreamState(prev => ({
        ...prev,
        text: payload.accumulated,
        tokensPerSecond: payload.tokens_per_second ?? prev.tokensPerSecond,
        totalTokens: payload.total_tokens,
      }));
    });
    listeners.push(chunkUnlisten);

    // Complete event
    const completeUnlisten = await listen('ollama-stream-complete', (event) => {
      const payload = event.payload as {
        final_text: string;
        total_tokens: number;
        total_duration_ms?: number;
        tokens_per_second?: number;
      };

      setStreamState(prev => ({
        ...prev,
        text: payload.final_text,
        isStreaming: false,
        isComplete: true,
        totalTokens: payload.total_tokens,
        totalDurationMs: payload.total_duration_ms ?? null,
        tokensPerSecond: payload.tokens_per_second ?? prev.tokensPerSecond,
      }));

      clientLogger.info('[Streaming] Complete', payload);
    });
    listeners.push(completeUnlisten);

    // Error event
    const errorUnlisten = await listen('ollama-stream-error', (event) => {
      const payload = event.payload as { error: string };
      
      setStreamState(prev => ({
        ...prev,
        isStreaming: false,
        error: payload.error,
      }));

      clientLogger.error('[Streaming] Error', payload);
    });
    listeners.push(errorUnlisten);

    unlistenersRef.current = listeners;
  }, []);

  const startStreaming = useCallback(async (
    text: string,
    sourceLang: string,
    targetLang: string,
    options: StreamingTranslationOptions
  ) => {
    if (!text.trim()) return;

    // Reset state
    setStreamState(initialState);
    
    // Setup listeners
    await setupListeners();

    try {
      await invoke('translate_with_streaming', {
        text,
        sourceLang,
        targetLang,
        model: options.model,
        temperature: options.temperature ?? 0.3,
        topP: options.topP,
        topK: options.topK,
        context: options.context,
        textType: options.textType,
      });
    } catch (error) {
      clientLogger.error('[Streaming] Failed to start', error);
      setStreamState(prev => ({
        ...prev,
        error: String(error),
        isStreaming: false,
      }));
    }
  }, [setupListeners]);

  const stopStreaming = useCallback(() => {
    // Clean up listeners
    unlistenersRef.current.forEach(unlisten => unlisten());
    unlistenersRef.current = [];

    setStreamState(prev => ({
      ...prev,
      isStreaming: false,
    }));
  }, []);

  const reset = useCallback(() => {
    unlistenersRef.current.forEach(unlisten => unlisten());
    unlistenersRef.current = [];
    setStreamState(initialState);
  }, []);

  return {
    streamState,
    startStreaming,
    stopStreaming,
    reset,
  };
}

// Hook per batch streaming
export function useBatchStreamingTranslation() {
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
    currentTextPreview: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let unlistenProgress: UnlistenFn | null = null;
    let unlistenComplete: UnlistenFn | null = null;

    const setupListeners = async () => {
      unlistenProgress = await listen('ollama-batch-progress', (event) => {
        setProgress(event.payload as typeof progress);
      });

      unlistenComplete = await listen('ollama-batch-complete', (event) => {
        setIsProcessing(false);
        setIsComplete(true);
      });
    };

    setupListeners();

    return () => {
      unlistenProgress?.();
      unlistenComplete?.();
    };
  }, []);

  const startBatch = useCallback(async (
    texts: string[],
    sourceLang: string,
    targetLang: string,
    model: string,
    temperature?: number
  ) => {
    setIsProcessing(true);
    setIsComplete(false);
    setResults([]);
    setProgress({ current: 0, total: texts.length, percentage: 0, currentTextPreview: '' });

    try {
      await invoke('translate_batch_streaming', {
        texts,
        sourceLang,
        targetLang,
        model,
        temperature: temperature ?? 0.3,
      });
    } catch (error) {
      setIsProcessing(false);
      throw error;
    }
  }, []);

  return {
    progress,
    isProcessing,
    results,
    isComplete,
    startBatch,
  };
}
