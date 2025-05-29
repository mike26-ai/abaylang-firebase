
import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { ConditionalLayoutWrapper } from "@/components/layout/conditional-layout-wrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content={siteConfig.description} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="font-sans">
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
