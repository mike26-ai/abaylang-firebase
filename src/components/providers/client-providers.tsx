// File: src/components/providers/client-providers.tsx
"use client";

import type { PropsWithChildren } from 'react';
import { FirebaseProvider } from "./firebase-provider";
import { Toaster } from "@/components/ui/toaster";

/**
 * This component wraps all providers that require a 'use client' context.
 * By isolating them here, we can safely use them in the server-side RootLayout
 * without causing ChunkLoadErrors.
 */
export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <FirebaseProvider>
      {children}
      <Toaster />
    </FirebaseProvider>
  );
}
