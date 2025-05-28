
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, isPast, startOfDay } from 'date-fns';
import { Spinner } from "../ui/spinner";

// Mock available time slots for simplicity
const availableTimeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "02:00 PM", "03:00 PM", "04:00 PM",
];

// Mock function to simulate fetching already booked slots for a date
// In a real app, this would query Firestore
async function getBookedSlots(date: Date): Promise<string[]> {
  // console.log(`Fetching booked slots for ${format(date, 'yyyy-MM-dd')}`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300)); 
  // Example: if date is tomorrow, 10:00 AM is booked
  if (format(date, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd')) {
    return ["10:00 AM"];
  }
  return [];
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
      });
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isSameDay(date, new Date())) { // Allow today but not past days
        toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive"});
        setSelectedDate(undefined);
    } else {
        setSelectedDate(date);
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return startOfDay(date1).getTime() === startOfDay(date2).getTime();
  }

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
        status: "confirmed",
        tutorId: "MahirAbasMustefa", // Assuming single tutor
        tutorName: "Mahir A.",
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Booking Confirmed!",
        description: `Your lesson on ${format(selectedDate, 'PPP')} at ${selectedTime} is booked.`,
      });
      // Optionally, refetch booked slots for the day
      getBookedSlots(selectedDate).then(setDailyBookedSlots);
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
            disabled={(date) => isPast(date) && !isSameDay(date, new Date())} // Disable past dates except today
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
                      className={isBooked ? "bg-muted text-muted-foreground line-through" : ""}
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
