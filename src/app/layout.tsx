import type React from "react";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { ConditionalLayoutWrapper } from "@/components/layout/conditional-layout-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content={siteConfig.description} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E67E22" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <FirebaseProvider>
          <ConditionalLayoutWrapper>
            {children}
          </ConditionalLayoutWrapper>
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
