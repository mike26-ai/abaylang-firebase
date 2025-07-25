
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
              .abylang-logo-footer .abylang-logo-lines,
              .abylang-logo-footer .abylang-logo-text {
                stroke: hsl(var(--background)); /* Uses footer text color for stroke */
                fill: hsl(var(--background));   /* Uses footer text color for fill */
              }
              .abylang-logo-footer .abylang-logo-lines {
                stroke-width: 10;
                stroke-linecap: round;
                stroke-linejoin: round;
                fill: none; /* Lines should not be filled */
              }
              .abylang-logo-footer .abylang-logo-text {
                font-family: var(--font-lora), serif;
                font-size: 60px;
                font-weight: 700;
                letter-spacing: 12px;
                text-anchor: middle;
                stroke: none; /* Text should not be stroked */
              }
            `}
          </style>
          
          <g className="abylang-logo-footer">
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
          </g>

        </svg>
      </div>
    </Link>
  );
}
