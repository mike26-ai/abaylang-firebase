
"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, ArrowLeft, Check, User, MessageSquare, BookOpen, Star, Package, Users, ShieldCheck, Ticket, CircleAlert } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse, isValid, differenceInHours } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType, TimeOff, GroupSession, UserProfile, UserCredit } from "@/lib/types";
import { SiteLogo } from "@/components/layout/SiteLogo"
import { paddlePriceIds } from "@/config/paddle";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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

const creditMap: Record<string, string[]> = {
    "quick-practice": ["quick-practice-bundle", "starter-bundle"],
    "comprehensive-lesson": ["learning-intensive", "foundation-pack"],
};

export default function BookLessonPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type');

  const lessonTypes = [
    // ... (lessonTypes array remains the same)
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

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    if (user && !authLoading) {
      const fetchUserProfile = async () => {
        setIsLoadingProfile(true);
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserProfile(userDocSnap.data() as UserProfile);
        }
        setIsLoadingProfile(false);
      };
      fetchUserProfile();
    } else if (!user && !authLoading) {
        setIsLoadingProfile(false);
    }
  }, [user, authLoading]);

  const availableCreditsForSelectedType = useMemo(() => {
    if (!userProfile || !selectedType) return null;
    const applicablePackageTypes = creditMap[selectedType] || [];
    for (const packageType of applicablePackageTypes) {
      const credit = userProfile.credits?.find(c => c.lessonType === packageType && c.count > 0);
      if (credit) {
        return credit;
      }
    }
    return null;
  }, [userProfile, selectedType]);

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
    const userDurationMinutes = selectedLessonDetails.duration as number;
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
        return relevantSessions;
    }
    const startOfSelected = startOfDay(selectedDate);
    return relevantSessions.filter(s => {
        const sessionDate = (s.startTime as unknown as Timestamp).toDate();
        return isEqual(startOfDay(sessionDate), startOfSelected);
    });
  }, [allGroupSessions, isGroupLesson, selectedLessonDetails, selectedDate]);


  const handleBooking = async () => {
    // ... (rest of the handleBooking function)
  };

  const isBookingWithCredit = !!availableCreditsForSelectedType;
  const isPaidLesson = (selectedLessonDetails?.price || 0) > 0 && !isBookingWithCredit;

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
        
        {user && !isLoadingProfile && (userProfile?.credits?.length || 0) > 0 && (
          <Card className="mb-8 shadow-lg bg-gradient-to-r from-primary/10 to-accent/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Ticket className="w-5 h-5 text-primary" /> Your Available Credits</CardTitle>
              <CardDescription>You can use these credits to book lessons directly.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {userProfile?.credits?.map(credit => (
                <div key={credit.lessonType} className="p-3 bg-background/50 rounded-lg border flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-foreground capitalize">{credit.lessonType.replace(/-/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{credit.count} remaining</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* ... Radio Group for lesson types ... */}

            {/* ... Other cards ... */}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-20">
              {/* ... Tutor Info Card ... */}
              <CardContent>
                {/* ... */}
                {isBookingWithCredit && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-foreground">Total:</span>
                      <span className="text-primary">$0</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2 px-2 py-1 bg-accent rounded-md">
                      <Ticket className="w-3 h-3 inline-block mr-1"/>
                      This lesson will be redeemed using 1 credit from your '{availableCreditsForSelectedType.lessonType.replace(/-/g, ' ')}' package.
                    </p>
                  </div>
                )}
                
                {selectedLessonDetails && !isBookingWithCredit && (
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
                    {isProcessing ? "Processing..." : isBookingWithCredit ? "Book with 1 Credit" : isPaidLesson ? "Proceed to Payment" : "Confirm Free Trial"}
                  </Button>
                </div>
                {/* ... */}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
