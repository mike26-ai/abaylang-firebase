// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';

/**
 * The single, official text-based logo component for the application.
 * Displays "ABYLANG" with "ABY" in bold for a modern, minimalist look.
 * Used in the main navbar, footer, admin sidebar, and workflow pages.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <span className="text-xl text-foreground group-hover:text-primary transition-colors">
        <span className="font-bold">ABY</span>
        <span className="font-normal">LANG</span>
      </span>
    </Link>
  );
}
