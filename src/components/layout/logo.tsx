
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
        {/* ABYLANG Logo SVG */}
        <svg
            width="120" 
            height="auto" 
            viewBox="0 0 150 300" 
            version="1.1" 
            xmlns="http://www.w3.org/2000/svg" 
            role="img" 
            aria-labelledby="abylang-logo-title"
            className="h-12 w-auto" // Control size with Tailwind for consistency
        >
        <title id="abylang-logo-title">ABYLANG Logo</title>
        
        <g id="Abylang-Logo">
            {/* Main Stele Shape */}
            <path 
            fillRule="evenodd" 
            fill="#2E3A40" // Using color from SVG design
            d="
                M 35,265 L 115,265 L 115,80 C 125,75 125,60 115,55 L 115,30 A 40,40 0 0 0 35,30 L 35,55 C 25,60 25,75 35,80 L 35,265 Z
                M 71,36 a 3.5,3.5 0 1 1 -7,0 a 3.5,3.5 0 1 1 7,0 Z
                M 86,36 a 3.5,3.5 0 1 1 -7,0 a 3.5,3.5 0 1 1 7,0 Z
                M 75,48 a 4,4 0 1 1 -8,0 a 4,4 0 1 1 8,0 Z
                M 62,48 a 4,4 0 1 1 -8,0 a 4,4 0 1 1 8,0 Z
                M 91,180 Q 75,180 75,160 Q 75,140 91,140 L 108,140 C 100,130 105,118 114,118 C 123,118 128,130 120,140 L 91,140 Z M 108,150 L 108,170 L 91,170 Q 82,170 82,160 Q 82,150 91,150 L 108,150 Z
            "
            />

            {/* Text "ABYLANG" */}
            <text x="75" y="285" fill="#C87546" fontFamily="Georgia, 'Times New Roman', serif" fontSize="18" fontWeight="normal" letterSpacing="1" textAnchor="middle">
            ABYLANG
            </text>
        </g>
        </svg>
    </Link>
  );
}
