
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, isPast, startOfDay, isEqual } from 'date-fns';
import { Spinner } from "../ui/spinner";
import type { Booking } from "@/lib/types";


// Mock available time slots for simplicity
const availableTimeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "03:00 PM", "04:00 PM",
];

// Function to fetch already booked slots for a date from Firestore
async function getBookedSlots(date: Date): Promise<string[]> {
  if (!date) return [];
  // console.log(`Fetching booked slots for ${format(date, 'yyyy-MM-dd')}`);
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookingsRef = collection(db, "bookings");
    // Query for bookings on the selected date that are confirmed
    const q = query(bookingsRef, where("date", "==", formattedDate), where("status", "in", ["confirmed", "completed"]));
    const querySnapshot = await getDocs(q);
    const bookedTimes = querySnapshot.docs.map(doc => (doc.data() as Booking).time);
    return bookedTimes;
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    // Consider showing a toast or error message to the user
    return []; // Return empty array on error to avoid breaking UI
  }
}


export function BookingCalendar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [dailyBookedSlots, setDailyBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setIsFetchingSlots(true);
      getBookedSlots(selectedDate).then(slots => {
        setDailyBookedSlots(slots);
        setIsFetchingSlots(false);
        setSelectedTime(undefined); // Reset time selection when date changes
      }).catch(error => {
        console.error("Failed to get booked slots:", error);
        toast({ title: "Error", description: "Could not fetch available slots. Please try again.", variant: "destructive"});
        setIsFetchingSlots(false);
      });
    }
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    // isPast compares the date to the *current moment*, not just the day.
    // We want to allow booking for today, but not for past days.
    // startOfDay ensures we compare dates without the time component.
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
        toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive"});
        setSelectedDate(undefined);
    } else {
        setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to book a lesson.", variant: "destructive" });
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({ title: "Selection Incomplete", description: "Please select a date and time.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: user.displayName || "Unknown User",
        userEmail: user.email,
        date: format(selectedDate, 'yyyy-MM-dd'), // Store date consistently
        time: selectedTime,
        status: "confirmed", // Default to confirmed, admin can manage
        tutorId: "MahderNegashMamo", // Assuming single tutor
        tutorName: "Mahder N. Mamo", // From siteConfig potentially
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Booking Confirmed!",
        description: `Your lesson on ${format(selectedDate, 'PPP')} at ${selectedTime} is booked.`,
      });
      // Refetch booked slots for the day to update UI
      setIsFetchingSlots(true);
      getBookedSlots(selectedDate).then(slots => {
        setDailyBookedSlots(slots);
        setIsFetchingSlots(false);
      });
      setSelectedTime(undefined); // Reset time selection
    } catch (error) {
      console.error("Error booking lesson:", error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Select a Date</CardTitle>
          <CardDescription>Choose a date for your Amharic lesson.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border p-0"
            disabled={(date) => isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))}
            fromDate={new Date()} // Start from today
          />
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Select a Time</CardTitle>
            <CardDescription>
              Available slots for {format(selectedDate, 'PPP')}. All times are in your local timezone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isFetchingSlots ? (
              <div className="flex justify-center items-center h-32"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {availableTimeSlots.map((time) => {
                  const isBooked = dailyBookedSlots.includes(time);
                  return (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time)}
                      disabled={isBooked}
                      className={isBooked ? "bg-muted text-muted-foreground line-through hover:bg-muted" : ""}
                    >
                      {time}
                      {isBooked && <span className="text-xs ml-1">(Booked)</span>}
                    </Button>
                  );
                })}
              </div>
            )}
            {selectedTime && !isFetchingSlots && (
              <Button onClick={handleBooking} className="w-full mt-8" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" className="mr-2"/> : null}
                Book Lesson for {selectedTime}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
