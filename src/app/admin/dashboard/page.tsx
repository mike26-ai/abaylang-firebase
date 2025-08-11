
"use client";

import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  DollarSign,
  Users,
  Star,
  BookOpenText,
  CheckCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  getCountFromServer,
  Timestamp,
  orderBy,
  limit,
  updateDoc,
  doc,
} from "firebase/firestore";
import { format, startOfDay } from "date-fns";
import { Logo } from "@/components/layout/logo";
import type { Booking, Testimonial, ContactMessage, UserProfile } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";


interface DashboardStats {
  upcomingBookings: number;
  pendingTestimonialsCount: number;
  newInquiries: number;
  totalStudents: number;
  totalRevenue: number; 
  averageRating: number; 
}

// Define action type for spinner logic
type TestimonialActionType = "approved" | "rejected" | null;

export default function AdminDashboardPage() {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    upcomingBookings: 0,
    pendingTestimonialsCount: 0,
    newInquiries: 0,
    totalStudents: 0,
    totalRevenue: 0, // Will be calculated or remain placeholder
    averageRating: 0, // Will be calculated or remain placeholder
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [pendingTestimonials, setPendingTestimonials] = useState<Testimonial[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [recentStudents, setRecentStudents] = useState<UserProfile[]>([]);
  
  const [updatingTestimonial, setUpdatingTestimonial] = useState<{ id: string | null; action: TestimonialActionType }>({ id: null, action: null });


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!isAdmin) {
      router.push("/profile"); 
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoadingStats(true);
      try {
        const today = format(startOfDay(new Date()), "yyyy-MM-dd");

        // --- OPTIMIZATION: Run queries in parallel ---
        const upcomingBookingsQuery = query(collection(db, "bookings"), where("date", ">=", today), where("status", "==", "confirmed"));
        const pendingTestimonialsQuery = query(collection(db, "testimonials"), where("status", "==", "pending"));
        const newInquiriesQuery = query(collection(db, "contactMessages"), where("read", "==", false));
        const totalStudentsQuery = query(collection(db, "users"), where("role", "==", "student"));
        const recentBookingsQuery = query(collection(db, "bookings"), orderBy("createdAt", "desc"), limit(5));
        const recentMessagesQuery = query(collection(db, "contactMessages"), orderBy("createdAt", "desc"), limit(5));
        const recentStudentsQuery = query(collection(db, "users"), where("role", "==", "student"), orderBy("createdAt", "desc"), limit(5));
        const latestPendingTestimonialsQuery = query(pendingTestimonialsQuery, orderBy("createdAt", "desc"), limit(5));
        
        const [
          upcomingBookingsSnapshot,
          pendingTestimonialsSnapshot,
          newInquiriesSnapshot,
          totalStudentsSnapshot,
          recentBookingsDocs,
          recentMessagesDocs,
          recentStudentsDocs,
          latestPendingTestimonialsDocs,
        ] = await Promise.all([
          getCountFromServer(upcomingBookingsQuery),
          getCountFromServer(pendingTestimonialsQuery),
          getCountFromServer(newInquiriesQuery),
          getCountFromServer(totalStudentsQuery),
          getDocs(recentBookingsQuery),
          getDocs(recentMessagesQuery),
          getDocs(recentStudentsQuery),
          getDocs(latestPendingTestimonialsQuery)
        ]);
        // --- END OPTIMIZATION ---


        setPendingTestimonials(latestPendingTestimonialsDocs.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial)));
        setRecentBookings(recentBookingsDocs.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
        setRecentMessages(recentMessagesDocs.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessage)));
        setRecentStudents(recentStudentsDocs.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
        
        // Placeholder for revenue and average rating calculation
        // For revenue: sum prices of 'completed' bookings
        // For average rating: average of 'approved' testimonial ratings

        setStats({
          upcomingBookings: upcomingBookingsSnapshot.data().count,
          pendingTestimonialsCount: pendingTestimonialsSnapshot.data().count,
          newInquiries: newInquiriesSnapshot.data().count,
          totalStudents: totalStudentsSnapshot.data().count,
          totalRevenue: 1250, // Placeholder
          averageRating: 4.9, // Placeholder
        });

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "Error", description: "Could not load dashboard data.", variant: "destructive" });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [user, isAdmin, authLoading, router, toast]);

  const handleTestimonialAction = async (id: string, action: "approved" | "rejected") => {
    setUpdatingTestimonial({ id, action });
    try {
      const testimonialDocRef = doc(db, "testimonials", id);
      await updateDoc(testimonialDocRef, { status: action });
      setPendingTestimonials((prev) => prev.filter((testimonial) => testimonial.id !== id));
      setStats(prev => ({...prev, pendingTestimonialsCount: Math.max(0, prev.pendingTestimonialsCount -1)}));
      toast({ title: "Success", description: `Testimonial ${action}.` });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({ title: "Error", description: "Could not update testimonial status.", variant: "destructive" });
    } finally {
      setUpdatingTestimonial({ id: null, action: null });
    }
  };
  

  if (authLoading || isLoadingStats || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading Dashboard...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">Overview of ABYLANG activities.</p>
          </div>
           <Link href="/" className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary mt-2 sm:mt-0">
              <BookOpenText className="h-5 w-5" />
              <span>View Site</span>
          </Link>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">lessons scheduled</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">registered</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue (Est.)</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">placeholder data</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">placeholder data</p>
            </CardContent>
          </Card>
        </div>

        {(stats.pendingTestimonialsCount > 0 || stats.newInquiries > 0) && (
          <Card className="shadow-lg mb-8 bg-gradient-to-r from-primary/5 to-accent/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Action Required</h3>
              <div className="flex flex-wrap gap-3">
                {stats.pendingTestimonialsCount > 0 && (
                  <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30">
                    {stats.pendingTestimonialsCount} testimonial{stats.pendingTestimonialsCount > 1 ? "s" : ""} pending
                  </Badge>
                )}
                {stats.newInquiries > 0 && (
                  <Badge variant="secondary" className="bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30">
                    {stats.newInquiries} new message{stats.newInquiries > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card border w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="testimonials" className="relative">
              Testimonials
              {stats.pendingTestimonialsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs rounded-full">{stats.pendingTestimonialsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              Messages 
              {stats.newInquiries > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">{stats.newInquiries}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Recent Lesson Bookings</CardTitle>
                <CardDescription>Overview of the latest scheduled lessons.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? <p className="text-muted-foreground">No recent bookings.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Lesson Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.userName}</div>
                          <div className="text-xs text-muted-foreground">{booking.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.date), "PP")} at {booking.time}
                        </TableCell>
                        <TableCell>{booking.lessonType || `${booking.duration} min`}</TableCell>
                        <TableCell>
                          <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "completed" ? "secondary" : "destructive"}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
                <div className="mt-4 text-right">
                    <Button variant="outline" asChild><Link href="/admin/bookings">View All Bookings</Link></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Pending Testimonials</CardTitle>
                <CardDescription>Review and approve or reject new student feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingTestimonials.length === 0 ? <p className="text-muted-foreground">No pending testimonials.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell className="font-medium">{testimonial.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{testimonial.comment}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleTestimonialAction(testimonial.id, "approved")}
                              disabled={updatingTestimonial.id === testimonial.id}
                            >
                              {updatingTestimonial.id === testimonial.id && updatingTestimonial.action === "approved" ? <Spinner size="sm" className="mr-1"/> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleTestimonialAction(testimonial.id, "rejected")}
                              disabled={updatingTestimonial.id === testimonial.id}
                            >
                               {updatingTestimonial.id === testimonial.id && updatingTestimonial.action === "rejected" ? <Spinner size="sm" className="mr-1"/> : <X className="w-4 h-4 mr-1" />} Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
                <div className="mt-4 text-right">
                    <Button variant="outline" asChild><Link href="/admin/testimonials">View All Testimonials</Link></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
             <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Recent Contact Messages</CardTitle>
                <CardDescription>Latest inquiries from students and visitors.</CardDescription>
              </CardHeader>
              <CardContent>
                 {recentMessages.length === 0 ? <p className="text-muted-foreground">No recent messages.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message (Preview)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-medium">{message.name}</TableCell>
                        <TableCell>{message.email}</TableCell>
                        <TableCell className="max-w-xs truncate">{message.message}</TableCell>
                        <TableCell>
                          <Badge variant={message.read ? "secondary" : "default"}>
                            {message.read ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                 )}
                 <div className="mt-4 text-right">
                    <Button variant="outline" asChild><Link href="/admin/inquiries">View All Messages</Link></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Recently Joined Students</CardTitle>
                <CardDescription>New members of the ABYLANG community.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentStudents.length === 0 ? <p className="text-muted-foreground">No recent students.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentStudents.map((student) => (
                      <TableRow key={student.uid}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.createdAt ? format(student.createdAt.toDate(), "PP") : "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.amharicLevel || "N/A"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
                 <div className="mt-4 text-right">
                    {/* For now, no dedicated "all students" management page beyond profiles, so disable or link to a future page */}
                    <Button variant="outline" disabled>View All Students (Coming Soon)</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    