"use client";

import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site"; // Import siteConfig for metadata

// No static metadata export here due to "use client"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showGlobalNavAndFooter = pathname !== "/";

  // Dynamically set title based on path or use default
  useEffect(() => {
    // Basic dynamic title example - can be enhanced
    if (pathname === "/") {
      document.title = siteConfig.name;
    } else {
      // For other pages, page.tsx should define its metadata title
      // This is a fallback if metadata isn't set on a page
      const pageName = pathname.split('/').pop() || 'Page';
      const capitalizedPageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
      if (pageName && pageName !== 'app' && pageName !== 'LissanHub') { // Avoid generic names
         document.title = `${capitalizedPageName.replace(/-/g, ' ')} | ${siteConfig.name}`;
      } else {
         document.title = siteConfig.name;
      }
    }
  }, [pathname]);


  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        {/* Metadata elements that don't conflict with "use client" */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="description" content={siteConfig.description} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" /> {/* Example theme color from LissanHub manifest */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" /> {/* Example icon */}
        {/* Note: Individual pages should export their own 'metadata' object for title, etc. */}
      </head>
      <body className="font-sans">
        <FirebaseProvider>
          {showGlobalNavAndFooter && <Navbar />}
          <main className="flex-grow">
            {children}
          </main>
          {showGlobalNavAndFooter && <Footer />}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}

// To manage titles and other metadata effectively with "use client" in layout:
// 1. Remove static `export const metadata` from this layout.
// 2. Each `page.tsx` should export its own `metadata` object.
//    Example for src/app/login/page.tsx:
//    import type { Metadata } from 'next';
//    export const metadata: Metadata = { title: 'Login' };
//    This ensures Next.js handles metadata generation per page correctly.
// 3. The useEffect above is a client-side fallback for document.title, but Next.js's metadata API is preferred.

// This is a temporary solution for document.title.
// For proper SEO and server-rendered titles, each page.tsx needs to export its metadata.
import { useEffect } from 'react';
