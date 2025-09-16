
import { AvailabilityManager } from "@/components/admin/availability-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { Clock } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Availability - Admin',
  description: 'Block out dates and times to prevent bookings.',
};

export default function AdminAvailabilityPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <Clock className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Availability</h1>
            <p className="text-muted-foreground">Block out dates and times when you are unavailable for lessons.</p>
        </div>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Calendar & Blocked Slots</CardTitle>
          <CardDescription>Select a date to view, add, or remove blocked time slots.</CardDescription>
        </CardHeader>
        <CardContent>
          <AvailabilityManager />
        </CardContent>
      </Card>
    </div>
  );
}
