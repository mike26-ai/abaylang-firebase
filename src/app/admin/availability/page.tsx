
import { TimeOffManager } from "@/components/admin/TimeOffManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: 'Manage Availability - Admin',
  description: 'Block out time off and manage your availability.',
};

export default function AdminAvailabilityPage() {
  // This page is protected by the admin layout, which should handle auth checks.
  // We check for the feature flag here to conditionally render the component.
  const isFeatureEnabled = process.env.FEATURE_TIME_OFF === 'true';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Availability</h1>
        <p className="text-muted-foreground">Block out periods when you are unavailable for lessons.</p>
      </header>
      
      {isFeatureEnabled ? (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Time Off Manager</CardTitle>
            <CardDescription>Add or remove time off blocks from your calendar. Students will not be able to book during these times.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOffManager />
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg border-destructive/50">
           <CardHeader className="flex flex-row items-center gap-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
                <div>
                    <CardTitle className="text-destructive">Feature Not Enabled</CardTitle>
                    <CardDescription>The Time Off feature is currently disabled.</CardDescription>
                </div>
           </CardHeader>
           <CardContent>
                <p className="text-muted-foreground">To enable this feature for local development and testing, set the following environment variable in your `.env` file and restart the server:</p>
                <code className="block bg-muted p-2 rounded-md mt-2 text-sm font-mono">FEATURE_TIME_OFF=true</code>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
