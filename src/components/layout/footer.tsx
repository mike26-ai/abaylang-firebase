
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { BookOpenText } from "lucide-react";
import { FooterLogo } from "./footer-logo";

export function Footer() {
  return (
    <footer className="border-t bg-foreground text-background py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2 group">
            <FooterLogo />
            <p className="text-muted-foreground mt-4 mb-4 max-w-md">
              {siteConfig.description}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-background">Learning</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/bookings" className="hover:text-background">Book Lesson</Link></li>
              <li><Link href="/tutor-profile" className="hover:text-background">About Mahder</Link></li>
              <li><Link href="/testimonials" className="hover:text-background">Reviews</Link></li>
              <li><Link href="/packages" className="hover:text-background">View Packages</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-background">Support</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><Link href="/contact" className="hover:text-background">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-background">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-background">Terms</Link></li>
              <li><Link href="/faq" className="hover:text-background">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/20 mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. Made with ❤️ for the Amharic learning community.</p>
        </div>
      </div>
    </footer>
  );
}
