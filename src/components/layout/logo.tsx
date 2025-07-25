
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

// A functional icon representing the core service of Abylang.
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
      {/* 
        Abylang Final Logo - Monogram
        Version: 3.1 (Adapted for Web)
        Description: A clean vector recreation of the geometric 'A' monogram,
        styled to use theme colors for consistency across the site.
      */}
      <svg
        width="180"
        height="120"
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${siteConfig.name} Logo`}
        className="h-14 w-auto" // Control size here
      >
        <title>{`${siteConfig.name} Logo`}</title>
        <style>
          {`
            .abylang-logo-lines {
              stroke: hsl(var(--foreground));
              stroke-width: 10;
              stroke-linecap: round;
              stroke-linejoin: round;
            }
            .abylang-logo-text {
              fill: hsl(var(--primary));
              font-family: var(--font-lora), serif;
              font-size: 60px;
              font-weight: 700;
              letter-spacing: 12px;
              text-anchor: middle;
            }
          `}
        </style>

        {/* The Monogram Group - THIS PART WILL BE REPLACED */}
        <g className="abylang-logo-lines">
          {/* Main 'A' Frame */}
          <polyline points="120,320 300,50 480,320" />
          {/* Horizontal Crossbar */}
          <line x1="150" y1="190" x2="450" y2="190" />
          {/* Inner Stele/Gateway Structure */}
          <line x1="300" y1="50" x2="300" y2="150" />
          <line x1="250" y1="190" x2="250" y2="320" />
          <line x1="300" y1="150" x2="300" y2="320" />
          <line x1="350" y1="190" x2="350" y2="320" />
          {/* Bottom Steps (Asymmetrical) */}
          <line x1="135" y1="285" x2="165" y2="285" />
          <line x1="125" y1="310" x2="155" y2="310" />
          <line x1="435" y1="285" x2="465" y2="285" />
          <line x1="445" y1="310" x2="475" y2="310" />
        </g>
        
        {/* The Wordmark Group - THIS PART WILL BE REPLACED */}
        <g className="abylang-logo-text">
            <text x="300" y="420">ABYLANG</text>
        </g>
      </svg>
    </Link>
  );
}
