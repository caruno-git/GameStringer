'use client';

import { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';

// Riga estratta inoltrata dalla DLL via overlay_ipc (evento "gs-overlay-text").
interface OverlayText {
  type: string;
  original: string;
  translated: string;
}

export default function GsOverlayPage() {
  const [line, setLine] = useState<OverlayText | null>(null);
  const [visible, setVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unlisten = listen<OverlayText>('gs-overlay-text', (event) => {
      setLine(event.payload);
      setVisible(true);

      // Auto-hide dopo 6s di silenzio (nessuna nuova riga).
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 6000);
    });

    return () => {
      unlisten.then((fn) => fn());
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!visible || !line) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-transparent flex items-end justify-center pb-16">
      <div
        className="pointer-events-auto max-w-3xl mx-4 px-5 py-3 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(8,12,24,0.92) 0%, rgba(12,20,40,0.94) 100%)',
          borderLeft: '3px solid rgba(56,189,248,0.8)', // sky-400
          boxShadow: '0 0 16px rgba(56,189,248,0.18), 0 6px 24px rgba(0,0,0,0.55)',
          animation: 'gsOverlayIn 0.25s ease-out forwards',
        }}
      >
        <p className="text-sky-400/60 text-sm leading-snug">{line.original}</p>
        <p
          className="text-white font-semibold text-xl leading-snug mt-1"
          style={{ textShadow: '0 0 10px rgba(56,189,248,0.35)' }}
        >
          {line.translated}
        </p>
      </div>

      <style>{`
        @keyframes gsOverlayIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
