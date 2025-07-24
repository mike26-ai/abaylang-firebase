
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import type React from "react";

// A functional icon representing the core service of Abylang.
export function FooterLogo() {
  return (
    <Link href="/" className="group inline-block">
      <div className="flex items-center justify-center gap-4 text-background">
        <span className="text-xl font-semibold tracking-wider uppercase">
          LANG
        </span>
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Tree Logo`}
        >
          <title>{`${siteConfig.name} Footer Logo`}</title>
          <style>
            {`
              .tree-path { 
                stroke: hsl(var(--background)); 
                stroke-width: 2.5;
                fill: none;
              }
              .tree-leaves {
                fill: hsl(var(--background));
              }
            `}
          </style>
          {/* Outer Circle */}
          <circle cx="50" cy="50" r="48" className="tree-path" />

          {/* Simplified Tree Structure */}
          {/* Trunk */}
          <path d="M 50 85 V 50" className="tree-path" strokeWidth="4" />
          
          {/* Roots */}
          <path d="M 50 85 C 40 95, 30 95, 20 85" className="tree-path" />
          <path d="M 50 85 C 60 95, 70 95, 80 85" className="tree-path" />
          <path d="M 50 85 C 45 90, 40 90, 30 80" className="tree-path" />
          <path d="M 50 85 C 55 90, 60 90, 70 80" className="tree-path" />

          {/* Branches */}
          <path d="M 50 50 C 40 40, 30 40, 25 25" className="tree-path" />
          <path d="M 50 50 C 60 40, 70 40, 75 25" className="tree-path" />
          <path d="M 50 50 C 45 45, 40 45, 35 20" className="tree-path" />
          <path d="M 50 50 C 55 45, 60 45, 65 20" className="tree-path" />
          <path d="M 50 50 C 50 35, 60 30, 70 20" className="tree-path" />
          <path d="M 50 50 C 50 35, 40 30, 30 20" className="tree-path" />
          
          {/* Simplified Leaves as Circles */}
          <g className="tree-leaves">
            <circle cx="25" cy="25" r="3" />
            <circle cx="75" cy="25" r="3" />
            <circle cx="35" cy="20" r="3" />
            <circle cx="65" cy="20" r="3" />
            <circle cx="70" cy="20" r="3" />
            <circle cx="30" cy="20" r="3" />
            <circle cx="50" cy="15" r="3" />
            <circle cx="40" cy="30" r="3" />
            <circle cx="60" cy="30" r="3" />
          </g>
        </svg>

        <span className="text-xl font-semibold tracking-wider uppercase">
          ABY
        </span>
      </div>
    </Link>
  );
}

    