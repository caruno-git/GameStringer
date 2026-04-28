'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/unified-auth';
// Rimosso NotificationProvider per semplificare

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




