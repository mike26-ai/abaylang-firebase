// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import Logo from '@/assets/icons/logo.svg';

const SiteLogo = () => {
  return (
    <Link href="/" className="flex items-center group">
      <Logo className="h-10 w-auto text-foreground" />
    </Link>
  );
};

export default SiteLogo;
