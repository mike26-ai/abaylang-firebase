
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut, ExternalLink } from "lucide-react";

interface StudentSidebarProps {
    isMobile?: boolean;
}

export function StudentSidebar({ isMobile = false }: StudentSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navContent = (
    <nav className={cn("space-y-2", isMobile ? "p-4" : "mt-6")}>
      {siteConfig.userNav.map((item) => {
        // For mobile, close the sheet on nav
        const linkProps = isMobile ? { onClick: () => ((document.querySelector('[data-radix-collection-item] > button[aria-label="Close"]') as HTMLElement)?.click()) } : {};

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
            {...linkProps}
          >
            {item.icon && <item.icon className="h-5 w-5" />}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  const footerContent = (
     <div className={cn("mt-auto space-y-2", isMobile && "p-4 border-t")}>
        <Button variant="ghost" asChild className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
          <Link href="/" target="_blank">
            <ExternalLink className="h-5 w-5 mr-3" />
            <span>View Site</span>
          </Link>
        </Button>
        <Button variant="ghost" onClick={signOut} className="w-full justify-start text-foreground hover:bg-accent hover:text-accent-foreground">
          <LogOut className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </Button>
      </div>
  );

  if (isMobile) {
    return (
        <>
            <div className="p-4 border-b">
                <SiteLogo />
            </div>
            <div className="flex-grow">
              {navContent}
            </div>
            {footerContent}
        </>
    );
  }

  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6 hidden md:flex flex-col">
      <div className="p-4 border-b">
        <SiteLogo />
      </div>
      {navContent}
      {footerContent}
    </aside>
  );
}

export default StudentSidebar;
