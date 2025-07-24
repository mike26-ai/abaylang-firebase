"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import type React from "react";

// A functional icon representing the core service of Abylang.
export function FooterLogo() {
  return (
    <Link href="/" className="group inline-block">
      <div className="flex items-center justify-center gap-4 text-background">
        {/* 
          Abylang Final Logo - Monogram (Footer Adaptation)
          Description: A clean vector recreation of the geometric 'A' monogram,
          styled to use theme colors for consistency across the site.
          The internal styles are adapted to use the footer's background color for contrast.
        */}
        <svg
          width="180"
          height="120"
          viewBox="0 0 600 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label={`${siteConfig.name} Footer Logo`}
          className="h-14 w-auto" // Control size here
        >
          <title>{`${siteConfig.name} Footer Logo`}</title>
          <style>
            {`
              .abylang-logo-lines-footer {
                stroke: hsl(var(--background)); /* Uses footer text color */
                stroke-width: 10;
                stroke-linecap: round;
                stroke-linejoin: round;
              }
              .abylang-logo-text-footer {
                fill: hsl(var(--background)); /* Uses footer text color */
                font-family: var(--font-lora), serif;
                font-size: 60px;
                font-weight: 700;
                letter-spacing: 12px;
                text-anchor: middle;
              }
            `}
          </style>

          {/* The Monogram Group */}
          <g className="abylang-logo-lines-footer">
            {/* Main 'A' Frame */}
            <polyline points="120,320 300,50 480,320" />
            {/* Horizontal Crossbar */}
            <line x1="150" y1="190" x2="450" y2="190" />
            {/* Inner Stele/Gateway Structure */}
            <line x1="300" y1="50" x2="300" y2="150" />
            <line x1="250" y1="190" x2="250" y2="320" />
            <line x1="300" y1="150" x2="300" y2="320" />
            <line x1="350" y1="190" x2="350" y2="320" />
            {/* Bottom Steps (Asymmetrical) */}
            <line x1="135" y1="285" x2="165" y2="285" />
            <line x1="125" y1="310" x2="155" y2="310" />
            <line x1="435" y1="285" x2="465" y2="285" />
            <line x1="445" y1="310" x2="475" y2="310" />
          </g>
          
          {/* The Wordmark */}
          <text className="abylang-logo-text-footer" x="300" y="420">ABYLANG</text>
        </svg>
      </div>
    </Link>
  );
}
