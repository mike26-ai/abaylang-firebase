
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
      {/* Per user instruction, this is the exact SVG for the logo */}
      <svg
        viewBox="0 0 180 50"
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-auto" // Preserves aspect ratio with fixed height
        aria-label="ABYLANG Logo"
      >
        <g id="logo-mark" transform="translate(15, 0) scale(0.45)">
          <path
            fill="#1A374D"
            d="M42.4,95 L20,95 L44.2,4.8 C45.3,2.2 47.5,1 50,1 C52.5,1 54.7,2.2 55.8,4.8 L80,95 L57.6,95 L53.5,84.4 L46.5,84.4 L42.4,95 Z M50,17.5 L40.5,41 L59.5,41 L50,17.5 Z"
          ></path>
          <path
            fill="#2E4A62"
            d="M50,12 L43,35 L57,35 L50,12 Z M49,45 L47,80 L53,80 L51,45 L49,45 Z"
          ></path>
          <path
            fill="#1D6BAE"
            d="M23,70 C35,55 60,50 80,62 L77,80 C60,65 40,70 27,85 L23,70 Z"
          ></path>
        </g>
        <text
          x="112"
          y="32"
          fontFamily="sans-serif"
          fontSize="20"
          fontWeight="bold"
          fill="#1A374D"
          textAnchor="middle"
          letterSpacing="1"
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
