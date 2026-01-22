
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc, getDoc, where, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, CreditCard, MessageCircle, Link as LinkIcon, Calendar, Clock, User } from "lucide-react";
<<<<<<< HEAD
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";
=======
import { format, isValid, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
>>>>>>> before-product-selection-rewrite
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
<<<<<<< HEAD
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
=======
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to safely format dates
const safeFormatDate = (dateInput: any, formatString: string) => {
  if (!dateInput) return 'N/A';
  
  // Handle Firestore Timestamp objects
  if (dateInput.toDate && typeof dateInput.toDate === 'function') {
    const date = dateInput.toDate();
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  }

  // Handle ISO strings or string dates
  if (typeof dateInput === 'string') {
      const date = parseISO(dateInput);
      if(isValid(date)) return format(date, formatString);
      
      // Fallback for YYYY-MM-DD format
      const [year, month, day] = dateInput.split('-').map(Number);
      if(year && month && day) {
        const directDate = new Date(year, month - 1, day);
        if(isValid(directDate)) return format(directDate, formatString);
      }
  }
  
  // Handle native Date objects
  if (dateInput instanceof Date && isValid(dateInput)) {
    return format(dateInput, formatString);
  }

  return 'Invalid Date';
};
>>>>>>> before-product-selection-rewrite

export function BookingsManager() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [zoomLinkData, setZoomLinkData] = useState<{ isOpen: boolean; booking: Booking | null; link: string; isSaving: boolean }>({ isOpen: false, booking: null, link: "", isSaving: false });
  const [deleteConfirmation, setDeleteConfirmation] = useState<Booking | null>(null);


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

      await updateDoc(bookingDocRef, { status: status });

      toast({ title: "Success", description: `Booking status updated to ${status}.` });
      fetchBookings(); 
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
      setDeleteConfirmation(null);
      fetchBookings(); 
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
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
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
<<<<<<< HEAD
                <TableCell>{booking.date !== 'N/A_PACKAGE' ? format(new Date(booking.date), 'PPP') : 'Package'}</TableCell>
=======
                <TableCell>{booking.date !== 'N/A_PACKAGE' ? safeFormatDate(booking.date, 'PPP') : 'Package'}</TableCell>
>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
                <TableCell>{booking.createdAt.toDate().toLocaleString()}</TableCell>
=======
                <TableCell>{safeFormatDate(booking.createdAt, 'PPp')}</TableCell>
>>>>>>> before-product-selection-rewrite
                <TableCell className="text-right">
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
                          <DropdownMenuItem className="text-red-600 hover:!text-red-600 focus:!text-red-600" onClick={() => setDeleteConfirmation(booking)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Booking
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="text-lg">{booking.userName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                  </div>
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
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
<<<<<<< HEAD
                    <span>{booking.date !== 'N/A_PACKAGE' ? format(new Date(booking.date), 'PPP') : 'Package'}</span>
=======
                    <span>{booking.date !== 'N/A_PACKAGE' ? safeFormatDate(booking.date, 'PPP') : 'Package'}</span>
>>>>>>> before-product-selection-rewrite
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{booking.time !== 'N/A_PACKAGE' ? booking.time : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
<<<<<<< HEAD
                    <span>Booked on {booking.createdAt.toDate().toLocaleDateString()}</span>
=======
                    <span>Booked on {safeFormatDate(booking.createdAt, 'PP')}</span>
>>>>>>> before-product-selection-rewrite
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 {(booking.status === 'awaiting-payment' || booking.status === 'payment-pending-confirmation') && (
                    <Button onClick={() => updateBookingStatus(booking, "confirmed")} className="w-full" size="sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Confirm Payment
                    </Button>
                 )}
                 <div className="grid grid-cols-2 gap-2 w-full">
                    <Button onClick={() => updateBookingStatus(booking, "completed")} disabled={booking.status === 'completed'} variant="outline" size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" /> Completed
                    </Button>
                     <Button onClick={() => updateBookingStatus(booking, "cancelled")} disabled={booking.status === 'cancelled'} variant="outline" size="sm">
                        <XCircle className="mr-2 h-4 w-4" /> Cancelled
                    </Button>
                 </div>
                 <Button onClick={() => setZoomLinkData({ isOpen: true, booking, link: booking.zoomLink || '', isSaving: false })} variant="outline" size="sm" className="w-full">
                    <LinkIcon className="mr-2 h-4 w-4" /> {booking.zoomLink ? "Edit" : "Add"} Zoom Link
                </Button>
                 <Button onClick={() => setDeleteConfirmation(booking)} variant="destructive" size="sm" className="w-full mt-2">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Modals and Dialogs */}
      <Dialog open={zoomLinkData.isOpen} onOpenChange={(isOpen) => !isOpen && setZoomLinkData({ isOpen: false, booking: null, link: "", isSaving: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Zoom Link</DialogTitle>
            <DialogDescription>
<<<<<<< HEAD
              Provide the Zoom meeting link for the lesson with {zoomLinkData.booking?.userName} on {zoomLinkData.booking?.date ? format(new Date(zoomLinkData.booking.date), 'PPP') : ''}.
=======
              Provide the Zoom meeting link for the lesson with {zoomLinkData.booking?.userName} on {zoomLinkData.booking?.date ? safeFormatDate(zoomLinkData.booking.date, 'PPP') : ''}.
>>>>>>> before-product-selection-rewrite
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

      <AlertDialog open={!!deleteConfirmation} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
<<<<<<< HEAD
              This action cannot be undone. This will permanently delete the booking for {deleteConfirmation?.userName} on {deleteConfirmation?.date !== 'N/A_PACKAGE' ? format(new Date(deleteConfirmation?.date || new Date()), 'PPP') : 'a package'}.
=======
              This action cannot be undone. This will permanently delete the booking for {deleteConfirmation?.userName} on {deleteConfirmation?.date !== 'N/A_PACKAGE' ? safeFormatDate(deleteConfirmation?.date, 'PPP') : 'a package'}.
>>>>>>> before-product-selection-rewrite
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmation && deleteBooking(deleteConfirmation.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
<<<<<<< HEAD
=======

    
>>>>>>> before-product-selection-rewrite
