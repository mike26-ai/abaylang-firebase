
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Star,
  Megaphone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Booking as BookingType } from "@/lib/types";
import { format, parse, differenceInHours, isValid } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import LessonFeedbackModal from "@/components/lesson-feedback-modal";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactEmail } from "@/config/site";


interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    lessonId: "",
    lessonType: "",
    lessonDate: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<BookingType | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [otherRescheduleReason, setOtherRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<BookingType | null>(null);
  const [cancellationChoice, setCancellationChoice] = useState<'refund' | 'credit' | ''>('');
  const [cancellationReason, setCancellationReason] = useState("");
  const [otherCancellationReason, setOtherCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const newBookingId = searchParams.get('booking_id');
    const isNewBooking = searchParams.get('new_booking') === 'true';
    const bookingType = searchParams.get('type');

    if (isNewBooking && newBookingId && bookingType === 'paid') {
      const alreadyShown = localStorage.getItem(`booking_confirmation_shown_${newBookingId}`);
      if (!alreadyShown) {
        setShowConfirmation(true);
        localStorage.setItem(`booking_confirmation_shown_${newBookingId}`, 'true');
      }
    }
  }, [searchParams]);

  const fetchDashboardData = async (currentUser: any) => {
    setIsLoading(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(
        bookingsCol,
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);

      let fetchedBookings = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as BookingType),
        id: doc.id,
        hasReview: false,
        duration: doc.data().duration || 60,
      }));

      const reviewChecks = fetchedBookings.map(async (booking) => {
        if (booking.status === "completed") {
          const reviewQuery = query(
            collection(db, "testimonials"),
            where("userId", "==", currentUser.uid),
            where("lessonId", "==", booking.id),
            limit(1)
          );
          const reviewSnapshot = await getDocs(reviewQuery);
          return { ...booking, hasReview: !reviewSnapshot.empty };
        }
        return booking;
      });

      const bookingsWithReviewStatus = await Promise.all(reviewChecks);
      setBookings(bookingsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Could not load your dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      return;
    }
    fetchDashboardData(user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleRateLesson = (booking: DashboardBooking) => {
    setFeedbackModal({
      isOpen: true,
      lessonId: booking.id,
      lessonType: booking.lessonType || "Lesson",
      lessonDate: booking.date,
    });
  };

  const handleFeedbackSubmit = async () => {
    if (user) {
      fetchDashboardData(user);
    }
  };

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter(
          (b) =>
            !["completed", "cancelled", "cancelled-by-admin", "refunded", "credit-issued"].includes(
              b.status
            ) && b.date !== "N/A_PACKAGE"
        )
        .sort((a, b) => {
          if (!a.date || !a.time) return -1;
          if (!b.date || !b.time) return 1;
          const dateA = parse(`${a.date} ${a.time}`, 'yyyy-MM-dd HH:mm', new Date());
          const dateB = parse(`${b.date} ${b.time}`, 'yyyy-MM-dd HH:mm', new Date());
          return dateA.getTime() - dateB.getTime();
        }),
    [bookings]
  );
  
  const completedBookingsCount = useMemo(
    () => bookings.filter((b) => b.status === "completed").length,
    [bookings]
  );
  const totalHours = useMemo(
    () =>
      bookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + (b.duration || 60), 0) / 60,
    [bookings]
  );

  const mostRecentLessonToReview = useMemo(() => {
    return bookings
      .filter((b) => b.status === "completed" && !b.hasReview && b.date !== "N/A_PACKAGE")
      .sort((a, b) => {
        const dateA = a.date ? parse(a.date, "yyyy-MM-dd", new Date()).getTime() : 0;
        const dateB = b.date ? parse(b.date, "yyyy-MM-dd", new Date()).getTime() : 0;
        return dateB - dateA;
      })[0];
  }, [bookings]);

  const openCancellationDialog = (booking: BookingType) => {
    setSelectedBookingForCancellation(booking);
    setCancellationChoice('');
    setCancellationReason('');
    setOtherCancellationReason('');
    setCancellationDialogOpen(true);
  };

  const handleCancellationRequest = async () => {
    if (!selectedBookingForCancellation || !cancellationChoice || !cancellationReason) {
        toast({ title: "Incomplete", description: "Please select a compensation type and a reason.", variant: "destructive" });
        return;
    }
    if (cancellationReason === 'Other' && !otherCancellationReason.trim()) {
        toast({ title: "Incomplete", description: "Please specify your reason for cancellation.", variant: "destructive" });
        return;
    }

    setIsCancelling(true);
    try {
      const finalReason = cancellationReason === 'Other' ? `Other: ${otherCancellationReason.trim()}` : cancellationReason;
      
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication error");

      const response = await fetch('/api/bookings/request-cancellation', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
              bookingId: selectedBookingForCancellation.id,
              resolutionChoice: cancellationChoice,
              reason: finalReason,
          }),
      });

      const result = await response.json();
      if (!response.ok) {
          throw new Error(result.error || 'Failed to send cancellation request.');
      }

      toast({ 
          title: "Cancellation Request Sent", 
          description: "Your request has been sent to the administrator for review.", 
      });
      if(user) fetchDashboardData(user);
      setCancellationDialogOpen(false);
    } catch (error: any) {
      console.error("Error requesting cancellation:", error);
      toast({ title: "Request Failed", description: error.message || "Could not send your cancellation request.", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };

  const openRescheduleDialog = (booking: BookingType) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleReason("");
    setOtherRescheduleReason("");
    setRescheduleDialogOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBookingForReschedule || !rescheduleReason) return;
    if (rescheduleReason === 'Other' && !otherRescheduleReason.trim()) return;
    
    setIsRescheduling(true);
    try {
       const finalReason = rescheduleReason === 'Other' ? `Other: ${otherRescheduleReason.trim()}` : rescheduleReason;
      
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication error");

       const response = await fetch('/api/bookings/request-cancellation', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
              bookingId: selectedBookingForReschedule.id,
              resolutionChoice: 'reschedule',
              reason: finalReason,
          }),
      });

       const result = await response.json();
      if (!response.ok) {
          throw new Error(result.error || 'Failed to process reschedule request.');
      }

      toast({ 
        title: "Lesson Cancelled for Rescheduling", 
        description: "Please choose a new time for your lesson on the booking page.",
      });
      if(user) fetchDashboardData(user);
      setRescheduleDialogOpen(false);
      router.push('/bookings');
    } catch (error: any) {
      console.error("Error during reschedule (cancellation step):", error);
      toast({ 
        title: "Reschedule Failed", 
        description: error.message || "Could not cancel your current lesson. Please try again.", 
        variant: "destructive" 
      });
    } finally {
        setIsRescheduling(false);
    }
  };

  const isRescheduleAllowed = (booking: BookingType) => {
    if (booking.date === 'N/A_PACKAGE' || !booking.time) return false; 
    const hours = booking.groupSessionId ? 3 : 12;
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };
  
  const isCancellationAllowed = isRescheduleAllowed;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.displayName}! Here is your learning overview.</p>
        </header>

      {mostRecentLessonToReview && (
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-accent/50 border-primary/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Megaphone className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg text-foreground">
                  Review Your Last Lesson
                </h3>
                <p className="text-sm text-muted-foreground">
                  How was your &apos;{mostRecentLessonToReview.lessonType}&apos; on{" "}
                  {mostRecentLessonToReview.date && isValid(parse(mostRecentLessonToReview.date, "yyyy-MM-dd", new Date())) 
                      ? format(parse(mostRecentLessonToReview.date, "yyyy-MM-dd", new Date()), "PPP")
                      : "a recent date"
                  }?
                </p>
              </div>
            </div>
            <Button onClick={() => handleRateLesson(mostRecentLessonToReview)}>
              <Star className="w-4 h-4 mr-2" />
              Leave Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Lessons
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            <p className="text-xs text-muted-foreground">View and manage lessons below</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Lessons
            </CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedBookingsCount}</div>
            <Link href="/profile/history" className="text-xs text-muted-foreground hover:underline">
              View lesson history
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Upcoming & Actionable Lessons</CardTitle>
            <CardDescription>Manage your scheduled lessons that have not yet been completed.</CardDescription>
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
                                    {booking.date && isValid(parse(booking.date, 'yyyy-MM-dd', new Date())) ? format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP") : 'Date not set'} at {booking.time}
                                </p>
                                </div>
                            </div>
                             <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-center w-full md:w-auto">
                                <p className="text-xs text-muted-foreground capitalize">{booking.status.replace(/-/g, ' ')}</p>
                                {booking.status === 'confirmed' && booking.zoomLink ? (
                                    <JoinLessonButton booking={booking} />
                                ) : booking.status === 'confirmed' && !booking.zoomLink ? (
                                    <p className="text-xs text-muted-foreground text-right">Zoom link coming soon.</p>
                                ) : null}
                                {(booking.status === 'confirmed' || booking.status === 'payment-pending-confirmation') && (
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
                <div className="text-center py-10">
                    <p className="text-muted-foreground mb-4">You have no upcoming lessons scheduled.</p>
                    <Button asChild>
                        <Link href="/bookings">
                            <Plus className="w-4 h-4 mr-2" /> Book a New Lesson
                        </Link>
                    </Button>
                </div>
            )}
        </CardContent>
      </Card>
      
      <LessonFeedbackModal
        lessonId={feedbackModal.lessonId}
        lessonType={feedbackModal.lessonType}
        lessonDate={feedbackModal.lessonDate}
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
        onSubmit={handleFeedbackSubmit}
      />

       <AlertDialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Lesson Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Please choose how you would like to be compensated for this cancellation and provide a reason. Your request will be sent to the administrator for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">Your lesson on {selectedBookingForCancellation && selectedBookingForCancellation.date ? format(parse(selectedBookingForCancellation.date, 'yyyy-MM-dd', new Date()), 'PPP') : ''} is eligible for cancellation.</p>
              
              <div>
                <Label>Compensation Choice</Label>
                <div className="flex gap-4 mt-2">
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

              <div>
                <Label htmlFor="cancellation-reason">Reason for Cancelling</Label>
                 <Select value={cancellationReason} onValueChange={setCancellationReason}>
                    <SelectTrigger id="cancellation-reason">
                        <SelectValue placeholder="Select a reason..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Scheduling Conflict">Scheduling Conflict</SelectItem>
                        <SelectItem value="Technical Issues">Technical Issues</SelectItem>
                        <SelectItem value="Personal Reasons">Personal Reasons</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              {cancellationReason === 'Other' && (
                <div>
                    <Label htmlFor="other-cancellation-reason">Please specify</Label>
                    <Textarea 
                        id="other-cancellation-reason"
                        value={otherCancellationReason}
                        onChange={(e) => setOtherCancellationReason(e.target.value)}
                        placeholder="Please provide a brief reason for cancelling..."
                    />
                </div>
              )}

          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancellationRequest}
              disabled={!cancellationChoice || !cancellationReason || (cancellationReason === 'Other' && !otherCancellationReason.trim()) || isCancelling}
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
              This action will cancel your current lesson and redirect you to the booking page to choose a new time. Please select a reason for rescheduling.
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

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Payment Submitted & Awaiting Confirmation</AlertDialogTitle>
                <AlertDialogDescription>
                    Your payment has been successfully submitted for processing. Once your payment is confirmed by the tutor, your lesson will be officially confirmed, and a Zoom link will be provided on your dashboard.
                    <br/><br/>
                    Confirmation usually takes **2-3 hours**. If your lesson is not confirmed within this timeframe, please contact us for immediate assistance.
                    <div className="mt-4 text-sm space-y-1">
                      <p><strong>Email:</strong> <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a></p>
                      <p><strong>WhatsApp:</strong> +251 99 117 6968</p>
                      <p><Link href="/privacy" className="underline">Review our payment and refund policy</Link></p>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setShowConfirmation(false)}>
                    OK, I understand
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
