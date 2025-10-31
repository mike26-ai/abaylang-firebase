
// File: src/app/layout.tsx

import type { Metadata } from 'next';
import React from "react";
import { Lato, Lora } from "next/font/google";
import "./globals.css";
import { ConditionalLayoutWrapper } from "@/components/layout/conditional-layout-wrapper";
import { ClientProviders } from '@/components/providers/client-providers';

// This section defines your custom fonts and is unchanged.
const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ['400', '700'],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ['400', '700'],
});

// --- METADATA OBJECT ---
export const metadata: Metadata = {
  title: 'ABYLANG — Learn Amharic with a Native Tutor',
  description: 'Connect to Ethiopian language and culture with Mahder Negash Mamo, a seasoned Amharic tutor offering live online lessons and cultural immersion through ABYLANG.',
  // FIX: The manifest property is removed to prevent browsers from trying to fetch the non-existent file.
  // manifest: '/manifest.json', // This line is removed.
  icons: {
    apple: '/icon-192x192.png', 
  },
};

// This is your updated RootLayout component.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${lora.variable}`}>
      <body>
        <ClientProviders>
          <ConditionalLayoutWrapper>{children}</ConditionalLayoutWrapper>
        </ClientProviders>
      </body>
    </html>
  );
}
