
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO } from "date-fns";
import type { Booking } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";

type ResolutionActionType = "approved" | "rejected" | null;

export default function AdminResolutionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [pendingResolutions, setPendingResolutions] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingResolution, setUpdatingResolution] = useState<{ id: string | null; action: ResolutionActionType }>({ id: null, action: null });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not authenticated");

      const response = await fetch('/api/admin/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch resolution data');
      }
      
      const data = await response.json();
      setPendingResolutions(data.pendingResolutions || []);

    } catch (error: any) {
      console.error("Error fetching resolution data:", error);
      toast({ title: "Error", description: error.message || "Could not load resolution data.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };


  useEffect(() => {
    if (authLoading) return;
    if (user) {
        fetchDashboardData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);
  
  const handleResolution = async (booking: Booking, approved: boolean) => {
    setUpdatingResolution({ id: booking.id, action: approved ? 'approved' : 'rejected' });

    try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) throw new Error("Authentication error");

        const response = await fetch('/api/admin/resolve-cancellation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                bookingId: booking.id,
                approved: approved,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to process resolution.');
        }

        toast({ title: "Success", description: `Request has been ${approved ? 'approved' : 'denied'}.` });
        fetchDashboardData(); // Refresh data

    } catch (error: any) {
        console.error("Error resolving cancellation:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setUpdatingResolution({ id: null, action: null });
    }
};

  if (isLoading || authLoading) {
    return <div className="flex items-center justify-center h-96"><Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading Resolutions...</p></div>;
  }

  return (
    <div className="space-y-8">
       <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
            <RefreshCw className="h-7 w-7 text-primary" />
        </div>
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Resolutions</h1>
            <p className="text-muted-foreground">Approve or deny student requests for lesson cancellations, refunds, or credits.</p>
        </div>
      </header>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Pending Cancellation Requests</CardTitle>
          <CardDescription>Review and process all pending requests from students.</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingResolutions.length === 0 ? <p className="text-muted-foreground text-center py-8">No pending resolution requests.</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Lesson Date</TableHead>
                <TableHead>Requested Action</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingResolutions.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.userName}</div>
                    <div className="text-xs text-muted-foreground">{booking.userEmail}</div>
                  </TableCell>
                  <TableCell>
                    {booking.date && booking.date !== 'N/A_PACKAGE'
                      ? `${format(parseISO(booking.date), "PP")} at ${booking.time}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30">
                      Request: {booking.requestedResolution}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                        onClick={() => handleResolution(booking, true)}
                        disabled={updatingResolution.id === booking.id}
                      >
                        {updatingResolution.id === booking.id && updatingResolution.action === "approved" ? <Spinner size="sm" className="mr-1"/> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleResolution(booking, false)}
                        disabled={updatingResolution.id === booking.id}
                      >
                         {updatingResolution.id === booking.id && updatingResolution.action === "rejected" ? <Spinner size="sm" className="mr-1"/> : <X className="w-4 h-4 mr-1" />} Deny
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
