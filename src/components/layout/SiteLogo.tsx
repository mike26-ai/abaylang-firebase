// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * Displays the official logo from the public assets folder.
 * Used in the main navbar, footer, admin sidebar, and workflow pages.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <Image
        src="/images/logo.png"
        alt="ABYLANG Logo"
        width={120}
        height={40}
        priority 
        className="h-auto w-auto"
      />
    </Link>
  );
}
