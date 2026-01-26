import Link from 'next/link';
import Image from 'next/image';

/**
 * The single, official logo component for the application.
 * Updated with strict CSS height constraints to prevent layout "slippage."
 */
export function SiteLogo() {
  return (
    <Link href="/" className="flex items-center group" aria-label="Back to homepage">
       <Image 
         src="/logo-header.svg" 
         alt="ABYLANG logo" 
         width={140} 
         height={35} 
         priority 
         className="h-18 w-auto md:h-12 object-contain" 
       />
    </Link>
  );
}
