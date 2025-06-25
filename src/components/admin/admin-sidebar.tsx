
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CalendarDays, MessageSquareText, Award, BookOpenText, Users, LibraryBig } from "lucide-react"; // Ensure all used icons are here
import type { NavItem } from "@/config/site";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Admin Dashboard": LayoutDashboard, // Key used in siteConfig
  "Manage Bookings": CalendarDays,
  "Manage Testimonials": Award,
  "View Inquiries": MessageSquareText,
  "Manage Students": Users,
  "Manage Materials": LibraryBig,
};


export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-sidebar text-sidebar-foreground p-4 space-y-6 hidden md:block">
      <Link href="/admin/dashboard" className="flex items-center space-x-2 pb-6 border-b border-sidebar-border">
        <BookOpenText className="h-7 w-7 text-sidebar-primary" />
        <span className="font-bold text-xl">{siteConfig.name}</span>
      </Link>
      
      <nav className="space-y-2">
        {siteConfig.adminNav.map((item) => {
          const Icon = item.icon || iconMap[item.title] || LayoutDashboard; // Default icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                pathname === item.href
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
