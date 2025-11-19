// File: src/components/profile/student-bookings-manager.tsx

"use client";

import { useEffect, useState, useMemo } from "react";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar, Clock, RefreshCw, XCircle } from "lucide-react";
import { format, isValid, parseISO, differenceInHours } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import Link from 'next/link';
import { RescheduleModal } from "@/components/bookings/RescheduleModal";
import { PaymentPendingNotice } from "@/components/profile/PaymentPendingNotice";


// Helper function to safely format dates
const safeFormatDate = (dateInput: any, formatString: string) => {
  if (!dateInput) return 'N/A';
  
  if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
    const date = dateInput.toDate();
    return isValid(date) ? format(date, formatString) : 'Invalid Date';
  }

  if (typeof dateInput === 'string') {
      const date = parseISO(dateInput);
      if(isValid(date)) return format(date, formatString);
  }
  
  if (dateInput instanceof Date && isValid(dateInput)) {
    return format(dateInput, formatString);
  }

  return 'Invalid Date';
};

interface StudentBookingsManagerProps {
    bookings: Booking[];
    isLoading: boolean;
    onDataRefresh: () => void;
    searchTerm: string;
    filterStatus: string;
    sortBy: string;
}

export function StudentBookingsManager({
    bookings,
    isLoading,
    onDataRefresh,
    searchTerm,
    filterStatus,
    sortBy,
}: StudentBookingsManagerProps) {
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);

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

  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => b.lessonType?.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    return [...filtered].sort((a, b) => {
        const timeA = a.startTime ? (typeof a.startTime === 'string' ? parseISO(a.startTime) : (a.startTime as any).toDate()).getTime() : Infinity;
        const timeB = b.startTime ? (typeof b.startTime === 'string' ? parseISO(b.startTime) : (b.startTime as any).toDate()).getTime() : Infinity;
        
        if(sortBy === 'date-asc') return timeA - timeB;
        if(sortBy === 'date-desc') return timeB - timeA;
        return 0; // Default sort
    });
  }, [bookings, searchTerm, filterStatus, sortBy]);


  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleModalOpen(true);
  };

  const isRescheduleAllowed = (booking: Booking) => {
    if (!booking.startTime) return false;
    const lessonDateTime = typeof booking.startTime === 'string' 
      ? parseISO(booking.startTime) 
      : (booking.startTime as any).toDate();
      
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
      {filteredAndSortedBookings.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {searchTerm || filterStatus !== 'all' ? 'No bookings match your filters.' : 'You have no active or upcoming bookings.'}
          </p>
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
                    {filteredAndSortedBookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                        {booking.status === 'payment-pending-confirmation' && !dismissedNotices.includes(booking.id) && (
                            <PaymentPendingNotice 
                                key={`notice-${booking.id}`} 
                                bookingId={booking.id}
                                onDismiss={handleDismissNotice}
                            />
                        )}
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
                                disabled={!isRescheduleAllowed(booking)}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
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
                {filteredAndSortedBookings.map((booking) => (
                <Card key={booking.id} className="shadow-sm">
                    {booking.status === 'payment-pending-confirmation' && !dismissedNotices.includes(booking.id) && (
                        <div className="p-4 border-b">
                            <PaymentPendingNotice 
                                key={`notice-mobile-${booking.id}`} 
                                bookingId={booking.id}
                                onDismiss={handleDismissNotice}
                            />
                        </div>
                    )}
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
                            <Button onClick={() => handleRescheduleClick(booking)} disabled={!isRescheduleAllowed(booking)} variant="outline" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
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
        onRescheduleSuccess={onDataRefresh}
        originalBooking={selectedBookingForReschedule}
      />
    </>
  );
}
