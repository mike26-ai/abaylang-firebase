
"use client";

import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
  // The props below are kept for compatibility but are no longer used for the image logo.
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/branding/abylang-logo.png"
        alt={`${siteConfig.name} Logo`}
        width={120}
        height={35}
        priority 
        data-ai-hint="logo"
      />
    </Link>
  );
}
