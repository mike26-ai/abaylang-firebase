// COPY AND PASTE THIS ENTIRE CODE BLOCK INTO YOUR `logo.tsx` FILE

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
      {/* This is the new SVG code for the obelisk logo */}
      <svg
        viewBox="0 0 100 130" // Defines the canvas for the SVG
        className="h-10 w-auto" // Control the display size with Tailwind CSS
        aria-label="Abylang Logo"
      >
        {/* Obelisk Shape with Cutouts */}
        <path
          fillRule="evenodd" // This rule allows the inner paths to become "cutouts"
          clipRule="evenodd"
          fill="#2D3748" // The main dark teal/grey color of the obelisk
          d="M38.5,5.1 C39.5,2.3 42.5,0 45.6,0 L54.4,0 C57.5,0 60.5,2.3 61.5,5.1 L75,45 L75,115 L25,115 L25,45 L38.5,5.1 Z M45,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M55,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M45,30 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M55,30 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0 Z M43,85 C43,93 49,97 53,97 C57,97 60,94 60,91 C60,88 56,86 53,86 L53,73 C58,73 63,70 63,65 C63,60 58,58 53,58 C48,58 43,60 43,65 C43,70 48,73 53,73 L53,83 C51,83 46,83 46,85 L43,85 Z"
        />

        {/* The word "ABYLANG" below the obelisk */}
        <text
          x="50" // Center the text horizontally
          y="128" // Position the text below the obelisk
          fontFamily="sans-serif"
          fontSize="14"
          fontWeight="bold"
          fill="#D97706" // The orange/amber color for the text
          textAnchor="middle" // This ensures the text is perfectly centered
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
