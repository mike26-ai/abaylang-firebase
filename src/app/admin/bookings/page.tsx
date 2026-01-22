
import { BookingsManager } from "@/components/admin/bookings-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Bookings - Admin',
  description: 'View and manage all lesson bookings.',
};

export default function AdminBookingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h1>
        <p className="text-muted-foreground">View, update, or cancel student lesson bookings.</p>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>A list of all scheduled, past, and cancelled lessons.</CardDescription>
        </CardHeader>
        <CardContent>
          <BookingsManager />
        </CardContent>
      </Card>
    </div>
  );
}
