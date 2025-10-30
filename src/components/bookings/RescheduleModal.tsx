
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Booking, UserCredit } from "@/lib/types";
import { createBookingWithCredit } from "@/services/bookingService";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "../ui/spinner";
import { format } from "date-fns";
import { BookingsCalendar } from "@/components/bookings/booking-calendar";
import { creditToLessonMap } from "@/config/creditMapping";
import { products, ProductId } from "@/config/products";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess: () => void;
  rescheduleCredit: UserCredit | null;
}

export function RescheduleModal({ isOpen, onClose, onRescheduleSuccess, rescheduleCredit }: RescheduleModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!rescheduleCredit) return null;
  
  const lessonProductId = creditToLessonMap[rescheduleCredit.lessonType] as ProductId;
  const lessonDetails = products[lessonProductId];

  const handleConfirmReschedule = async () => {
    if (!user || !selectedDate || !selectedTime) {
      toast({
        title: "Selection Required",
        description: "Please select a new date and time.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await createBookingWithCredit({
        creditType: rescheduleCredit.lessonType,
        userId: user.uid,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
      });
      
      toast({
        title: "Reschedule Successful",
        description: "Your lesson has been moved to the new time.",
      });

      onRescheduleSuccess(); // This will trigger a data refresh and close the modal
      
    } catch (error: any) {
       toast({
        title: "Booking Failed",
        description: error.message.includes('slot_already_booked') 
          ? "This slot is no longer available. Please select another." 
          : error.message || "Could not complete your booking.",
        variant: "destructive",
      });
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reschedule Your Lesson</DialogTitle>
          <DialogDescription>
            Select a new date and time for your &quot;{lessonDetails?.label}&quot; lesson.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <BookingsCalendar 
                lessonType={lessonDetails}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateChange={setSelectedDate}
                onTimeChange={setSelectedTime}
            />
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
