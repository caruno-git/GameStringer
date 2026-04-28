'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChatPanel } from '@/components/social';
import { useProfiles } from '@/hooks/use-profiles';
import { useTranslation } from '@/lib/i18n';
import { MessageCircle, Loader2, ExternalLink, RotateCw } from 'lucide-react';
import { clientLogger } from '@/lib/client-logger';

export default function ChatPopupPage() {
  const { t } = useTranslation();
  const { currentProfile, isLoading, refreshProfiles } = useProfiles();
  const [mounted, setMounted] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Nella finestra popup separata, forza ricarica profilo corrente al mount
    // (il ProfileManager backend è condiviso, ma il React state è isolato per finestra)
    refreshProfiles().catch(() => {
      // ignora errore: verrà mostrato lo stato "non autenticato" sotto
    });
  }, [refreshProfiles]);

  // Auto-retry: se al primo caricamento non c'è profilo, riprova dopo 800ms
  // (può succedere se il popup si apre prima che il backend sia sincronizzato)
  useEffect(() => {
    if (!mounted || isLoading) return;
    if (currentProfile) return;
    if (retryCount >= 2) return; // Max 2 retry automatici
    const timer = setTimeout(() => {
      setIsRetrying(true);
      refreshProfiles()
        .catch(() => { /* ignora */ })
        .finally(() => {
          setIsRetrying(false);
          setRetryCount(c => c + 1);
        });
    }, 800);
    return () => clearTimeout(timer);
  }, [mounted, isLoading, currentProfile, retryCount, refreshProfiles]);

  // Ascolta evento profile-auth-changed dalla main window per sincronizzarsi live
  // Usa sia DOM events (stessa webview) che Tauri events (cross-webview)
  useEffect(() => {
    const handler = () => {
      clientLogger.debug('[ChatPopup] profile-auth-changed ricevuto, ricarico profilo');
      refreshProfiles().catch(() => { /* ignora */ });
    };
    window.addEventListener('profile-auth-changed', handler);

    // Ascolta anche evento Tauri cross-webview (emittati da main window al login)
    let unlisten: (() => void) | undefined;
    import('@tauri-apps/api/event')
      .then(({ listen }) => listen('profile-auth-changed', handler))
      .then(fn => { unlisten = fn; })
      .catch(() => { /* non in contesto Tauri */ });

    return () => {
      window.removeEventListener('profile-auth-changed', handler);
      if (unlisten) unlisten();
    };
  }, [refreshProfiles]);

  // Apre/focalizza la main window per permettere il login
  const openMainWindow = useCallback(async () => {
    try {
      const { getAllWebviewWindows } = await import('@tauri-apps/api/webviewWindow');
      const windows = await getAllWebviewWindows();
      const mainWin = windows.find(w => w.label === 'main');
      if (mainWin) {
        await mainWin.show();
        await mainWin.unminimize();
        await mainWin.setFocus();
      }
    } catch (e: unknown) {
      clientLogger.warn('[ChatPopup] Impossibile aprire main window: ' + String(e));
    }
  }, []);

  // Loader durante il mount iniziale, caricamento profilo o retry automatico
  if (!mounted || isLoading || isRetrying) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const userId = currentProfile?.id || '';

  if (!userId) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-cyan-400" />
        </div>
        <h2 className="text-lg font-bold text-white mb-2">GameStringer Chat</h2>
        <p className="text-sm text-slate-400 mb-1">
          {t('chat.loginRequired') || 'Accedi con un profilo per usare la chat.'}
        </p>
        <p className="text-xs text-slate-500 mb-5 max-w-xs">
          {t('chat.loginHint') || 'Apri la finestra principale di GameStringer per accedere con il tuo profilo.'}
        </p>
        <div className="flex flex-col gap-2 w-full max-w-[220px]">
          <button
            onClick={openMainWindow}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {t('chat.openMainWindow') || 'Apri App Principale'}
          </button>
          <button
            onClick={() => refreshProfiles()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCw className="w-3 h-3" />
            {t('common.reload') || 'Ricarica'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 overflow-hidden flex flex-col">
      {/* Header stile Steam */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-white truncate">GameStringer Chat</h1>
          <p className="text-xs text-slate-500 truncate">Community & Amici</p>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 overflow-hidden">
        <ChatPanel userId={userId} />
      </div>
    </div>
  );
}

