
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
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse, isValid } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType, TimeOff, GroupSession } from "@/lib/types";
import { SiteLogo } from "@/components/layout/SiteLogo"
import { paddlePriceIds } from "@/config/paddle";

import { getAvailability } from "@/services/availabilityService";
import { createBooking } from "@/services/bookingService";
import { TimeSlot, TimeSlotProps } from "@/components/bookings/time-slot"
import { DateSelection } from "@/components/bookings/date-selection"
import { getGroupSessions } from "@/services/groupSessionService"
import { Timestamp } from "firebase/firestore"

const generateBaseStartTimes = (): string[] => {
  const times: string[] = [];
  const refDate = new Date();
  for (let h = 0; h < 24; h++) { // Generate times for all 24 hours
    for (let m = 0; m < 60; m += 30) {
      times.push(format(new Date(refDate.setHours(h, m, 0, 0)), 'HH:mm'));
    }
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
      features: ["Meet the tutor", "Experience teaching style", "Discuss learning goals"], type: "individual"
    },
    {
      value: "quick-practice", label: "Quick Practice", duration: 30, price: 9, description: "Perfect for conversation practice",
      features: ["Conversation practice", "Pronunciation correction", "Quick grammar review"], type: "individual"
    },
    {
      value: "comprehensive-lesson", label: "Comprehensive Lesson", duration: 60, price: 16, description: "Structured learning session",
      features: ["Structured lesson plan", "Cultural context & stories", "Homework & materials"], type: "individual"
    },
    // Group
    {
      value: "quick-group-conversation", label: "Quick Group Conversation", duration: 30, price: 7, description: "Practice with fellow learners",
      features: ["Small group setting (4-6)", "Focused conversation", "Peer learning experience"], type: "group", minStudents: 4, maxStudents: 6
    },
    {
      value: "immersive-conversation-practice", label: "Immersive Conversation Practice", duration: 60, price: 12, description: "Deeper conversation and cultural insights",
      features: ["Extended conversation time", "In-depth cultural topics", "Collaborative learning"], type: "group", minStudents: 4, maxStudents: 6
    },
    // Packages
    {
      value: "quick-practice-bundle", label: "Quick Practice Bundle", duration: "10 x 30-min", price: 50, originalPrice: 70, totalLessons: 10, unitDuration: 30,
      description: "10 conversation practice sessions",
      features: ["10 lessons, 30 mins each", "Just $5 per lesson", "Focus on speaking fluency", "Flexible scheduling"], type: "package"
    },
    {
      value: "learning-intensive", label: "Learning Intensive", duration: "10 x 60-min", price: 100, originalPrice: 150, totalLessons: 10, unitDuration: 60,
      description: "Accelerate your structured learning",
      features: ["10 lessons, 60 mins each", "Just $10 per lesson", "Comprehensive curriculum", "Priority booking"], type: "package"
    },
     {
      value: "starter-bundle", label: "Starter Bundle", duration: "5 x 30-min", price: 25, originalPrice: 35, totalLessons: 5, unitDuration: 30,
      description: "Start practicing conversation regularly",
      features: ["5 lessons, 30 mins each", "Great value to get started", "Build conversational confidence"], type: "package"
    },
    {
      value: "foundation-pack", label: "Foundation Pack", duration: "5 x 60-min", price: 60, originalPrice: 75, totalLessons: 5, unitDuration: 60,
      description: "Build a solid foundation",
      features: ["5 lessons, 60 mins each", "Perfect for beginners", "Covers core concepts"], type: "package"
    },
  ];

  const [selectedType, setSelectedType] = useState(initialType && lessonTypes.some(l => l.value === initialType) ? initialType : "comprehensive-lesson");
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [paymentNote, setPaymentNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dailyBookedSlots, setDailyBookedSlots] = useState<BookingType[]>([]);
  const [dailyTimeOff, setDailyTimeOff] = useState<TimeOff[]>([]);

  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  
  const [allGroupSessions, setAllGroupSessions] = useState<GroupSession[]>([]);
  const [isFetchingGroupSessions, setIsFetchingGroupSessions] = useState(false);
  const [selectedGroupSession, setSelectedGroupSession] = useState<string | undefined>(undefined);


  const selectedLessonDetails = lessonTypes.find((type) => type.value === selectedType);
  
  const isIndividualLesson = selectedLessonDetails?.type === 'individual';
  const isGroupLesson = selectedLessonDetails?.type === 'group';
  const isPackagePurchase = selectedLessonDetails?.type === 'package';

  const fetchAvailability = async (date: Date) => {
    setIsFetchingSlots(true);
    
    getAvailability(date).then(({ bookings, timeOff }) => {
      setDailyBookedSlots(bookings);
      setDailyTimeOff(timeOff || []);
      setSelectedTime(undefined);
    }).catch(error => {
      console.error("Failed to get availability data:", error);
      toast({ title: "Error", description: "Could not fetch available slots.", variant: "destructive" });
    }).finally(() => {
        setIsFetchingSlots(false);
    });
  }

  const fetchGroupSessions = async () => {
    setIsFetchingGroupSessions(true);
    try {
        const sessions = await getGroupSessions();
        setAllGroupSessions(sessions);
    } catch(error: any) {
        toast({ title: "Error", description: error.message || "Could not fetch group sessions.", variant: "destructive" });
    } finally {
        setIsFetchingGroupSessions(false);
    }
  }


  useEffect(() => {
    if (isIndividualLesson && selectedDate && isValid(selectedDate)) {
        fetchAvailability(selectedDate);
    } else {
      setDailyBookedSlots([]);
      setDailyTimeOff([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isIndividualLesson]);
  
  useEffect(() => {
    if(isGroupLesson) {
        fetchGroupSessions();
    }
  }, [isGroupLesson]);


  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
      toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive" });
      setSelectedDateState(undefined);
    } else {
      setSelectedDateState(date);
    }
  };

  const displayTimeSlots = useMemo(() => {
    if (!selectedDate || !isIndividualLesson || !selectedLessonDetails) return [];
    
    const slots: TimeSlotProps[] = [];
    const userDurationMinutes = selectedLessonDetails.duration as number; // Individual lessons always have number duration
    const slotDate = startOfDay(selectedDate);
    const now = new Date();
    const isToday = isEqual(slotDate, startOfDay(now));

    for (const startTimeString of baseStartTimes) {
        const potentialStartTime = parse(startTimeString, 'HH:mm', slotDate);
        const potentialEndTime = addMinutes(potentialStartTime, userDurationMinutes);

        if (isToday && isPast(potentialStartTime)) {
            continue;
        }

        let currentStatus: 'available' | 'booked' | 'blocked' = 'available';
        let bookingMeta: BookingType | undefined;
        let timeOffMeta: TimeOff | undefined;

        for (const booking of dailyBookedSlots) {
            if (booking.startTime && booking.endTime) {
                const bookingStart = (booking.startTime as any).toDate();
                const bookingEnd = (booking.endTime as any).toDate();
                if (potentialStartTime < bookingEnd && potentialEndTime > bookingStart) {
                    currentStatus = 'booked';
                    bookingMeta = booking;
                    break;
                }
            }
        }
        if (currentStatus === 'booked') {
            slots.push({
                display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`,
                value: startTimeString,
                status: 'booked',
                bookedMeta: bookingMeta,
            });
            continue;
        }

        for (const block of dailyTimeOff) {
            const blockStart = new Date(block.startISO);
            const blockEnd = new Date(block.endISO);
            if (potentialStartTime < blockEnd && potentialEndTime > blockStart) {
                currentStatus = 'blocked';
                timeOffMeta = block;
                break;
            }
        }

        slots.push({
            display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`,
            value: startTimeString,
            status: currentStatus,
            blockedMeta: timeOffMeta,
        });
    }
    return slots;
}, [selectedDate, isIndividualLesson, selectedLessonDetails, dailyBookedSlots, dailyTimeOff]);


  const filteredGroupSessions = useMemo(() => {
    if (!isGroupLesson || !selectedLessonDetails) return [];
    const relevantSessions = allGroupSessions.filter(s => s.duration === selectedLessonDetails.duration);
    if (!selectedDate) {
        return relevantSessions; // Return all if no date is selected
    }
    // Filter by selected date
    const startOfSelected = startOfDay(selectedDate);
    return relevantSessions.filter(s => {
        const sessionDate = (s.startTime as unknown as Timestamp).toDate();
        return isEqual(startOfDay(sessionDate), startOfSelected);
    });
  }, [allGroupSessions, isGroupLesson, selectedLessonDetails, selectedDate]);


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
    if (isIndividualLesson && (!selectedDate || !selectedTime)) {
      toast({ title: "Selection Incomplete", description: "Please select a date and time for your lesson.", variant: "destructive" });
      return;
    }
    if (isGroupLesson && !selectedGroupSession) {
      toast({ title: "Selection Incomplete", description: "Please select a group session to join.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const isFreeTrial = selectedLessonDetails.price === 0;

      let unitDuration: number;
        if (isGroupLesson && selectedGroupSession) {
            const session = allGroupSessions.find(s => s.id === selectedGroupSession);
            unitDuration = session?.duration || 60;
        } else {
            unitDuration = typeof selectedLessonDetails.unitDuration === 'number'
                ? selectedLessonDetails.unitDuration
                : typeof selectedLessonDetails.duration === 'number'
                ? selectedLessonDetails.duration
                : 60;
        }
          
      let finalDate = 'N/A_PACKAGE';
      let finalTime = 'N/A_PACKAGE';
      let bookingIdForPassthrough = '';

      if (isIndividualLesson && selectedDate) {
        finalDate = format(selectedDate, 'yyyy-MM-dd');
        finalTime = selectedTime || 'N/A';
      } else if (isGroupLesson && selectedGroupSession) {
        const session = allGroupSessions.find(s => s.id === selectedGroupSession);
        if(session) {
            const startTimeDate = (session.startTime as unknown as Timestamp).toDate();
            finalDate = format(startTimeDate, 'yyyy-MM-dd');
            finalTime = format(startTimeDate, 'HH:mm');
        }
      }

      // For non-package purchases, create the booking document first to get an ID.
      if (!isPackagePurchase) {
          const bookingPayload = {
            date: finalDate,
            time: finalTime,
            duration: unitDuration,
            lessonType: selectedLessonDetails.label,
            price: selectedLessonDetails.price,
            tutorId: "MahderNegashMamo",
            userId: user.uid,
            userName: user.displayName || "User",
            userEmail: user.email || "No Email",
            ...(paymentNote.trim() && { paymentNote: paymentNote.trim() }),
            isFreeTrial,
            ...(isGroupLesson && { groupSessionId: selectedGroupSession }),
          };
          const { bookingId } = await createBooking(bookingPayload);
          bookingIdForPassthrough = bookingId;
          console.log('✅ Booking document created successfully.', { id: bookingId });
      }

      if (isFreeTrial) {
        router.push(`/bookings/success?booking_id=${bookingIdForPassthrough}&free_trial=true`);
      } else {
        const lessonValue = selectedLessonDetails.value;
        const lessonKey = Object.keys(paddlePriceIds).find(key => 
          key.toLowerCase().replace(/_/g, '') === lessonValue.toLowerCase().replace(/-/g, '')
        ) as keyof typeof paddlePriceIds;

        const priceId = lessonKey ? paddlePriceIds[lessonKey] : undefined;
        
        if (!priceId || priceId.includes('YOUR_') || priceId.includes('price_free_trial')) {
            toast({
                title: "Payment Link Not Configured",
                description: "The payment link for this product has not been set up. Please contact support.",
                variant: "destructive",
                duration: 9000,
            });
            setIsProcessing(false);
            return;
        }

        const passthroughData = isPackagePurchase
          ? { user_id: user.uid, package_type: selectedLessonDetails.value, credits_to_add: selectedLessonDetails.totalLessons }
          : { booking_id: bookingIdForPassthrough };
        
        const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${priceId}?email=${encodeURIComponent(user.email || "")}&passthrough=${encodeURIComponent(JSON.stringify(passthroughData))}`;
        window.location.href = checkoutUrl;
      }

    } catch (error: any) {
      console.error("❌ Booking process failed:", error);
      if (error.message.includes("slot_already_booked") || error.message.includes("tutor_unavailable")) {
          toast({
              title: "Booking Conflict",
              description: "This slot is no longer available. The schedule has been updated. Please select another time.",
              variant: "destructive",
              duration: 9000,
          });
          if (selectedDate) {
              fetchAvailability(selectedDate);
          }
      } else {
          toast({
              title: "Booking Failed",
              description: error.message || "Could not complete your booking. Please try again.",
              variant: "destructive",
              duration: 9000,
          });
      }
      setIsProcessing(false);
    }
  };

  const isPaidLesson = (selectedLessonDetails?.price || 0) > 0;

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
          <p className="text-xl text-muted-foreground">Choose your lesson type and schedule with ${tutorInfo.name}</p>
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
                <RadioGroup value={selectedType} onValueChange={(value) => {setSelectedType(value); setSelectedTime(undefined); setSelectedDateState(undefined); setSelectedGroupSession(undefined)}}>
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

            {isIndividualLesson && (
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
                          <DateSelection
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                          />
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
                            <TimeSlot
                                key={slot.value}
                                {...slot}
                                isSelected={selectedTime === slot.value}
                                onClick={(clickedSlot) => setSelectedTime(clickedSlot.value)}
                             />
                        ))}
                        </div>
                    )}
                    </CardContent>
                </Card>
                )}
              </>
            )}

            {isGroupLesson && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                            <Users className="w-5 h-5 text-primary" />
                            Select a Group Session
                        </CardTitle>
                        <CardDescription>Choose a date to see available group classes.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                        <DateSelection
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                        />
                        {isFetchingGroupSessions ? (
                            <div className="flex justify-center items-center h-24"><Spinner /></div>
                        ) : filteredGroupSessions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">
                                {selectedDate ? `No upcoming ${selectedLessonDetails?.duration} minute group sessions are scheduled for this date.` : "Select a date to see scheduled sessions."}
                            </p>
                        ) : (
                             <RadioGroup value={selectedGroupSession} onValueChange={setSelectedGroupSession} className="space-y-3 pt-4 border-t">
                                {filteredGroupSessions.map((session) => (
                                    <div key={session.id} className="flex items-start space-x-3">
                                        <RadioGroupItem value={session.id} id={session.id} className="mt-1" />
                                        <Label htmlFor={session.id} className="flex-1 cursor-pointer">
                                            <div className={`p-3 border rounded-lg hover:bg-accent/50 ${selectedGroupSession === session.id ? "bg-accent border-primary ring-1 ring-primary" : ""}`}>
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-foreground">{session.title}</span>
                                                    <Badge variant="outline">{session.duration} min</Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">{format((session.startTime as unknown as Timestamp).toDate(), 'PPP, p')}</p>
                                                <p className="text-xs text-muted-foreground">{session.participantCount} / {session.maxStudents} students</p>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        )}
                    </CardContent>
                </Card>
            )}

            {isPackagePurchase && (
                 <Card className="shadow-lg bg-accent border-primary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                        <Package className="w-5 h-5 text-primary" />
                        Ready to Purchase Package?
                        </CardTitle>
                        <CardDescription>Click &quot;Proceed to Payment&quot; to buy this package. You can schedule your individual lessons from your dashboard after purchase.</CardDescription>
                    </CardHeader>
                </Card>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  {isPaidLesson ? "Payment Note (Optional)" : "Learning Goals (Optional)"}
                </CardTitle>
                <CardDescription>
                  {isPaidLesson 
                    ? "Add a note for the tutor (e.g., your payment transaction ID or username)."
                    : `Tell ${tutorInfo.name.split(" ")[0]} about your specific learning objectives.`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder={
                    isPaidLesson 
                    ? "e.g., PayPal Transaction ID: 123ABCXYZ"
                    : "e.g., conversational Amharic for family, basic reading/writing..."
                  }
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
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
                       {isPackagePurchase && (
                         <div className="flex justify-between">
                          <span className="text-muted-foreground">Contains:</span>
                          <span className="font-medium text-foreground">{selectedLessonDetails.duration}</span>
                        </div>
                       )}
                         {isPackagePurchase && typeof selectedLessonDetails.totalLessons === 'number' && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Lessons:</span>
                                <span className="font-medium text-foreground">{selectedLessonDetails.totalLessons}</span>
                            </div>
                        )}
                    </div>
                  )}
                  {selectedDate && (isIndividualLesson || isGroupLesson) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium text-foreground">
                        {format(selectedDate, "PPP")}
                      </span>
                    </div>

                  )}
                  {selectedTime && isIndividualLesson && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium text-foreground">
                        {`${format(parse(selectedTime, 'HH:mm', selectedDate || new Date()), 'HH:mm')} - ${format(addMinutes(parse(selectedTime, 'HH:mm', selectedDate || new Date()), (selectedLessonDetails?.duration) as number), 'HH:mm')}`}
                      </span>
                    </div>
                  )}
                   {isGroupLesson && selectedGroupSession && allGroupSessions.find(s => s.id === selectedGroupSession) && (
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium text-foreground">
                            {format((allGroupSessions.find(s => s.id === selectedGroupSession)!.startTime as unknown as Timestamp).toDate(), 'p')}
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
                     {isPaidLesson && (
                        <p className="text-xs text-muted-foreground text-center mt-2 px-2 py-1 bg-accent rounded-md">
                          <ShieldCheck className="w-3 h-3 inline-block mr-1"/>
                          Secure payment processing via Paddle.
                        </p>
                    )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={isProcessing || !selectedLessonDetails || (isIndividualLesson && (!selectedDate || !selectedTime)) || (isGroupLesson && !selectedGroupSession)}
                  >
                    {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                    {isProcessing ? "Processing..." : isPaidLesson ? "Proceed to Payment" : "Confirm Free Trial"}
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

    