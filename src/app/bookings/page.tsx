

"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, ArrowLeft, Check, User, MessageSquare, BookOpen, Star, Package, Users, ShieldCheck, Ticket } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse, isValid, parseISO } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType, TimeOff, GroupSession } from "@/lib/types";
import { SiteLogo } from "@/components/layout/SiteLogo"

import { getAvailability } from "@/services/availabilityService";
import { createBooking, createBookingWithCredit } from "@/services/bookingService";
import { getGroupSessions } from "@/services/groupSessionService";
import { products, type ProductId } from "@/config/products"; 
import { creditToLessonMap } from "@/config/creditMapping";
import { TimeSlot, TimeSlotProps } from "@/components/bookings/time-slot"
import { DateSelection } from "@/components/bookings/date-selection"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const lessonTypes = Object.entries(products).map(([id, product]) => ({ ...product, id: id as ProductId }));

const generateBaseStartTimes = (): string[] => {
  const times: string[] = [];
  const refDate = new Date();
  for (let h = 0; h < 24; h++) {
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
  
  const lessonTypeFromUrl = searchParams.get('lessonType') as ProductId | null;
  const useCreditType = searchParams.get('useCredit') as ProductId | null;

  const getInitialProductId = (): ProductId => {
    if (useCreditType && creditToLessonMap[useCreditType]) {
      return creditToLessonMap[useCreditType] as ProductId;
    }
    if (lessonTypeFromUrl && products[lessonTypeFromUrl]) {
        return lessonTypeFromUrl;
    }
    return "comprehensive-lesson";
  };
  
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(() => getInitialProductId());
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [paymentNote, setPaymentNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dailyBookedSlots, setDailyBookedSlots] = useState<BookingType[]>([]);
  const [dailyTimeOff, setDailyTimeOff] = useState<TimeOff[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);
  
  const [groupSessions, setGroupSessions] = useState<GroupSession[]>([]);
  const [isFetchingGroupSessions, setIsFetchingGroupSessions] = useState(false);
  const [selectedGroupSessionId, setSelectedGroupSessionId] = useState<string | null>(null);

  const hasUserSelectedRef = useRef(false);

  const selectedProduct = products[selectedProductId];
  const isIndividualLesson = selectedProduct?.type === 'individual';
  const isPublicGroupLesson = selectedProduct?.type === 'group';
  const isPrivateGroup = selectedProduct?.type === 'private-group';
  const isPackage = selectedProduct?.type === 'package';

  useEffect(() => {
    if (!hasUserSelectedRef.current && useCreditType && creditToLessonMap[useCreditType]) {
      setSelectedProductId(creditToLessonMap[useCreditType] as ProductId);
    }
  }, [useCreditType]);

  const fetchAvailability = async (date: Date) => {
    setIsFetchingSlots(true);
    try {
        const { bookings, timeOff } = await getAvailability(date);
        setDailyBookedSlots(bookings);
        setDailyTimeOff(timeOff || []);
        setSelectedTime(undefined);
    } catch (error) {
        console.error("Failed to get availability data:", error);
        toast({ title: "Error", description: "Could not fetch available slots.", variant: "destructive" });
    } finally {
        setIsFetchingSlots(false);
    }
  }

  useEffect(() => {
    if ((isIndividualLesson || isPrivateGroup) && selectedDate && isValid(selectedDate)) {
        fetchAvailability(selectedDate);
    } else {
      setDailyBookedSlots([]);
      setDailyTimeOff([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isIndividualLesson, isPrivateGroup]);

  useEffect(() => {
    if (isPublicGroupLesson) {
        setIsFetchingGroupSessions(true);
        getGroupSessions().then(sessions => {
            const filteredSessions = sessions.filter(s => {
                const productKey = Object.keys(products).find(key => products[key as ProductId].label === s.title);
                return productKey === selectedProductId;
            });
            setGroupSessions(filteredSessions);
        }).catch(error => {
            console.error("Failed to get group sessions:", error);
            toast({ title: "Error", description: "Could not fetch group sessions.", variant: "destructive" });
        }).finally(() => {
            setIsFetchingGroupSessions(false);
        });
    }
  }, [isPublicGroupLesson, selectedProductId, toast]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
      toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive" });
      setSelectedDateState(undefined);
    } else {
      setSelectedDateState(date);
    }
  };

  const displayTimeSlots = useMemo(() => {
    if (!selectedDate || (!isIndividualLesson && !isPrivateGroup) || !selectedProduct || typeof selectedProduct.duration !== 'number') return [];
    
    const slots: TimeSlotProps[] = [];
    const userDurationMinutes = selectedProduct.duration;
    const slotDate = startOfDay(selectedDate);
    const now = new Date();
    const isToday = isEqual(slotDate, startOfDay(now));

    for (const startTimeString of baseStartTimes) {
        const potentialStartTime = parse(startTimeString, 'HH:mm', slotDate);
        const potentialEndTime = addMinutes(potentialStartTime, userDurationMinutes);

        if (isToday && isPast(potentialStartTime)) continue;

        let currentStatus: 'available' | 'booked' | 'blocked' = 'available';
        let bookingMeta: BookingType | undefined;
        let timeOffMeta: TimeOff | undefined;

        for (const booking of dailyBookedSlots) {
            if (booking.startTime && booking.endTime) {
                 const bookingStart = booking.startTime instanceof Date ? booking.startTime : parseISO(booking.startTime as any);
                 const bookingEnd = booking.endTime instanceof Date ? booking.endTime : parseISO(booking.endTime as any);

                if (potentialStartTime < bookingEnd && potentialEndTime > bookingStart) {
                    currentStatus = 'booked';
                    bookingMeta = booking;
                    break;
                }
            }
        }
        if (currentStatus === 'booked') {
            slots.push({ display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`, value: startTimeString, status: 'booked', bookedMeta: bookingMeta });
            continue;
        }

        for (const block of dailyTimeOff) {
            const blockStart = block.startISO instanceof Date ? block.startISO : new Date(block.startISO);
            const blockEnd = block.endISO instanceof Date ? block.endISO : new Date(block.endISO);
            if (potentialStartTime < blockEnd && potentialEndTime > blockStart) {
                currentStatus = 'blocked';
                timeOffMeta = block;
                break;
            }
        }

        slots.push({ display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`, value: startTimeString, status: currentStatus, blockedMeta: timeOffMeta });
    }
    return slots;
}, [selectedDate, isIndividualLesson, isPrivateGroup, selectedProduct, dailyBookedSlots, dailyTimeOff]);


  const handleBooking = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Please log in to book a lesson.", variant: "destructive" });
      router.push('/login?redirect=/bookings');
      return;
    }
    if (!selectedProduct) {
      toast({ title: "Selection Incomplete", description: "Please select a lesson type.", variant: "destructive" });
      return;
    }
    
    if (useCreditType) {
        if (!selectedDate || !selectedTime) {
          toast({ title: "Selection Incomplete", description: "Please select a date and time.", variant: "destructive" });
          return;
        }
        setIsProcessing(true);
        try {
            const result = await createBookingWithCredit({
                creditType: useCreditType,
                userId: user.uid,
                date: format(selectedDate, 'yyyy-MM-dd'),
                time: selectedTime,
                notes: paymentNote.trim(),
            });
            if (result.redirectUrl) {
                router.push(result.redirectUrl);
            }
        } catch (error: any) {
            handleBookingError(error);
        } finally {
            setIsProcessing(false);
        }
        return;
    }

    if ((isIndividualLesson || isPrivateGroup) && (!selectedDate || !selectedTime)) {
      toast({ title: "Selection Incomplete", description: "Please select a date and time.", variant: "destructive" });
      return;
    }
     if (isPublicGroupLesson && !selectedGroupSessionId) {
      toast({ title: "Selection Incomplete", description: "Please select a group session to join.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);

    try {
        const payload = {
            productId: selectedProductId,
            userId: user.uid,
            date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined,
            time: selectedTime,
            groupSessionId: isPublicGroupLesson ? selectedGroupSessionId : undefined,
            paymentNote: paymentNote.trim(),
        };

        console.debug("BOOKING_PAYLOAD", payload);

        const data = await createBooking(payload);
        
        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        }
    } catch (error: any) {
        handleBookingError(error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleBookingError = (error: any) => {
    console.error("Booking process failed:", error);
    toast({
        title: "Booking Failed",
        description: error.message.includes('slot_already_booked') 
          ? "This slot is no longer available. Please select another." 
          : error.message || "Could not complete your booking. Please try again.",
        variant: "destructive",
    });
    if (selectedDate && (isIndividualLesson || isPrivateGroup)) fetchAvailability(selectedDate);
    if(isPublicGroupLesson) {
        getGroupSessions().then(sessions => {
            const filteredSessions = sessions.filter(s => {
              const productKey = Object.keys(products).find(key => products[key as ProductId].label === s.title);
              return productKey === selectedProductId;
            });
            setGroupSessions(filteredSessions);
        });
    }
    setIsProcessing(false);
  }

  const isPaidLesson = (selectedProduct?.price || 0) > 0 && !useCreditType;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href={useCreditType ? "/credits" : "/packages"} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <SiteLogo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">{useCreditType ? "Book With Credit" : "Book Your Lesson"}</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-2">{useCreditType ? "Choose a Time" : "Start Your Amharic Journey"}</h1>
          <p className="text-xl text-muted-foreground">{useCreditType ? `Select a date and time for your '${selectedProduct?.label}' lesson.` : `Schedule a lesson with ${tutorInfo.name}`}</p>
        </div>

        {useCreditType && selectedProduct && (
            <Card className="mb-8 bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-primary"/>
                    <div>
                        <h3 className="font-semibold text-primary">Booking with Credit</h3>
                        <p className="text-sm text-muted-foreground">You are using one credit for a <span className="font-medium text-foreground">{selectedProduct.label}</span>. One credit will be deducted upon confirmation.</p>
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            <div key="lesson-selection-wrapper">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {useCreditType ? "Lesson to Book" : "Choose Your Lesson or Package"}
                  </CardTitle>
                  <CardDescription>
                    {useCreditType ? "Your lesson type is locked. Please select a new time." : "Select the format that best fits your learning goals"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-6">
                  {["individual", "private-group", "group", "package"].map(lessonGroupType => (
                    <div key={lessonGroupType}>
                      <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
                        {lessonGroupType.replace(/-/g, ' ')} Lessons
                      </h3>

                      <div className="space-y-4">
                        {lessonTypes
                          .filter((lesson) => lesson.type === lessonGroupType)
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "p-4 border rounded-lg transition-colors",
                                !!useCreditType ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-accent/50",
                                selectedProductId === lesson.id && "bg-accent border-primary ring-2 ring-primary"
                              )}
                              onClick={() => {
                                if (useCreditType) return;
                                setSelectedProductId(lesson.id as ProductId);
                                hasUserSelectedRef.current = true;
                                setSelectedTime(undefined);
                                setSelectedDateState(undefined);
                              }}
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2">
                                <div className="mb-2 sm:mb-0">
                                  <div className="font-semibold text-lg text-foreground flex items-center gap-2">
                                    {lesson.label}
                                    {lesson.price === 0 && <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">Free Trial</Badge>}
                                    {lesson.type === "package" && <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 dark:text-purple-400">Package</Badge>}
                                    {lesson.type === "group" && <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Public Group</Badge>}
                                    {lesson.type === "private-group" && <Badge variant="secondary" className="bg-teal-500/10 text-teal-700 dark:text-teal-400">Private Group</Badge>}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {typeof lesson.duration === 'number' ? `${lesson.duration} minutes` : lesson.duration} • {lesson.description}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-primary">${lesson.price}{lesson.type === 'private-group' ? <span className="text-sm text-muted-foreground">/person</span> : ''}</div>
                                  {lesson.originalPrice && <div className="text-sm text-muted-foreground line-through">${lesson.originalPrice}</div>}
                                </div>
                              </div>

                              <ul className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm list-none p-0">
                                {lesson.features.map((feature, index) => {
                                  const featureKey = `${lesson.id}-feat-${index}-${feature?.toString().slice(0,30).replace(/\s+/g, "-")}`;
                                  return (
                                    <li key={featureKey} className="flex items-center gap-2">
                                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                                      <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
            </div>

            {isPrivateGroup && (
                <div key="private-group-wrapper">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-foreground"> <Users className="w-5 h-5 text-primary" /> Book a Private Group Session </CardTitle>
                            <CardDescription>Organize a lesson just for your friends or family.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                        <p className="text-muted-foreground text-sm">This option allows you to create your own private group. You'll be taken to a separate page to invite your members and choose a time that works for everyone.</p>
                        <Button asChild size="lg">
                            <Link href="/bookings/private-group">
                                Organize Your Private Group
                            </Link>
                        </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {(isIndividualLesson || useCreditType) && (
              <div key="individual-lesson-wrapper" className="space-y-8">
                <Card>
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
                <div key="timeslot-card-wrapper">
                    <Card>
                        <CardHeader>
                        <CardTitle className="text-xl text-foreground flex items-center gap-2"> <Clock className="w-5 h-5 text-primary" /> Select Time Slot </CardTitle>
                        <CardDescription>Available slots for {format(selectedDate, 'PPP')}. (Your local time)</CardDescription>
                        </CardHeader>
                        <CardContent>
                        {isFetchingSlots ? <div className="flex justify-center items-center h-24 col-span-full"><Spinner /></div>
                        : displayTimeSlots.length === 0 ? <p className="text-muted-foreground text-center py-4 col-span-full">No available slots for this duration/date.</p>
                        : <div className="grid grid-cols-2 md:grid-cols-3 gap-3"> {displayTimeSlots.map((slot) => ( <TimeSlot key={slot.value} {...slot} isSelected={selectedTime === slot.value} onClick={(clickedSlot) => setSelectedTime(clickedSlot.value)} /> ))} </div>
                        }
                        </CardContent>
                    </Card>
                </div>
                )}
              </div>
            )}
            
             {isPublicGroupLesson && (
              <div key="public-group-wrapper">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                      <Calendar className="w-5 h-5 text-primary" />
                      Join an Upcoming Group Session
                    </CardTitle>
                    <CardDescription>Select one of the scheduled sessions below to book your spot.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isFetchingGroupSessions ? <div className="flex justify-center items-center h-24"><Spinner /></div>
                    : groupSessions.length === 0 ? <p className="text-muted-foreground text-center py-4">No upcoming group sessions for this type. Please check back later.</p>
                    : (
                      <div className="space-y-4">
                          {groupSessions.map((session) => (
                            <div key={session.id}
                              className={cn("p-4 border rounded-lg hover:bg-accent/50", selectedGroupSessionId === session.id && "bg-accent border-primary ring-2 ring-primary", session.participantCount >= session.maxStudents ? "cursor-not-allowed opacity-60" : "cursor-pointer")}
                              onClick={() => {
                                if (session.participantCount < session.maxStudents) {
                                  setSelectedGroupSessionId(session.id);
                                }
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold text-foreground">{session.title}</p>
                                  <p className="text-sm text-muted-foreground">{format(new Date(session.startTime as any), 'eeee, PPP \'at\' p')}</p>
                                </div>
                                <Badge variant={session.participantCount >= session.maxStudents ? "destructive" : "secondary"}>
                                    <Users className="w-3 h-3 mr-1.5"/>
                                    {session.participantCount} / {session.maxStudents} spots filled
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            
            {isPackage && (
                <div key="package-wrapper">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl text-foreground"> <Package className="w-5 h-5 text-primary" /> Package Details </CardTitle>
                            <CardDescription>After purchase, your credits will be added to your account. You can then book lessons from your dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <p className="text-muted-foreground text-sm">You are purchasing a package of lessons. No time selection is needed now. After your payment is confirmed, you will find your lesson credits in your student dashboard, ready to be used for booking individual sessions at your convenience.</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {!useCreditType && !isPrivateGroup && (
              <div key="notes-wrapper">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl text-foreground"> <MessageSquare className="w-5 h-5 text-primary" /> Notes (Optional) </CardTitle>
                    <CardDescription> Add a note for your tutor. </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder={ "e.g., conversational Amharic for family, basic reading/writing..." } value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} rows={4} className="resize-none" />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="shadow-lg sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground"> <User className="w-5 h-5 text-primary" /> Your Tutor </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent rounded-full mx-auto mb-3 flex items-center justify-center"> <span className="text-2xl text-primary font-bold">{tutorInfo.name.split(" ").map(n=>n[0]).join("")}</span> </div>
                  <h3 className="font-semibold text-foreground">{tutorInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{tutorInfo.shortIntro}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => {
                        const starKey = `tutor-star-${i}-${tutorInfo.name.slice(0,3).replace(/\s+/g, "-")}`;
                        return (
                           <Star key={starKey} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        )
                    })}
                    <span className="text-sm text-muted-foreground ml-1">(Highly Rated)</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Booking Summary</h4>
                  {selectedProduct && (
                    <div className="space-y-2">
                      <div className="flex justify-between"> <span className="text-muted-foreground">Selected:</span> <span className="font-medium text-right text-foreground">{selectedProduct.label}</span> </div>
                      {(!isPackage && typeof selectedProduct.duration === 'number') && ( <div className="flex justify-between"> <span className="text-muted-foreground">Duration:</span> <span className="font-medium text-foreground">{selectedProduct.duration} minutes</span> </div> )}
                      {isPackage && ( <div className="flex justify-between"> <span className="text-muted-foreground">Contains:</span> <span className="font-medium text-foreground">{selectedProduct.duration}</span> </div> )}
                    </div>
                  )}
                  {selectedDate && !isPackage && !isPublicGroupLesson && ( <div className="flex justify-between"> <span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground"> {format(selectedDate, "PPP")} </span> </div> )}
                  {selectedTime && !isPackage && !isPublicGroupLesson && ( <div className="flex justify-between"> <span className="text-muted-foreground">Time:</span> <span className="font-medium text-foreground"> {selectedTime} </span> </div> )}
                  {selectedGroupSessionId && isPublicGroupLesson && (
                      <div className="flex justify-between">
                          <span className="text-muted-foreground">Session:</span>
                          <span className="font-medium text-foreground">{format(new Date(groupSessions.find(s=>s.id === selectedGroupSessionId)?.startTime as any), 'PPP p')}</span>
                      </div>
                  )}
                </div>
                
                {selectedProduct && (
                  <div className="border-t border-border pt-4">
                     {useCreditType ? (
                        <div className="flex justify-between text-lg font-bold"> <span className="text-foreground">Total:</span> <span className="text-primary">1 Credit</span> </div>
                     ) : (
                        <div className="flex justify-between text-lg font-bold"> <span className="text-foreground">Total:</span> <span className="text-primary">${selectedProduct.price}</span> </div>
                     )}
                    {isPaidLesson && ( <p className="text-xs text-muted-foreground text-center mt-2 px-2 py-1 bg-accent rounded-md"> <ShieldCheck className="w-3 h-3 inline-block mr-1"/> Secure payment processing via Paddle. </p> )}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button className="w-full" onClick={handleBooking} disabled={isProcessing || !selectedProduct || ((isIndividualLesson || isPrivateGroup) && (!selectedDate || !selectedTime)) || (isPublicGroupLesson && !selectedGroupSessionId) }>
                    {isProcessing && <Spinner size="sm" className="mr-2" />}
                    {isPrivateGroup ? "Organize on Next Page" : isProcessing ? "Processing..." : useCreditType ? "Confirm with 1 Credit" : isPaidLesson ? "Proceed to Payment" : "Confirm Free Trial"}
                  </Button>
                   {!useCreditType && user && !isPackage && !isPublicGroupLesson && !isPrivateGroup && (
                        <Button className="w-full" variant="outline" asChild>
                            <Link href="/credits">
                                <Ticket className="w-4 h-4 mr-2"/>
                                Use a Credit
                            </Link>
                        </Button>
                    )}
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
