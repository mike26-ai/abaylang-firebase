// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';

/**
 * The single, official text-based logo component for the application.
 * Displays "ABYLANG" in a simple, clean, and stable format.
 * Used in the main navbar, footer, admin sidebar, and workflow pages.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <span className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
        ABYLANG
      </span>
    </Link>
  );
}
