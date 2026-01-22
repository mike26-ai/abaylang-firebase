
"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createTimeOff, deleteTimeOff, getTimeOff } from "@/app/actions/timeOffActions";
import { Timestamp } from "firebase/firestore";
import { format } from "date-fns";
import { Trash2, PlusCircle, CalendarOff, Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the shape of the TimeOff document for the client
interface TimeOff {
  id: string;
  startTime: Timestamp;
  endTime: Timestamp;
  reason?: string;
}

// Validation schema for the form
const timeOffSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endDate: z.string().min(1, "End date is required"),
  endTime: z.string().min(1, "End time is required"),
  reason: z.string().optional(),
}).refine(data => {
  const start = new Date(`${data.startDate}T${data.startTime}`);
  const end = new Date(`${data.endDate}T${data.endTime}`);
  return end > start;
}, {
  message: "End date and time must be after the start date and time.",
  path: ["endDate"], // Attach error to the endDate field for clarity
});

type TimeOffFormValues = z.infer<typeof timeOffSchema>;

export function TimeOffManager() {
  const { toast } = useToast();
  const [timeOffBlocks, setTimeOffBlocks] = useState<TimeOff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TimeOffFormValues>({
    resolver: zodResolver(timeOffSchema),
  });

  const fetchTimeOff = async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      const result = await getTimeOff();
      if (!result.success) {
        // Gracefully handle server config error without a toast
        setLoadingError(result.error);
        setTimeOffBlocks([]);
      } else {
        const clientBlocks = (result.data || []).map(block => ({
          ...block,
          startTime: new Timestamp(block.startTime.seconds, block.startTime.nanoseconds),
          endTime: new Timestamp(block.endTime.seconds, block.endTime.nanoseconds),
        }));
        setTimeOffBlocks(clientBlocks);
      }
    } catch (error: any) {
      // Catch unexpected errors and show a toast for those
      setLoadingError("An unexpected error occurred while fetching data.");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeOff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit: SubmitHandler<TimeOffFormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createTimeOff(data);
      if (result.success) {
        toast({ title: "Success", description: "Time off block created." });
        reset();
        await fetchTimeOff(); // Refresh the list
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Submission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteTimeOff(id);
      if (result.success) {
        toast({ title: "Success", description: "Time off block deleted." });
        setDeleteConfirmation(null);
        await fetchTimeOff();
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-8">
      {/* Form Section */}
      <section>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 border rounded-lg bg-card">
          <h3 className="text-lg font-semibold text-foreground border-b pb-3 flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Add New Time Off</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Start Time */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <div className="flex gap-2">
                <Input id="startDate" type="date" {...register("startDate")} />
                <Input id="startTime" type="time" {...register("startTime")} />
              </div>
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              {errors.startTime && <p className="text-sm text-destructive">{errors.startTime.message}</p>}
            </div>
            {/* End Time */}
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <div className="flex gap-2">
                <Input id="endDate" type="date" {...register("endDate")} />
                <Input id="endTime" type="time" {...register("endTime")} />
              </div>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              {errors.endTime && <p className="text-sm text-destructive">{errors.endTime.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input id="reason" placeholder="e.g., Personal Appointment, Holiday" {...register("reason")} />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Time Off
          </Button>
        </form>
      </section>

      {/* List Section */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"><CalendarOff className="w-5 h-5" /> Existing Time Off Blocks</h3>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : loadingError ? (
           <div className="text-center py-4 px-4 border rounded-lg bg-muted/50 text-muted-foreground flex flex-col items-center gap-2">
             <AlertCircle className="w-5 h-5 text-destructive" />
             <p className="font-semibold">Could not load time off blocks.</p>
             <p className="text-sm">{loadingError}</p>
             <p className="text-xs mt-2">This is expected if server credentials are not set in your local `.env` file.</p>
           </div>
        ) : timeOffBlocks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No time off blocks scheduled.</p>
        ) : (
          <ul className="space-y-3">
            {timeOffBlocks.map(block => (
              <li key={block.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div>
                  <p className="font-medium text-foreground">
                    {format(block.startTime.toDate(), 'PPP p')} - {format(block.endTime.toDate(), 'PPP p')}
                  </p>
                  {block.reason && <p className="text-sm text-muted-foreground">{block.reason}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteConfirmation(block.id)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <AlertDialog open={!!deleteConfirmation} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the time off block and potentially open up these slots for booking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmation && handleDelete(deleteConfirmation)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
=======
import { useState, useEffect, useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { format, addMinutes, parse, startOfDay, isEqual, isPast } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { TimeSlot, TimeSlotProps } from '@/components/bookings/time-slot';
import { getAvailability, blockSlot, unblockSlot } from '@/services/availabilityService';
import type { Booking, TimeOff } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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

export function TimeOffManager() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availability, setAvailability] = useState<{ bookings: Booking[]; timeOff: TimeOff[] }>({ bookings: [], timeOff: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingSlot, setIsUpdatingSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tutorId = "MahderNegashMamo"; // Hardcoded for single tutor model

  const fetchAvailability = async (date: Date) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAvailability(date);
        setAvailability(data);
      } catch (err: any) {
        console.error("Could not fetch available slots:", err);
        setError("Could not fetch available slots. Please try again.");
        toast({ title: 'Error', description: err.message || 'Could not fetch schedule data.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    if (!selectedDate) {
      setIsLoading(false);
      return;
    }
    fetchAvailability(selectedDate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, tutorId]);

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    
    const now = new Date();
    const isToday = isEqual(startOfDay(selectedDate), startOfDay(now));
    const slots: TimeSlotProps[] = [];

    for (const startTime of baseStartTimes) {
      const slotDate = startOfDay(selectedDate);
      const potentialStartTime = parse(startTime, 'HH:mm', slotDate);
      const potentialEndTime = addMinutes(potentialStartTime, 30); // Admin blocks in 30-min increments

      if (isToday && isPast(potentialStartTime)) {
        continue;
      }

      const booking = availability.bookings.find(b => {
        if (!b.startTime || !b.endTime) return false;
        const bookingStart = new Date(b.startTime as any);
        const bookingEnd = new Date(b.endTime as any);
        return potentialStartTime < bookingEnd && potentialEndTime > bookingStart;
      });

      const timeOffBlock = availability.timeOff.find(t => {
        const blockStart = new Date(t.startISO);
        const blockEnd = new Date(t.endISO);
        return potentialStartTime < blockEnd && potentialEndTime > blockStart;
      });

      let status: 'available' | 'booked' | 'blocked' = 'available';
      if (booking) status = 'booked';
      if (timeOffBlock) status = 'blocked';

      slots.push({
        value: startTime,
        display: `${startTime} - ${format(potentialEndTime, 'HH:mm')}`,
        status,
        bookedMeta: booking,
        blockedMeta: timeOffBlock,
        isAdminView: true,
      });
    }
    return slots;
  }, [selectedDate, availability]);

  const handleSlotClick = async (slot: TimeSlotProps) => {
    if (!selectedDate || !user || !isAdmin || isUpdatingSlot) return;

    if (slot.status === 'booked') {
      toast({ title: 'Slot Booked', description: "Cannot block a slot that is already booked by a student.", variant: 'default' });
      return;
    }
    
    setIsUpdatingSlot(slot.value);

    if (slot.status === 'available') {
      try {
        const startTime = parse(`${format(selectedDate, 'yyyy-MM-dd')} ${slot.value}`, 'yyyy-MM-dd HH:mm', new Date());
        const startISO = startTime.toISOString();
        const endISO = addMinutes(startTime, 30).toISOString();
        
        await blockSlot({
          tutorId,
          startISO,
          endISO,
          note: 'Admin Block',
        });
        
        toast({ title: 'Slot Blocked', description: `Time slot ${slot.display} has been marked as unavailable.` });
        if(selectedDate) await fetchAvailability(selectedDate);

      } catch (error: any) {
        toast({ title: 'Blocking Failed', description: error.message || 'Could not block the time slot.', variant: 'destructive' });
      }
    }

    if (slot.status === 'blocked' && slot.blockedMeta?.id) {
      try {
        await unblockSlot({ timeOffId: slot.blockedMeta.id });
        toast({ title: 'Slot Unblocked', description: `Time slot ${slot.display} is now available.` });
        if(selectedDate) await fetchAvailability(selectedDate);

      } catch (error: any) {
        toast({ title: 'Unblocking Failed', description: error.message || 'Could not unblock the time slot.', variant: 'destructive' });
      }
    }
    
    setIsUpdatingSlot(null);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="shadow-xl sticky top-24">
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>View and manage the schedule for a specific day.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border p-0"
              disabled={(date) => isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))}
            />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Time Slots for {selectedDate ? format(selectedDate, 'PPP') : '...'}</CardTitle>
            <CardDescription>Click a slot to toggle its availability. Blue slots are student lessons.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
                <>
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <AlertTitle>How to Manage</AlertTitle>
                    <AlertDescription>
                        <ul className="list-disc list-inside text-xs space-y-1">
                            <li><span className="font-semibold text-foreground">Available (White):</span> Click to block this slot.</li>
                            <li><span className="font-semibold text-foreground">Busy (Red):</span> Click to make this slot available again.</li>
                            <li><span className="font-semibold text-foreground">Booked (Blue):</span> This is a student&apos;s lesson and cannot be changed here.</li>
                        </ul>
                    </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {timeSlots.map(slot => (
                      <div key={slot.value} className="relative">
                        <TimeSlot
                            {...slot}
                            onClick={handleSlotClick}
                        />
                        {isUpdatingSlot === slot.value && (
                          <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-md">
                            <Spinner size="sm" />
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
>>>>>>> before-product-selection-rewrite
    </div>
  );
}
