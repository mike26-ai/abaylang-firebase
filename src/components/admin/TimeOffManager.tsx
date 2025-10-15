
"use client";

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
    </div>
  );
}
