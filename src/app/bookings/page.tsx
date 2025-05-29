"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, CreditCard, Check } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { addDoc, collection, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, isPast, startOfDay, isEqual, addDays } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site" // Import tutorInfo

// Function to fetch already booked slots for a date from Firestore
async function getBookedSlots(date: Date): Promise<string[]> {
  if (!date) return [];
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("date", "==", formattedDate), where("status", "in", ["confirmed", "completed"]));
    const querySnapshot = await getDocs(q);
    const bookedTimes = querySnapshot.docs.map(doc => (doc.data() as any).time);
    return bookedTimes;
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return [];
  }
}

export default function BookingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedDuration, setSelectedDuration] = useState("60");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dailyBookedSlots, setDailyBookedSlots] = useState<string[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const durations = [
    { value: "30", label: "30 minutes", price: 25, description: "Quick practice session", type: "Quick Practice" },
    { value: "60", label: "60 minutes", price: 45, description: "Comprehensive lesson", type: "Comprehensive Lesson" },
    { value: "90", label: "90 minutes", price: 65, description: "Cultural immersion", type: "Cultural Immersion" }, // Added 90 min option
  ];

  // Generate available dates (e.g., next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i));

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  const selectedLessonDetails = durations.find((d) => d.value === selectedDuration);

  useEffect(() => {
    if (selectedDate) {
      setIsFetchingSlots(true);
      getBookedSlots(selectedDate).then(slots => {
        setDailyBookedSlots(slots);
        setIsFetchingSlots(false);
        setSelectedTime(undefined);
      }).catch(error => {
        console.error("Failed to get booked slots:", error);
        toast({ title: "Error", description: "Could not fetch available slots.", variant: "destructive" });
        setIsFetchingSlots(false);
      });
    }
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
      toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive" });
      setSelectedDate(undefined);
    } else {
      setSelectedDate(date);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to book a lesson.", variant: "destructive" });
      router.push('/login?redirect=/bookings');
      return;
    }
    if (!selectedDate || !selectedTime || !selectedLessonDetails) {
      toast({ title: "Selection Incomplete", description: "Please select duration, date, and time.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userName: user.displayName || "User",
        userEmail: user.email,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        duration: parseInt(selectedLessonDetails.value, 10),
        lessonType: selectedLessonDetails.type,
        price: selectedLessonDetails.price,
        status: "confirmed",
        tutorId: "MahirAbasMustefa", // Assuming one tutor for now
        tutorName: tutorInfo.name,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Lesson Booked Successfully!",
        description: `Your ${selectedLessonDetails.label} on ${format(selectedDate, 'PPP')} at ${selectedTime} is confirmed.`,
      });
      // Refetch booked slots
      setIsFetchingSlots(true);
      getBookedSlots(selectedDate).then(slots => {
        setDailyBookedSlots(slots);
        setIsFetchingSlots(false);
      });
      setSelectedTime(undefined); // Reset time selection
      // Optionally redirect or reset form
      // router.push("/profile"); // Example redirect
    } catch (error) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: "Could not complete your booking. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Book a Lesson</h1>
          <p className="text-muted-foreground">Schedule your one-on-one Amharic lesson with {tutorInfo.name}.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Duration Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-primary" />
                  Select Lesson Duration
                </CardTitle>
                <CardDescription>Choose the length of your lesson.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
                  <div className="space-y-3">
                    {durations.map((duration) => (
                      <Label
                        htmlFor={`duration-${duration.value}`}
                        key={duration.value}
                        className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${selectedDuration === duration.value ? 'bg-accent border-primary ring-2 ring-primary' : 'border-border'}`}
                      >
                        <RadioGroupItem value={duration.value} id={`duration-${duration.value}`} />
                        <div className="flex-1">
                          <div className="font-medium">{duration.label}</div>
                          <div className="text-sm text-muted-foreground">{duration.description}</div>
                        </div>
                        <div className="text-lg font-bold text-primary">${duration.price}</div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date
                </CardTitle>
                <CardDescription>Choose an available date for your lesson.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {availableDates.map((dateOption) => (
                    <Button
                      key={dateOption.toISOString()}
                      variant={selectedDate && isEqual(startOfDay(selectedDate), dateOption) ? "default" : "outline"}
                      className="p-4 h-auto flex flex-col"
                      onClick={() => handleDateSelect(dateOption)}
                      disabled={isPast(dateOption) && !isEqual(startOfDay(dateOption), startOfDay(new Date()))}
                    >
                      <div className="text-sm">
                        {format(dateOption, "E")}
                      </div>
                      <div className="font-semibold">
                        {format(dateOption, "MMM d")}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Select Time</CardTitle>
                  <CardDescription>Available slots for {format(selectedDate, 'PPP')}. (Your local time)</CardDescription>
                </CardHeader>
                <CardContent>
                  {isFetchingSlots ? (
                     <div className="flex justify-center items-center h-24"><Spinner /></div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {timeSlots.map((time) => {
                        const isBooked = dailyBookedSlots.includes(time);
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 shadow-lg"> {/* Adjusted sticky top */}
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{selectedLessonDetails?.label}</span>
                  </div>

                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {format(selectedDate, "PPP")}
                      </span>
                    </div>
                  )}

                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutor:</span>
                    <span className="font-medium">{tutorInfo.name}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">${selectedLessonDetails?.price || 0}</span>
                  </div>
                </div>

                <div className="space-y-3">
                   <Badge variant="secondary" className="w-full justify-center py-2 bg-accent text-accent-foreground">
                    <Check className="w-4 h-4 mr-2 text-primary" />
                    Secure Booking
                  </Badge>

                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || isProcessing || !selectedLessonDetails}
                  >
                    {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                    {isProcessing ? "Processing..." : `Pay $${selectedLessonDetails?.price || 0} & Book Lesson`}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Free cancellation up to 24 hours before.</p>
                  <p>• You'll receive a Zoom link via email.</p>
                  <p>• Session will be recorded for your review.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
