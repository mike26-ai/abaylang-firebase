
import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FirebaseProvider } from "@/components/providers/firebase-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // icons: { // You can add favicon here if you have one
  //   icon: "/favicon.ico", 
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased min-h-screen flex flex-col`}>
        <FirebaseProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <Toaster />
        </FirebaseProvider>
      </body>
    </html>
  );
}
