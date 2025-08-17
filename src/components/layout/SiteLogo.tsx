// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
// @ts-ignore - This will work once the SVG is moved and the build process is configured for SVG imports
import LogoSvg from '@/components/icons/logo.svg'; // Import the SVG as a component

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group">
      <LogoSvg className="w-40 h-auto text-foreground" />
    </Link>
  );
}
