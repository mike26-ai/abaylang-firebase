
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
  const showGlobalNavAndFooter = pathname !== "/";

  return (
    <>
      {showGlobalNavAndFooter && <Navbar />}
      <main className="flex-grow">
        {children}
      </main>
      {showGlobalNavAndFooter && <Footer />}
    </>
  );
}
