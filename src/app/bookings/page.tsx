
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, ArrowLeft, Check, User, MessageSquare, BookOpen, Star, Package, Users, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { addDoc, collection, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType } from "@/lib/types";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { createPaddleCheckout } from "@/app/actions/paymentActions";
import { paddlePriceIds } from "@/config/paddle";

interface BookedSlotInfo {
  startTimeValue: string;
  startTimeDate: Date;
  endTimeDate: Date;
}

async function getBookedSlotsData(date: Date): Promise<BookedSlotInfo[]> {
  if (!date) return [];
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("date", "==", formattedDate),
      where("status", "in", ["confirmed", "completed"])
    );
    const querySnapshot = await getDocs(q);

    const bookedSlots: BookedSlotInfo[] = [];
    querySnapshot.forEach(doc => {
      const data = doc.data() as BookingType;
      if (data.time && data.duration) {
        const slotDate = startOfDay(date);
        const parsedStartTime = parse(data.time, 'HH:mm', slotDate);
        if (!isNaN(parsedStartTime.getTime())) {
            bookedSlots.push({
                startTimeValue: data.time,
                startTimeDate: parsedStartTime,
                endTimeDate: addMinutes(parsedStartTime, data.duration)
            });
        } else {
            console.warn(`Could not parse booked time: ${data.time} for date ${formattedDate}`);
        }
      }
    });
    return bookedSlots;
  } catch (error) {
    console.error("Error fetching booked slots data:", error);
    return [];
  }
}

const generateBaseStartTimes = (): string[] => {
  const times: string[] = [];
  const refDate = new Date();
  for (let h = 0; h < 24; h++) { // Generate times for all 24 hours
    times.push(format(new Date(refDate.setHours(h, 0, 0, 0)), 'HH:mm'));
    times.push(format(new Date(refDate.setHours(h, 30, 0, 0)), 'HH:mm'));
  }
  return times;
};

const baseStartTimes = generateBaseStartTimes();

export default function BookLessonPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');

  const lessonTypes = [
    // Individual
    {
      value: "free-trial", label: "Free Trial", duration: 30, price: 0, description: "One-time only trial to meet the tutor",
      features: ["Meet the tutor", "Experience teaching style", "Discuss learning goals"], type: "individual", priceId: paddlePriceIds.freeTrial
    },
    {
      value: "quick-practice", label: "Quick Practice", duration: 30, price: 9, description: "Perfect for conversation practice",
      features: ["Conversation practice", "Pronunciation correction", "Quick grammar review"], type: "individual", priceId: paddlePriceIds.quickPractice
    },
    {
      value: "comprehensive-lesson", label: "Comprehensive Lesson", duration: 60, price: 16, description: "Structured learning session",
      features: ["Structured lesson plan", "Cultural context & stories", "Homework & materials"], type: "individual", priceId: paddlePriceIds.comprehensiveLesson
    },
    // Group
    {
      value: "quick-group-conversation", label: "Quick Group Conversation", duration: 30, price: 7, description: "Practice with fellow learners",
      features: ["Small group setting (4-6)", "Focused conversation", "Peer learning experience"], type: "group", minStudents: 4, maxStudents: 6, priceId: paddlePriceIds.quickGroupConversation
    },
    {
      value: "immersive-conversation-practice", label: "Immersive Conversation Practice", duration: 60, price: 12, description: "Deeper conversation and cultural insights",
      features: ["Extended conversation time", "In-depth cultural topics", "Collaborative learning"], type: "group", minStudents: 4, maxStudents: 6, priceId: paddlePriceIds.immersiveConversationPractice
    },
    // Packages
    {
      value: "quick-practice-bundle", label: "Quick Practice Bundle", duration: "10 x 30-min", price: 50, originalPrice: 70, totalLessons: 10, unitDuration: 30,
      description: "10 conversation practice sessions",
      features: ["10 lessons, 30 mins each", "Just $5 per lesson", "Focus on speaking fluency", "Flexible scheduling"], type: "package", priceId: paddlePriceIds.quickPracticeBundle
    },
    {
      value: "learning-intensive", label: "Learning Intensive", duration: "10 x 60-min", price: 100, originalPrice: 150, totalLessons: 10, unitDuration: 60,
      description: "Accelerate your structured learning",
      features: ["10 lessons, 60 mins each", "Just $10 per lesson", "Comprehensive curriculum", "Priority booking"], type: "package", priceId: paddlePriceIds.learningIntensive
    },
     {
      value: "starter-bundle", label: "Starter Bundle", duration: "5 x 30-min", price: 25, originalPrice: 35, totalLessons: 5, unitDuration: 30,
      description: "Start practicing conversation regularly",
      features: ["5 lessons, 30 mins each", "Great value to get started", "Build conversational confidence"], type: "package", priceId: paddlePriceIds.starterBundle
    },
    {
      value: "foundation-pack", label: "Foundation Pack", duration: "5 x 60-min", price: 60, originalPrice: 75, totalLessons: 5, unitDuration: 60,
      description: "Build a solid foundation",
      features: ["5 lessons, 60 mins each", "Perfect for beginners", "Covers core concepts"], type: "package", priceId: paddlePriceIds.foundationPack
    },
  ];

  const [selectedType, setSelectedType] = useState(initialType && lessonTypes.some(l => l.value === initialType) ? initialType : "comprehensive-lesson");
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [learningGoals, setLearningGoals] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dailyBookedRanges, setDailyBookedRanges] = useState<BookedSlotInfo[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(startOfDay(new Date()), i));
  const selectedLessonDetails = lessonTypes.find((type) => type.value === selectedType);

  useEffect(() => {
    if (selectedDate) {
      setIsFetchingSlots(true);
      getBookedSlotsData(selectedDate).then(ranges => {
        setDailyBookedRanges(ranges);
        setIsFetchingSlots(false);
        setSelectedTime(undefined);
      }).catch(error => {
        console.error("Failed to get booked slots data:", error);
        toast({ title: "Error", description: "Could not fetch available slots.", variant: "destructive" });
        setIsFetchingSlots(false);
      });
    }
  }, [selectedDate, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
      toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive" });
      setSelectedDateState(undefined);
    } else {
      setSelectedDateState(date);
    }
  };

  const displayTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedLessonDetails || selectedLessonDetails.type === 'package') return [];
    const slots: { display: string; value: string; isDisabled: boolean }[] = [];
    const userDurationMinutes = selectedLessonDetails.unitDuration || selectedLessonDetails.duration as number;
    const slotDate = startOfDay(selectedDate);

    for (const startTimeString of baseStartTimes) {
      const potentialStartTime = parse(startTimeString, 'HH:mm', slotDate);
      if (isNaN(potentialStartTime.getTime())) {
          console.warn(`Could not parse base start time: ${startTimeString}`);
          continue;
      }
      const potentialEndTime = addMinutes(potentialStartTime, userDurationMinutes);

      let isSlotBooked = false;
      for (const bookedRange of dailyBookedRanges) {
        if (potentialStartTime < bookedRange.endTimeDate && potentialEndTime > bookedRange.startTimeDate) {
          isSlotBooked = true;
          break;
        }
      }
      slots.push({
        display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`,
        value: startTimeString,
        isDisabled: isSlotBooked,
      });
    }
    return slots;
  }, [selectedDate, selectedLessonDetails, dailyBookedRanges]);

  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to book a lesson.", variant: "destructive" });
      router.push('/login?redirect=/bookings');
      return;
    }

    if (!selectedLessonDetails) {
      toast({ title: "Selection Incomplete", description: "Please select a lesson type.", variant: "destructive" });
      return;
    }
    if (selectedLessonDetails.type !== 'package' && (!selectedDate || !selectedTime)) {
      toast({ title: "Selection Incomplete", description: "Please select a date and time for your lesson.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const isFreeTrial = selectedLessonDetails.price === 0;

      const unitDuration = typeof selectedLessonDetails.unitDuration === 'number'
          ? selectedLessonDetails.unitDuration
          : typeof selectedLessonDetails.duration === 'number'
          ? selectedLessonDetails.duration
          : 60; // Default to 60 if somehow not available

      const bookingData = {
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : 'N/A_PACKAGE',
        time: selectedTime || 'N/A_PACKAGE',
        duration: unitDuration,
        lessonType: selectedLessonDetails.label,
        price: selectedLessonDetails.price,
        status: isFreeTrial ? 'confirmed' : 'awaiting-payment',
        tutorId: "MahderNegashNano",
        tutorName: "Mahder Negash",
        userId: user.uid,
        userName: user.displayName || "User",
        userEmail: user.email || "No Email",
        ...(learningGoals.trim() && { learningGoals: learningGoals.trim() }),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      if (isFreeTrial) {
        const queryParams = new URLSearchParams({
          lessonType: bookingData.lessonType,
          ...(bookingData.date !== 'N/A_PACKAGE' && { date: bookingData.date }),
          ...(bookingData.time !== 'N/A_PACKAGE' && { time: bookingData.time }),
        });
        router.push(`/bookings/success?${queryParams.toString()}`);
      } else {
        if (!selectedLessonDetails.priceId) {
            throw new Error("This product's Price ID is not configured. Please contact support.");
        }
        
        const checkoutUrl = await createPaddleCheckout(
            selectedLessonDetails.priceId,
            bookingData.userEmail,
            docRef.id
        );

        if (checkoutUrl) {
           // Redirect the user to the checkout URL
           window.location.href = checkoutUrl;
        } else {
          throw new Error("Could not create a payment transaction.");
        }
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      let description = "Could not complete your booking. Please try again.";
      if (error.code === 'permission-denied') {
        description = "Booking failed due to a permissions issue. Please ensure you are logged in.";
      } else {
        description = error.message;
      }
      toast({ title: "Booking Failed", description, variant: "destructive", duration: 9000 });
      setIsProcessing(false);
    }
  };

  const isPackageSelected = selectedLessonDetails?.type === 'package';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to ABYLANG</span>
          </Link>
          <SiteLogo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Book Your Lesson</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-2">Start Your Amharic Journey</h1>
          <p className="text-xl text-muted-foreground">Choose your lesson type and schedule with {tutorInfo.name}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Choose Your Lesson or Package
                </CardTitle>
                <CardDescription>Select the format that best fits your learning goals</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedType} onValueChange={(value) => {setSelectedType(value); setSelectedTime(undefined); setSelectedDateState(undefined);}}>
                  <div className="space-y-6">
                    {["individual", "group", "package"].map(lessonGroupType => (
                       <div key={lessonGroupType}>
                        <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{lessonGroupType === 'individual' ? 'Individual' : lessonGroupType} Lessons</h3>
                        <div className="space-y-4">
                            {lessonTypes
                            .filter((lesson) => lesson.type === lessonGroupType)
                            .map((lesson) => (
                                <div key={lesson.value} className="flex items-start space-x-3">
                                <RadioGroupItem value={lesson.value} id={lesson.value} className="mt-1" />
                                <Label htmlFor={lesson.value} className="flex-1 cursor-pointer">
                                    <div
                                    className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                                        selectedType === lesson.value
                                        ? "bg-accent border-primary ring-2 ring-primary"
                                        : "border-border"
                                    }`}
                                    >
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                        <div className="mb-2 sm:mb-0">
                                        <div className="font-semibold text-lg text-foreground flex items-center gap-2">
                                            {lesson.label}
                                            {lesson.price === 0 && <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">Free Trial</Badge>}
                                            {lesson.type === "package" && <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">Package</Badge>}
                                            {lesson.type === "group" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Group ({lesson.minStudents}-{lesson.maxStudents} people)</Badge>}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {typeof lesson.duration === 'number' ? `${lesson.duration} minutes` : lesson.duration} • {lesson.description}
                                        </div>
                                        </div>
                                        <div className="text-right">
                                        <div className="text-2xl font-bold text-primary">${lesson.price}</div>
                                        {lesson.originalPrice && (
                                            <div className="text-sm text-muted-foreground line-through">${lesson.originalPrice}</div>
                                        )}
                                        </div>
                                    </div>
                                    <ul className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm list-none p-0">
                                        {lesson.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                        ))}
                                    </ul>
                                    </div>
                                </Label>
                                </div>
                            ))}
                        </div>
                       </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {!isPackageSelected && (
              <>
                <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-foreground">
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

                {selectedDate && (
                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Select Time Slot
                    </CardTitle>
                    <CardDescription>Available slots for {format(selectedDate, 'PPP')}. (Your local time)</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isFetchingSlots ? (
                        <div className="flex justify-center items-center h-24"><Spinner /></div>
                    ) : displayTimeSlots.length === 0 ? (
                        <p className="text-muted-foreground text-center py-4">No available slots for this duration/date.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {displayTimeSlots.map((slot) => (
                            <Button
                            key={slot.value + slot.display}
                            variant={selectedTime === slot.value ? "default" : "outline"}
                            onClick={() => setSelectedTime(slot.value)}
                            disabled={slot.isDisabled}
                            className={slot.isDisabled ? "bg-muted text-muted-foreground line-through hover:bg-muted" : ""}
                            >
                            {slot.display}
                            {slot.isDisabled && <span className="text-xs ml-1">(Booked)</span>}
                            </Button>
                        ))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                )}
              </>
            )}

            {isPackageSelected && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                        <Calendar className="w-5 h-5 text-primary" />
                        Package Start Date (Optional)
                        </CardTitle>
                        <CardDescription>Select a preferred start date for your first lesson in the package. Subsequent lessons can be scheduled from your dashboard.</CardDescription>
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
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Learning Goals (Optional)
                </CardTitle>
                <CardDescription>Tell {tutorInfo.name.split(" ")[0]} about your specific learning objectives</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="What would you like to focus on? (e.g., conversational Amharic for family, basic reading/writing, specific cultural topics)"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <User className="w-5 h-5 text-primary" />
                  Your Tutor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-2xl text-primary font-bold">{tutorInfo.name.split(" ").map(n=>n[0]).join("")}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{tutorInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{tutorInfo.shortIntro}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">(Highly Rated)</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Booking Summary</h4>
                  {selectedLessonDetails && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Selected:</span>
                        <span className="font-medium text-right text-foreground">{selectedLessonDetails.label}</span>
                      </div>
                      {typeof selectedLessonDetails.duration === 'number' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium text-foreground">{selectedLessonDetails.duration} minutes</span>
                        </div>
                      )}
                       {selectedLessonDetails.type === 'package' && (
                         <div className="flex justify-between">
                          <span className="text-muted-foreground">Contains:</span>
                          <span className="font-medium text-foreground">{selectedLessonDetails.duration}</span>
                        </div>
                       )}
                         {selectedLessonDetails.type === 'package' && typeof selectedLessonDetails.totalLessons === 'number' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lessons:</span>
                                <span className="font-medium text-foreground">{selectedLessonDetails.totalLessons}</span>
                            </div>
                        )}
                    </div>
                  )}
                  {selectedDate && !isPackageSelected && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium text-foreground">
                        {format(selectedDate, "PPP")}
                      </span>
                    </div>

                  )}
                   {selectedDate && isPackageSelected && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span className="font-medium text-foreground">
                        {format(selectedDate, "PPP")}
                      </span>
                    </div>
                  )}
                  {selectedTime && !isPackageSelected && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium text-foreground">
                        {`${format(parse(selectedTime, 'HH:mm', selectedDate || new Date()), 'HH:mm')} - ${format(addMinutes(parse(selectedTime, 'HH:mm', selectedDate || new Date()), selectedLessonDetails?.duration as number), 'HH:mm')}`}
                      </span>
                    </div>
                  )}
                </div>

                {selectedLessonDetails && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">${selectedLessonDetails.price}</span>
                    </div>
                     {selectedLessonDetails.price > 0 && (
                        <p className="text-xs text-muted-foreground text-center mt-2 px-2 py-1 bg-accent rounded-md">
                        <ShieldCheck className="w-3 h-3 inline-block mr-1"/>
                        Your spot is held temporarily. Proceed to secure payment.
                        </p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={isProcessing || !selectedLessonDetails || (selectedLessonDetails.type !== 'package' && (!selectedDate || !selectedTime)) || (selectedLessonDetails.type === 'package' && !selectedDate && !learningGoals) }
                  >
                    {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                    {isProcessing ? "Processing..." : selectedLessonDetails?.price === 0 ? "Confirm Free Trial" : `Proceed to Payment - $${selectedLessonDetails?.price || 0}`}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 text-center">
                  <p>• Free cancellation up to 12 hours before.</p>
                  <p>• Your spot is confirmed upon payment for paid lessons.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
