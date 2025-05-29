"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, CreditCard, Star, BookOpen, LogOut, Plus, User, MessageSquare, Edit3, Video, XCircle } from "lucide-react" // Added Edit3, Video, XCircle
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, orderBy, Timestamp, doc, updateDoc, deleteDoc } from "firebase/firestore"
import type { Booking, UserProfile as UserProfileType } from "@/lib/types" // Assuming Booking type is defined
import { format } from 'date-fns'
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
} from "@/components/ui/alert-dialog"


export default function StudentDashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(true)
  const [userProfileData, setUserProfileData] = useState<UserProfileType | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    nativeLanguage: "",
    // Add other editable fields here if needed
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // router.push("/login"); // Already handled by useAuth typically
      setIsLoadingBookings(false);
      setIsLoadingProfile(false);
      return;
    }

    // Fetch User Profile Data
    const fetchUserProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
        if (!userDocSnap.empty) {
          const profile = userDocSnap.docs[0].data() as UserProfileType;
          setUserProfileData(profile);
          setEditFormData({
            name: profile.name || user.displayName || "",
            nativeLanguage: profile.nativeLanguage || ""
          });
        } else {
          // Create a basic profile if it doesn't exist (should ideally be done at signup)
           const basicProfile: UserProfileType = {
            uid: user.uid,
            email: user.email || "",
            name: user.displayName || "New User",
            role: "student",
            createdAt: Timestamp.now(),
          };
          await doc(db, "users", user.uid).set(basicProfile);
          setUserProfileData(basicProfile);
           setEditFormData({ name: basicProfile.name, nativeLanguage: "" });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
      } finally {
        setIsLoadingProfile(false);
      }
    };

    // Fetch Bookings
    const fetchBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const bookingsCol = collection(db, "bookings");
        const q = query(bookingsCol, where("userId", "==", user.uid), orderBy("date", "desc"), orderBy("time", "asc"));
        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast({ title: "Error", description: "Could not load your bookings.", variant: "destructive" });
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchUserProfile();
    fetchBookings();

  }, [user, authLoading, toast]);

  const handleProfileEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoadingProfile(true); // Use same loader for saving
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        name: editFormData.name,
        nativeLanguage: editFormData.nativeLanguage,
      });
      // Also update Firebase Auth display name if it changed
      if (user.displayName !== editFormData.name && auth.currentUser) {
        await auth.currentUser.updateProfile({ displayName: editFormData.name });
      }
      setUserProfileData(prev => ({ ...prev, ...editFormData } as UserProfileType)); // Update local state
      toast({ title: "Profile Updated", description: "Your profile has been saved." });
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Update Failed", description: "Could not save your profile.", variant: "destructive" });
    } finally {
      setIsLoadingProfile(false);
    }
  };
  
  const handleCancelBooking = async (bookingId: string) => {
    // Add confirmation dialog here
    try {
      const bookingDocRef = doc(db, "bookings", bookingId);
      // Option 1: Soft delete (mark as cancelled by student)
      await updateDoc(bookingDocRef, { status: "cancelled" }); 
      // Option 2: Hard delete (if preferred, ensure rules allow)
      // await deleteDoc(bookingDocRef);
      
      setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: "cancelled"} : b));
      toast({ title: "Booking Cancelled", description: "Your lesson has been cancelled." });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({ title: "Cancellation Failed", description: "Could not cancel your booking.", variant: "destructive" });
    }
  };


  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" && !isPast(new Date(`${b.date}T${b.time.split(' ')[0]}`))); // More robust past check
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const totalSpent = completedBookings.reduce((sum, b) => sum + b.price, 0);
  const totalHours = completedBookings.reduce((sum, b) => sum + (b.duration || 0), 0) / 60;


  if (authLoading || (!userProfileData && isLoadingProfile)) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /> <p className="ml-3">Loading dashboard...</p></div>;
  }

  if (!user && !authLoading) {
     // This case should ideally be handled by a global redirect in AuthProvider or middleware
     return <div className="min-h-screen flex flex-col items-center justify-center"><p>Please log in to view your dashboard.</p><Button asChild className="mt-4"><Link href="/login">Log In</Link></Button></div>;
  }


  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Your Learning Dashboard</h1>
          <p className="text-lg text-muted-foreground">Welcome back, {userProfileData?.name || user?.displayName}!</p>
        </header>

        {/* Stats Cards */}
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
              <div className="text-2xl font-bold">{completedBookings.length}</div>
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

        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <TabsList className="bg-card border">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="profile">My Profile</TabsTrigger>
            </TabsList>
            <Button asChild>
              <Link href="/bookings">
                <Plus className="w-4 h-4 mr-2" />
                Book New Lesson
              </Link>
            </Button>
          </div>

          <TabsContent value="upcoming">
            {isLoadingBookings ? (
              <div className="flex justify-center items-center h-40"><Spinner /></div>
            ) : upcomingBookings.length === 0 ? (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-2">No Upcoming Lessons</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Ready to continue your LissanHub journey? Book your next lesson with your tutor.
                  </p>
                  <Button asChild>
                    <Link href="/bookings">
                      <Plus className="w-4 h-4 mr-2" />
                      Book Your Next Lesson
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
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
                              {format(new Date(booking.date), "PPP")} at {booking.time}
                            </p>
                            <p className="text-sm text-primary">{booking.duration} minutes with {booking.tutorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                          <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <span className="font-semibold text-foreground">${booking.price}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                                <XCircle className="mr-1 h-4 w-4 md:hidden" />
                                <span className="hidden md:inline">Cancel</span>
                               </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Lesson?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel your lesson on {format(new Date(booking.date), "PPP")} at {booking.time}?
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
                          {/* <Button variant="outline" size="sm">Reschedule</Button> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
             {isLoadingBookings ? (
              <div className="flex justify-center items-center h-40"><Spinner /></div>
            ) : completedBookings.length === 0 && cancelledBookings.length === 0 ? (
                 <Card className="shadow-lg">
                    <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-primary/70 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-foreground mb-2">No Lesson History</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Your completed and cancelled lessons will appear here.
                    </p>
                    </CardContent>
                </Card>
            ) : (
              <div className="space-y-4">
                {bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').map((booking) => (
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
                               {format(new Date(booking.date), "PPP")} at {booking.time}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.duration} minutes with {booking.tutorName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 self-start md:self-center mt-2 md:mt-0 w-full md:w-auto justify-end">
                           <Badge variant={booking.status === "completed" ? "default" : "destructive"} className={booking.status === "completed" ? "" : "opacity-70"}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <span className="font-semibold text-foreground">${booking.price}</span>
                          {booking.status === 'completed' && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href="/testimonials"> 
                                <Star className="mr-1 h-4 w-4" /> Rate
                              </Link>
                            </Button>
                          )}
                          {/* <Button variant="outline" size="sm">View Recording</Button> */}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
                        <User className="w-5 h-5 text-primary" />
                        Profile Information
                        </CardTitle>
                        <CardDescription>Manage your account details and learning preferences.</CardDescription>
                    </div>
                    {!isEditingProfile && <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}><Edit3 className="mr-2 h-4 w-4" />Edit</Button>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                            <Label htmlFor="editName">Full Name</Label>
                            <Input id="editName" name="name" value={editFormData.name} onChange={handleProfileEditInputChange} />
                        </div>
                        <div>
                            <Label htmlFor="editNativeLanguage">Native Language (Optional)</Label>
                            <Input id="editNativeLanguage" name="nativeLanguage" value={editFormData.nativeLanguage} onChange={handleProfileEditInputChange} placeholder="e.g., English, French" />
                        </div>
                        {/* Add other editable fields like country, Amharic level if desired */}
                        <div className="flex gap-2 pt-2">
                            <Button type="submit" disabled={isLoadingProfile}>
                                {isLoadingProfile ? <Spinner size="sm" className="mr-2" /> : null} Save Changes
                            </Button>
                            <Button variant="ghost" type="button" onClick={() => {setIsEditingProfile(false); setEditFormData({name: userProfileData.name || "", nativeLanguage: userProfileData.nativeLanguage || ""});}}>Cancel</Button>
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

        <Button variant="outline" onClick={signOut} className="mt-8 text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
