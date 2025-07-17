// File: src/app/layout.tsx

import type { Metadata } from 'next';
import React from "react";
import { Lato, Lora } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalLayoutWrapper } from "@/components/layout/conditional-layout-wrapper";

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

// --- NEW METADATA OBJECT ---
// This is the modern, correct way to add the Title and Description.
export const metadata: Metadata = {
  title: 'ABYLANG — Learn Amharic with a Native Tutor',
  description: 'Connect to Ethiopian language and culture with Mahder Negash Mamo, a seasoned Amharic tutor offering live online lessons and cultural immersion through ABYLANG.',
  manifest: '/manifest.json',
  icons: {
    apple: '/icon-192x192.png', // Your existing apple touch icon
  },
};

// This is your updated RootLayout component.
// We removed the manual <head> because the 'metadata' object handles it automatically.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${lora.variable}`}>
      <body>
        <FirebaseProvider>
          <ConditionalLayoutWrapper>{children}</ConditionalLayoutWrapper>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
