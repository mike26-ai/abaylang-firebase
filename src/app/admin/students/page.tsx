
import { StudentsManager } from "@/components/admin/students-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { Users } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Students - Admin',
  description: 'View and manage registered students.',
};

export default function AdminStudentsPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Students</h1>
            <p className="text-muted-foreground">View registered users and their details.</p>
        </div>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Students</CardTitle>
          <CardDescription>A list of all users registered on LissanHub.</CardDescription>
        </CardHeader>
        <CardContent>
          <StudentsManager />
        </CardContent>
      </Card>
    </div>
  );
}
