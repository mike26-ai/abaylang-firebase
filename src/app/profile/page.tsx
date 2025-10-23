
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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import type { Booking as BookingType } from "@/lib/types";
import { format, parse } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import LessonFeedbackModal from "@/components/lesson-feedback-modal";
import { JoinLessonButton } from "@/components/bookings/join-lesson-button";

interface DashboardBooking extends BookingType {
  hasReview?: boolean;
}

export default function StudentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleFeedbackSubmit = async (feedbackData: {
    lessonId: string;
    rating: number;
    feedbackText: string;
    specificRatings: Record<string, number>;
    date: string;
  }) => {
    // This function remains for the modal, but the submission logic
    // might be better centralized if reused elsewhere.
    // For now, it is self-contained.
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
          if (!a.date || !a.time || !b.date || !b.time) return 0;
          return (
            new Date(a.date + " " + (a.time || "00:00")).getTime() -
            new Date(b.date + " " + (b.time || "00:00")).getTime()
          );
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
      .filter((b) => b.status === "completed" && !b.hasReview && b.date)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return (
          parse(b.date, "yyyy-MM-dd", new Date()).getTime() -
          parse(a.date, "yyyy-MM-dd", new Date()).getTime()
        );
      })[0];
  }, [bookings]);

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
                  {format(
                    parse(mostRecentLessonToReview.date, "yyyy-MM-dd", new Date()),
                    "PPP"
                  )}
                  ?
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
            <Link href="/credits" className="text-xs text-muted-foreground hover:underline">
              View and manage lessons
            </Link>
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
            <CardTitle>Next Upcoming Lesson</CardTitle>
            <CardDescription>Get ready for your next session.</CardDescription>
        </CardHeader>
        <CardContent>
            {upcomingBookings.length > 0 ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
                    <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">{upcomingBookings[0].lessonType}</h4>
                        <p className="text-sm text-muted-foreground">
                            {format(parse(upcomingBookings[0].date, 'yyyy-MM-dd', new Date()), 'eeee, MMMM d')} at {upcomingBookings[0].time}
                        </p>
                    </div>
                     <JoinLessonButton booking={upcomingBookings[0]} />
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
    </div>
  );
}
