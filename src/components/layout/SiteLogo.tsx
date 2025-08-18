// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import LogoSvg from '@/assets/icons/logo.svg'; // Import the SVG as a React Component

export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group">
      <LogoSvg className="h-10 w-auto text-foreground" />
    </Link>
  );
}
