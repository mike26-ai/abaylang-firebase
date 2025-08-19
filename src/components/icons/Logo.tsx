// File: src/components/icons/Logo.tsx

import Image from 'next/image';
import logoSrc from '@/assets/icons/logo.svg';
import type { ComponentProps } from 'react';

const Logo = (props: Partial<ComponentProps<typeof Image>>) => {
  return (
    <Image
      src={logoSrc}
      alt="Site Logo"
      {...props}
    />
  );
};

export default Logo;
