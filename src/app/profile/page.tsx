
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
  Award,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import type { Booking as BookingType } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { StudentBookingsManager } from "@/components/profile/student-bookings-manager";

interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);


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
        duration: doc.data().duration || 60,
      }));

      setBookings(fetchedBookings);
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
      router.push('/login?callbackUrl=/profile');
      return;
    }
    fetchDashboardData(user);
  }, [user, authLoading, router, toast]);

  const upcomingBookingsCount = useMemo(
    () =>
      bookings.filter(
        (b) =>
          !["completed", "cancelled", "cancelled-by-admin", "refunded", "credit-issued", "rescheduled"].includes(
            b.status
          ) && b.date !== "N/A_PACKAGE"
      ).length,
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


  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {user?.displayName}! Here is your learning overview.</p>
            </div>
             <div className="flex gap-2">
                <Button asChild>
                    <Link href="/submit-testimonial">
                        <Award className="w-4 h-4 mr-2" /> Leave a Review
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/bookings">
                        <Plus className="w-4 h-4 mr-2" /> Book New Lesson
                    </Link>
                </Button>
            </div>
        </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Lessons
            </CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingBookingsCount}</div>
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
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>My Active Bookings</CardTitle>
                    <CardDescription>Manage your scheduled lessons that are upcoming or awaiting action.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <StudentBookingsManager />
        </CardContent>
      </Card>
    </div>
  );
}
