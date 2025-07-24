"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

// A functional icon representing the core service of Abylang.
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
        <div className="flex items-center gap-3">
         <svg
            className="w-auto h-12"
            viewBox="0 0 100 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`${siteConfig.name} Logo`}
          >
            <title>{`${siteConfig.name} Logo`}</title>
            {/* Main Icon */}
            <g stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                {/* Outer Triangle */}
                <path d="M50 2 L98 78 L2 78 Z" />
                {/* Inner 'A' shape */}
                <path d="M50 2 L20 78" />
                <path d="M50 2 L80 78" />
                <path d="M25 50 L75 50" />
                {/* Central Pillars */}
                <path d="M42 50 L42 78" />
                <path d="M50 50 L50 78" />
                <path d="M58 50 L58 78" />
                {/* Side details */}
                <path d="M22 60 L32 60" />
                <path d="M21 66 L31 66" />
                <path d="M20 72 L30 72" />
                <path d="M78 60 L68 60" />
                <path d="M79 66 L69 66" />
                <path d="M80 72 L70 72" />
            </g>
        </svg>

        <span className="text-xl font-bold tracking-wider text-primary group-hover:opacity-90 transition-opacity" style={{ fontFamily: 'var(--font-lato)' }}>
            {siteConfig.name}
        </span>
      </div>
    </Link>
  );
}
