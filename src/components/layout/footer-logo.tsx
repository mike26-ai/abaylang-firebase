"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

export function FooterLogo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
      {/* This is the adapted SVG for the footer, with inverted colors for dark background */}
       <svg
        viewBox="0 0 140 140"
        className={cn("h-12 w-auto", className)}
        aria-label="Abylang Logo"
      >
        <defs>
          <clipPath id="footerRiverClip">
            <path d="M65,0 L35,115 H55 L85,0 H65 Z" />
          </clipPath>
        </defs>
        
        {/* Main 'A' shape - Light color for dark background */}
        <path
          d="M70,5 L10,115 H30 L50,60 H90 L110,115 H130 L70,5 Z"
          fill="#FDF6E3" // Parchment White
        />
        
        {/* River Shape (Blue Nile) */}
        <g clipPath="url(#footerRiverClip)">
          <path
            d="M-10,50 Q20,80 50,80 T110,70 L110,90 Q80,100 50,100 T-10,70 Z"
            fill="#63B3ED" // Lighter blue for better visibility
          />
        </g>
        
        {/* The word "ABYLANG" */}
        <text
          x="70"
          y="135"
          fontFamily="sans-serif"
          fontSize="18"
          fontWeight="bold"
          fill="#E9A23B" // Brighter amber color
          textAnchor="middle"
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
