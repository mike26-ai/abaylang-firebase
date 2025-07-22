
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

// A functional icon representing the core service of Abylang: language dialogue.
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex flex-col items-center group", className)}>
        <div className="flex items-center gap-2">
         <svg
            className="w-auto h-12" // Adjusted height for navbar
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`${siteConfig.name} Icon`}
        >
            <title>{siteConfig.name} Logo Icon</title>
            {/* Main speech bubble shape */}
            <path
                d="M10 10 H90 V70 H30 L10 90 V70 H10 V10 Z"
                fill="hsl(var(--foreground))"
                stroke="hsl(var(--foreground))"
                strokeWidth="4"
                strokeLinejoin="round"
            />

            {/* Amharic Letter 'ሀ' (Ha) in negative space */}
            <path
                d="M58 25 C50 25 45 35 45 45 L45 60 M45 40 H70"
                stroke="hsl(var(--background))"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <span className="text-xl font-bold text-primary group-hover:opacity-90 transition-opacity">
            {siteConfig.name}
        </span>
      </div>
    </Link>
  );
}
