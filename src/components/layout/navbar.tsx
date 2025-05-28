
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogIn, LogOut, UserCircle, ShieldCheck, ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"; // Added SheetClose
import { Logo } from "./logo";
import React from "react"; // Imported React

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const renderNavLinks = (items: NavItem[], inSheet: boolean = false) =>
    items
      .filter(item => !item.authRequired || (item.authRequired && user))
      .filter(item => !item.adminRequired || (item.adminRequired && isAdmin))
      .filter(item => !(item.hideWhenLoggedIn && user))
      .map((item) => {
        if (inSheet) {
          // Mobile Sheet Navigation
          return (
            <React.Fragment key={item.href}>
              <SheetClose asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "block py-2 text-lg font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              </SheetClose>
              {item.children && item.children.length > 0 && (
                <div className="pl-4">
                  {item.children.map((child) => (
                     <SheetClose asChild key={child.href}>
                        <Link
                        href={child.href}
                        className={cn(
                            "block py-2 text-base font-medium transition-colors hover:text-primary",
                            pathname === child.href ? "text-primary" : "text-muted-foreground"
                        )}
                        >
                        {child.title}
                        </Link>
                     </SheetClose>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        } else {
          // Desktop Navigation
          if (item.children && item.children.length > 0) {
            const isParentActive = item.href === pathname || item.children.some(child => child.href === pathname);
            return (
              <DropdownMenu key={item.href}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                      isParentActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {item.title}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.children.map((child) => (
                    <DropdownMenuItem key={child.href} asChild>
                      <Link
                        href={child.href}
                        className={cn(
                          pathname === child.href ? "font-semibold text-primary" : ""
                        )}
                      >
                        {child.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.title}
            </Link>
          );
        }
      });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
          {renderNavLinks(siteConfig.mainNav.filter(item => !item.isSectionAnchor))}
        </nav>

        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.displayName || user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {siteConfig.userNav.map(item => (
                   <DropdownMenuItem key={item.href} asChild>
                     <Link href={item.href}>{item.title}</Link>
                   </DropdownMenuItem>
                ))}
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href="/admin/dashboard">
                         <ShieldCheck className="mr-2 h-4 w-4" />
                         Admin Panel
                       </Link>
                     </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="grid gap-2 text-lg font-medium mt-8"> {/* Reduced gap */}
                {renderNavLinks(siteConfig.mainNav, true)}
                {!user && (
                  <>
                   <SheetClose asChild>
                    <Link href="/login" className="block py-2 text-lg font-medium text-muted-foreground hover:text-primary">Log In</Link>
                   </SheetClose>
                   <SheetClose asChild>
                    <Link href="/register" className="block py-2 text-lg font-medium text-muted-foreground hover:text-primary">Sign Up</Link>
                   </SheetClose>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
