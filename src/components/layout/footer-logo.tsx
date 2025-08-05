"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";

interface LogoProps {
  className?: string;
}

export function FooterLogo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)}>
       <div className="flex items-center justify-center h-12 w-12 bg-background rounded-md">
        <span className="text-2xl font-bold text-foreground">AB</span>
      </div>
       <span className="ml-3 text-xl font-bold text-background">ABYLANG</span>
    </Link>
  );
}
