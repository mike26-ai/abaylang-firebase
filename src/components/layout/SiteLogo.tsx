// THIS IS THE OFFICIAL, CENTRALIZED LOGO COMPONENT FOR THE ENTIRE SITE.

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";
import Image from "next/image";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className }: SiteLogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
      <Image
        src="/logo.svg"
        alt="ABYLANG Logo"
        width={160}
        height={45}
        priority // Ensures the logo loads quickly as it's a critical LCP element.
        className="h-10 w-auto" // Responsive scaling while maintaining aspect ratio.
      />
    </Link>
  );
}
