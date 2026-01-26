
"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs, orderBy, query, updateDoc, doc, deleteDoc, getDoc, where, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking, UserProfile } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, CreditCard, MessageCircle, Link as LinkIcon, Calendar, Clock, User, Check, Ban, Search } from "lucide-react";
import { format, isValid, parseISO, isPast } from 'date-fns';
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
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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

export function BookingsManager() {
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [zoomLinkData, setZoomLinkData] = useState<{ isOpen: boolean; booking: Booking | null; link: string; isSaving: boolean }>({ isOpen: false, booking: null, link: "", isSaving: false });
  const [deleteConfirmation, setDeleteConfirmation] = useState<Booking | null>(null);

  // State for tabs, search and filter
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");


  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(bookingsCol, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setAllBookings(fetchedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({ title: "Error Fetching Bookings", description: "Could not load booking data. Please check your connection and try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const { activeBookings, archivedBookings } = useMemo(() => {
    const terminalStatuses = ["completed", "cancelled", "cancelled-by-admin", "refunded", "credit-issued", "rescheduled", "no-show"];
    const active: Booking[] = [];
    const archived: Booking[] = [];

    allBookings.forEach(booking => {
      const startTime = booking.startTime ? (typeof booking.startTime === 'string' ? parseISO(booking.startTime) : (booking.startTime as any).toDate()) : null;
      const isLessonInPast = startTime ? isPast(startTime) : booking.status === 'completed';

      if (terminalStatuses.includes(booking.status) || (isLessonInPast && booking.status !== 'confirmed' && booking.status !== 'in-progress')) {
        archived.push(booking);
      } else {
        active.push(booking);
      }
    });

    return { activeBookings: active, archivedBookings: archived };
  }, [allBookings]);
  
  const filteredAndSortedBookings = useMemo(() => {
    const source = activeTab === 'active' ? activeBookings : archivedBookings;
    let filtered = source;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(b => 
          b.lessonType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return [...filtered].sort((a, b) => {
        const timeA = a.startTime ? (typeof a.startTime === 'string' ? parseISO(a.startTime) : (a.startTime as any).toDate()).getTime() : Infinity;
        const timeB = b.startTime ? (typeof b.startTime === 'string' ? parseISO(b.startTime) : (b.startTime as any).toDate()).getTime() : Infinity;
        
        if (sortBy === 'date-asc') return timeA - timeB;
        if (sortBy === 'date-desc') return timeB - timeA;
        return 0;
    });
  }, [activeTab, activeBookings, archivedBookings, searchTerm, filterStatus, sortBy]);


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
  
  const getStatusText = (status: string) => {
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusVariant = (status: Booking['status']): 'default' | 'secondary' | 'destructive' => {
      switch (status) {
          case 'confirmed':
          case 'in-progress':
              return 'default';
          case 'completed':
          case 'payment-pending-confirmation':
          case 'awaiting-payment':
          case 'cancellation-requested':
          case 'credit-issued':
          case 'rescheduled':
              return 'secondary';
          case 'cancelled':
          case 'cancelled-by-admin':
          case 'no-show':
          case 'refunded':
              return 'destructive';
          default:
              return 'secondary';
      }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <>
      <div className="mb-4 grid sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
            <Input placeholder="Search by lesson, name, email..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger><SelectValue placeholder="Filter by status..." /></SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="cancellation-requested">Cancellation Requested</SelectItem>
                <SelectItem value="payment-pending-confirmation">Payment Pending</SelectItem>
            </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger><SelectValue placeholder="Sort by..." /></SelectTrigger>
            <SelectContent>
                <SelectItem value="date-asc">Soonest First</SelectItem>
                <SelectItem value="date-desc">Latest First</SelectItem>
            </SelectContent>
        </Select>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active & Upcoming</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
            {filteredAndSortedBookings.length === 0 ? <p className="text-muted-foreground text-center py-10">No active bookings match your criteria.</p> : renderBookings(filteredAndSortedBookings)}
        </TabsContent>
        <TabsContent value="archived" className="mt-6">
            {filteredAndSortedBookings.length === 0 ? <p className="text-muted-foreground text-center py-10">No archived bookings match your criteria.</p> : renderBookings(filteredAndSortedBookings)}
        </TabsContent>
      </Tabs>
      
      {/* Modals and Dialogs */}
      <Dialog open={zoomLinkData.isOpen} onOpenChange={(isOpen) => !isOpen && setZoomLinkData({ isOpen: false, booking: null, link: "", isSaving: false })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Zoom Link</DialogTitle>
            <DialogDescription>
              Provide the Zoom meeting link for the lesson with {zoomLinkData.booking?.userName} on {zoomLinkData.booking?.date ? safeFormatDate(zoomLinkData.booking.date, 'PPP') : ''}.
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
              This action cannot be undone. This will permanently delete the booking for {deleteConfirmation?.userName} on {deleteConfirmation?.date !== 'N/A_PACKAGE' ? safeFormatDate(deleteConfirmation?.date, 'PPP') : 'a package'}.
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

  function renderBookings(bookingsToRender: Booking[]) {
    return (
        <>
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
            {bookingsToRender.map((booking) => (
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
                <TableCell>{booking.date !== 'N/A_PACKAGE' ? safeFormatDate(booking.date, 'PPP') : 'Package'}</TableCell>
                <TableCell>{booking.time !== 'N/A_PACKAGE' ? booking.time : 'N/A'}</TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(booking.status)}
                    className={
                      booking.status === 'awaiting-payment' ? "bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30" 
                      : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30"
                      : booking.status === 'in-progress' ? "bg-green-400/20 text-green-700 dark:text-green-500 border-green-400/30 animate-pulse"
                      : booking.status === 'cancellation-requested' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30"
                      : ""
                      }
                  >
                    {getStatusText(booking.status)}
                  </Badge>
                </TableCell>
                <TableCell>{safeFormatDate(booking.createdAt, 'PPp')}</TableCell>
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
                        {booking.status === 'in-progress' && (
                            <DropdownMenuItem onClick={() => updateBookingStatus(booking, 'completed')}>
                                <Check className="mr-2 h-4 w-4 text-green-500" /> Mark as Completed
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setZoomLinkData({ isOpen: true, booking, link: booking.zoomLink || '', isSaving: false })}>
                          <LinkIcon className="mr-2 h-4 w-4" /> {booking.zoomLink ? "Edit" : "Add"} Zoom Link
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking, "no-show")} disabled={booking.status === 'no-show'}>
                            <Ban className="mr-2 h-4 w-4 text-orange-500" /> Mark as No-Show
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateBookingStatus(booking, "cancelled-by-admin")} disabled={booking.status.includes('cancelled')}>
                          <XCircle className="mr-2 h-4 w-4 text-red-500" /> Cancel Lesson
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

      <div className="md:hidden space-y-4">
        {bookingsToRender.map((booking) => (
          <Card key={booking.id} className="shadow-md">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle className="text-lg">{booking.userName}</CardTitle>
                      <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                  </div>
                  <Badge
                    variant={getStatusVariant(booking.status)}
                    className={
                        booking.status === 'awaiting-payment' ? "bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30" 
                        : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30"
                        : booking.status === 'in-progress' ? "bg-green-400/20 text-green-700 dark:text-green-500 border-green-400/30 animate-pulse"
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
                <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Booked on {safeFormatDate(booking.createdAt, 'PP')}</span>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                 {(booking.status === 'awaiting-payment' || booking.status === 'payment-pending-confirmation') && (
                    <Button onClick={() => updateBookingStatus(booking, "confirmed")} className="w-full" size="sm">
                        <CreditCard className="mr-2 h-4 w-4" /> Confirm Payment
                    </Button>
                 )}
                 {booking.status === 'in-progress' && (
                    <Button onClick={() => updateBookingStatus(booking, 'completed')} className="w-full" size="sm">
                        <Check className="mr-2 h-4 w-4" /> Mark as Completed
                    </Button>
                 )}
                 <div className="grid grid-cols-2 gap-2 w-full">
                    <Button onClick={() => updateBookingStatus(booking, "no-show")} disabled={booking.status === 'no-show'} variant="outline" size="sm">
                        <Ban className="mr-2 h-4 w-4" /> No-Show
                    </Button>
                     <Button onClick={() => updateBookingStatus(booking, "cancelled-by-admin")} disabled={booking.status.includes('cancelled')} variant="outline" size="sm">
                        <XCircle className="mr-2 h-4 w-4" /> Cancel
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
        </>
    )
  }
}
