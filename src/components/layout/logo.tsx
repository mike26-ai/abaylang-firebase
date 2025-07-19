
"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// A more faithful SVG recreation of the provided logo image.
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "flex flex-col items-center text-foreground group",
        className
      )}
    >
      <div className="w-auto h-12">
        {" "}
        {/* Adjusted height for better proportion */}
        <svg
          viewBox="0 0 100 150" // Adjusted viewBox for a more vertical obelisk
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
          aria-label={`${siteConfig.name} logo`}
        >
          {/* Main Obelisk/Stele Shape */}
          <path
            d="M35 135V15C35 10 40 5 50 5C60 5 65 10 65 15V135H35Z"
            className="fill-foreground"
          />
          {/* Rounded Top of the Obelisk */}
          <path
            d="M35 15C35 25 40 30 50 30C60 30 65 25 65 15C65 5 60 0 50 0C40 0 35 5 35 15Z"
            className="fill-foreground"
          />
          {/* Ge'ez Script Character 'ሀ' (hä) - white on the obelisk */}
          <path
            d="M45 70C45 67.2386 47.2386 65 50 65H58C60.7614 65 63 67.2386 63 70V80C63 81.1046 62.1046 82 61 82H57C55.8954 82 55 82.8954 55 84V90H53V84C53 82.8954 52.1046 82 51 82H47C45.8954 82 45 81.1046 45 80V70Z"
            className="fill-background"
          />
          {/* Decorative lines */}
          <rect x="42" y="40" width="16" height="3" rx="1.5" className="fill-background" />
          <rect x="42" y="50" width="16" height="3" rx="1.5" className="fill-background" />
          <rect x="42" y="100" width="16" height="3" rx="1.5" className="fill-background" />
          <rect x="42" y="110" width="16" height="3" rx="1.5" className="fill-background" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tighter text-primary group-hover:text-primary/90 -mt-2">
        {siteConfig.name}
      </span>
    </Link>
  );
}
