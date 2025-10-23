
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Plus, CheckCircle, XCircle, FileClock } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { Booking } from "@/lib/types";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function BookingHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/profile/history");
      return;
    }

    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(fetchedBookings);

      } catch (error) {
        console.error("Error fetching booking history:", error);
        toast({ title: "Error", description: "Could not load your booking history.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const getHistoryItem = (item: Booking) => {
    // This function can be expanded to be more detailed
    if (item.date === 'N/A_PACKAGE') {
      return {
        description: `Purchased '${item.lessonType}' package`,
        amount: `+${item.price && item.price > 20 ? '10' : '5'} credits`, // Simplified
        icon: <Plus className="w-4 h-4 text-primary" />
      }
    }
    if (item.wasRedeemedWithCredit) {
      return {
        description: `Used 1 credit for '${item.lessonType}'`,
        amount: "-1 credit",
        icon: <CheckCircle className="w-4 h-4 text-green-600" />
      }
    }
     if (item.status === 'credit-issued') {
        return {
            description: `Credit issued for cancelled lesson`,
            amount: `+1 credit`,
            icon: <Plus className="w-4 h-4 text-primary" />
        }
    }
    if (item.status === 'cancellation-requested') {
        return {
            description: `Cancellation requested for '${item.lessonType}'`,
            amount: "Pending",
            icon: <FileClock className="w-4 h-4 text-yellow-600" />
        }
    }
     if (item.status === 'refunded') {
        return {
            description: `Refund processed for '${item.lessonType}'`,
            amount: `$${item.price}`,
            icon: <CheckCircle className="w-4 h-4 text-green-600" />
        }
    }
    if (item.status === 'completed') {
         return {
            description: `Completed '${item.lessonType}'`,
            amount: item.wasRedeemedWithCredit ? "-1 credit" : `-$${item.price}`,
            icon: <CheckCircle className="w-4 h-4 text-green-600" />
        }
    }
    // Default for other statuses like cancelled, etc.
    return {
      description: `Booking for '${item.lessonType}'`,
      amount: item.status.replace(/-/g, ' '),
      icon: <XCircle className="w-4 h-4 text-destructive" />
    };
  }

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

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            All Transactions
          </CardTitle>
          <CardDescription>A complete log of all your credit and booking activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.length > 0 ? (
            <div className="space-y-4">
                {bookings.map(item => {
                  const { description, amount, icon } = getHistoryItem(item);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            {icon}
                            <div>
                                <p className="font-medium text-foreground">{description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.createdAt ? format(item.createdAt.toDate(), "PPP") : "Recent"}
                                </p>
                            </div>
                        </div>
                        <Badge variant={amount.startsWith('+') ? 'default' : amount.startsWith('-') ? 'destructive' : 'secondary'} className={amount === 'Pending' ? 'bg-yellow-400/20 text-yellow-700' : ''}>
                            {amount}
                        </Badge>
                    </div>
                  )
                })}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
                <p>No transaction history yet.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
