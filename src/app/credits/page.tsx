
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Plus, CreditCard, RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { UserProfile, Booking } from "@/lib/types";
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { differenceInHours, parse } from "date-fns";


export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [cancellableBookings, setCancellableBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for dialogs
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState<Booking | null>(null);
  const [cancellationChoice, setCancellationChoice] = useState<'refund' | 'credit' | ''>('');
  const [isCancelling, setIsCancelling] = useState(false);


  const isCancellationAllowed = (booking: Booking) => {
    if (booking.date === 'N/A_PACKAGE' || !booking.time) return false; 
    const hours = booking.groupSessionId ? 3 : 12; // Stricter for group
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    return differenceInHours(lessonDateTime, new Date()) >= hours;
  };

  const fetchData = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        // Fetch user profile to get credit balance
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfileData(userDocSnap.data() as UserProfile);
        }

        // Fetch bookings that are eligible for cancellation/refund request
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            where("status", "in", ["confirmed", "awaiting-payment"])
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        
        // Filter in the client to check the time window
        setCancellableBookings(fetchedBookings.filter(isCancellationAllowed));

      } catch (error) {
        console.error("Error fetching credit/booking data:", error);
        toast({ title: "Error", description: "Could not load your credit and booking information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/credits");
      return;
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);


  const openCancellationDialog = (booking: Booking) => {
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

      toast({ 
          title: "Cancellation Request Sent", 
          description: "Your request has been sent to the administrator for review.", 
      });
      fetchData(); // Re-fetch data to update UI
      setCancellationDialogOpen(false);
    } catch (error) {
      console.error("Error requesting cancellation:", error);
      toast({ title: "Request Failed", description: "Could not send your cancellation request.", variant: "destructive" });
    } finally {
      setIsCancelling(false);
    }
  };


  const credits = userProfileData?.credits || [];

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-3 text-muted-foreground">Loading Your Credits...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">My Credits</h1>
        <p className="text-muted-foreground">Manage your purchased packages and request refunds.</p>
      </header>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Refund & Credit Requests
              </CardTitle>
              <CardDescription>Request a refund or credit for eligible upcoming lessons.</CardDescription>
            </CardHeader>
            <CardContent>
              {cancellableBookings.length > 0 ? (
                <div className="space-y-4">
                  {cancellableBookings.map((booking) => (
                      <Card key={booking.id} className="shadow-sm">
                        <CardContent className="p-4 flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex items-center gap-3 md:gap-4 flex-grow">
                                <div>
                                <h3 className="font-semibold text-foreground text-lg">{booking.lessonType || "Amharic Lesson"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {booking.date} at {booking.time}
                                </p>
                                </div>
                            </div>
                             <div className="flex flex-col items-start md:items-end gap-2 self-start md:self-center w-full md:w-auto">
                                <Button size="sm" variant="outline" onClick={() => openCancellationDialog(booking)}>
                                    <RefreshCw className="w-4 h-4 mr-2" /> Request Refund/Credit
                                </Button>
                             </div>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              ) : (
                 <div className="text-center py-10 text-muted-foreground">
                    <p>You have no upcoming lessons eligible for a refund or credit request.</p>
                    <p className="text-xs mt-2">(Lessons must be cancelled at least 12 hours in advance)</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
           <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {credits.length > 0 ? (
                <div className="space-y-4">
                  {credits.map((credit, index) => (
                    <div key={index} className="p-4 bg-accent/50 rounded-lg border border-primary/20 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground capitalize">{credit.lessonType.replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">Remaining Credits</p>
                      </div>
                      <p className="text-3xl font-bold text-primary">{credit.count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have no active lesson packages.</p>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/bookings">
                  <Plus className="w-4 h-4 mr-2" />
                  Book with Credit
                </Link>
              </Button>
               <Button asChild className="w-full">
                <Link href="/packages">
                  <Ticket className="w-4 h-4 mr-2" />
                  Buy More Credits
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
       <AlertDialog open={cancellationDialogOpen} onOpenChange={setCancellationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Lesson Cancellation</AlertDialogTitle>
            <AlertDialogDescription>
              Please choose how you would like to be compensated for this cancellation. Your request will be sent to the administrator for approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">Your lesson on {selectedBookingForCancellation && selectedBookingForCancellation.date ? selectedBookingForCancellation.date : ''} is eligible for cancellation.</p>
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
            >
              {isCancelling && <Spinner size="sm" className="mr-2" />}
              Submit Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
