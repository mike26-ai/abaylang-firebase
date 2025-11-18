
"use client";

import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Booking, TimeOff } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "../ui/spinner";
import { format, isValid, isPast, isEqual, startOfDay, addMinutes, parse, parseISO } from "date-fns";
import { getAvailability } from "@/services/availabilityService";
import { products, ProductId } from "@/config/products";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlot, TimeSlotProps } from "@/components/bookings/time-slot";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { requestReschedule, createBookingWithCredit } from "@/services/bookingService";


interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess: () => void;
  originalBooking: Booking | null;
}

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


export function RescheduleModal({ isOpen, onClose, onRescheduleSuccess, originalBooking }: RescheduleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availability, setAvailability] = useState<{ bookings: Booking[]; timeOff: TimeOff[] }>({ bookings: [], timeOff: [] });
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
    // Reset state when the modal is closed or the booking changes
    if (!isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setAvailability({ bookings: [], timeOff: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDate && isValid(selectedDate)) {
      fetchAvailability(selectedDate);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isOpen]);


  const timeSlots = useMemo(() => {
    if (!selectedDate || !lessonDetails || typeof lessonDetails.duration !== 'number') return [];
    
    const slots: TimeSlotProps[] = [];
    const slotDate = startOfDay(selectedDate);
    const now = new Date();
    const isToday = isEqual(slotDate, startOfDay(now));

    for (const startTimeString of baseStartTimes) {
        const potentialStartTime = parse(startTimeString, 'HH:mm', slotDate);
        const potentialEndTime = addMinutes(potentialStartTime, lessonDetails.duration as number);

        if (isToday && isPast(potentialStartTime)) continue;

        let currentStatus: 'available' | 'booked' | 'blocked' = 'available';
        let bookedMeta: Booking | undefined = undefined;
        let blockedMeta: TimeOff | undefined = undefined;

        for (const booking of availability.bookings) {
            if (booking.startTime && booking.endTime) {
                 const bookingStart = booking.startTime instanceof Date ? booking.startTime : parseISO(booking.startTime as any);
                 const bookingEnd = booking.endTime instanceof Date ? booking.endTime : parseISO(booking.endTime as any);

                if (potentialStartTime < bookingEnd && potentialEndTime > bookingStart) {
                    currentStatus = 'booked';
                    bookedMeta = booking;
                    break;
                }
            }
        }
        if (currentStatus === 'booked') {
            slots.push({ display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`, value: startTimeString, status: 'booked', bookedMeta });
            continue;
        }

        for (const block of availability.timeOff) {
            const blockStart = block.startISO instanceof Date ? block.startISO : new Date(block.startISO);
            const blockEnd = block.endISO instanceof Date ? block.endISO : new Date(block.endISO);
            if (potentialStartTime < blockEnd && potentialEndTime > blockStart) {
                currentStatus = 'blocked';
                blockedMeta = block;
                break;
            }
        }

        slots.push({
            display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`,
            value: startTimeString,
            status: currentStatus,
            bookedMeta,
            blockedMeta
        });
    }
    return slots;
}, [selectedDate, lessonDetails, availability]);


  const handleConfirmReschedule = async () => {
    if (!user || !selectedDate || !selectedTime || !originalBooking) {
      toast({ title: "Selection Required", description: "Please select a new date and time.", variant: "destructive" });
      return;
    }
    
    setIsProcessing(true);
    try {
        // --- ATOMIC WORKFLOW START ---
        // Step 1: Cancel the old lesson to get a credit.
        const rescheduleResult = await requestReschedule({
            bookingId: originalBooking.id,
            reason: `Rescheduled by user to ${format(selectedDate, 'yyyy-MM-dd')} at ${selectedTime}`,
        });

        if (!rescheduleResult.success || !rescheduleResult.credit) {
            throw new Error(rescheduleResult.message || "Failed to get reschedule credit. Your original booking was not changed.");
        }
        
        toast({ title: "Step 1/2 Complete", description: "Old lesson cancelled. Now booking new time..." });
      
        // Step 2: Use the issued credit to book the new lesson.
        // This will only run if Step 1 was successful.
        await createBookingWithCredit({
            creditType: rescheduleResult.credit.lessonType,
            userId: user.uid,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
        });

        toast({ title: "Reschedule Successful!", description: "Your lesson has been moved to the new time." });
        onRescheduleSuccess();
        onClose(); // Close the modal on success
        // --- ATOMIC WORKFLOW END ---
      
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
            Select a new date and time for your &quot;{lessonDetails?.label || 'lesson'}&quot;. The old booking will be cancelled and replaced.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4 max-h-[70vh]">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))}
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
