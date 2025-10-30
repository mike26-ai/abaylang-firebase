
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Clock, User, RefreshCw, XCircle } from "lucide-react";
import { format, isValid, parseISO, differenceInHours, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import { requestReschedule } from "@/services/bookingService";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';

// Helper function to safely format dates
const safeFormatDate = (dateInput: any, formatString: string) => {
  if (!dateInput) return 'N/A';
  
  if (dateInput.toDate && typeof dateInput.toDate === 'function') {
    const date = dateInput.toDate();
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  }

  if (typeof dateInput === 'string') {
      const date = parseISO(dateInput);
      if(isValid(date)) return format(date, formatString);
      
      const [year, month, day] = dateInput.split('-').map(Number);
      if(year && month && day) {
        const directDate = new Date(year, month - 1, day);
        if(isValid(directDate)) return format(directDate, formatString);
      }
  }
  
  if (dateInput instanceof Date && isValid(dateInput)) {
    return format(dateInput, formatString);
  }

  return 'Invalid Date';
};

export function StudentBookingsManager() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  const fetchBookings = async () => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(
          bookingsCol, 
          where("userId", "==", user.uid),
          where("status", "not-in", ["completed", "cancelled", "cancelled-by-admin", "refunded", "credit-issued", "rescheduled"]),
          orderBy("status"),
          orderBy("createdAt", "desc")
      );
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
  }, [user, toast]);

  const handleRescheduleClick = (booking: Booking) => {
      setSelectedBookingForReschedule(booking);
      setRescheduleDialogOpen(true);
  };

  const proceedToReschedule = async () => {
    if (!selectedBookingForReschedule || !user) return;
    setIsProcessingReschedule(true);
    try {
      await requestReschedule({
        bookingId: selectedBookingForReschedule.id,
        reason: 'Student initiated reschedule',
      });
      toast({
        title: "Credit Issued for Reschedule",
        description: "Your original lesson was cancelled. You can now use your credit to book a new time.",
      });
      setRescheduleDialogOpen(false);
      fetchBookings(); // Refresh the bookings list
      // Optionally, redirect to the credits page
      // router.push('/credits');
      
    } catch (error: any) {
      console.error("Failed to process reschedule request:", error);
      toast({
        title: "Reschedule Failed",
        description: error.message || "Could not process your reschedule request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingReschedule(false);
    }
  };

  const isRescheduleAllowed = (booking: Booking) => {
    if (booking.date === 'N/A_PACKAGE' || !booking.time) return false; 
    const hours = booking.groupSessionId ? 3 : 12;
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };
  
  const getStatusText = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (bookings.length === 0) {
    return <p className="text-muted-foreground text-center py-8">You have no active or upcoming bookings.</p>;
  }

  return (
    <>
      {/* Desktop View: Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lesson</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.lessonType || 'Amharic Lesson'}
                </TableCell>
                <TableCell>{booking.date !== 'N/A_PACKAGE' ? `${safeFormatDate(booking.date, 'PPP')} at ${booking.time}` : 'Package'}</TableCell>
                <TableCell>
                  <Badge
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className={
                      booking.status === 'awaiting-payment' ? "bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30" 
                      : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30"
                      : booking.status === 'cancellation-requested' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30"
                      : ""
                      }
                  >
                    {getStatusText(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                    {booking.status === 'confirmed' && <JoinLessonButton booking={booking} />}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Lesson Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleRescheduleClick(booking)} disabled={!isRescheduleAllowed(booking)}>
                            <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/credits">
                                <XCircle className="mr-2 h-4 w-4" /> Request Cancellation
                            </Link>
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
          <Card key={booking.id} className="shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="text-lg">{booking.lessonType || 'Amharic Lesson'}</CardTitle>
                  </div>
                  <Badge
                    variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                    className={
                      booking.status === 'awaiting-payment' ? "bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30" 
                      : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30"
                      : booking.status === 'cancellation-requested' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30"
                      : ""
                      }
                  >
                    {getStatusText(booking.status)}
                  </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{booking.date !== 'N/A_PACKAGE' ? safeFormatDate(booking.date, 'PPP') : 'Package'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{booking.time !== 'N/A_PACKAGE' ? booking.time : 'N/A'}</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 {booking.status === 'confirmed' && <JoinLessonButton booking={booking} />}
                 <div className="grid grid-cols-2 gap-2 w-full">
                    <Button onClick={() => handleRescheduleClick(booking)} disabled={!isRescheduleAllowed(booking)} variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" /> Reschedule
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                         <Link href="/credits">
                            <XCircle className="mr-2 h-4 w-4" /> Cancel
                        </Link>
                    </Button>
                 </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your current booking and issue you a credit for the same lesson type. You will then be able to book a new time slot from the &quot;My Credits&quot; page. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={proceedToReschedule} disabled={isProcessingReschedule}>
              {isProcessingReschedule && <Spinner size="sm" className="mr-2" />}
              Yes, Cancel and Get Credit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    