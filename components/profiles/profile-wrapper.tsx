'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ProfileAuthProvider } from '@/lib/auth/profile-auth';
import { ProfilesProvider } from '@/hooks/use-profiles';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { MainLayout } from '@/components/layout/main-layout';
import { sessionPersistence } from '@/lib/auth/session-persistence';
import { isProtectedRoute } from '@/lib/route-config';
import { clientLogger } from '@/lib/client-logger';

interface ProfileWrapperProps {
  children: React.ReactNode;
}

export function ProfileWrapper({ children }: ProfileWrapperProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const pathname = usePathname();

  // FALLBACK IMMEDIATO: chiudi splash appena il componente è montato
  useEffect(() => {
    const closeSplashFallback = async () => {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        console.log('[ProfileWrapper] 🚀 Tentativo chiusura splash immediato...');
        await invoke('close_splash');
        console.log('[ProfileWrapper] ✅ Splash chiusa con successo');
      } catch (e) {
        console.log('[ProfileWrapper] ⚠️ close_splash fallback error:', e);
      }
    };
    // Chiudi splash dopo 2 secondi come fallback assoluto
    const fallbackTimer = setTimeout(closeSplashFallback, 2000);
    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    const initialize = async () => {
      // Timeout di sicurezza: se dopo 3s non è ancora pronto, forza il completamento
      const safetyTimeout = setTimeout(() => {
        clientLogger.warn('⚠️ ProfileWrapper: Safety timeout reached, forcing initialization complete');
        setIsInitializing(false);
      }, 3000);
      
      try {
        clientLogger.debug('🔄 ProfileWrapper: Inizializzazione...');
        
        // ✅ RIABILITATO con protezione anti-loop
        try {
          // Setup activity tracking for session persistence con debouncing
          sessionPersistence.setupActivityTracking();
          
          // Try to restore previous session con timeout BREVE
          const restorePromise = sessionPersistence.restoreSession();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session restore timeout')), 1000)
          );
          
          await Promise.race([restorePromise, timeoutPromise]);
          
          // Clean up any expired sessions
          sessionPersistence.cleanup();
          
          // Ripristina le connessioni store dal backend Rust (non bloccante)
          sessionPersistence.restoreStoreConnections().catch(() => {});
          
          clientLogger.debug('✅ ProfileWrapper: Session persistence riabilitato con successo');
        } catch (sessionError) {
          clientLogger.warn('⚠️ ProfileWrapper: Session persistence fallito, continuando senza:', sessionError);
          // Non bloccare l'inizializzazione se la session persistence fallisce
        }
        
        clientLogger.debug('✅ ProfileWrapper: Inizializzazione completata');
      } catch (error: unknown) {
        clientLogger.error('❌ ProfileWrapper: Error initializing:', error);
      } finally {
        clearTimeout(safetyTimeout);
        clientLogger.debug('🏁 ProfileWrapper: setIsInitializing(false)');
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Chiudi splash quando il frontend è pronto
  useEffect(() => {
    if (!isInitializing) {
      // Frontend pronto - chiudi splash e mostra main window
      import('@tauri-apps/api/core').then(({ invoke }) => {
        invoke('close_splash').catch(() => {});
      }).catch(() => {});
    }
  }, [isInitializing]);

  // Loading iniziale - non mostrare nulla, la splash Tauri è visibile
  if (isInitializing) {
    return null; // Splash Tauri è già visibile
  }

  // Determina se la route corrente richiede authentication
  const requireAuth = isProtectedRoute(pathname);

  // Route che non devono avere NIENTE (ocr overlay trasparente)
  const bareRoutes = ['/ocr-overlay'];
  if (bareRoutes.some(route => pathname?.startsWith(route))) {
    return <>{children}</>;
  }

  // Route finestre secondarie: niente MainLayout ma servono i provider profilo
  const popupRoutes = ['/chat-popup'];
  if (popupRoutes.some(route => pathname?.startsWith(route))) {
    return (
      <ProfilesProvider>
        <ProfileAuthProvider>
          {children}
        </ProfileAuthProvider>
      </ProfilesProvider>
    );
  }

  return (
    <ProfilesProvider>
      <ProfileAuthProvider>
        <ProtectedRoute requireAuth={requireAuth}>
          <MainLayout>
            {children}
          </MainLayout>
        </ProtectedRoute>
      </ProfileAuthProvider>
    </ProfilesProvider>
  );
}



