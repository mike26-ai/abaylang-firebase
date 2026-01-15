// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * This now uses the Next.js Image component for automatic optimization.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
       <Image src="/logo-header.svg" alt="ABYLANG logo" width={140} height={35} priority />
    </Link>
  );
}
