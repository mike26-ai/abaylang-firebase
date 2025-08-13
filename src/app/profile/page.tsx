
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
} from "firebase/firestore";
import { updateProfile as updateFirebaseUserProfile } from "firebase/auth";
import type { Booking as BookingType, UserProfile } from "@/lib/types";
import { format, isPast, parse } from "date-fns";
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
import { Logo } from "@/components/layout/logo";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}

export default function StudentDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
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
  const fetchBookings = async () => {
    if (!user) {
      setIsLoadingBookings(false);
      return;
    }
    setIsLoadingBookings(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(
        bookingsCol,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
  
      const querySnapshot = await getDocs(q);
      const fetchedBookings = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as BookingType),
          id: doc.id,
          hasReview: false, // Default to false
          duration: doc.data().duration || 60
      }));

      // Now, for each COMPLETED booking, check if a review exists.
      const reviewChecks = fetchedBookings.map(async (booking) => {
        if (booking.status === 'completed') {
          const testimonialsCol = collection(db, "testimonials");
          const reviewQuery = query(
              testimonialsCol, 
              where("userId", "==", user.uid), 
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
  
    } catch (error: any) {
      console.error("CRITICAL ERROR fetching data in dashboard:", error);
      toast({
        title: "Error Loading Dashboard",
        description: "Could not load booking information. Please check your connection.",
        variant: "destructive",
        duration: 9000,
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };
  const fetchUserProfile = async () => {
    if (!user) return;
    setIsLoadingProfile(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const profile = userDocSnap.data() as UserProfile;
        setUserProfileData(profile);
        setEditFormData({
          name: profile.name || user.displayName || "",
          nativeLanguage: profile.nativeLanguage || "",
          country: profile.country || "",
          amharicLevel: profile.amharicLevel || "beginner",
        });
      } else {
        // Create a basic profile if it doesn't exist
        const basicProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || "New User",
          role: "student",
          createdAt: Timestamp.now(),
          photoURL: user.photoURL || null,
          country: "",
          amharicLevel: "beginner",
          nativeLanguage: "",
        };
        await setDoc(doc(db, "users", user.uid), basicProfile);
        setUserProfileData(basicProfile);
        setEditFormData({ name: basicProfile.name, nativeLanguage: "", country: "", amharicLevel: "beginner" });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Could not load your profile data.",
        variant: "destructive",
      });
    } finally {
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
    fetchUserProfile();
    fetchBookings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]); 

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
        description: "Your profile has been saved.",
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
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingDocRef, { status: "cancelled" });
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "cancelled" as "cancelled"} : b));
      toast({ title: "Booking Cancelled", description: "Your lesson has been cancelled." });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({ title: "Cancellation Failed", description: "Could not cancel your booking.", variant: "destructive" });
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => (b.status === "confirmed" || b.status === "pending") && !isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd HH:mm', new Date()))
  ).sort((a,b) => new Date(a.date + ' ' + (a.time || "00:00")).getTime() - new Date(b.date + ' ' + (b.time || "00:00")).getTime());

  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled" || ((b.status === "confirmed" || b.status === "pending") && isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd HH:mm', new Date())))
  ).sort((a,b) => new Date(b.date + ' ' + (b.time || "00:00")).getTime() - new Date(a.date + ' ' + (a.time || "00:00")).getTime());
  
  const confirmedUpcomingCount = upcomingBookings.filter(b => b.status === 'confirmed').length;
  const completedBookingsCount = bookings.filter((b) => b.status === "completed").length;
  const totalHours = bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + (b.duration || 60), 0) / 60;
  
  const mostRecentLessonToReview = useMemo(() => {
    return bookings
      .filter(b => b.status === 'completed' && !b.hasReview)
      .sort((a, b) => parse(b.date, 'yyyy-MM-dd', new Date()).getTime() - parse(a.date, 'yyyy-MM-dd', new Date()).getTime())
      [0];
  }, [bookings]);


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
          <Logo />
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
            {mostRecentLessonToReview && (
              <Card className="shadow-lg mb-8 bg-gradient-to-r from-primary/10 to-accent/50 border-primary/20">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Megaphone className="w-8 h-8 text-primary" />
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">Review Your Last Lesson</h3>
                      <p className="text-sm text-muted-foreground">
                        How was your '{mostRecentLessonToReview.lessonType}' on {format(parse(mostRecentLessonToReview.date, 'yyyy-MM-dd', new Date()), "PPP")}?
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
                  <Calendar className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{confirmedUpcomingCount}</div>
                   <p className="text-xs text-muted-foreground">{upcomingBookings.length - confirmedUpcomingCount} pending confirmation</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
                  <BookOpen className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completedBookingsCount}</div>
                   <p className="text-xs text-muted-foreground">&nbsp;</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
                  <Clock className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                   <p className="text-xs text-muted-foreground">&nbsp;</p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/bookings">
                            <Plus className="w-4 h-4 mr-2" />
                            Book New Lesson
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link href="/submit-testimonial">
                        <FileText className="w-4 h-4 mr-2" />
                        Write a Testimonial
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-6"> 
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <TabsList className="bg-card border w-full sm:w-auto grid grid-cols-2 sm:grid-cols-3">
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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
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
                          <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                            <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className={booking.status === "pending" ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-500" : ""}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive text-xs">
                                  <XCircle className="mr-1 h-3 w-3 md:hidden" />
                                  <span className="hidden md:inline">Cancel</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Lesson?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to cancel your lesson on {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}?
                                    (Please check our 12-hour cancellation policy).
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep Lesson</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCancelBooking(booking.id)} className="bg-destructive hover:bg-destructive/90">
                                    Yes, Cancel Lesson
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
                                {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}
                              </p>
                              <p className="text-sm text-muted-foreground">{booking.duration || 60} minutes with {booking.tutorName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                            <Badge variant={booking.status === "completed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"} className={booking.status === "completed" ? "" : "opacity-70"}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
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
    </div>
  );
}
