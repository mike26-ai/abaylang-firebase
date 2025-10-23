
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, History, Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { UserProfile } from "@/lib/types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// Mockup of a transaction ledger for the UI structure
const mockHistory = [
  { id: 1, date: "2023-10-26", description: "Used 1 credit for 'Comprehensive Lesson'", amount: -1 },
  { id: 2, date: "2023-10-25", description: "Credit issued for cancelled lesson", amount: 1 },
  { id: 3, date: "2023-10-20", description: "Purchased 'Learning Intensive' package", amount: 10 },
];

export default function CreditsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [userProfileData, setUserProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/login?callbackUrl=/credits");
      return;
    }

    const fetchUserProfile = async () => {
      setIsLoading(true);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setUserProfileData(userDocSnap.data() as UserProfile);
      }
      setIsLoading(false);
    };

    fetchUserProfile();
  }, [user, authLoading, router]);

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
              <CardDescription>A log of all your credit activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                <p>Transaction history coming soon...</p>
              </div>
              {/* Future implementation of the ledger will go here */}
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
                <Link href="/bookings">
                  <Plus className="w-4 h-4 mr-2" />
                  Use Credits or Book
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
