
"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";

// THIS COMPONENT IS NO LONGER USED.
// The logic has been moved directly into Navbar and Footer components
// to simplify the root layout and potentially fix the ChunkLoadError.
// It is kept in the project to avoid breaking imports but can be deleted later.

export function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Don't show main nav/footer on admin, profile, or special homepage layout.
  const showGlobalNavAndFooter = !pathname.startsWith('/admin') && !pathname.startsWith('/profile') && pathname !== "/";


  // The admin and profile layouts provide their own structure.
  if (pathname.startsWith('/admin') || pathname.startsWith('/profile')) {
    return <>{children}</>;
  }

  // The homepage has its own custom header and footer within its component
  if (pathname === '/') {
    return <>{children}</>;
  }
  
  // Render the standard layout for all other public pages.
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}
