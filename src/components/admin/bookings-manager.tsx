
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, CreditCard } from "lucide-react";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(bookingsCol, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error", description: "Could not fetch bookings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const triggerFirstLessonFeedbackPrompt = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        
        // Only trigger if they have NOT submitted feedback before.
        if (!userData.hasSubmittedFirstLessonFeedback) {
          // Check if this is their first completed lesson.
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", userId),
            where("status", "==", "completed")
          );
          const completedBookingsSnap = await getDocs(bookingsQuery);
          
          // The update to completed is about to happen, so if there are 0 completed, this is the first.
          if (completedBookingsSnap.size === 0) {
              await updateDoc(userDocRef, {
                showFirstLessonFeedbackPrompt: true,
              });
              toast({ title: "Feedback Prompt Sent", description: `Prompt enabled for ${userData.name}.` });
          }
        }
      }
    } catch (error) {
      console.error("Error triggering first lesson feedback prompt:", error);
      // Fail silently to not block the admin's main action
    }
  };

  const updateBookingStatus = async (booking: Booking, status: Booking['status']) => {
    try {
      // If moving to 'completed', check if we need to trigger the feedback prompt
      if (status === 'completed' && booking.status !== 'completed') {
        await triggerFirstLessonFeedbackPrompt(booking.userId);
      }
      
      const bookingDocRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingDocRef, { status });
      toast({ title: "Success", description: `Booking status updated to ${status}.` });
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({ title: "Error", description: "Could not update booking status.", variant: "destructive" });
    }
  };
  
  const deleteBooking = async (bookingId: string) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingDocRef);
      toast({ title: "Success", description: "Booking deleted." });
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast({ title: "Error", description: "Could not delete booking.", variant: "destructive" });
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">No bookings found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Booked On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell className="font-medium">{booking.userName}</TableCell>
              <TableCell>{booking.userEmail}</TableCell>
              <TableCell>{booking.date !== 'N/A_PACKAGE' ? format(new Date(booking.date), 'PPP') : 'Package'}</TableCell>
              <TableCell>{booking.time !== 'N/A_PACKAGE' ? booking.time : 'N/A'}</TableCell>
              <TableCell>
                 <Badge
                  variant={
                    booking.status === "confirmed" ? "default" 
                    : booking.status === "completed" ? "secondary"
                    : booking.status === "cancelled" ? "destructive" 
                    : "secondary"
                  }
                   className={booking.status === 'awaiting-payment' ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500" : ""}
                >
                  {booking.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </TableCell>
              <TableCell>{format(booking.createdAt.toDate(), 'PP pp')}</TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      {booking.status === 'awaiting-payment' && (
                         <DropdownMenuItem onClick={() => updateBookingStatus(booking, "confirmed")}>
                            <CreditCard className="mr-2 h-4 w-4 text-green-500" /> Confirm Payment
                         </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => updateBookingStatus(booking, "completed")} disabled={booking.status === 'completed'}>
                        <CheckCircle className="mr-2 h-4 w-4 text-blue-500" /> Mark as Completed
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateBookingStatus(booking, "cancelled")} disabled={booking.status === 'cancelled'}>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Mark as Cancelled
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                       <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-red-600 hover:!text-red-600 focus:!text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the booking for {booking.userName} on {booking.date !== 'N/A_PACKAGE' ? format(new Date(booking.date), 'PPP') : 'a package'} at {booking.time}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteBooking(booking.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
