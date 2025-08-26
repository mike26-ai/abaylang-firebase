
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc, getDoc, where, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, CreditCard, MessageCircle, Link as LinkIcon } from "lucide-react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [zoomLinkData, setZoomLinkData] = useState<{ isOpen: boolean; booking: Booking | null; link: string; isSaving: boolean }>({ isOpen: false, booking: null, link: "", isSaving: false });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerFirstLessonFeedbackPrompt = async (userId: string) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data() as UserProfile;
        
        if (!userData.hasSubmittedFirstLessonFeedback) {
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", userId),
            where("status", "==", "completed")
          );
          const completedBookingsSnap = await getDocs(bookingsQuery);
          
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
    }
  };

  const updateBookingStatus = async (booking: Booking, status: Booking['status']) => {
    try {
      if (status === 'completed' && booking.status !== 'completed') {
        await triggerFirstLessonFeedbackPrompt(booking.userId);
      }
      
      const bookingDocRef = doc(db, "bookings", booking.id);
      await updateDoc(bookingDocRef, { 
        status: status,
        statusHistory: arrayUnion({
            status: status,
            changedAt: serverTimestamp(),
            changedBy: 'admin'
        })
      });
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

  const handleSaveZoomLink = async () => {
    if (!zoomLinkData.booking || !zoomLinkData.link) return;
    setZoomLinkData(prev => ({ ...prev, isSaving: true }));
    try {
      const bookingDocRef = doc(db, "bookings", zoomLinkData.booking.id);
      await updateDoc(bookingDocRef, { zoomLink: zoomLinkData.link });
      toast({ title: "Zoom Link Saved", description: "The student will see the join button once the lesson is confirmed." });
      setZoomLinkData({ isOpen: false, booking: null, link: "", isSaving: false });
      fetchBookings();
    } catch (error) {
      console.error("Error saving Zoom link:", error);
      toast({ title: "Error", description: "Could not save the Zoom link.", variant: "destructive" });
      setZoomLinkData(prev => ({ ...prev, isSaving: false }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (bookings.length === 0) {
    return <p className="text-muted-foreground">No bookings found.</p>;
  }

  return (
    <>
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
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {booking.userName}
                    {booking.paymentNote && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MessageCircle className="h-4 w-4 text-primary cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{booking.paymentNote}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
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
                    className={
                      booking.status === 'awaiting-payment' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30" 
                      : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30"
                      : ""
                      }
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
                        {(booking.status === 'awaiting-payment' || booking.status === 'payment-pending-confirmation') && (
                          <DropdownMenuItem onClick={() => updateBookingStatus(booking, "confirmed")}>
                              <CreditCard className="mr-2 h-4 w-4 text-primary" /> Confirm Payment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setZoomLinkData({ isOpen: true, booking, link: booking.zoomLink || '', isSaving: false })}>
                          <LinkIcon className="mr-2 h-4 w-4" /> {booking.zoomLink ? "Edit" : "Add"} Zoom Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
                          This action cannot be undone. This will permanently delete the booking for {booking.userName} on {booking.date !== 'N/A_PACKAGE' ? format(new Date(booking.date), 'PPP') : 'a package'}.
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
      
      <Dialog open={zoomLinkData.isOpen} onOpenChange={(isOpen) => !isOpen && setZoomLinkData({ isOpen: false, booking: null, link: "", isSaving: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Zoom Link</DialogTitle>
            <DialogDescription>
              Provide the Zoom meeting link for the lesson with {zoomLinkData.booking?.userName} on {zoomLinkData.booking?.date ? format(new Date(zoomLinkData.booking.date), 'PPP') : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="zoom-link">Zoom Link</Label>
            <Input
              id="zoom-link"
              value={zoomLinkData.link}
              onChange={(e) => setZoomLinkData(prev => ({...prev, link: e.target.value}))}
              placeholder="https://zoom.us/j/..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZoomLinkData({ isOpen: false, booking: null, link: "", isSaving: false })}>Cancel</Button>
            <Button onClick={handleSaveZoomLink} disabled={zoomLinkData.isSaving}>
              {zoomLinkData.isSaving && <Spinner size="sm" className="mr-2" />}
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
