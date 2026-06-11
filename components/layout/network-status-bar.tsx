'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';
import { getNetworkStatus, onNetworkStatusChange, getOfflineQueueLength } from '@/lib/network-resilience';

/**
 * Barra stato connessione — mostra quando offline o Supabase down.
 * Auto-hide quando connessione ripristinata (con transizione).
 */
export function NetworkStatusBar() {
  const [status, setStatus] = useState(getNetworkStatus());
  const [queueLength, setQueueLength] = useState(getOfflineQueueLength());
  const [isRecovering, setIsRecovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hideTimer, setHideTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onNetworkStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    const handleQueueUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.queueLength !== undefined) {
        setQueueLength(detail.queueLength);
      }
    };
    window.addEventListener('gs-offline-queue-update', handleQueueUpdate);

    return () => {
      unsub();
      window.removeEventListener('gs-offline-queue-update', handleQueueUpdate);
    };
  }, []);

  useEffect(() => {
    // Show bar when offline or Supabase down
    const shouldShow = !status.isOnline || !status.isSupabaseOnline;

    if (shouldShow) {
      setIsVisible(true);
      setIsRecovering(false);
      if (hideTimer) {
        clearTimeout(hideTimer);
        setHideTimer(null);
      }
    } else if (isVisible) {
      // Connection restored — show recovery message briefly then hide
      setIsRecovering(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsRecovering(false);
      }, 3000);
      setHideTimer(timer);
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [status.isOnline, status.isSupabaseOnline]);

  if (!isVisible) return null;

  // Determine severity
  const isOffline = !status.isOnline;
  const isSupabaseDown = status.isOnline && !status.isSupabaseOnline;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
        isRecovering
          ? 'bg-emerald-600/90 text-white'
          : isOffline
            ? 'bg-red-600/90 text-white'
            : 'bg-amber-600/90 text-white'
      }`}
    >
      {isRecovering ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span>Connessione ripristinata{queueLength > 0 ? ` — sincronizzazione ${queueLength} operazioni...` : ''}</span>
        </>
      ) : isOffline ? (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span>Modalità offline — le modifiche saranno sincronizzate al ritorno della connessione</span>
          {queueLength > 0 && (
            <span className="ml-1 opacity-80">({queueLength} in coda)</span>
          )}
        </>
      ) : isSupabaseDown ? (
        <>
          <CloudOff className="h-3.5 w-3.5" />
          <span>Server non raggiungibile — alcune funzionalità potrebbero non essere disponibili</span>
          {status.latencyMs !== null && (
            <span className="ml-1 opacity-80">(latenza: {status.latencyMs}ms)</span>
          )}
        </>
      ) : null}
    </div>
  );
}

