
"use client"; // Required for usePathname

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Toaster } from "@/components/ui/toaster";
// siteConfig can still be used by individual pages if they import it for their metadata
// import { siteConfig } from "@/config/site"; 
import { usePathname } from "next/navigation"; // Import usePathname

// Metadata cannot be exported from a Client Component.
// Individual pages (page.tsx) should define their own metadata.
// export const metadata: Metadata = {
//   title: {
//     default: siteConfig.name,
//     template: `%s | ${siteConfig.name}`,
//   },
//   description: siteConfig.description,
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col`}>
        <FirebaseProvider>
          {!isHomePage && <Navbar />} {/* Conditionally render Navbar */}
          <main className="flex-grow">{children}</main>
          {!isHomePage && <Footer />} {/* Conditionally render Footer */}
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
