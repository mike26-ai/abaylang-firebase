// File: src/components/providers/client-providers.tsx
"use client";

import type { PropsWithChildren } from 'react';
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

/**
 * This component wraps all providers that require a 'use client' context.
 * By isolating them here, we can safely use them in the server-side RootLayout.
 * This refactored component now directly includes AuthProvider.
 */
export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
