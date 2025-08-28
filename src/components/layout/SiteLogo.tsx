// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * Displays a clean placeholder image with the site name "ABYLANG".
 * Used in the main navbar, footer, admin sidebar, and workflow pages.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <Image
        src="https://placehold.co/120x40/FDF6E3/36454F?text=ABYLANG&font=lora"
        alt="ABYLANG Logo"
        width={120}
        height={40}
        priority // Ensures the logo loads quickly on all pages
      />
    </Link>
  );
}
