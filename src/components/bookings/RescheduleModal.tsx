
"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Booking } from "@/lib/types";
import { createBookingWithCredit, requestReschedule } from "@/services/bookingService";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "../ui/spinner";
import { format, isValid } from "date-fns";
import { getAvailability } from "@/services/availabilityService";
import { products, ProductId } from "@/config/products";
import { creditToLessonMap } from "@/config/creditMapping";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlot, TimeSlotProps } from "@/components/bookings/time-slot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";


interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess: () => void;
  originalBooking: Booking | null;
}

export function RescheduleModal({ isOpen, onClose, onRescheduleSuccess, originalBooking }: RescheduleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availability, setAvailability] = useState<{ bookings: Booking[]; timeOff: any[] }>({ bookings: [], timeOff: [] });
  const [isFetchingSlots, setIsFetchingSlots] = useState(false);

  // Determine the lesson details from the original booking
  const lessonDetails = useMemo(() => {
    if (!originalBooking?.productId) return null;
    return products[originalBooking.productId as ProductId] || null;
  }, [originalBooking]);

  const fetchAvailability = async (date: Date) => {
    setIsFetchingSlots(true);
    try {
      const data = await getAvailability(date);
      setAvailability(data);
      setSelectedTime(undefined); // Reset time when date changes
    } catch (error: any) {
      toast({ title: "Error fetching availability", description: error.message, variant: "destructive" });
    } finally {
      setIsFetchingSlots(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && selectedDate && isValid(selectedDate)) {
      fetchAvailability(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isOpen]);


  const timeSlots = useMemo((): TimeSlotProps[] => {
    if (!selectedDate || !lessonDetails || typeof lessonDetails.duration !== 'number') return [];
    
    // This logic should be robust enough to handle time slot generation
    // It's simplified here for brevity but should be consistent with the main booking page
    const slots: TimeSlotProps[] = [];
    const now = new Date();
    // Your existing time slot generation logic...
    // Make sure it uses `availability.bookings` and `availability.timeOff`
    return slots;
  }, [selectedDate, lessonDetails, availability]);


  const handleConfirmReschedule = async () => {
    if (!user || !selectedDate || !selectedTime || !originalBooking) {
      toast({ title: "Selection Required", description: "Please select a new date and time.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
      // Step 1: Cancel the original booking to get a credit. This is now safe.
      const rescheduleResponse = await requestReschedule({
          bookingId: originalBooking.id,
          reason: "Student initiated reschedule from dashboard.",
      });

      if (!rescheduleResponse.success || !rescheduleResponse.credit) {
          throw new Error(rescheduleResponse.message || "Failed to issue reschedule credit.");
      }
      
      const creditType = rescheduleResponse.credit.lessonType;

      // Step 2: Use the issued credit to book the new lesson. This only runs if step 1 succeeds.
      await createBookingWithCredit({
        creditType: creditType,
        userId: user.uid,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      });
      
      toast({ title: "Reschedule Successful", description: "Your lesson has been moved to the new time." });
      onRescheduleSuccess();
      
    } catch (error: any) {
       toast({ title: "Reschedule Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reschedule Lesson</DialogTitle>
          <DialogDescription>
            Select a new date and time for your &quot;{lessonDetails?.label || 'lesson'}&quot;. The old booking will be cancelled and a credit will be used.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />
          <Card>
            <CardContent className="p-2 h-full">
              <ScrollArea className="h-full max-h-[400px] p-4">
                {selectedDate && !isFetchingSlots && timeSlots.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <TimeSlot 
                        key={slot.value} 
                        {...slot}
                        isSelected={selectedTime === slot.value}
                        onClick={() => setSelectedTime(slot.value)}
                      />
                    ))}
                  </div>
                )}
                {isFetchingSlots && <div className="flex justify-center items-center h-full"><Spinner /></div>}
                {selectedDate && !isFetchingSlots && timeSlots.length === 0 && (
                  <p className="text-center text-muted-foreground pt-10">No available slots for this day.</p>
                )}
                {!selectedDate && (
                  <p className="text-center text-muted-foreground pt-10">Please select a date to see available times.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirmReschedule} disabled={!selectedDate || !selectedTime || isProcessing}>
            {isProcessing && <Spinner size="sm" className="mr-2" />}
            Confirm New Time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
