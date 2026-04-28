'use client';

// Sistema di authentication unificato - sostituisce NextAuth
import React from 'react';
import { AuthProvider } from '@/lib/auth/unified-auth';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}




