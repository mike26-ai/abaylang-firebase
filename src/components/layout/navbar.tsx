
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogIn, UserCircle, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
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
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import React from "react";
import SiteLogo from "./SiteLogo";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navLinks = [
    { title: "About Tutor", href: "/tutor-profile" },
    { title: "Packages", href: "/packages" },
    { title: "Testimonials", href: "/testimonials" },
    { title: "Resources", href: "/resources" },
    { title: "Chat", href: "/chat" },
    { title: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <SiteLogo />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
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
                <DropdownMenuItem asChild>
                  <Link href="/profile">Dashboard</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="cursor-pointer">
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

          {/* Mobile Navigation */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetClose asChild>
                <div className="mt-6 mb-4 px-2">
                   <SiteLogo />
                </div>
              </SheetClose>
              <nav className="grid gap-2 text-lg font-medium px-2">
                {navLinks.map(item => (
                   <SheetClose asChild key={item.href}>
                    <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-lg font-medium text-muted-foreground hover:text-primary">{item.title}</Link>
                   </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
