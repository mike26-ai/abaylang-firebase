

"use client";

import { useState, useEffect, FormEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  BookOpen,
  LogOut,
  Plus,
  User,
  Edit3,
  XCircle,
  Star,
  FileText,
  CheckCircle,
  Megaphone,
  RefreshCw,
  Info,
  Video,
  Ticket,
  AlertTriangle,
  CreditCard,
  History,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db, auth as firebaseAuth } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  Timestamp,
  getDoc,
  limit,
  addDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { updateProfile as updateFirebaseUserProfile } from "firebase/auth";
import type { Booking as BookingType, UserProfile } from "@/lib/types";
import { format, isPast, parse, differenceInHours } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LessonFeedbackModal from "@/components/lesson-feedback-modal";
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
import { SiteLogo } from "@/components/layout/SiteLogo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}


export default function StudentDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    nativeLanguage: "",
    country: "",
    amharicLevel: "",
  });

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<BookingType | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [otherRescheduleReason, setOtherRescheduleReason] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);
  
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<BookingType | null>(null);
  const [cancellationChoice, setCancellationChoice] = useState<'refund' | 'credit' | ''>('');
  const [isCancelling, setIsCancelling] = useState(false);

  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    lessonId: string;
    lessonType: string;
    lessonDate: string;
  }>({
    isOpen: false,
    lessonId: "",
    lessonType: "",
    lessonDate: "",
  });

  const [paymentConfirmDialog, setPaymentConfirmDialog] = useState(false);
  
  // New state for resolution requests from admin-cancelled lessons
  const [resolutionRequest, setResolutionRequest] = useState<{ booking: BookingType, choice: 'refund' | 'credit' } | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const fetchBookingsAndProfile = async (currentUser: any) => {
      setIsLoadingBookings(true);
      setIsLoadingProfile(true);

      try {
        // Fetch profile
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const profile = userDocSnap.data() as UserProfile;
            setUserProfileData(profile);
            setEditFormData({
                name: profile.name || currentUser.displayName || "",
                nativeLanguage: profile.nativeLanguage || "",
                country: profile.country || "",
                amharicLevel: profile.amharicLevel || "beginner",
            });
        } else {
            const basicProfile: UserProfile = {
                uid: currentUser.uid, email: currentUser.email || "", name: currentUser.displayName || "New User",
                role: "student", createdAt: Timestamp.now(), photoURL: currentUser.photoURL || null,
                country: "", amharicLevel: "beginner", nativeLanguage: "",
                showFirstLessonFeedbackPrompt: false, hasSubmittedFirstLessonFeedback: false,
            };
            await setDoc(doc(db, "users", currentUser.uid), basicProfile);
            setUserProfileData(basicProfile);
            setEditFormData({ name: basicProfile.name, nativeLanguage: "", country: "", amharicLevel: "beginner" });
        }
        setIsLoadingProfile(false);

        // Fetch bookings
        const bookingsCol = collection(db, "bookings");
        const q = query(bookingsCol, where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        let fetchedBookings = querySnapshot.docs.map((doc) => ({
            ...(doc.data() as BookingType), id: doc.id, hasReview: false, duration: doc.data().duration || 60
        }));

        fetchedBookings.sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));

        const reviewChecks = fetchedBookings.map(async (booking) => {
            if (booking.status === 'completed') {
                const reviewQuery = query(collection(db, "testimonials"), where("userId", "==", currentUser.uid), where("lessonId", "==", booking.id), limit(1));
                const reviewSnapshot = await getDocs(reviewQuery);
                return { ...booking, hasReview: !reviewSnapshot.empty };
            }
            return booking;
        });

        const bookingsWithReviewStatus = await Promise.all(reviewChecks);
        setBookings(bookingsWithReviewStatus);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "Error", description: "Could not load your dashboard data.", variant: "destructive" });
      } finally {
        setIsLoadingBookings(false);
        setIsLoadingProfile(false);
      }
  };


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoadingBookings(false);
      setIsLoadingProfile(false);
      return;
    }
    fetchBookingsAndProfile(user);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, toast]); 

  const handleProfileEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleProfileSelectChange = (name: string, value: string) => {
     setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firebaseAuth.currentUser) return; 
    
    setIsLoadingProfile(true); 
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedProfileData = {
        name: editFormData.name,
        nativeLanguage: editFormData.nativeLanguage,
        country: editFormData.country,
        amharicLevel: editFormData.amharicLevel,
      };
      await updateDoc(userDocRef, updatedProfileData);

      if (firebaseAuth.currentUser.displayName !== editFormData.name) {
        await updateFirebaseUserProfile(firebaseAuth.currentUser, { displayName: editFormData.name });
      }
      
      setUserProfileData(prev => ({ ...prev, ...updatedProfileData } as UserProfile));

      toast({
        title: "Profile Updated",
        description: "Your changes have been saved.",
      });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update Failed",
        description: "Could not save your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleRateLesson = (booking: DashboardBooking) => {
    setFeedbackModal({
      isOpen: true,
      lessonId: booking.id,
      lessonType: booking.lessonType || "Lesson",
      lessonDate: booking.date,
    });
  };

  const handleFeedbackSubmit = async (feedbackData: { lessonId: string; rating: number; feedbackText: string; specificRatings: Record<string, number>; date: string }) => {
     if (!user || !userProfileData) {
        toast({ title: "Error", description: "You must be logged in to submit feedback.", variant: "destructive"});
        return Promise.reject("User not logged in");
    }
    try {
        await addDoc(collection(db, "testimonials"), {
            userId: user.uid,
            name: userProfileData.name, 
            userEmail: userProfileData.email,
            lessonId: feedbackData.lessonId,
            lessonType: feedbackModal.lessonType,
            lessonDate: feedbackModal.lessonDate, 
            rating: feedbackData.rating,
            comment: feedbackData.feedbackText,
            specificRatings: feedbackData.specificRatings,
            status: "pending",
            createdAt: serverTimestamp(),
        });
        
        if (userProfileData.showFirstLessonFeedbackPrompt) {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, {
            showFirstLessonFeedbackPrompt: false,
            hasSubmittedFirstLessonFeedback: true,
          });
          setUserProfileData(prev => ({ ...prev, showFirstLessonFeedbackPrompt: false, hasSubmittedFirstLessonFeedback: true } as UserProfile));
        }

        setBookings((prev) =>
          prev.map((booking) =>
              booking.id === feedbackData.lessonId
              ? { ...booking, hasReview: true }
              : booking
          )
        );
        toast({ title: "Feedback Submitted", description: "Thank you for your review!"});
        return Promise.resolve();
    } catch (error) {
        console.error("Error submitting testimonial:", error);
        toast({ title: "Submission Error", description: "Could not submit your feedback.", variant: "destructive"});
        return Promise.reject(error);
    }
  };
  
  const openCancellationDialog = (booking: BookingType) => {
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

      if(user) await fetchBookingsAndProfile(user);
      toast({ 
          title: "Cancellation Request Sent", 
          description: "Your request has been logged. View your history for details.", 
      });
      router.push('/credits'); // Redirect to history page
      setCancellationDialogOpen(false);
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast({ title: "Request Failed", description: "Could not send your cancellation request.", variant: "destructive" });
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
        title: "Lesson Cancelled", 
        description: "Please choose a new time for your lesson.",
      });
      if(user) await fetchBookingsAndProfile(user);
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

  const handlePaymentSubmitted = async (bookingId: string) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingDocRef, { status: "payment-pending-confirmation" });
      if(user) await fetchBookingsAndProfile(user);
      setPaymentConfirmDialog(true);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast({ title: "Update Failed", description: "Could not update booking status.", variant: "destructive" });
    }
  };
  
  const handleResolutionRequest = async (booking: BookingType, choice: 'refund' | 'credit') => {
      setResolutionRequest({ booking, choice });
      setIsResolving(true);
      try {
        const bookingDocRef = doc(db, "bookings", booking.id);
        await updateDoc(bookingDocRef, {
            status: 'resolution-requested',
            requestedResolution: choice,
        });
        if(user) await fetchBookingsAndProfile(user);
        toast({ title: "Request Sent", description: `Your request for a ${choice} has been sent to the admin.` });
      } catch (error) {
        console.error("Error sending resolution request:", error);
        toast({ title: "Error", description: "Could not send your request.", variant: "destructive" });
      } finally {
          setIsResolving(false);
          setResolutionRequest(null);
      }
  };


  const getStatusText = (booking: BookingType) => {
    const { status } = booking;
    if (status === 'awaiting-payment') return 'Awaiting Tutor Confirmation';
    if (status === 'payment-pending-confirmation') return 'Pending Confirmation';
    if (status === 'cancellation-requested' || status === 'resolution-requested') return 'Request Pending';
    return status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isRescheduleAllowed = (booking: BookingType) => {
    if (booking.date === 'N/A_PACKAGE') return false; 
    const hours = booking.groupSessionId ? 3 : 12;
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };
  
  const isCancellationAllowed = isRescheduleAllowed;


  const upcomingBookings = useMemo(() => {
    const statusOrder: { [key: string]: number } = { confirmed: 1, 'awaiting-payment': 2, 'payment-pending-confirmation': 3, 'cancellation-requested': 4 };

    return bookings
      .filter(
        (b) =>
          !['completed', 'cancelled', 'cancelled-by-admin', 'refunded', 'credit-issued'].includes(b.status) &&
          b.date !== 'N/A_PACKAGE' &&
          b.time &&
          !isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd HH:mm', new Date()))
      )
      .sort((a, b) => {
        const statusA = a.status as keyof typeof statusOrder;
        const statusB = b.status as keyof typeof statusOrder;
        const statusComparison = (statusOrder[statusA] || 99) - (statusOrder[statusB] || 99);
        if (statusComparison !== 0) return statusComparison;
        const dateA = new Date(a.date + ' ' + (a.time || "00:00")).getTime();
        const dateB = new Date(b.date + ' ' + (b.time || "00:00")).getTime();
        return dateA - dateB;
      });
  }, [bookings]);
  
  const pastBookings = useMemo(() => bookings.filter(
    (b) => ['completed', 'cancelled', 'refunded', 'credit-issued'].includes(b.status) || (b.date !== 'N/A_PACKAGE' && b.time && !['cancelled-by-admin', 'cancellation-requested'].includes(b.status) && isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd HH:mm', new Date())))
  ).sort((a,b) => {
        if (!a.date || !a.time || !b.date || !b.time) return 0;
        return new Date(b.date + ' ' + (b.time || "00:00")).getTime() - new Date(a.date + ' ' + (a.time || "00:00")).getTime()
    }), [bookings]);

  const actionRequiredBookings = useMemo(() => bookings.filter(b => b.status === 'cancelled-by-admin'), [bookings]);
  
  const upcomingLessonsCount = useMemo(() => upcomingBookings.filter(b => ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'].includes(b.status)).length, [upcomingBookings]);
  const completedBookingsCount = useMemo(() => bookings.filter((b) => b.status === "completed").length, [bookings]);
  const totalHours = useMemo(() => bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.duration || 60), 0) / 60, [bookings]);
  
  const mostRecentLessonToReview = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed' && !b.hasReview && b.date)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return parse(b.date, 'yyyy-MM-dd', new Date()).getTime() - parse(a.date, 'yyyy-MM-dd', new Date()).getTime()
      })
      [0];
  }, [bookings]);
  
  const credits = userProfileData?.credits || [];

  if (authLoading || (!userProfileData && isLoadingProfile && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading ABYLANG Dashboard...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Please log in to view your ABYLANG dashboard.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }
  
  const isLoadingAny = isLoadingBookings || isLoadingProfile;


  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <SiteLogo />
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">Student</Badge>
            <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {userProfileData?.name || user?.displayName}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-primary">
              <LogOut className="w-4 h-4 mr-0 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
            My Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your lessons, profile, and access learning materials.
          </p>
        </div>

        {isLoadingAny ? (
            <div className="flex justify-center items-center h-40"><Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading dashboard data...</p></div>
        ) : (
          <>
            {actionRequiredBookings.length > 0 && (
                <Card className="shadow-lg mb-8 bg-gradient-to-r from-destructive/10 to-accent/50 border-destructive/20">
                    <CardContent className="p-6">
                        <h3 className="font-semibold text-lg text-destructive mb-3 flex items-center gap-2">
                           <AlertTriangle className="w-5 h-5"/> Action Required: Lesson Cancellation
                        </h3>
                        {actionRequiredBookings.map(booking => (
                            <div key={booking.id} className="p-4 bg-background/50 rounded-lg border border-destructive/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <p className="font-medium text-foreground">Your {booking.lessonType} lesson on {format(parse(booking.date, 'yyyy-MM-dd', new Date()), 'PPP')} was cancelled by the tutor.</p>
                                    <p className="text-sm text-muted-foreground">Please choose how you would like to be compensated.</p>
                                </div>
                                <div className="flex gap-2 self-start sm:self-center flex-shrink-0">
                                    <Button size="sm" onClick={() => handleResolutionRequest(booking, 'credit')} disabled={isResolving && resolutionRequest?.booking.id === booking.id}>
                                      {isResolving && resolutionRequest?.choice === 'credit' && resolutionRequest?.booking.id === booking.id ? <Spinner size="sm" className="mr-2"/> : <Ticket className="w-4 h-4 mr-2"/>}
                                      Request Credit
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleResolutionRequest(booking, 'refund')} disabled={isResolving && resolutionRequest?.booking.id === booking.id}>
                                       {isResolving && resolutionRequest?.choice === 'refund' && resolutionRequest?.booking.id === booking.id ? <Spinner size="sm" className="mr-2"/> : <CreditCard className="w-4 h-4 mr-2"/>}
                                       Request Refund
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {mostRecentLessonToReview && !userProfileData?.showFirstLessonFeedbackPrompt && (
              <Card className="shadow-lg mb-8 bg-gradient-to-r from-primary/10 to-accent/50 border-primary/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Megaphone className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Review Your Last Lesson</h3>
                      <p className="text-sm text-muted-foreground">
                        How was your &apos;{mostRecentLessonToReview.lessonType}&apos; on {format(parse(mostRecentLessonToReview.date, 'yyyy-MM-dd', new Date()), "PPP")}?
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
            
            {credits.length > 0 && (
                <Card className="shadow-lg mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary"/>
                            My Lesson Credits
                        </CardTitle>
                        <CardDescription>You can use these credits to book the corresponding individual lessons on the booking page.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {credits.map((credit, index) => (
                            <div key={index} className="p-4 bg-accent/50 rounded-lg border border-primary/20 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-foreground capitalize">{credit.lessonType.replace(/-/g, ' ')}</p>
                                    <p className="text-sm text-muted-foreground">Remaining Credits</p>
                                </div>
                                <p className="text-3xl font-bold text-primary">{credit.count}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}


            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{upcomingLessonsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {upcomingBookings.filter(b => b.status === 'awaiting-payment' || b.status === 'payment-pending-confirmation').length} pending
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedBookingsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedBookingsCount} total lessons finished
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">
                    Total learning time
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                        <Link href="/bookings">
                            <Plus className="w-4 h-4 mr-2" />
                            Book New Lesson
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/credits">
                        <History className="w-4 h-4 mr-2" />
                        Manage Credits & History
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6"> 
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <TabsList className="bg-card border w-full sm:w-auto grid grid-cols-3 sm:grid-cols-3">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="profile">My Profile</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="upcoming" className="space-y-4">
                {isLoadingBookings ? (
                  <div className="flex justify-center items-center h-40"><Spinner /></div>
                ) : upcomingBookings.length === 0 ? (
                  <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Calendar className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                      <h3 className="text-2xl font-semibold text-foreground mb-2">No Upcoming Lessons</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Ready to continue your ABYLANG journey? Book your next lesson.
                      </p>
                      <Button asChild>
                        <Link href="/bookings">
                          <Plus className="w-4 h-4 mr-2" /> Book Your Next Lesson
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingBookings.map((booking) => (
                    <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4 flex-grow">
                            <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                               {booking.status === 'confirmed' ? <CheckCircle className="w-6 h-6 text-primary" /> : <Clock className="w-6 h-6 text-yellow-600"/>}
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Amharic Lesson"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}
                              </p>
                              <p className="text-sm text-primary">{booking.duration || 60} minutes with {booking.tutorName}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto">
                             <Badge
                                variant={booking.status === "confirmed" ? "default" : "secondary"}
                                className={booking.status === 'awaiting-payment' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30" : booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30" : booking.status === 'cancellation-requested' || booking.status === 'resolution-requested' ? 'bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30' : ""}
                            >
                               {getStatusText(booking)}
                            </Badge>

                            {booking.status === 'confirmed' && booking.zoomLink ? (
                                <JoinLessonButton booking={booking} />
                            ) : booking.status === 'confirmed' && !booking.zoomLink ? (
                                <p className="text-xs text-muted-foreground text-right">Zoom link will appear here soon.</p>
                            ) : booking.status === 'awaiting-payment' ? (
                                <Button size="sm" onClick={() => handlePaymentSubmitted(booking.id)}>Payment Submitted</Button>
                            ) : booking.status === 'payment-pending-confirmation' || booking.status === 'cancellation-requested' || booking.status === 'resolution-requested' ? (
                                <p className="text-xs text-muted-foreground text-right">Awaiting Admin Action</p>
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
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>


              <TabsContent value="history" className="space-y-4">
                {isLoadingBookings ? (
                  <div className="flex justify-center items-center h-40"><Spinner /></div>
                ) : pastBookings.length === 0 ? (
                  <Card className="shadow-lg"><CardContent className="p-12 text-center"><p className="text-muted-foreground">No past lessons found.</p></CardContent></Card>
                ) : (
                  pastBookings.map((booking) => (
                    <Card key={booking.id} className="shadow-md">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${booking.status === 'completed' ? 'bg-accent' : 'bg-muted'}`}>
                              <BookOpen className={`w-6 h-6 ${booking.status === 'completed' ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Amharic Lesson"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.date !== "N/A_PACKAGE" ? `${format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at ${booking.time}` : 'Package Lesson'}
                              </p>
                              <p className="text-sm text-muted-foreground">{booking.duration || 60} minutes with {booking.tutorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                             <Badge variant={booking.status === "completed" ? "default" : booking.status.includes("cancel") ? "destructive" : "secondary"} className={booking.status === 'awaiting-payment' || booking.status === 'payment-pending-confirmation' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30" : ""}>
                               {getStatusText(booking)}
                            </Badge>
                            {booking.status === 'completed' && (
                              booking.hasReview ? (
                                <Badge variant="secondary" className="bg-accent text-accent-foreground">
                                  <Star className="w-3 h-3 mr-1" /> Reviewed
                                </Badge>
                              ) : (
                                <Button variant="outline" size="sm" onClick={() => handleRateLesson(booking)} className="text-xs border-primary/30 hover:bg-accent">
                                  <Star className="w-4 h-4 mr-1" /> Rate Lesson
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="profile">
                {isLoadingProfile && !userProfileData ? (
                    <div className="flex justify-center items-center h-40"><Spinner /></div>
                ) : userProfileData ? (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Information
                            </CardTitle>
                            <CardDescription>Manage your account details.</CardDescription>
                        </div>
                        {!isEditingProfile && <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button>}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    {isEditingProfile ? (
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="editName">Full Name</Label>
                                    <Input id="editName" name="name" value={editFormData.name} onChange={handleProfileEditInputChange} />
                                </div>
                                <div>
                                    <Label htmlFor="editNativeLanguage">Native Language</Label>
                                    <Input id="editNativeLanguage" name="nativeLanguage" value={editFormData.nativeLanguage} onChange={handleProfileEditInputChange} placeholder="e.g., English" />
                                </div>
                                <div>
                                    <Label htmlFor="editCountry">Country</Label>
                                    <Input id="editCountry" name="country" value={editFormData.country} onChange={handleProfileEditInputChange} placeholder="e.g., USA" />
                                </div>
                                <div>
                                    <Label htmlFor="editAmharicLevel">Amharic Level</Label>
                                    <Select value={editFormData.amharicLevel} onValueChange={(value) => handleProfileSelectChange("amharicLevel", value)}>
                                        <SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="complete-beginner">Complete Beginner</SelectItem>
                                            <SelectItem value="some-words">Know Some Words</SelectItem>
                                            <SelectItem value="basic-conversation">Basic Conversation</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={isLoadingProfile}>
                                    {isLoadingProfile ? <Spinner size="sm" className="mr-2" /> : null} Save Changes
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => {
                                    setIsEditingProfile(false);
                                    if(userProfileData) {
                                      setEditFormData({
                                            name: userProfileData.name || firebaseAuth.currentUser?.displayName || "",
                                            nativeLanguage: userProfileData.nativeLanguage || "",
                                            country: userProfileData.country || "",
                                            amharicLevel: userProfileData.amharicLevel || "beginner"
                                        });
                                    }
                                }}>Cancel</Button>
                            </div>
                        </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                                <p className="text-foreground">{userProfileData.name}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                                <p className="text-foreground">{userProfileData.email}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Country</h4>
                                <p className="text-foreground">{userProfileData.country || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Amharic Level</h4>
                                <p className="text-foreground capitalize">{userProfileData.amharicLevel?.replace(/-/g, " ") || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Native Language</h4>
                                <p className="text-foreground">{userProfileData.nativeLanguage || "Not specified"}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground">Member Since</h4>
                                <p className="text-foreground">{userProfileData.createdAt ? format(userProfileData.createdAt.toDate(), "MMMM yyyy") : "N/A"}</p>
                            </div>
                        </div>
                      </div>
                    )}
                    </CardContent>
                  </Card>
                ) : (
                    <p className="text-muted-foreground">Could not load profile information.</p>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

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
              className="bg-primary hover:bg-primary/90"
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
              className="bg-primary hover:bg-primary/90"
            >
              {isRescheduling && <Spinner size="sm" className="mr-2" />}
              Proceed to Reschedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={paymentConfirmDialog} onOpenChange={setPaymentConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thank You! Your Payment is Processing.</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground space-y-4">
            <p>
              Your booking status has been updated to &apos;Awaiting Confirmation&apos;. Verification is typically instant and often completes within a few minutes.
            </p>
            <p>
              For accountability and to handle any unforeseen delays, we guarantee all payments are verified and your lesson is confirmed within a formal window of <strong>2-3 hours</strong>.
            </p>
            <div className="font-semibold text-foreground pt-2 border-t mt-4">
                <p className="mb-2">If your booking status has not changed to &apos;Confirmed&apos; after 3 hours, please contact us immediately:</p>
                <ul className="space-y-1 list-disc list-inside">
                    <li><a href="/contact" className="text-primary underline">Send a Message</a> via our contact form.</li>
                    <li>Email us directly at <a href="mailto:mahdernmamo@gmail.com" className="text-primary underline">mahdernmamo@gmail.com</a>.</li>
                    <li>Contact us on WhatsApp: <a href="https://wa.me/251991176968" target="_blank" rel="noopener noreferrer" className="text-primary underline">+251991176968</a>.</li>
                </ul>
            </div>
             <p className="mt-4 text-xs">
               For full details, please review our <a href="/faq#payment-policy" className="text-primary underline">Payment and Refund Policies</a>.
             </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPaymentConfirmDialog(false)}>OK, I Understand</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
