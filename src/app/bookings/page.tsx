
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, ArrowLeft, Check, User, MessageSquare, BookOpen, Star, Package } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
// import { PronunciationFeedbackTool } from "@/components/ai/PronunciationFeedbackTool" // MVP: Defer AI tools
// import { AIChatbot } from "@/components/ai/AIChatbot" // MVP: Defer AI tools
// import { NewsletterSignup } from "@/components/newsletter/newsletter-signup" // MVP: Defer newsletter
// import { ReferralCodeInput } from "@/components/payment/ReferralCodeInput" // MVP: Defer referral
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { addDoc, collection, serverTimestamp, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType } from "@/lib/types";
import { Logo } from "@/components/layout/logo"

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
        const parsedStartTime = parse(data.time, 'hh:mm a', slotDate);
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
  for (let h = 9; h < 12; h++) {
    times.push(format(new Date(refDate.setHours(h, 0, 0, 0)), 'hh:mm a'));
    times.push(format(new Date(refDate.setHours(h, 30, 0, 0)), 'hh:mm a'));
  }
  for (let h = 14; h < 17; h++) { 
    times.push(format(new Date(refDate.setHours(h, 0, 0, 0)), 'hh:mm a'));
    times.push(format(new Date(refDate.setHours(h, 30, 0, 0)), 'hh:mm a'));
  }
  times.push(format(new Date(refDate.setHours(17, 0, 0, 0)), 'hh:mm a')); 
  return times;
};

const baseStartTimes = generateBaseStartTimes();

export default function BookLessonPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [selectedType, setSelectedType] = useState("comprehensive");
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [learningGoals, setLearningGoals] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // const [referralCode, setReferralCode] = useState(""); // MVP: Defer referral
  const [dailyBookedRanges, setDailyBookedRanges] = useState<BookedSlotInfo[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const lessonTypes = [
    {
      value: "quick", label: "Quick Practice", duration: 30, price: 25, description: "Conversation practice and pronunciation",
      features: ["Conversation practice", "Pronunciation correction", "Quick grammar review", "Session recording"], type: "individual",
    },
    {
      value: "comprehensive", label: "Comprehensive Lesson", duration: 60, price: 45, description: "Structured lesson with cultural context",
      features: ["Structured lesson plan", "Cultural context & stories", "Homework & materials", "Progress tracking", "Session recording"], type: "individual",
    },
    {
      value: "cultural", label: "Cultural Immersion", duration: 90, price: 65, description: "Deep dive into Ethiopian culture and heritage",
      features: ["Traditional stories & proverbs", "Cultural customs & etiquette", "Family conversation prep", "Regional dialects", "Cultural materials included"], type: "individual",
    },
    // MVP: Simplify, maybe hide group/package options from direct booking initially or link to package page
    // {
    //   value: "group-conversation", label: "Group Conversation", duration: 60, price: 20, description: "Practice with fellow learners (4-6 students)",
    //   features: ["Small group setting (4-6 students)", "Conversation practice", "Peer learning experience", "Cultural discussions", "Session recording"], type: "group",
    // },
    {
      value: "quick-practice-bundle", label: "Quick Practice Bundle", duration: 30, price: 220, originalPrice: 250, totalLessons: 10,
      description: "10 conversation practice sessions with 12% savings",
      features: ["10 x 30-minute lessons", "Conversation practice focus", "12% discount", "Valid for 4 months", "Priority booking"], type: "package",
    },
    {
      value: "learning-intensive", label: "Learning Intensive", duration: 60, price: 304, originalPrice: 360, totalLessons: 8,
      description: "8 comprehensive lessons with 15% savings",
      features: ["8 x 60-minute lessons", "Structured lesson plans", "15% discount", "Valid for 4 months", "Progress reviews"], type: "package",
    },
  ];

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
    const userDurationMinutes = selectedLessonDetails.duration as number;
    const slotDate = startOfDay(selectedDate); 

    for (const startTimeString of baseStartTimes) {
      const potentialStartTime = parse(startTimeString, 'hh:mm a', slotDate);
      if (isNaN(potentialStartTime.getTime())) {
          console.warn(`Could not parse base start time: ${startTimeString}`);
          continue;
      }
      const potentialEndTime = addMinutes(potentialStartTime, userDurationMinutes);
      const dayEndHour = 18;
      if (potentialEndTime.getHours() > dayEndHour || (potentialEndTime.getHours() === dayEndHour && potentialEndTime.getMinutes() > 0)) {
          continue; 
      }
      let isSlotBooked = false;
      for (const bookedRange of dailyBookedRanges) {
        if (potentialStartTime < bookedRange.endTimeDate && potentialEndTime > bookedRange.startTimeDate) {
          isSlotBooked = true;
          break;
        }
      }
      slots.push({
        display: `${format(potentialStartTime, 'p')} - ${format(potentialEndTime, 'p')}`,
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
      toast({ title: "Selection Incomplete", description: "Please select date and time for your lesson.", variant: "destructive" });
      return;
    }
    if (selectedLessonDetails.type === 'package' && !selectedDate) {
         toast({ title: "Selection Incomplete", description: "Please select a start date for your package.", variant: "destructive" });
         return;
    }

    setIsProcessing(true);
    try {
      const bookingData: Omit<BookingType, 'id' | 'createdAt'> = {
        userId: user.uid,
        userName: user.displayName || "User",
        userEmail: user.email || "",
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : "N/A_PACKAGE",
        time: selectedTime || "N/A_PACKAGE",
        duration: typeof selectedLessonDetails.duration === 'number' ? selectedLessonDetails.duration : 0,
        lessonType: selectedLessonDetails.label,
        price: selectedLessonDetails.price,
        status: "confirmed", // MVP: Confirm directly. Later, might be "pending_payment"
        tutorId: "MahirAbasMustefa",
        tutorName: tutorInfo.name,
        learningGoals: learningGoals || undefined,
      };

      await addDoc(collection(db, "bookings"), {
        ...bookingData,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Lesson Booked Successfully!",
        description: `Your ${selectedLessonDetails.label} ${selectedDate && selectedTime ? `on ${format(selectedDate, 'PPP')} at ${selectedTime}`: ''} is confirmed.`,
      });
      
      if(selectedDate) {
        setIsFetchingSlots(true);
        getBookedSlotsData(selectedDate).then(ranges => {
            setDailyBookedRanges(ranges);
            setIsFetchingSlots(false);
        });
      }
      setSelectedTime(undefined); 
      setLearningGoals("");
    } catch (error) {
      console.error("Booking error:", error);
      toast({ title: "Booking Failed", description: "Could not complete your booking. Please try again.", variant: "destructive" });
    } finally {
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
            <span>Back to LissanHub</span>
          </Link>
          <Logo />
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
                    {["individual", "package"].map(lessonGroupType => ( // MVP: Removed "group" for simplicity
                       <div key={lessonGroupType}>
                        <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">{lessonGroupType} Lessons</h3>
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
                                            {lesson.type === "package" && <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">Package</Badge>}
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
                                    <div className="grid md:grid-cols-2 gap-2 mt-3 text-sm">
                                        {lesson.features.slice(0, 2).map((feature, index) => ( // MVP: Show fewer features
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                        ))}
                                    </div>
                                    </div>
                                </Label>
                                </div>
                            ))}
                        </div>
                        {lessonGroupType === 'package' && (
                             <div className="mt-4 p-4 bg-accent/70 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                <Package className="w-5 h-5 text-primary" />
                                <span className="font-semibold text-accent-foreground">More Packages Available</span>
                                </div>
                                <Button asChild variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                                  <Link href="/packages">View All Packages</Link>
                                </Button>
                            </div>
                        )}
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
                        <CardDescription>You can select a preferred start date, or schedule lessons individually later from your dashboard.</CardDescription>
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
                  placeholder="What would you like to focus on?"
                  value={learningGoals}
                  onChange={(e) => setLearningGoals(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* MVP: Comment out AI tools & Newsletter from booking page */}
            {/* 
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Star className="w-5 h-5 text-primary" /> Pronunciation Practice
                </CardTitle>
                 <CardDescription>Warm up or test your pronunciation.</CardDescription>
              </CardHeader>
              <CardContent>
                <PronunciationFeedbackTool />
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <User className="w-5 h-5 text-primary" /> AI Tutor Chat
                 </CardTitle>
                  <CardDescription>Practice basic conversation with Lissan AI.</CardDescription>
               </CardHeader>
               <CardContent>
                <AIChatbot />
               </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <MessageSquare className="w-5 h-5 text-primary" /> Stay Updated
                  </CardTitle>
                  <CardDescription>Get weekly Amharic tips and news from LissanHub.</CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterSignup />
              </CardContent>
            </Card>
            */}
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
                    <span className="text-sm text-muted-foreground ml-1">(200+ reviews)</span>
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
                      {selectedLessonDetails.type !== 'package' && typeof selectedLessonDetails.duration === 'number' && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium text-foreground">{selectedLessonDetails.duration} minutes</span>
                        </div>
                      )}
                       {selectedLessonDetails.type === 'package' && typeof selectedLessonDetails.duration === 'string' && (
                         <div className="flex justify-between">
                          <span className="text-muted-foreground">Contains:</span>
                          <span className="font-medium text-foreground">{selectedLessonDetails.duration}</span>
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
                        {`${format(parse(selectedTime, 'hh:mm a', selectedDate || new Date()), 'p')} - ${format(addMinutes(parse(selectedTime, 'hh:mm a', selectedDate || new Date()), selectedLessonDetails?.duration as number), 'p')}`}
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
                  </div>
                )}

                <div className="space-y-3">
                  <Badge variant="secondary" className="w-full justify-center py-2 bg-accent text-accent-foreground">
                    <Check className="w-4 h-4 mr-2 text-primary" />
                    Secure Booking (Payment later for MVP)
                  </Badge>
                  {/* <ReferralCodeInput referralCode={referralCode} setReferralCode={setReferralCode} /> MVP: Defer referral */ }
                  <Button
                    className="w-full"
                    onClick={handleBooking}
                    disabled={isProcessing || !selectedLessonDetails || (selectedLessonDetails.type !== 'package' && (!selectedDate || !selectedTime)) || (selectedLessonDetails.type === 'package' && !selectedDate) }
                  >
                    {isProcessing ? <Spinner size="sm" className="mr-2" /> : null}
                    {isProcessing ? "Processing..." : `Confirm Booking - $${selectedLessonDetails?.price || 0}`}
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 text-center">
                  <p>• Free cancellation up to 24 hours before.</p>
                  <p>• You'll receive a Zoom link via email.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
