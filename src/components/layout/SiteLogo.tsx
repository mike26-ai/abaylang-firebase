
// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import { siteConfig } from '@/config/site';

/**
 * The single, official logo component for the application.
 * This is a text-only version to ensure stability and prevent image-related errors.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <span className="text-2xl font-bold text-foreground transition-colors group-hover:text-primary">
        {siteConfig.name}
      </span>
    </Link>
  );
}
