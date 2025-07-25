
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
              fill: hsl(var(--foreground));
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
        
        {/* Reverted to simple 'A' logo */}
        <g>
            <g className="abylang-logo-lines">
                 {/* Stylized Letter 'A' */}
                 <path 
                    d="M336.5,125 C366.5,125 390,155 390,195 C390,255 355,295 310,315 C295,322 280,325 268,325 C240,325 210,305 210,270 C210,240 235,225 260,225 C280,225 295,235 300,250 M260,225 C255,200 240,170 215,160 M336.5,125 C336.5,95 320,80 300,80 C280,80 265,95 265,125" 
                    stroke="hsl(var(--foreground))" 
                    strokeWidth="40" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    fill="none"
                 />
            </g>
            <g className="abylang-logo-text">
                <text x="300" y="480">ABYLANG</text>
            </g>
        </g>
      </svg>
    </Link>
  );
}
