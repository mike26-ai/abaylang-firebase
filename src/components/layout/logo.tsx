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
      {/* This is the new, confirmed SVG code for the "A" river logo */}
      <svg
        viewBox="0 0 140 140"
        className={cn("h-12 w-auto", className)}
        aria-label="Abylang Logo"
      >
        <defs>
          <clipPath id="riverClip">
            <path d="M65,0 L35,115 H55 L85,0 H65 Z" />
          </clipPath>
        </defs>
        
        {/* Main 'A' shape */}
        <path
          d="M70,5 L10,115 H30 L50,60 H90 L110,115 H130 L70,5 Z"
          fill="#2D3748"
        />
        
        {/* River Shape (Blue Nile) */}
        <g clipPath="url(#riverClip)">
          <path
            d="M-10,50 Q20,80 50,80 T110,70 L110,90 Q80,100 50,100 T-10,70 Z"
            fill="#4299E1"
          />
        </g>
        
        {/* The word "ABYLANG" */}
        <text
          x="70"
          y="135"
          fontFamily="sans-serif"
          fontSize="18"
          fontWeight="bold"
          fill="#D97706"
          textAnchor="middle"
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
