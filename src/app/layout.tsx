// File: src/app/layout.tsx
import type { Metadata } from 'next';
import React from "react";
import { Lato, Lora } from "next/font/google";
import "./globals.css";
import { ClientProviders } from '@/components/providers/client-providers';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/Footer';

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

export const metadata: Metadata = {
  title: 'ABYLANG | Learn Amharic Online with Native Tutor Mahder',
  description: 'Connect to Ethiopian language and culture with Mahder Negash Mamo. Master Amharic with personalized 1-on-1 lessons and cultural immersion.',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '96x96', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${lora.variable}`}>
      <body>
        <ClientProviders>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-2 md:pt-6 px-4">{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
