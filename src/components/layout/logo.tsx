"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { BookOpenText } from "lucide-react";

interface LogoProps {
  className?: string;
}

// A simple text-based logo as a placeholder.
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center space-x-2 text-foreground group", className)}>
      <BookOpenText className="h-6 w-6 text-primary group-hover:text-primary/90 transition-colors" />
      <span className="font-bold text-lg">{siteConfig.name}</span>
    </Link>
  );
}
