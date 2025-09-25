import { TimeOffManager } from "@/components/admin/TimeOffManager";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manage Availability - Admin',
  description: 'Block or unblock time slots in the tutor schedule.',
};

export default function ManageAvailabilityPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Tutor Availability</h1>
        <p className="text-muted-foreground">
          View the schedule, block time off for appointments, or make slots available.
        </p>
      </header>
      <TimeOffManager />
    </div>
  );
}
