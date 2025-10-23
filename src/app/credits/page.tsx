
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, History, Plus, FileClock, CheckCircle, XCircle, Calendar, RefreshCw, Video, AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { UserProfile, Booking } from "@/lib/types";
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { format, parse, parseISO, differenceInHours } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for dialogs
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [otherRescheduleReason, setOtherRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<Booking | null>(null);
  const [cancellationChoice, setCancellationChoice] = <'refund' | 'credit' | ''>>useState('');
  const [isCancelling, setIsCancelling] = useState(false);


  const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfileData(userDocSnap.data() as UserProfile);
        }

        // Fetch all bookings for history and upcoming list
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(fetchedBookings);

      } catch (error) {
        console.error("Error fetching credit data:", error);
        toast({ title: "Error", description: "Could not load your credit information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/credits");
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const history = useMemo(() => bookings, [bookings]);
  
  const upcomingBookings = useMemo(() => {
    return bookings
      .filter(b => !['completed', 'cancelled', 'cancelled-by-admin', 'refunded', 'credit-issued'].includes(b.status) && b.date !== 'N/A_PACKAGE')
      .sort((a,b) => {
          if (!a.date || !a.time || !b.date || !b.time) return 0;
          return new Date(a.date + ' ' + (a.time || "00:00")).getTime() - new Date(b.date + ' ' + (b.time || "00:00")).getTime();
      });
  }, [bookings]);


  const getHistoryItem = (item: Booking) => {
    if (item.date === 'N/A_PACKAGE') {
      return {
        description: `Purchased '${item.lessonType}' package`,
        amount: `+${item.price && item.price > 20 ? '10' : '5'} credits`, // Simplified logic
        icon: <Plus className="w-4 h-4 text-primary" />
      }
    }
    if (item.wasRedeemedWithCredit) {
      return {
        description: `Used 1 credit for '${item.lessonType}'`,
        amount: "-1 credit",
        icon: <CheckCircle className="w-4 h-4 text-green-600" />
      }
    }
    if (item.status === 'credit-issued') {
        return {
            description: `Credit issued for cancelled lesson`,
            amount: `+1 credit`,
            icon: <Plus className="w-4 h-4 text-primary" />
        }
    }
    if (item.status === 'cancellation-requested') {
        return {
            description: `Cancellation requested for '${item.lessonType}'`,
            amount: "Pending",
            icon: <FileClock className="w-4 h-4 text-yellow-600" />
        }
    }
     if (item.status === 'refunded') {
        return {
            description: `Refund processed for '${item.lessonType}'`,
            amount: `$${item.price}`,
            icon: <CheckCircle className="w-4 h-4 text-green-600" />
        }
    }
    if (item.status === 'completed' && !item.wasRedeemedWithCredit) {
         return {
            description: `Completed '${item.lessonType}' (Paid)`,
            amount: `-$${item.price}`,
            icon: <CheckCircle className="w-4 h-4 text-green-600" />
        }
    }
    // Default for other statuses like cancelled, etc.
    return {
      description: `Booking for '${item.lessonType}'`,
      amount: item.status.replace(/-/g, ' '),
      icon: <XCircle className="w-4 h-4 text-destructive" />
    };
  }
  
  const openCancellationDialog = (booking: Booking) => {
    setSelectedBookingForCancellation(booking);
    setCancellationChoice('');
    setCancellationDialogOpen(true);
  };

  const handleCancellationRequest = async () => {
    if (!selectedBookingForCancellation || !cancellationChoice) return;
    setIsCancelling(true);
    try {
      const bookingDocRef = doc(db, "bookings", selectedBookingForCancellation.id);
      await updateDoc(bookingDocRef, {
        status: 'cancellation-requested',
        requestedResolution: cancellationChoice,
        statusHistory: arrayUnion({
          status: 'cancellation-requested',
          changedAt: serverTimestamp(),
          changedBy: 'student',
          reason: `Requested ${cancellationChoice}`,
        }),
      });

      toast({ 
          title: "Cancellation Request Sent", 
          description: "Your request has been logged. View your history for details.", 
      });
      fetchData(); // Re-fetch data to update UI
      setCancellationDialogOpen(false);
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast({ title: "Request Failed", description: "Could not send your cancellation request.", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const openRescheduleDialog = (booking: Booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleReason("");
    setOtherRescheduleReason("");
    setRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBookingForReschedule || !rescheduleReason) return;
    if (rescheduleReason === 'Other' && !otherRescheduleReason.trim()) return;
    
    setIsRescheduling(true);
    const newStatus = "cancelled";
    try {
      const finalReason = rescheduleReason === 'Other' ? `Other: ${otherRescheduleReason.trim()}` : rescheduleReason;
      const bookingDocRef = doc(db, "bookings", selectedBookingForReschedule.id);
      await updateDoc(bookingDocRef, { 
        status: newStatus,
        cancellationReason: `Rescheduled: ${finalReason}`,
        statusHistory: arrayUnion({
            status: newStatus,
            changedAt: serverTimestamp(),
            changedBy: 'student',
            reason: `Rescheduled: ${finalReason}`
        })
      });
      toast({ 
        title: "Lesson Cancelled for Rescheduling", 
        description: "Please choose a new time for your lesson on the booking page.",
      });
      fetchData(); // Re-fetch data
      setRescheduleDialogOpen(false);
      router.push('/bookings');
    } catch (error) {
      console.error("Error during reschedule (cancellation step):", error);
      toast({ 
        title: "Reschedule Failed", 
        description: "Could not cancel your current lesson. Please try again.", 
        variant: "destructive" 
      });
    } finally {
        setIsRescheduling(false);
    }
  };

  const isRescheduleAllowed = (booking: Booking) => {
    if (booking.date === 'N/A_PACKAGE' || !booking.time) return false; 
    const hours = booking.groupSessionId ? 3 : 12;
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };
  
  const isCancellationAllowed = isRescheduleAllowed;


  const credits = userProfileData?.credits || [];

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-3 text-muted-foreground">Loading Your Credits...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          My Credits & History
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          View your available lesson credits, manage upcoming lessons, and track your history.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Upcoming Lessons Section */}
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Lessons
              </CardTitle>
              <CardDescription>Manage your scheduled lessons here.</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                      <Card key={booking.id} className="shadow-sm">
                        <CardContent className="p-4 flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex items-center gap-3 md:gap-4 flex-grow">
                                <div>
                                <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Amharic Lesson"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}
                                </p>
                                </div>
                            </div>
                             <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-center w-full md:w-auto">
                                <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className={booking.status === 'awaiting-payment' || booking.status === 'payment-pending-confirmation' ? 'bg-yellow-400/20 text-yellow-700' : ''}>
                                    {booking.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                                {booking.status === 'confirmed' && booking.zoomLink ? (
                                    <JoinLessonButton booking={booking} />
                                ) : booking.status === 'confirmed' && !booking.zoomLink ? (
                                    <p className="text-xs text-muted-foreground text-right">Zoom link coming soon.</p>
                                ) : null}
                                {(booking.status === 'confirmed' || booking.status === 'awaiting-payment') && (
                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                        <div>
                                            <Button variant="outline" size="sm" className="text-xs" onClick={() => openRescheduleDialog(booking)} disabled={!isRescheduleAllowed(booking)}>
                                            <RefreshCw className="mr-1 h-3 w-3" /> Reschedule
                                            </Button>
                                        </div>
                                        </TooltipTrigger>
                                        {!isRescheduleAllowed(booking) && (
                                        <TooltipContent>
                                            <p>Cannot reschedule within {booking.groupSessionId ? '3' : '12'} hours of the lesson.</p>
                                        </TooltipContent>
                                        )}
                                    </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive text-xs" onClick={() => openCancellationDialog(booking)} disabled={!isCancellationAllowed(booking)}>
                                                        <XCircle className="mr-1 h-3 w-3" /> Cancel
                                                    </Button>
                                                </div>
                                            </TooltipTrigger>
                                            {!isCancellationAllowed(booking) && (
                                            <TooltipContent>
                                                <p>Cannot cancel within {booking.groupSessionId ? '3' : '12'} hours of the lesson.</p>
                                            </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                )}
                             </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>You have no upcoming lessons scheduled.</p>
                 </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>A log of all your credit and booking activities.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(item => {
                      const { description, amount, icon } = getHistoryItem(item);
                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                {icon}
                                <div>
                                    <p className="font-medium text-foreground">{description}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.createdAt ? format(item.createdAt.toDate(), "PPP") : "Recent"}
                                    </p>
                                </div>
                            </div>
                            <Badge variant={amount.startsWith('+') ? 'default' : amount.startsWith('-') ? 'destructive' : 'secondary'} className={amount === 'Pending' ? 'bg-yellow-400/20 text-yellow-700' : ''}>
                                {amount}
                            </Badge>
                        </div>
                      )
                    })}
                </div>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>No transaction history yet.</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credits.length > 0 ? (
                <div className="space-y-4">
                  {credits.map((credit, index) => (
                    <div key={index} className="p-4 bg-accent/50 rounded-lg border border-primary/20 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground capitalize">{credit.lessonType.replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">Remaining Credits</p>
                      </div>
                      <p className="text-3xl font-bold text-primary">{credit.count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have no active lesson packages.</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/bookings">
                  <Plus className="w-4 h-4 mr-2" />
                  Book a Lesson
                </Link>
              </Button>
               <Button asChild variant="outline" className="w-full">
                <Link href="/packages">
                  <Ticket className="w-4 h-4 mr-2" />
                  Buy More Credits
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

       <AlertDialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Lesson Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Please choose how you would like to be compensated for this cancellation. Your request will be sent to the administrator for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">Your lesson on {selectedBookingForCancellation ? format(parse(selectedBookingForCancellation.date, 'yyyy-MM-dd', new Date()), 'PPP') : ''} is eligible for cancellation.</p>
              <div className="flex gap-4">
                  <Button
                      variant={cancellationChoice === 'refund' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setCancellationChoice('refund')}
                  >
                      Request Full Refund
                  </Button>
                  <Button
                      variant={cancellationChoice === 'credit' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setCancellationChoice('credit')}
                  >
                      Request Lesson Credit
                  </Button>
              </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancellationRequest}
              disabled={!cancellationChoice || isCancelling}
            >
              {isCancelling && <Spinner size="sm" className="mr-2" />}
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reschedule Lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will cancel your current lesson. You will then be redirected to the booking page to choose a new time. Please select a reason for rescheduling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="reschedule-reason" className="mb-2 block">Reason for Rescheduling</Label>
                <Select value={rescheduleReason} onValueChange={setRescheduleReason}>
                    <SelectTrigger id="reschedule-reason">
                        <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Scheduling Conflict">Scheduling Conflict</SelectItem>
                        <SelectItem value="Found a Better Time">Found a Better Time</SelectItem>
                        <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                        <SelectItem value="Personal Reasons">Personal Reasons</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {rescheduleReason === 'Other' && (
                <div>
                    <Label htmlFor="other-reason" className="mb-2 block">Please specify your reason</Label>
                    <Textarea 
                        id="other-reason"
                        value={otherRescheduleReason}
                        onChange={(e) => setOtherRescheduleReason(e.target.value)}
                        placeholder="Please provide a brief reason for rescheduling..."
                    />
                </div>
              )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReschedule}
              disabled={!rescheduleReason || (rescheduleReason === 'Other' && !otherRescheduleReason.trim()) || isRescheduling}
            >
              {isRescheduling && <Spinner size="sm" className="mr-2" />}
              Proceed to Reschedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
