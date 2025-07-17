
"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Don't show the main Navbar and Footer on the special homepage layout or admin pages.
  const showGlobalNavAndFooter = !pathname.startsWith('/admin') && pathname !== "/";


  // The admin layout provides its own structure, so we render it without the standard wrapper
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // The homepage has its own custom header and footer within its component
  if (pathname === '/') {
    return <>{children}</>;
  }
  
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
