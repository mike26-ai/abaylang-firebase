
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
          Abylang Final Logo - Horizontal Lockup
          Version: 2.0
          Description: A minimalist logo featuring a stylized Axumite stele with a 
          cross-like letter 'ተ' (Teh) cutout.
          Adapted for React component with theme colors.
        */}
        <svg
          width="40"
          height="56"
          viewBox="0 0 75 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Logo Icon`}
          className="h-10 w-auto" // Control size here
        >
          <title>{`${siteConfig.name} Logo`}</title>
          <style>
            {`
              .abylang-icon { fill: hsl(var(--foreground)); }
            `}
          </style>

          <path
            className="abylang-icon"
            fillRule="evenodd"
            clipRule="evenodd"
            d="
               M 10 100 L 65 100 L 65 35 
               C 65 35 65 25 57.5 20 
               L 57.5 18 
               C 57.5 18 52.5 15 50 15 
               L 50 10 
               C 50 0 42.5 0 37.5 0 
               C 32.5 0 25 0 25 10 
               L 25 15 
               C 22.5 15 17.5 18 17.5 18 
               L 17.5 20 
               C 10 25 10 35 10 35 
               L 10 100 Z 

               M 37.5 4 
               A 2.5 2.5 0 1 1 37.5 9 
               A 2.5 2.5 0 1 1 37.5 4 Z

               M 30 10 
               A 2 2 0 1 1 30 14 
               A 2 2 0 1 1 30 10 Z

               M 45 10 
               A 2 2 0 1 1 45 14 
               A 2 2 0 1 1 45 10 Z
               
               M 37.5 14 
               A 1.5 1.5 0 1 1 37.5 17 
               A 1.5 1.5 0 1 1 37.5 14 Z

               M 28 60 
               L 47 60 L 47 64 L 40 64 L 40 72 L 35 72 L 35 64 L 28 64 Z
               "
          />
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
