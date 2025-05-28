"use client";

import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-sm",
    md: "w-8 h-8 text-lg",
    lg: "w-10 h-10 text-xl", // Adjusted lg icon text size slightly for balance
  };

  const textSizeClasses = {
    sm: "text-lg", // LissanHub main text size
    md: "text-xl",
    lg: "text-2xl", // Reduced from 3xl for better proportion with icon
  };

  const subTextSizeClasses = { // For "Learn Amharic..."
    sm: "text-xs",
    md: "text-xs", // Kept consistent for md and sm
    lg: "text-sm",
  }

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}> {/* Reduced gap from 3 to 2 */}
      <div
        className={`${sizeClasses[size]} bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold`}
        // Changed from rounded-xl to rounded-lg to match ShadCN default radius
        // Used bg-primary and text-primary-foreground to respect theme
        // Removed gradient for simplicity with theme variables, can be added back with more complex CSS if needed
      >
        ል
      </div>
      {showText && (
        <div>
          <span className={`${textSizeClasses[size]} font-bold text-foreground`}> {/* Changed text-gray-900 to text-foreground */}
            LissanHub
          </span>
          <p className={`${subTextSizeClasses[size]} text-primary font-medium`}> {/* Changed text-emerald-600 to text-primary */}
            Learn Amharic • Connect Culture
          </p>
        </div>
      )}
    </Link>
  );
}
