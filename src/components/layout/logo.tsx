
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { BookOpenText } from "lucide-react"; // Using a standard, reliable icon for diagnostics
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  // Logic to show the "ABYLANG" text only for the footer logo
  const showText = className?.includes("footer-logo");

  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      {/* 
        Diagnostic Step: Using a standard Lucide icon instead of a custom SVG.
        This helps determine if the issue is with the SVG data or the component's structure and styling.
      */}
      <BookOpenText className="logo-svg" />

      {showText && (
        <span className="logo-text text-xl font-semibold">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
