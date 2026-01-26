
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export function Footer() {
  const pathname = usePathname();
  // Conditionally render footer based on path
  const showFooter = !pathname.startsWith('/admin') && !pathname.startsWith('/profile') && pathname !== "/" && !pathname.startsWith('/register') && !pathname.startsWith('/login') && !pathname.startsWith('/forgot-password');

  if (!showFooter) {
    return null;
  }

  return (
    <footer className="border-t bg-[#1A1A1A] text-white py-16 px-4">
      <div className="container mx-auto">
        {/* LOGO SECTION: Centered and constrained */}
        <div className="flex justify-center mb-12">
            <Link href="/" aria-label="ABYLANG home" className="opacity-90 hover:opacity-100 transition-opacity">
                <Image 
                  src="/logo.svg" 
                  alt="ABYLANG logo" 
                  width={150} 
                  height={38} 
                  className="h-18 w-auto md:h-12" // This makes it consistent with the header
                />
            </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <p className="text-gray-400 mt-4 mb-4 max-w-md leading-relaxed">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Learning</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/bookings" className="hover:text-[#EAB308] transition-colors">Book Lesson</Link></li>
              <li><Link href="/tutor-profile" className="hover:text-[#EAB308] transition-colors">About Mahder</Link></li>
              <li><Link href="/testimonials" className="hover:text-[#EAB308] transition-colors">Reviews</Link></li>
              <li><Link href="/packages" className="hover:text-[#EAB308] transition-colors">View Packages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 text-white uppercase tracking-wider text-sm">Support</h3>
            <ul className="space-y-3 text-gray-400">
              <li><Link href="/contact" className="hover:text-[#EAB308] transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-[#EAB308] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[#EAB308] transition-colors">Terms</Link></li>
              <li><Link href="/faq" className="hover:text-[#EAB308] transition-colors">FAQ</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Made with ❤️ for the Amharic learning community.</p>
        </div>
      </div>
    </footer>
  )
}
