
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

// Replaced with the user-provided custom SVG logo component.
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex flex-col items-center group", className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 400 600"
        fill="none"
        className="w-auto h-16" // Adjusted height for better balance in the navbar
        aria-label={`${siteConfig.name} Logo`}
      >
        <title>ABYLANG Logo</title>
        {/* Pillar / Salt Shaker Shape */}
        <path
          d="M140 0 C140 0, 260 0, 260 0 C295 0, 310 20, 310 60 L310 500 C310 540, 290 560, 250 560 L150 560 C110 560, 90 540, 90 500 L90 60 C90 20, 105 0, 140 0 Z"
          fill="hsl(var(--foreground))"
        />

        {/* Ge'ez Letter ግ Stylized Path */}
        <path
          d="M190 180 C190 170, 200 160, 210 160 C220 160, 230 170, 230 180 L230 210 C230 220, 225 230, 215 230 L210 230 L210 300 C210 310, 220 320, 230 320 L250 320 C260 320, 270 330, 270 340 C270 350, 260 360, 250 360 L220 360 C190 360, 180 340, 180 320 L180 200 C180 190, 185 180, 190 180 Z"
          fill="hsl(var(--background))"
        />

        {/* Holes on Top */}
        <circle cx="200" cy="40" r="7" fill="hsl(var(--background))" />
        <circle cx="180" cy="55" r="5" fill="hsl(var(--background))" />
        <circle cx="220" cy="55" r="5" fill="hsl(var(--background))" />
        <circle cx="190" cy="75" r="4.5" fill="hsl(var(--background))" />
        <circle cx="210" cy="75" r="4.5" fill="hsl(var(--background))" />

        {/* Brand Text */}
        <text
          x="200"
          y="590"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="36"
          fill="hsl(var(--primary))"
          className="group-hover:opacity-90 transition-opacity"
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
