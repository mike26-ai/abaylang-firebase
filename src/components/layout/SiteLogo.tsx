// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * Displays the logo from the local /public/images folder.
 * This is the most stable method, avoiding external hosting and configuration issues.
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
