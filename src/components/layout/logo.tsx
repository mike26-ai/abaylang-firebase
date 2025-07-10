
"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
}

// This component now contains the corrected SVG code and logic 
// to display the full logo in the footer and a compact version elsewhere.
export function Logo({ className = "" }: LogoProps) {
  const showText = className?.includes("footer-logo");

  return (
    <Link href="/" className={cn("group flex items-center gap-2", className)}>
      {/* 
        This is the corrected SVG code for the logo.
        It uses `currentColor` for the fill, allowing CSS to control its color.
        The `viewBox` and path data are preserved exactly as you provided.
      */}
      <svg
        className="logo-svg"
        viewBox="0 15 150 250"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ABYLANG Logo"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          fillRule="evenodd"
          fill="currentColor"
          d="M 35,265 L 115,265 L 115,80 C 125,75 125,60 115,55 L 115,30 A 40,40 0 0 0 35,30 L 35,55 C 25,60 25,75 35,80 L 35,265 Z M 71,36 a 3.5,3.5 0 1 1 -7,0 a 3.5,3.5 0 1 1 7,0 Z M 86,36 a 3.5,3.5 0 1 1 -7,0 a 3.5,3.5 0 1 1 7,0 Z M 75,48 a 4,4 0 1 1 -8,0 a 4,4 0 1 1 8,0 Z M 62,48 a 4,4 0 1 1 -8,0 a 4,4 0 1 1 8,0 Z M 91,180 Q 75,180 75,160 Q 75,140 91,140 L 108,140 C 100,130 105,118 114,118 C 123,118 128,130 120,140 L 91,140 Z M 108,150 L 108,170 L 91,170 Q 82,170 82,160 Q 82,150 91,150 L 108,150 Z"
        />
      </svg>
      {showText && (
        <span className="logo-text text-xl font-semibold">
          {siteConfig.name}
        </span>
      )}
    </Link>
  );
}
