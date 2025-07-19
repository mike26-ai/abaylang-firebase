"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// Recreated the logo as a custom SVG based on the provided image.
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center space-x-2 text-foreground group", className)}
    >
      <div className="w-auto h-10"> {/* Container to control size */}
        <svg
          viewBox="0 0 110 250"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label={`${siteConfig.name} logo`}
        >
          {/* Main Stele/Obelisk Shape */}
          <path
            d="M55 0C85.3757 0 110 24.6243 110 55V60C110 62.7614 107.761 65 105 65H90C84.4772 65 80 69.4772 80 75V240H30V75C30 69.4772 25.5228 65 20 65H5C2.23858 65 0 62.7614 0 60V55C0 24.6243 24.6243 0 55 0Z"
            fill="#36454F" // Matches --foreground color
          />

          {/* Perforations at the top */}
          <circle cx="55" cy="35" r="5" fill="#FDF6E3" />
          <circle cx="35" cy="45" r="4" fill="#FDF6E3" />
          <circle cx="75" cy="45" r="4" fill="#FDF6E3" />
          <circle cx="55" cy="55" r="3" fill="#FDF6E3" />
          
          {/* Ge'ez Script Character 'ሀ' (hä) */}
          <path
            d="M42 120C42 114.477 46.4772 110 52 110H68C73.5228 110 78 114.477 78 120V150C78 152.761 75.7614 155 73 155H65C62.2386 155 60 157.239 60 160V180H50V160C50 157.239 47.7614 155 45 155H37C34.2386 155 32 152.761 32 150V130C32 124.477 36.4772 120 42 120Z"
            fill="#FDF6E3" // Matches --background color for contrast
          />

          {/* ABYLANG Text */}
          <text
            x="55"
            y="280"
            fontFamily="Lora, serif"
            fontSize="30"
            fill="#CC7722" // Matches --primary color
            textAnchor="middle"
          >
            ABYLANG
          </text>
        </svg>
      </div>
    </Link>
  );
}