// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import LogoSvg from '@/assets/icons/logo.svg'; 

/**
 * The primary, official SVG logo component for the application.
 * Used in the main navbar, footer, and admin sidebar.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <LogoSvg className="h-10 w-auto text-foreground" />
    </Link>
  );
}
