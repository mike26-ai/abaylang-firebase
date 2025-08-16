// THIS IS THE CODE FOR THE OFFICIAL HIGH-QUALITY SVG LOGO

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center group", className)} style={{ border: '5px solid red' }}>
      <Image
        src="/logo.svg"
        alt="ABYLANG Logo"
        width={160}
        height={45}
        priority
        className="h-10 w-auto" // Ensures responsive scaling while maintaining aspect ratio
      />
    </Link>
  );
}
