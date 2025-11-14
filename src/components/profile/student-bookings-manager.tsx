// File: src/components/profile/student-bookings-manager.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query, where, doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { Booking, UserCredit, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Clock, User, RefreshCw, XCircle, AlertCircle } from "lucide-react";
import { format, isValid, parseISO, differenceInHours, parse } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import { rescheduleBooking } from "@/services/bookingService";
import { useAuth } from "@/hooks/use-auth";
import Link from 'next/link';
import { RescheduleModal } from "@/components/bookings/RescheduleModal";
import { PaymentPendingNotice } from "@/components/profile/PaymentPendingNotice";

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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [isProcessingReschedule, setIsProcessingReschedule] = useState(false);

  // State for permanently dismissed notices
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  
  useEffect(() => {
    // Load dismissed notices from localStorage on component mount
    const dismissed = localStorage.getItem('dismissedPaymentNotices');
    if (dismissed) {
      setDismissedNotices(JSON.parse(dismissed));
    }
  }, []);

  const handleDismissNotice = (bookingId: string) => {
    const newDismissed = [...dismissedNotices, bookingId];
    setDismissedNotices(newDismissed);
    localStorage.setItem('dismissedPaymentNotices', JSON.stringify(newDismissed));
  };


  const fetchData = async () => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
      const bookingsQuery = query(
          collection(db, "bookings"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
      );
      const userProfileRef = doc(db, "users", user.uid);

      const [bookingsSnapshot, userProfileSnap] = await Promise.all([
          getDocs(bookingsQuery),
          getDoc(userProfileRef)
      ]);
      
      const fetchedBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(fetchedBookings);

      if (userProfileSnap.exists()) {
          setUserProfile(userProfileSnap.data() as UserProfile);
      }

    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error", description: "Could not fetch bookings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toast]);

  const activeBookings = useMemo(() => {
      const inactiveStatuses = ["completed", "cancelled", "cancelled-by-admin", "refunded", "credit-issued", "rescheduled", "no-show"];
      return bookings.filter(b => !inactiveStatuses.includes(b.status));
  }, [bookings]);

  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleModalOpen(true);
  };

  const handleRescheduleSubmit = async (newDate: Date, newTime: string) => {
    if (!selectedBookingForReschedule) return;
    setIsProcessingReschedule(true);
    try {
        await rescheduleBooking({
            originalBookingId: selectedBookingForReschedule.id,
            newDate: format(newDate, 'yyyy-MM-dd'),
            newTime: newTime,
        });
        toast({
            title: "Reschedule Successful",
            description: "Your lesson has been moved to the new time.",
        });
        setRescheduleModalOpen(false);
        fetchData();
    } catch (error: any) {
        toast({ title: "Reschedule Failed", description: error.message, variant: "destructive"});
    } finally {
        setIsProcessingReschedule(false);
    }
  };

  const isRescheduleAllowed = (booking: Booking) => {
    if (!booking.startTime) return false;
    const lessonDateTime = (booking.startTime as any).toDate();
    if (!isValid(lessonDateTime)) return false;
    const hours = booking.groupSessionId ? 3 : 12;
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };
  
  const getStatusText = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }
  
  return (
    <>
       {activeBookings.map(booking => 
        booking.status === 'payment-pending-confirmation' && !dismissedNotices.includes(booking.id) && (
          <PaymentPendingNotice 
            key={`notice-${booking.id}`} 
            bookingId={booking.id}
            onDismiss={handleDismissNotice}
          />
        )
      )}
      
      {activeBookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">You have no active or upcoming bookings.</p>
      ) : (
          <>
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
                    {activeBookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                        {booking.lessonType || 'Amharic Lesson'}
                        </TableCell>
                        <TableCell>{booking.date !== 'N/A_PACKAGE' ? `${safeFormatDate(booking.startTime, 'PPP, p')}` : 'Package'}</TableCell>
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
                        <TableCell className="text-right space-x-2">
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
                                <DropdownMenuItem 
                                onClick={() => handleRescheduleClick(booking)} 
                                disabled={!isRescheduleAllowed(booking) || isProcessingReschedule}
                                >
                                    {isProcessingReschedule ? <Spinner size="sm" className="mr-2"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                                    Reschedule
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild disabled={!isRescheduleAllowed(booking)}>
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
            
            <div className="md:hidden space-y-4">
                {activeBookings.map((booking) => (
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
                            <span>{booking.date !== 'N/A_PACKAGE' ? safeFormatDate(booking.startTime, 'PPP') : 'Package'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{booking.time !== 'N/A_PACKAGE' ? safeFormatDate(booking.startTime, 'p') : 'N/A'}</span>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        {booking.status === 'confirmed' && <JoinLessonButton booking={booking} />}
                        <div className="grid grid-cols-2 gap-2 w-full">
                            <Button onClick={() => handleRescheduleClick(booking)} disabled={!isRescheduleAllowed(booking) || isProcessingReschedule} variant="outline" size="sm">
                                {isProcessingReschedule ? <Spinner size="sm" className="mr-2"/> : <RefreshCw className="mr-2 h-4 w-4" />}
                                Reschedule
                            </Button>
                            <Button variant="outline" size="sm" asChild disabled={!isRescheduleAllowed(booking)}>
                                <Link href="/credits">
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                </Link>
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
                ))}
            </div>
        </>
      )}

      <RescheduleModal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        onRescheduleConfirm={handleRescheduleSubmit}
        originalBooking={selectedBookingForReschedule}
      />
    </>
  );
}
