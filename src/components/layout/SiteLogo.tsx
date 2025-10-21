// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';

/**
 * The single, official logo component for the application.
 * This now uses a standard <img> tag pointing to the static SVG in /public
 * for maximum reliability and to prevent build-time SVG processing errors.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
       <img src="/logo-header.svg" alt="ABYLANG logo" style={{ height: 40, width: 'auto' }} />
    </Link>
  );
}
