
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Navbar } from "@/components/layout/navbar"; // Using main navbar for consistency in header, sidebar for admin nav.
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Admin could have a simplified Navbar or reuse the main one */}
        {/* For now, no separate admin navbar on top, relying on sidebar */}
        <ScrollArea className="flex-1 overflow-y-auto">
           <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             {children}
           </div>
        </ScrollArea>
      </div>
    </div>
  );
}
