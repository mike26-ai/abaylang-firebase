
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, History, Plus, FileClock, CheckCircle, XCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { UserProfile, Booking } from "@/lib/types";
import { doc, getDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";


export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/credits");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user profile
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfileData(userDocSnap.data() as UserProfile);
        }

        // Fetch booking history
        const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(bookingsQuery);
        const fetchedHistory = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setHistory(fetchedHistory);

      } catch (error) {
        console.error("Error fetching credit data:", error);
        toast({ title: "Error", description: "Could not load your credit information.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  const getHistoryItem = (item: Booking) => {
    if (item.date === 'N/A_PACKAGE') {
      return {
        description: `Purchased '${item.lessonType}' package`,
        amount: `+${item.price && item.price > 20 ? '10' : '5'} credits`, // Simplified logic
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
    if (item.status === 'completed' && !item.wasRedeemedWithCredit) {
         return {
            description: `Completed '${item.lessonType}' (Paid)`,
            amount: `-$${item.price}`,
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
    <div className="container mx-auto max-w-4xl py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          My Credits &amp; History
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          View your available lesson credits and track your transaction history.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Transaction History
              </CardTitle>
              <CardDescription>A log of all your credit and booking activities.</CardDescription>
            </CardHeader>
            <CardContent>
              {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(item => {
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

        <div className="md:col-span-1 space-y-6">
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
                    <div key={index} className="p-3 bg-accent/50 rounded-lg border border-primary/20 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-foreground capitalize">{credit.lessonType.replace(/-/g, ' ')}</p>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                      </div>
                      <p className="text-3xl font-bold text-primary">{credit.count}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">You have no active lesson packages.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/bookings?type=quick-practice-bundle">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy More Credits
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

