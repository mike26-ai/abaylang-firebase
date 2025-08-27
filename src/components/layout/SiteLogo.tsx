// File: src/components/layout/SiteLogo.tsx
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { BookOpenText } from 'lucide-react';

/**
 * The single, official text-based logo component for the application.
 * Displays the site name as a link to the homepage.
 * Used in the main navbar, footer, admin sidebar, and workflow pages.
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
       <BookOpenText className="h-6 w-6 mr-2 text-primary transition-colors" />
      <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
        {siteConfig.name}
      </span>
    </Link>
  );
}
