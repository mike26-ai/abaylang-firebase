// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import LogoSvg from '@/components/icons/logo.svg'; // Import the SVG as a default export

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group">
      <LogoSvg className="w-40 h-auto text-foreground" />
    </Link>
  );
}
