
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
  CreditCard,
  Mail,
  RefreshCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { format, parseISO, isValid } from "date-fns";
import type { Booking, Testimonial, ContactMessage, UserProfile, UserCredit } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { updateDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";


interface DashboardStats {
  upcomingBookings: number;
  pendingTestimonialsCount: number;
  newInquiries: number;
  totalStudents: number;
  totalRevenue: number; 
  averageRating: number; 
  newBookingsCount: number;
  pendingResolutionsCount: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentBookings: Booking[];
  pendingTestimonials: Testimonial[];
  recentMessages: ContactMessage[];
  recentStudents: UserProfile[];
  pendingResolutions: Booking[];
}

type TestimonialActionType = "approved" | "rejected" | null;
type ResolutionActionType = "approved" | "rejected" | null;

export default function AdminDashboardPage() {
  const { user, loading: authLoading, signOut, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingTestimonial, setUpdatingTestimonial] = useState<{ id: string | null; action: TestimonialActionType }>({ id: null, action: null });
  const [updatingResolution, setUpdatingResolution] = useState<{ id: string | null; action: ResolutionActionType }>({ id: null, action: null });

  const fetchDashboardData = async () => {
    // No need to set loading here, parent loading state handles it
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch('/api/admin/dashboard-stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard data');
      }
      
      const data: DashboardData = await response.json();
      setDashboardData(data);

    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: "Error", description: error.message || "Could not load dashboard data.", variant: "destructive" });
    }
  };


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

    const loadData = async () => {
        setIsLoading(true);
        await fetchDashboardData();
        setIsLoading(false);
    }
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, authLoading, router]);

  const handleTestimonialAction = async (id: string, action: "approved" | "rejected") => {
    if (!dashboardData) return;
    setUpdatingTestimonial({ id, action });
    try {
      const testimonialDocRef = doc(db, "testimonials", id);
      await updateDoc(testimonialDocRef, { status: action });
      
      setDashboardData(prevData => {
        if (!prevData) return null;
        return {
          ...prevData,
          pendingTestimonials: prevData.pendingTestimonials.filter(t => t.id !== id),
          stats: {
            ...prevData.stats,
            pendingTestimonialsCount: Math.max(0, prevData.stats.pendingTestimonialsCount - 1),
          }
        };
      });

      toast({ title: "Success", description: `Testimonial ${action}.` });
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({ title: "Error", description: "Could not update testimonial status.", variant: "destructive" });
    } finally {
      setUpdatingTestimonial({ id: null, action: null });
    }
  };
  
  const handleResolution = async (booking: Booking, approved: boolean) => {
    setUpdatingResolution({ id: booking.id, action: approved ? 'approved' : 'rejected' });

    try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) throw new Error("Authentication error");

        const response = await fetch('/api/admin/resolve-cancellation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
                bookingId: booking.id,
                approved: approved,
            }),
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to process resolution.');
        }

        toast({ title: "Success", description: `Request has been ${approved ? 'approved' : 'denied'}.` });
        fetchDashboardData(); // Refresh all data

    } catch (error: any) {
        console.error("Error resolving cancellation:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setUpdatingResolution({ id: null, action: null });
    }
};

  if (authLoading || isLoading || !user || !isAdmin) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /> <p className="ml-3 text-muted-foreground">Loading Dashboard...</p></div>;
  }
  
  if (!dashboardData) {
      return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Could not load dashboard data. Please try again.</p></div>;
  }

  const { stats, recentBookings, pendingTestimonials, recentMessages, recentStudents, pendingResolutions } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">Overview of ABYLANG activities.</p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">confirmed lessons</p>
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
              <p className="text-xs text-muted-foreground">from approved testimonials</p>
            </CardContent>
          </Card>
        </div>

        {(stats.pendingTestimonialsCount > 0 || stats.newInquiries > 0 || stats.newBookingsCount > 0 || stats.pendingResolutionsCount > 0) && (
          <Card className="shadow-lg mb-8 bg-gradient-to-r from-primary/5 to-accent/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Action Required</h3>
              <div className="flex flex-wrap gap-3">
                 {stats.pendingResolutionsCount > 0 && (
                  <Badge variant="secondary" className="bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30">
                    <RefreshCcw className="mr-1.5 h-3 w-3" />
                    {stats.pendingResolutionsCount} cancellation request{stats.pendingResolutionsCount > 1 ? "s" : ""}
                  </Badge>
                )}
                {stats.newBookingsCount > 0 && (
                  <Badge variant="secondary" className="bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30">
                     <CreditCard className="mr-1.5 h-3 w-3" />
                    {stats.newBookingsCount} new booking{stats.newBookingsCount > 1 ? "s" : ""} awaiting confirmation
                  </Badge>
                )}
                {stats.pendingTestimonialsCount > 0 && (
                  <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30">
                    {stats.pendingTestimonialsCount} testimonial{stats.pendingTestimonialsCount > 1 ? "s" : ""} pending
                  </Badge>
                )}
                {stats.newInquiries > 0 && (
                  <Badge variant="secondary" className="bg-green-400/20 text-green-700 dark:text-green-500 border-green-400/30">
                    <Mail className="mr-1.5 h-3 w-3" />
                    {stats.newInquiries} new message{stats.newInquiries > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card border w-full sm:w-auto grid grid-cols-2 sm:grid-cols-5">
            <TabsTrigger value="bookings" className="relative">
              Bookings
              {stats.newBookingsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full">{stats.newBookingsCount}</Badge>
              )}
            </TabsTrigger>
             <TabsTrigger value="resolutions" className="relative">
              Resolutions
              {stats.pendingResolutionsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-white text-xs rounded-full">{stats.pendingResolutionsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="relative">
              Testimonials
              {stats.pendingTestimonialsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-yellow-500 text-yellow-900 text-xs rounded-full">{stats.pendingTestimonialsCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              Messages 
              {stats.newInquiries > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-green-500 text-white text-xs rounded-full">{stats.newInquiries}</Badge>}
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
                          {booking.date && booking.date !== 'N/A_PACKAGE' && isValid(parseISO(booking.date))
                            ? `${format(parseISO(booking.date), "PP")} at ${booking.time}`
                            : 'Package'
                          }
                        </TableCell>
                        <TableCell>{booking.lessonType || `${booking.duration} min`}</TableCell>
                        <TableCell>
                           <Badge
                                variant={
                                booking.status === "confirmed" ? "default" 
                                : booking.status === "completed" ? "secondary"
                                : booking.status === "cancelled" ? "destructive"
                                : "secondary" 
                                }
                                className={
                                booking.status === 'awaiting-payment' ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-500 border-yellow-400/30" :
                                booking.status === 'payment-pending-confirmation' ? "bg-blue-400/20 text-blue-700 dark:text-blue-500 border-blue-400/30" : ""
                                }
                            >
                               {booking.status.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
          
           <TabsContent value="resolutions">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle>Pending Resolutions</CardTitle>
                <CardDescription>Approve or deny student requests for cancellations.</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingResolutions.length === 0 ? <p className="text-muted-foreground">No pending requests.</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Lesson Date</TableHead>
                      <TableHead>Requested Action</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingResolutions.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.userName}</div>
                          <div className="text-xs text-muted-foreground">{booking.userEmail}</div>
                        </TableCell>
                        <TableCell>
                          {booking.date && booking.date !== 'N/A_PACKAGE' && isValid(parseISO(booking.date))
                            ? `${format(parseISO(booking.date), "PP")} at ${booking.time}`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize bg-orange-400/20 text-orange-700 dark:text-orange-500 border-orange-400/30">
                            {booking.requestedResolution?.replace(/-/g, ' ')}
                          </Badge>
                        </TableCell>
                         <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-primary border-primary/30 hover:bg-primary/10 hover:text-primary"
                              onClick={() => handleResolution(booking, true)}
                              disabled={updatingResolution.id === booking.id}
                            >
                              {updatingResolution.id === booking.id && updatingResolution.action === "approved" ? <Spinner size="sm" className="mr-1"/> : <CheckCircle className="w-4 h-4 mr-1" />} Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleResolution(booking, false)}
                              disabled={updatingResolution.id === booking.id}
                            >
                               {updatingResolution.id === booking.id && updatingResolution.action === "rejected" ? <Spinner size="sm" className="mr-1"/> : <X className="w-4 h-4 mr-1" />} Deny
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
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
                      <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
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
                        <TableCell>
                            {student.createdAt && isValid(parseISO(student.createdAt as any)) 
                              ? format(parseISO(student.createdAt as any), "PP") 
                              : "N/A"
                            }
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.amharicLevel?.replace(/-/g, " ") || "N/A"}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
                 <div className="mt-4 text-right">
                    <Button variant="outline" asChild><Link href="/admin/students">View All Students</Link></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
