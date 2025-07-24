
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
      <div className="flex items-center gap-3">
        {/* 
          Abylang Final Logo
          Version: 1.0
          Description: A minimalist, elegant, and trustworthy logo featuring a stylized 
          Axumite stele with the Amharic letter 'አ' (Aleph) cut out.
          This SVG has been adapted to use theme variables for color.
        */}
        <svg
          width="40"
          height="56"
          viewBox="0 0 150 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Logo Icon`}
          className="h-10 w-auto" // Control size here
        >
          <title>{`${siteConfig.name} Logo`}</title>
          {/* Style Definitions: Colors use theme variables now */}
          <style>
            {`
              .abylang-pillar { fill: hsl(var(--foreground)); }
            `}
          </style>

          {/* The Stele Icon Graphic */}
          <g transform="scale(0.75) translate(0, 10)">
            <path
              className="abylang-pillar"
              fillRule="evenodd"
              clipRule="evenodd"
              d="
                 M 10 340 L 140 340 L 140 100 
                 C 140 100 140 75 125 60 
                 L 125 55 
                 C 125 55 115 45 110 45 
                 L 110 30 
                 C 110 10 95 0 75 0 
                 C 55 0 40 10 40 30 
                 L 40 45 
                 C 35 45 25 55 25 55 
                 L 25 60 
                 C 10 75 10 100 10 100 
                 L 10 340 Z 
                 M 65 205 
                 C 65 205 45 205 45 180 
                 C 45 155 60 155 70 155 
                 L 70 140 80 140 80 175 105 175 105 185 80 185 80 205 
                 L 65 205 Z
                 M 75 15 
                 A 5 5 0 1 1 75 25 
                 A 5 5 0 1 1 75 15 Z
                 M 60 30 
                 A 4 4 0 1 1 60 38 
                 A 4 4 0 1 1 60 30 Z
                 M 90 30 
                 A 4 4 0 1 1 90 38 
                 A 4 4 0 1 1 90 30 Z
                 M 75 42 
                 A 3 3 0 1 1 75 48 
                 A 3 3 0 1 1 75 42 Z
                 "
            />
          </g>
        </svg>

        <span
          className="text-xl font-bold tracking-wider text-primary group-hover:opacity-90 transition-opacity"
          style={{ fontFamily: 'var(--font-lato)' }}
        >
          {siteConfig.name}
        </span>
      </div>
    </Link>
  );
}
