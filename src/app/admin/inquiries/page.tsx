
import { InquiriesViewer } from "@/components/admin/inquiries-viewer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'View Inquiries - Admin',
  description: 'Read and manage contact form submissions.',
};

export default function AdminInquiriesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Inquiries</h1>
        <p className="text-muted-foreground">View messages submitted through the contact form.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Inquiries</CardTitle>
          <CardDescription>List of all received contact messages.</CardDescription>
        </CardHeader>
        <CardContent>
          <InquiriesViewer />
        </CardContent>
      </Card>
    </div>
  );
}

    