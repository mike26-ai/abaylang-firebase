
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import type { NavItem } from "@/config/site";

// Re-using the same icon mapping from the desktop sidebar for consistency
import { LayoutDashboard, CalendarDays, MessageSquareText, Award, Users } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Admin Dashboard": LayoutDashboard,
  "Manage Bookings": CalendarDays,
  "Manage Testimonials": Award,
  "View Inquiries": MessageSquareText,
  "Manage Students": Users,
};


export function AdminMobileNav() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <div className="flex items-center justify-between">
       <SiteLogo />
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open Admin Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] flex flex-col">
          <SheetHeader className="p-4 border-b">
             <SheetTitle className="sr-only">Admin Menu</SheetTitle>
             <SiteLogo />
          </SheetHeader>
          
          <nav className="flex-grow p-4 space-y-2">
            <div className="mb-4">
                <h3 className="font-semibold text-foreground text-base flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Admin Panel
                </h3>
            </div>
            {siteConfig.adminNav.map((item) => {
              const Icon = item.icon || iconMap[item.title] || LayoutDashboard;
              return (
                <SheetClose asChild key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </SheetClose>
              );
            })}
          </nav>

          <div className="p-4 border-t mt-auto space-y-2">
            <SheetClose asChild>
                <Button variant="ghost" asChild className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
                <Link href="/" target="_blank">
                    <ExternalLink className="h-5 w-5 mr-3" />
                    <span>View Site</span>
                </Link>
                </Button>
            </SheetClose>
            <Button variant="ghost" onClick={() => { signOut(); setIsOpen(false); }} className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
