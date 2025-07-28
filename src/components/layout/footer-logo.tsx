
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
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Footer Logo`}
          className="h-14 w-auto"
        >
          <title>{`${siteConfig.name} Footer Logo`}</title>
          <style>
            {`
              .abylang-logo-footer .abylang-logo-base,
              .abylang-logo-footer .abylang-logo-accent {
                fill: hsl(var(--background));
              }
              .abylang-logo-footer .abylang-logo-text {
                fill: hsl(var(--background));
                font-family: var(--font-lora), serif;
                font-size: 80px;
                font-weight: 700;
                letter-spacing: 2px;
                text-anchor: middle;
              }
            `}
          </style>
          
          <g className="abylang-logo-footer">
            {/* Main 'A' shape and text */}
            <g className="abylang-logo-base">
                <path d="M300 24L100 400H150L190 280H410L450 400H500L300 24ZM210 240L300 80L390 240H210Z" />
                <path d="M280 44.5L270 24H330L320 44.5C315 54.5 300 60 300 60C300 60 285 54.5 280 44.5Z" />
                <g className="abylang-logo-text">
                  <text x="300" y="485">ABYLANG</text>
                </g>
            </g>

            {/* River Accent */}
            <g className="abylang-logo-accent">
                <path d="M410.799 240H210C240.399 265.5 242.399 297 274.799 320C307.199 343 361.2 327.5 385.2 301C409.2 274.5 410.799 240 410.799 240Z"/>
            </g>
          </g>
        </svg>
      </div>
    </Link>
  );
}
