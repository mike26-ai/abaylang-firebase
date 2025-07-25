
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
              <g className="abylang-logo-lines">
                  {/* Original Placeholder Graphic */}
                  <path d="M150 380 L300 100 L450 380" />
                  <line x1="225" y1="240" x2="375" y2="240" />
              </g>
              <g className="abylang-logo-text">
                  <text x="300" y="480">ABYLANG</text>
              </g>
          </g>

        </svg>
      </div>
    </Link>
  );
}
