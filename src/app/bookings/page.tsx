

"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Clock, ArrowLeft, Check, User, MessageSquare, BookOpen, Star, Package, Users, ShieldCheck, Ticket, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, isPast, startOfDay, isEqual, addMinutes, parse, isValid, addMonths } from 'date-fns';
import { Spinner } from "@/components/ui/spinner"
import { tutorInfo } from "@/config/site"
import type { Booking as BookingType, TimeOff } from "@/lib/types";
import { SiteLogo } from "@/components/layout/SiteLogo"

import { getAvailability } from "@/services/availabilityService";
import { TimeSlot, TimeSlotProps } from "@/components/bookings/time-slot"
import { DateSelection } from "@/components/bookings/date-selection"
import { products, type ProductId } from "@/config/products"; 
import { creditToLessonMap } from "@/config/creditMapping";

// The lessonTypes array is now derived from the server-side product catalog
const lessonTypes = Object.entries(products).map(([id, details]) => ({
  id: id as ProductId,
  ...details,
}));

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
  
  const useCreditType = searchParams.get('useCredit') as ProductId | null;
  const creditPurchasedAt = searchParams.get('creditPurchasedAt');
  const creditExpiryDate = creditPurchasedAt ? addMonths(new Date(creditPurchasedAt), 6) : null;
  
  const initialTypeFromUrl = searchParams.get('type') as ProductId | null;
  
  const getInitialProductId = (): ProductId => {
    if (useCreditType && creditToLessonMap[useCreditType]) {
      return creditToLessonMap[useCreditType] as ProductId;
    }
    if (initialTypeFromUrl && lessonTypes.some(l => l.id === initialTypeFromUrl)) {
      return initialTypeFromUrl;
    }
    return "comprehensive-lesson";
  };
  
  const [selectedProductId, setSelectedProductId] = useState<ProductId>(getInitialProductId());
  const [selectedDate, setSelectedDateState] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [paymentNote, setPaymentNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dailyBookedSlots, setDailyBookedSlots] = useState<BookingType[]>([]);
  const [dailyTimeOff, setDailyTimeOff] = useState<TimeOff[]>([]);
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  const selectedProduct = lessonTypes.find((p) => p.id === selectedProductId);
  const isTimeRequired = selectedProduct?.type === 'individual' || selectedProduct?.type === 'group';

  useEffect(() => {
    if (useCreditType && creditToLessonMap[useCreditType]) {
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
    if (isTimeRequired && selectedDate && isValid(selectedDate)) {
        fetchAvailability(selectedDate);
    } else {
      setDailyBookedSlots([]);
      setDailyTimeOff([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isTimeRequired]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))) {
      toast({ title: "Invalid Date", description: "Cannot select a past date.", variant: "destructive" });
      setSelectedDateState(undefined);
    } else {
      setSelectedDateState(date);
    }
  };

  const displayTimeSlots = useMemo(() => {
    if (!selectedDate || !isTimeRequired || !selectedProduct || typeof selectedProduct.duration !== 'number') return [];
    
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
                const bookingStart = new Date(booking.startTime as any);
                const bookingEnd = new Date(booking.endTime as any);
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
            const blockStart = new Date(block.startISO);
            const blockEnd = new Date(block.endISO);
            if (potentialStartTime < blockEnd && potentialEndTime > blockStart) {
                currentStatus = 'blocked';
                timeOffMeta = block;
                break;
            }
        }

        slots.push({ display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`, value: startTimeString, status: currentStatus, blockedMeta: timeOffMeta });
    }
    return slots;
}, [selectedDate, isTimeRequired, selectedProduct, dailyBookedSlots, dailyTimeOff]);


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
    if (isTimeRequired && (!selectedDate || !selectedTime)) {
      toast({ title: "Selection Incomplete", description: "Please select a date and time.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);

    try {
        const idToken = await user.getIdToken();
        let response;
        
        if (useCreditType) {
            const payload = {
                creditType: useCreditType,
                userId: user.uid,
                date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                time: selectedTime || '',
                notes: paymentNote.trim(),
            };
            response = await fetch('/api/bookings/create-with-credit', {
                 method: 'POST',
                 headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                 },
                 body: JSON.stringify(payload),
            });
        } else {
             const payload = {
                productId: selectedProduct.id,
                userId: user.uid,
                ...(isTimeRequired && { 
                    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined, 
                    time: selectedTime 
                }),
                ...(paymentNote.trim() && { paymentNote: paymentNote.trim() }),
            };
            response = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(payload),
            });
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Booking creation failed.');
        }

        if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
        } else {
            throw new Error("No redirect URL received from server.");
        }

    } catch (error: any) {
      console.error("Booking process failed:", error);
      toast({
          title: "Booking Failed",
          description: error.message.includes('slot_already_booked') 
            ? "This slot is no longer available. Please select another." 
            : error.message || "Could not complete your booking. Please try again.",
          variant: "destructive",
      });
      if (selectedDate) fetchAvailability(selectedDate);
      setIsProcessing(false);
    }
  };

  const isPaidLesson = (selectedProduct?.price || 0) > 0 && !useCreditType;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/credits" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <SiteLogo />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 text-center">
          <Badge className="mb-4 bg-accent text-accent-foreground">Book Your Lesson</Badge>
          <h1 className="text-4xl font-bold text-foreground mb-2">Start Your Amharic Journey</h1>
          <p className="text-xl text-muted-foreground">Schedule a lesson with {tutorInfo.name}</p>
        </div>

        {useCreditType && selectedProduct && (
            <Card className="mb-8 bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                    <Ticket className="w-6 h-6 text-primary"/>
                    <div>
                        <h3 className="font-semibold text-primary">Booking with Credit</h3>
                        <p className="text-sm text-muted-foreground">You are using one credit for a <span className="font-medium text-foreground">{selectedProduct.label}</span>.</p>
                        {creditExpiryDate && (
                            <p className="text-xs text-muted-foreground mt-1">This credit is valid for booking lessons until {format(creditExpiryDate, 'PPP')}.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             {!useCreditType && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Choose Your Lesson or Package
                  </CardTitle>
                  <CardDescription>Select the format that best fits your learning goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedProductId} onValueChange={(value) => {setSelectedProductId(value as ProductId); setSelectedTime(undefined); setSelectedDateState(undefined);}} disabled={!!useCreditType}>
                    <div className="space-y-6">
                      {["individual", "group", "package"].map(lessonGroupType => (
                         <div key={lessonGroupType}>
                          <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
                              {lessonGroupType.replace('-', ' ')} Lessons
                          </h3>
                          <div className="space-y-4">
                              {lessonTypes
                              .filter((lesson) => lesson.type === lessonGroupType)
                              .map((lesson) => (
                                  <div key={lesson.id} className="flex items-start space-x-3">
                                  <RadioGroupItem value={lesson.id} id={lesson.id} className="mt-1" />
                                  <Label htmlFor={lesson.id} className="flex-1 cursor-pointer">
                                      <div className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors ${selectedProductId === lesson.id ? "bg-accent border-primary ring-2 ring-primary" : "border-border"}`}>
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
                                          <div className="text-2xl font-bold text-primary">${lesson.price}</div>
                                          {lesson.originalPrice && <div className="text-sm text-muted-foreground line-through">${lesson.originalPrice}</div>}
                                          </div>
                                      </div>
                                      <ul className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-3 text-sm list-none p-0">
                                          {lesson.features.map((feature, index) => ( <li key={index} className="flex items-center gap-2"> <Check className="w-4 h-4 text-primary flex-shrink-0" /> <span className="text-muted-foreground">{feature}</span> </li> ))}
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
             )}


            {isTimeRequired && (
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
                            toDate={creditExpiryDate || undefined}
                          />
                      </CardContent>
                </Card>

                {selectedDate && (
                <Card className="shadow-lg">
                    <CardHeader>
                    <CardTitle className="text-xl text-foreground flex items-center gap-2"> <Clock className="w-5 h-5 text-primary" /> Select Time Slot </CardTitle>
                    <CardDescription>Available slots for {format(selectedDate, 'PPP')}. (Your local time)</CardDescription>
                    </CardHeader>
                    <CardContent>
                    {isFetchingSlots ? <div className="flex justify-center items-center h-24"><Spinner /></div>
                    : displayTimeSlots.length === 0 ? <p className="text-muted-foreground text-center py-4">No available slots for this duration/date.</p>
                    : <div className="grid grid-cols-2 md:grid-cols-3 gap-3"> {displayTimeSlots.map((slot) => ( <TimeSlot key={slot.value} {...slot} isSelected={selectedTime === slot.value} onClick={(clickedSlot) => setSelectedTime(clickedSlot.value)} /> ))} </div>
                    }
                    </CardContent>
                </Card>
                )}
              </>
            )}
            
            {selectedProduct?.type === 'package' && (
                 <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl text-foreground"> <Package className="w-5 h-5 text-primary" /> Package Details </CardTitle>
                        <CardDescription>After purchase, your credits will be added to your account. You can then book lessons from your dashboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <p className="text-muted-foreground text-sm">You are purchasing a package of lessons. No time selection is needed now. After your payment is confirmed, you will find your lesson credits in your student dashboard, ready to be used for booking individual sessions at your convenience.</p>
                    </CardContent>
                </Card>
            )}

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
                  <div className="flex items-center justify-center gap-1 mt-2"> {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" /> ))} <span className="text-sm text-muted-foreground ml-1">(Highly Rated)</span> </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Booking Summary</h4>
                  {selectedProduct && (
                    <div className="space-y-2">
                      <div className="flex justify-between"> <span className="text-muted-foreground">Selected:</span> <span className="font-medium text-right text-foreground">{selectedProduct.label}</span> </div>
                      {(selectedProduct.type !== 'package') && ( <div className="flex justify-between"> <span className="text-muted-foreground">Duration:</span> <span className="font-medium text-foreground">{selectedProduct.duration} minutes</span> </div> )}
                      {selectedProduct.type === 'package' && ( <div className="flex justify-between"> <span className="text-muted-foreground">Contains:</span> <span className="font-medium text-foreground">{selectedProduct.duration}</span> </div> )}
                    </div>
                  )}
                  {selectedDate && selectedProduct?.type !== 'package' && ( <div className="flex justify-between"> <span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground"> {format(selectedDate, "PPP")} </span> </div> )}
                  {selectedTime && isTimeRequired && ( <div className="flex justify-between"> <span className="text-muted-foreground">Time:</span> <span className="font-medium text-foreground"> {selectedTime} </span> </div> )}
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
                  <Button className="w-full" onClick={handleBooking} disabled={isProcessing || !selectedProduct || (isTimeRequired && (!selectedDate || !selectedTime))}>
                    {isProcessing && <Spinner size="sm" className="mr-2" />}
                    {isProcessing ? "Processing..." 
                      : useCreditType ? "Confirm with 1 Credit"
                      : isPaidLesson ? "Proceed to Payment" 
                      : "Confirm Free Trial"}
                  </Button>
                   {!useCreditType && user && selectedProduct?.type !== 'package' && (
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
