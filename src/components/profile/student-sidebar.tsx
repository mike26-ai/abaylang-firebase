
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";

interface StudentSidebarProps {
    isMobile?: boolean;
}

export function StudentSidebar({ isMobile = false }: StudentSidebarProps) {
  const pathname = usePathname();

  const navContent = (
    <nav className={cn("space-y-2", isMobile ? "p-4" : "mt-6")}>
      {siteConfig.userNav.map((item) => {
        // For mobile, close the sheet on nav
        const linkProps = isMobile ? { onClick: () => (document.querySelector('[data-radix-collection-item] > button[aria-label="Close"]')?.['click']()) } : {};

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

  if (isMobile) {
    return (
        <div>
            <div className="p-4 border-b">
                <SiteLogo />
            </div>
            {navContent}
        </div>
    );
  }

  return (
    <aside className="w-64 border-r bg-card p-4 space-y-6 hidden md:flex flex-col">
      <div>
        <div className="p-4 border-b">
          <SiteLogo />
        </div>
        {navContent}
      </div>
      {/* Additional footer items for desktop sidebar can go here */}
    </aside>
  );
}

export default StudentSidebar;
