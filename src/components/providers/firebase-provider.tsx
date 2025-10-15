
"use client";

import type { PropsWithChildren } from 'react';
import React from "react";
import { AuthProvider } from "@/hooks/use-auth";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // If using react-query

// const queryClient = new QueryClient(); // If using react-query

export function FirebaseProvider({ children }: PropsWithChildren) {
  return (
    // <QueryClientProvider client={queryClient}> {/* If using react-query */}
      <AuthProvider>{children}</AuthProvider>
    // </QueryClientProvider> {/* If using react-query */}
  );
}
