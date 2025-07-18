"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

// Updated Logo component using the custom SVG.
export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("flex items-center space-x-2 text-foreground group", className)}
    >
      <Image 
        src="/logo.png" 
        alt={`${siteConfig.name} logo`} 
        width={120} 
        height={30} 
        className="h-auto"
        priority
      />
    </Link>
  );
}
