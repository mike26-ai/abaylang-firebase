
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <svg
        className="h-7 w-auto"
        viewBox="0 0 180 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${siteConfig.name} logo`}
      >
        <text
          x="0"
          y="24"
          fontFamily="'Lora', serif"
          fontSize="26"
          fontWeight="bold"
          fill="hsl(var(--primary))"
        >
          ABYLANG
        </text>
      </svg>
    </Link>
  );
}
