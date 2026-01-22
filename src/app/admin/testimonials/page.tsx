
import { TestimonialsManager } from "@/components/admin/testimonials-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Testimonials - Admin',
  description: 'Approve, edit, or delete student testimonials.',
};

export default function AdminTestimonialsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Testimonials</h1>
        <p className="text-muted-foreground">Review and manage submitted student testimonials.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Testimonials</CardTitle>
          <CardDescription>A list of all submitted testimonials with their status.</CardDescription>
        </CardHeader>
        <CardContent>
          <TestimonialsManager />
        </CardContent>
      </Card>
    </div>
  );
}
