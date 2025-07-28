
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import type React from "react";

export function FooterLogo() {
  return (
    <Link href="/" className="group inline-block">
      <div className="flex items-center justify-center gap-4 text-background">
        <svg
          width="180"
          height="120"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Footer Logo`}
          className="h-14 w-auto"
        >
          <title>{`${siteConfig.name} Footer Logo`}</title>
          <style>
            {`
              .abylang-logo-footer .abylang-logo-base,
              .abylang-logo-footer .abylang-logo-accent,
              .abylang-logo-footer .abylang-logo-text {
                fill: hsl(var(--background));
                stroke: hsl(var(--background));
              }
              .abylang-logo-footer .abylang-logo-text {
                font-family: var(--font-lora), serif;
                font-size: 80px;
                font-weight: 700;
                letter-spacing: 2px;
                text-anchor: middle;
              }
            `}
          </style>
          
          <g className="abylang-logo-footer">
            {/* Main 'A' shape and Ge'ez-like lines */}
            <g className="abylang-logo-base">
              <path d="M180,450 L256,60 L332,450 L296,450 L256,200 L216,450 Z" />
              <line x1="256" y1="200" x2="256" y2="320" strokeWidth="12" strokeLinecap="round" />
              <line x1="246" y1="240" x2="266" y2="240" strokeWidth="12" strokeLinecap="round" />
            </g>
            
            {/* River Accent */}
            <g className="abylang-logo-accent">
              <path d="M160,370 C200,330 300,330 352,370 C300,410 200,410 160,370 Z" />
            </g>

            {/* Text */}
            <g className="abylang-logo-text">
               <text x="256" y="500" textAnchor="middle">ABYLANG</text>
            </g>
          </g>
        </svg>
      </div>
    </Link>
  );
}
