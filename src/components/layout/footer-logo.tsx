
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
                fill: hsl(var(--background));
              }
              .abylang-logo-footer .abylang-logo-text {
                font-family: var(--font-lora), serif;
                font-size: 60px;
                font-weight: 700;
                letter-spacing: 12px;
                text-anchor: middle;
              }
            `}
          </style>
          
          <g className="abylang-logo-footer">
              <g className="abylang-logo-lines">
                  {/* The main stele/shaker shape with the Ge'ez letter 'አ' cut out */}
                  <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M363.824 100C363.824 74.3411 343.483 54 317.824 54H282.176C256.517 54 236.176 74.3411 236.176 100V105.795C220.933 111.411 210 126.342 210 143.511V380H390V143.511C390 126.342 379.067 111.411 363.824 105.795V100ZM290.824 84C286.301 84 282.647 87.6543 282.647 92.1765C282.647 96.6986 286.301 100.353 290.824 100.353C295.346 100.353 299 96.6986 299 92.1765C299 87.6543 295.346 84 290.824 84ZM317.5 75.8235C313.09 75.8235 309.5 79.4135 309.5 84C309.5 88.5865 313.09 92.1765 317.5 92.1765C321.91 92.1765 325.5 88.5865 325.5 84C325.5 79.4135 321.91 75.8235 317.5 75.8235ZM344.176 84C339.654 84 336 87.6543 336 92.1765C336 96.6986 339.654 100.353 344.176 100.353C348.699 100.353 352.353 96.6986 352.353 92.1765C352.353 87.6543 348.699 84 344.176 84ZM300 112.176C295.478 112.176 291.824 115.831 291.824 120.353C291.824 124.875 295.478 128.529 300 128.529C304.522 128.529 308.176 124.875 308.176 120.353C308.176 115.831 304.522 112.176 300 112.176Z" 
                  />
                  {/* Since this is the footer, the cutout should match the background (which is the foreground color of the site) */}
                  {/* However, since the whole logo is one color here, we just use a single path. The cutout is achieved via the SVG fill-rule. */}
                  <path 
                      fillRule="evenodd" 
                      clipRule="evenodd" 
                      d="M265.503 277.824C261.216 277.824 258.45 273.535 259.51 269.539L268.494 235.331C269.452 231.691 272.934 229 276.711 229H282.956C289.055 229 294 233.945 294 240.044V296.863C294 301.91 290.003 306 284.956 306H278.43C277.818 306 277.29 305.973 276.786 305.922C278.539 301.052 279.5 295.842 279.5 290.412C279.5 285.456 278.291 280.79 276.223 276.733C274.527 273.342 271.696 270.73 268.271 269.589L265.503 277.824ZM307.962 306C312.919 306 317 301.996 317 297.038V241.044C317 234.391 311.609 229 305.044 229H298.5V306H307.962Z"
                      fill="hsl(var(--foreground))"
                  />
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
