
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  CreditCard,
  Star,
  BookOpen,
  LogOut,
  Plus,
  User,
  MessageSquare,
  Trophy,
  Target,
  Zap,
  Award,
  Download,
  Play,
  FileText,
  Brain,
  TrendingUp,
  Edit3,
  XCircle,
  Video,
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
import { InteractiveCalendar } from "@/components/calendar/interactive-calendar";
import { ProgressCharts, type ProgressData } from "@/components/progress/progress-charts";


interface CalendarLesson {
  id: string;
  date: Date;
  time: string;
  duration: number;
  type: string;
  status: "booked" | "completed" | "cancelled";
}

interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}

// Mock data for ProgressCharts
const mockSkillsData: ProgressData = {
  labels: ["Speaking", "Reading", "Listening", "Writing", "Culture"],
  datasets: [{
    label: "Skill Level",
    data: [85, 70, 75, 60, 90], // Percentages
    // backgroundColor: 'hsl(var(--chart-1))' // Example: Recharts might use 'fill' prop on <Bar>
  }],
};
const mockVocabularyData: ProgressData = { // Placeholder, chart not implemented yet
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [{
    label: "Words Learned",
    data: [50, 70, 100, 130, 180, 247],
  }],
};
const mockLessonData: ProgressData = { // Placeholder, chart not implemented yet
  labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
  datasets: [{
    label: "Lessons Completed",
    data: [2, 3, 2, 4],
  }],
};


export default function StudentDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [calendarLessons, setCalendarLessons] = useState<CalendarLesson[]>([]);
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

  const [currentStreak, setCurrentStreak] = useState(12); 
  const [totalXP, setTotalXP] = useState(850); 
  const [currentLevel, setCurrentLevel] = useState("Intermediate"); 
  const [weeklyGoal, setWeeklyGoal] = useState({ target: 3, completed: 2 }); 

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoadingBookings(true);
    try {
      const bookingsCol = collection(db, "bookings");
      const q = query(
        bookingsCol,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      let fetchedBookings = querySnapshot.docs.map((doc) => {
        const data = doc.data() as BookingType;
        return { ...data, id: doc.id, hasReview: false };
      });

      const testimonialsCol = collection(db, "testimonials");
      const tesimonialsQuery = query(testimonialsCol, where("userId", "==", user.uid), where("lessonId", "!=", null));
      const testimonialsSnapshot = await getDocs(tesimonialsQuery);
      const reviewedLessonIds = new Set(testimonialsSnapshot.docs.map(d => d.data().lessonId));

      fetchedBookings = fetchedBookings.map(b => ({
        ...b,
        hasReview: reviewedLessonIds.has(b.id)
      }));

      setBookings(fetchedBookings);

      const formattedCalendarLessons: CalendarLesson[] = fetchedBookings.map(b => {
        let lessonStatus: CalendarLesson['status'] = "booked";
        if (b.status === "completed") lessonStatus = "completed";
        else if (b.status === "cancelled") lessonStatus = "cancelled";
        
        return {
          id: b.id,
          date: parse(b.date, 'yyyy-MM-dd', new Date()), 
          time: b.time || "N/A",
          duration: b.duration || 0,
          type: b.lessonType || "Lesson",
          status: lessonStatus,
        };
      });
      setCalendarLessons(formattedCalendarLessons);

    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast({
        title: "Error",
        description: "Could not load your bookings.",
        variant: "destructive",
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
        setCurrentLevel(profile.amharicLevel || "Beginner");
      } else {
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
        setCurrentLevel("Beginner");
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
  }, [user, authLoading, toast]); // Added toast to dependencies


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
      setCurrentLevel(updatedProfileData.amharicLevel || "Beginner");

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

  const handleFeedbackSubmit = async (feedbackData: { lessonId: string; rating: number; comment: string; specificRatings: Record<string, number>}) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === feedbackData.lessonId
          ? { ...booking, hasReview: true }
          : booking
      )
    );
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingDocRef, { status: "cancelled" });
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "cancelled" as "cancelled"} : b).filter(b => b.id !== bookingId || b.status !== "cancelled"));
      fetchBookings(); 
      toast({ title: "Booking Cancelled", description: "Your lesson has been cancelled." });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({ title: "Cancellation Failed", description: "Could not cancel your booking.", variant: "destructive" });
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === "confirmed" && !isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd hh:mm a', new Date()))
  );
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled" || (b.status === "confirmed" && isPast(parse(b.date + ' ' + (b.time || "00:00"), 'yyyy-MM-dd hh:mm a', new Date())))
  );
  
  const completedBookingsCount = bookings.filter((b) => b.status === "completed").length;

  const totalSpent = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const totalHours =
    bookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + (b.duration || 0), 0) / 60;

  if (authLoading || (!userProfileData && isLoadingProfile && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading LissanHub Dashboard...</p>
      </div>
    );
  }

  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Please log in to view your LissanHub dashboard.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

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
            Your Learning Journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and manage your LissanHub lessons
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Lessons</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lessons</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookingsCount}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Learned</CardTitle>
              <Clock className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-6"> 
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="bg-card border w-full sm:w-auto grid grid-cols-3 sm:grid-cols-6"> 
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming List</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/bookings">
                <Plus className="w-4 h-4 mr-2" />
                Book New Lesson
              </Link>
            </Button>
          </div>

          <TabsContent value="calendar" className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            ) : bookings.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">No Lessons Scheduled</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Your calendar is empty. Book a lesson to get started!
                  </p>
                  <Button asChild>
                    <Link href="/bookings">
                      <Plus className="w-4 h-4 mr-2" /> Book Your First Lesson
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <InteractiveCalendar
                lessons={calendarLessons}
                onSelectDate={(date) => toast({ title: "Date Selected", description: `Viewing lessons for ${format(date, 'PPP')}`})}
                onSelectLesson={(lesson) => toast({ title: "Lesson Selected", description: `${lesson.type} on ${format(lesson.date, 'PPP')} at ${lesson.time}` })}
              />
            )}
          </TabsContent>


          <TabsContent value="upcoming" className="space-y-4">
            {isLoadingBookings ? (
              <div className="flex justify-center items-center h-40"><Spinner /></div>
            ) : upcomingBookings.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">No Upcoming Lessons</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Ready to continue your LissanHub journey? Book your next lesson.
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
                          <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Lesson"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}
                          </p>
                          <p className="text-sm text-primary">{booking.duration} minutes with {booking.tutorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <span className="font-semibold text-foreground">${booking.price}</span>
                        <Button variant="outline" size="sm" className="text-xs border-primary/30 hover:bg-accent">Reschedule</Button>
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
                                Please check our cancellation policy.
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
                          <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Lesson"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parse(booking.date, 'yyyy-MM-dd', new Date()), "PPP")} at {booking.time}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.duration} minutes with {booking.tutorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                        <Badge variant={booking.status === "completed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"} className={booking.status === "completed" ? "" : "opacity-70"}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        <span className="font-semibold text-foreground">${booking.price}</span>
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
                         {booking.status === 'completed' && (
                           <Button variant="outline" size="sm" className="text-xs border-primary/30 hover:bg-accent"><Video className="mr-1 h-4 w-4" /> View Recording</Button>
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
                        <CardDescription>Manage your account details and learning preferences.</CardDescription>
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
                         <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Learning Streak</h4>
                            <p className="text-foreground">{currentStreak} days (Static)</p>
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

          <TabsContent value="resources" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Homework & Assignments</CardTitle>
                  <CardDescription>Complete your assignments and track your progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><h4 className="font-medium">Family Conversation Practice</h4><p className="text-sm text-muted-foreground">Due: Tomorrow</p></div>
                      <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-500">Pending</Badge>
                    </div>
                     <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div><h4 className="font-medium">Fidel Script Exercise</h4><p className="text-sm text-muted-foreground">Due: Jan 20</p></div>
                      <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">Completed</Badge>
                    </div>
                  </div>
                  <Button asChild className="w-full"><Link href="/resources#assignments">View All Assignments</Link></Button>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> Interactive Quizzes</CardTitle>
                  <CardDescription>Test your knowledge with fun, interactive quizzes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                       <div><h4 className="font-medium">Basic Greetings Quiz</h4><p className="text-sm text-muted-foreground">10 questions • 5 min</p></div>
                       <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /><span className="text-sm">95%</span></div>
                    </div>
                  </div>
                   <Button asChild className="w-full"><Link href="/resources#quizzes">Take a Quiz</Link></Button>
                </CardContent>
              </Card>
               <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /> Vocabulary Builder</CardTitle>
                  <CardDescription>Expand your Amharic vocabulary with flashcards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-accent rounded-lg">
                      <div className="text-2xl font-bold text-primary">247</div><div className="text-sm text-muted-foreground">Words Learned</div>
                    </div>
                    <div className="text-center p-4 bg-accent/70 rounded-lg">
                      <div className="text-2xl font-bold text-primary">15</div><div className="text-sm text-muted-foreground">Daily Goal</div>
                    </div>
                  </div>
                   <Button asChild className="w-full"><Link href="/resources#flashcards">Practice Flashcards</Link></Button>
                </CardContent>
              </Card>
               <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" /> Digital Learning Materials</CardTitle>
                  <CardDescription>Interactive flipbooks and study materials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer">
                    <div><h4 className="font-medium">Amharic Alphabet Flipbook</h4><p className="text-sm text-muted-foreground">Interactive Fidel guide</p></div>
                    <Button size="sm" variant="outline" asChild><Link href="/resources#flipbooks"><Play className="w-4 h-4 mr-1" /> Open</Link></Button>
                  </div>
                   <Button asChild className="w-full"><Link href="/resources#flipbooks">View All Materials</Link></Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressCharts 
                skillsData={mockSkillsData} 
                vocabularyData={mockVocabularyData} 
                lessonData={mockLessonData} 
            />
          </TabsContent>
        </Tabs>
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

```