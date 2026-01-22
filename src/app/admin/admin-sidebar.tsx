
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
<<<<<<< HEAD
import { LayoutDashboard, CalendarDays, MessageSquareText, Award, BookOpenText, Users, LibraryBig, LogOut, ExternalLink } from "lucide-react";
=======
import { LayoutDashboard, CalendarDays, MessageSquareText, Award, BookOpenText, Users, LibraryBig, LogOut, ExternalLink, ClipboardList } from "lucide-react";
>>>>>>> before-product-selection-rewrite
import type { NavItem } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/layout/SiteLogo";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Admin Dashboard": LayoutDashboard, // Key used in siteConfig
  "Manage Bookings": CalendarDays,
  "Manage Testimonials": Award,
  "View Inquiries": MessageSquareText,
  "Manage Students": Users,
<<<<<<< HEAD
=======
  "Manage Group Sessions": ClipboardList,
>>>>>>> before-product-selection-rewrite
};


export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // The signOut function in useAuth will handle redirection
  };

  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6 hidden md:flex flex-col">
      <div>
        <div className="p-4 border-b">
          <SiteLogo />
        </div>
        
        <nav className="space-y-2 mt-6">
          {siteConfig.adminNav.map((item) => {
            const Icon = item.icon || iconMap[item.title] || LayoutDashboard; // Default icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-2">
        <Button variant="ghost" asChild className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/" target="_blank">
            <ExternalLink className="h-5 w-5 mr-3" />
            <span>View Site</span>
          </Link>
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
