
import { GroupSessionManager } from "@/components/admin/group-session-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { ClipboardList } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Group Sessions - Admin',
  description: 'Create, view, and manage group class sessions.',
};

export default function AdminGroupSessionsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <ClipboardList className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Group Sessions</h1>
            <p className="text-muted-foreground">Create and manage upcoming group classes.</p>
        </div>
      </header>
      
      <GroupSessionManager />

    </div>
  );
}
