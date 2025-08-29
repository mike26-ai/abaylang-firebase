
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

// This layout is for the admin section.
// It should ideally check for admin role. This can be done in middleware or here.
// For simplicity, we assume middleware handles redirection if not admin.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar - hidden on mobile */}
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - only visible on mobile */}
        <header className="md:hidden border-b p-4 bg-card">
          <AdminMobileNav />
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
