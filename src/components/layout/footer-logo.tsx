"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

export function FooterLogo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)} style={{ border: '5px solid red' }}>
       <div className="flex items-center justify-center h-12 w-12 rounded-md bg-background">
        <svg
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-auto"
          aria-label="ABYLANG Logo Mark"
        >
            <g transform="scale(0.95)">
                <path
                    fill="hsl(var(--foreground))"
                    d="M42.4,95 L20,95 L44.2,4.8 C45.3,2.2 47.5,1 50,1 C52.5,1 54.7,2.2 55.8,4.8 L80,95 L57.6,95 L53.5,84.4 L46.5,84.4 L42.4,95 Z M50,17.5 L40.5,41 L59.5,41 L50,17.5 Z"
                ></path>
                <path
                    fill="hsl(var(--muted))" 
                    d="M50,12 L43,35 L57,35 L50,12 Z M49,45 L47,80 L53,80 L51,45 L49,45 Z"
                ></path>
                <path
                    fill="hsl(var(--primary))"
                    d="M23,70 C35,55 60,50 80,62 L77,80 C60,65 40,70 27,85 L23,70 Z"
                ></path>
            </g>
        </svg>
      </div>
       <span className="ml-3 text-xl font-bold text-background">ABYLANG</span>
    </Link>
  );
}
