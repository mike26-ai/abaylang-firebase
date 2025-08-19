// File: src/components/layout/SiteLogo.tsx

import Link from 'next/link';
import Logo from '@/components/icons/Logo';

const SiteLogo = () => {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
      <Logo className="h-10 w-auto" />
    </Link>
  );
};

export default SiteLogo;
