
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, BookOpenText, LogIn, LogOut, UserCircle, ShieldCheck } from "lucide-react";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "@/config/site";

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, signOut, isAdmin } = useAuth();

  const renderNavLinks = (items: NavItem[], inSheet: boolean = false) =>
    items
      .filter(item => !item.authRequired || (item.authRequired && user))
      .filter(item => !item.adminRequired || (item.adminRequired && isAdmin))
      .filter(item => !(item.hideWhenLoggedIn && user))
      .map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground",
            inSheet && "block py-2"
          )}
        >
          {item.title}
        </Link>
      ));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BookOpenText className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{siteConfig.name}</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {renderNavLinks(siteConfig.mainNav)}
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
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                {renderNavLinks(siteConfig.mainNav, true)}
                {!user && (
                  <>
                    <Link href="/login" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Log In</Link>
                    <Link href="/register" className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary">Sign Up</Link>
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
