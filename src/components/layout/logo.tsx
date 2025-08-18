
// File: src/components/layout/logo.tsx
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { BookOpenText } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 group">
      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
        <BookOpenText className="h-6 w-6 text-primary" />
      </div>
      <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
        {siteConfig.name}
      </span>
    </Link>
  );
}
