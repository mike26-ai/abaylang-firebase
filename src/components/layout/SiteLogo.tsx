// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
<<<<<<< HEAD
import { siteConfig } from '@/config/site';

/**
 * The single, official logo component for the application.
 * This is a text-only version to ensure stability and prevent image-related errors.
=======
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * This now uses the Next.js Image component for automatic optimization.
>>>>>>> before-product-selection-rewrite
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
<<<<<<< HEAD
      <span className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
        {siteConfig.name}
      </span>
=======
       <Image src="/logo-header.svg" alt="ABYLANG logo" width={140} height={35} priority />
>>>>>>> before-product-selection-rewrite
    </Link>
  );
}
