
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Star, CheckCircle, Package } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Booking } from "@/lib/types";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format, parse, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LessonFeedbackModal from "@/components/lesson-feedback-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface HistoryBooking extends Booking {
    hasReview?: boolean;
    redeemedLessons?: HistoryBooking[];
}

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<HistoryBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");


  const [feedbackModal, setFeedbackModal] = useState({
      isOpen: false,
      lessonId: "",
      lessonType: "",
      lessonDate: "",
  });

  const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(bookingsQuery);
        let fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryBooking));

        const reviewChecks = fetchedBookings.map(async (booking) => {
            if (booking.status === "completed") {
                const reviewQuery = query(
                    collection(db, "testimonials"),
                    where("userId", "==", user.uid),
                    where("lessonId", "==", booking.id),
                    limit(1)
                );
                const reviewSnapshot = await getDocs(reviewQuery);
                return { ...booking, hasReview: !reviewSnapshot.empty };
            }
            return booking;
        });

        const bookingsWithStatus = await Promise.all(reviewChecks);
        setBookings(bookingsWithStatus);

      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast({ title: "Error", description: "Could not load your booking history.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/profile/history");
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const handleRateLesson = (booking: HistoryBooking) => {
    setFeedbackModal({
      isOpen: true,
      lessonId: booking.id,
      lessonType: booking.lessonType || 'Lesson',
      lessonDate: booking.date,
    });
  };

  const handleFeedbackSubmit = async () => {
    fetchData(); // Refetch data to update the button state
  };
  
  const organizedBookings = useMemo(() => {
    const parentBookings = bookings.filter(b => !b.parentPackageId);
    const childBookings = bookings.filter(b => b.parentPackageId);

    return parentBookings.map(parent => ({
        ...parent,
        redeemedLessons: childBookings.filter(child => child.parentPackageId === parent.id)
    }));
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'archived') {
        return organizedBookings.filter(b => ['completed', 'cancelled', 'cancelled-by-admin', 'refunded', 'credit-issued'].includes(b.status));
    }
    return organizedBookings.filter(b => !['completed', 'cancelled', 'cancelled-by-admin', 'refunded', 'credit-issued'].includes(b.status));
  }, [organizedBookings, activeTab]);


  const renderBookingItem = (item: HistoryBooking, isChild: boolean = false) => (
     <div key={item.id} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg ${isChild ? 'bg-muted/30 ml-8' : 'bg-card border'}`}>
        <div className="flex items-center gap-3">
            <div>
                <p className="font-medium text-foreground">{item.lessonType || "Lesson"}</p>
                <p className="text-xs text-muted-foreground">
                    {item.date !== 'N/A_PACKAGE' && item.date && isValid(parse(item.date, 'yyyy-MM-dd', new Date())) ? format(parse(item.date, 'yyyy-MM-dd', new Date()), "PPP") : 'Package Purchase'}
                    {item.date !== 'N/A_PACKAGE' && ` at ${item.time}`}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
           <Badge variant={item.status === 'completed' || item.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
            {item.status.replace(/-/g, ' ')}
           </Badge>
           {item.status === 'completed' && item.productType !== 'package' && (
             !item.hasReview ? (
                <Button size="sm" variant="outline" onClick={() => handleRateLesson(item)}>
                    <Star className="w-4 h-4 mr-2"/>
                    Leave a Review
                </Button>
             ) : (
                <Button size="sm" variant="outline" disabled>
                    <CheckCircle className="w-4 h-4 mr-2"/>
                    Reviewed
                </Button>
             )
           )}
        </div>
    </div>
  );

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-3 text-muted-foreground">Loading Booking History...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Booking History</h1>
        <p className="text-muted-foreground">A log of all your credit and booking activities.</p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active">Active & Upcoming</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>
            <TabsContent value="active">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" />Active Bookings</CardTitle>
                        <CardDescription>Lessons that are upcoming or awaiting action.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {filteredBookings.length > 0 ? (
                        <div className="space-y-4">
                            {filteredBookings.map(item => (
                                <div key={item.id}>
                                    {renderBookingItem(item)}
                                    {item.productType === 'package' && item.redeemedLessons && item.redeemedLessons.length > 0 && (
                                      <div className="space-y-2 mt-2">{item.redeemedLessons.map(lesson => renderBookingItem(lesson, true))}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                      ) : (
                         <div className="text-center py-10 text-muted-foreground"><p>No active or upcoming bookings.</p></div>
                      )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="archived">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><History className="w-5 h-5 text-primary" />Archived Bookings</CardTitle>
                        <CardDescription>Your history of completed and cancelled lessons.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {filteredBookings.length > 0 ? (
                        <div className="space-y-4">
                            {filteredBookings.map(item => (
                                <div key={item.id}>
                                    {renderBookingItem(item)}
                                    {item.productType === 'package' && item.redeemedLessons && item.redeemedLessons.length > 0 && (
                                       <div className="space-y-2 mt-2">{item.redeemedLessons.map(lesson => renderBookingItem(lesson, true))}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                      ) : (
                         <div className="text-center py-10 text-muted-foreground"><p>No archived bookings yet.</p></div>
                      )}
                    </CardContent>
                </Card>
            </TabsContent>
      </Tabs>

      <LessonFeedbackModal
        lessonId={feedbackModal.lessonId}
        lessonType={feedbackModal.lessonType}
        lessonDate={feedbackModal.lessonDate}
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal(prev => ({...prev, isOpen: false}))}
        onSubmit={handleFeedbackSubmit}
       />
    </div>
  );
}
