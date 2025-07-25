
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
      <svg
        width="180"
        height="120"
        viewBox="0 0 600 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${siteConfig.name} Logo`}
        className="h-14 w-auto"
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
        
        {/* New logo provided by user */}
        <g class="abylang-logo-lines">
            {/* Salt shaker body + decorative holes */}
            <path d="..." />
            <circle cx="..." cy="..." r="..." />
            
            {/* Ge’ez letter — vectorized */}
            <path d="M123.4 56.7 C89.0 12.3 ..." />
        </g>
        <g class="abylang-logo-text">
            <text x="300" y="480">ABYLANG</text>
        </g>

      </svg>
    </Link>
  );
}
