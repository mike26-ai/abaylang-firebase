
"use client";

import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Spinner } from "../ui/spinner";
import { format } from 'date-fns';

interface Booking {
  id: string;
  date: string; // Assuming date is stored as YYYY-MM-DD string
  time: string;
  status: "confirmed" | "cancelled" | "completed"; // Example statuses
  lessonName?: string; // Optional
  tutorName?: string; // Optional
  createdAt: Timestamp;
}

export function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookings() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const bookingsCol = collection(db, "bookings");
        // Ensure 'userId' field exists in your Firestore documents
        const q = query(bookingsCol, where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const fetchedBookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
        setBookings(fetchedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        // Handle error (e.g., show toast)
      } finally {
        setIsLoading(false);
      }
    }

    fetchBookings();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Your upcoming and past lessons.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Spinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 shadow-lg" id="my-bookings">
      <CardHeader>
        <CardTitle className="text-xl">My Bookings</CardTitle>
        <CardDescription>Here are your scheduled and past lessons.</CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length === 0 ? (
          <p className="text-muted-foreground">You have no bookings yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{format(new Date(booking.date), 'PPP')}</TableCell>
                  <TableCell>{booking.time}</TableCell>
                  <TableCell>{booking.tutorName || "Mahir A."}</TableCell>
                  <TableCell>
                    <Badge variant={booking.status === "confirmed" ? "default" : booking.status === "cancelled" ? "destructive" : "secondary"}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
