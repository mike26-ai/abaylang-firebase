"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// Custom SVG Logo component
function AbyLangIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="ABYLANG Logo"
    >
      <path
        d="M12 2L4 6V18L12 22L20 18V6L12 2Z"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 6L12 10L20 6"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 22V10"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Updated Logo component using the custom SVG.
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center space-x-2 text-foreground group", className)}
    >
      <AbyLangIcon className="h-6 w-6 text-primary group-hover:opacity-90 transition-colors" />
      <span className="font-bold text-lg">{siteConfig.name}</span>
    </Link>
  );
}
