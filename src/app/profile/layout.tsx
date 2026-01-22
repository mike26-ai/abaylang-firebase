
"use client";

import { StudentSidebar } from "@/components/profile/student-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function StudentMobileNav() {
    return (
        <div className="flex items-center justify-between">
           <SiteLogo />
           <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] flex flex-col p-0">
                <StudentSidebar isMobile={true} />
            </SheetContent>
           </Sheet>
        </div>
    );
}


export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?callbackUrl=/profile');
      } else if (isAdmin) {
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, isAdmin, router]);


  if (loading || !user || isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-3 text-muted-foreground">Loading Your Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <StudentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="md:hidden border-b p-4 bg-card">
          <StudentMobileNav />
        </header>
        <ScrollArea className="flex-1 overflow-y-auto">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {children}
           </div>
        </ScrollArea>
      </div>
    </div>
  );
}
