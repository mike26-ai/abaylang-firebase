"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useGroupBookingForm } from "@/hooks/use-group-booking-form";
import { PlusCircle, Trash2, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { DateSelection } from "./date-selection";
import { TimeSlot, TimeSlotProps } from "./time-slot";
import { useState, useMemo, useEffect, useCallback } from "react";
import { getAvailability } from "@/services/availabilityService";
import type { Booking as BookingType, TimeOff } from "@/lib/types";
import { format, addMinutes, parse, startOfDay, isEqual, isPast, parseISO } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "../ui/spinner";

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

export function PrivateGroupBookingForm({ product }: { product: any }) {
    const { form, fields, append, remove, isSubmitting, onSubmit } = useGroupBookingForm(product);
    const { toast } = useToast();
    
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [selectedTime, setSelectedTime] = useState<string | undefined>();
    const [dailyBookedSlots, setDailyBookedSlots] = useState<BookingType[]>([]);
    const [dailyTimeOff, setDailyTimeOff] = useState<TimeOff[]>([]);
    const [isFetchingSlots, setIsFetchingSlots] = useState(false);

    useEffect(() => {
        form.setValue('date', selectedDate as Date);
    }, [selectedDate, form]);

    useEffect(() => {
        form.setValue('time', selectedTime || '');
    }, [selectedTime, form]);

    const fetchAvailability = useCallback(async (date: Date) => {
        setIsFetchingSlots(true);
        try {
            const { bookings, timeOff } = await getAvailability(date);
            setDailyBookedSlots(bookings);
            setDailyTimeOff(timeOff || []);
            setSelectedTime(undefined);
        } catch (error) {
            toast({ title: "Error fetching slots", variant: "destructive" });
        } finally {
            setIsFetchingSlots(false);
        }
    }, [toast]);

    useEffect(() => {
        if (selectedDate) fetchAvailability(selectedDate);
    }, [selectedDate, fetchAvailability]);

    const displayTimeSlots = useMemo(() => {
        if (!selectedDate || !product || typeof product.duration !== 'number') return [];
        
        const slots: TimeSlotProps[] = [];
        const slotDate = startOfDay(selectedDate);
        const now = new Date();
        const isToday = isEqual(slotDate, startOfDay(now));

        for (const startTimeString of baseStartTimes) {
            const potentialStartTime = parse(startTimeString, 'HH:mm', slotDate);
            const potentialEndTime = addMinutes(potentialStartTime, product.duration);

            if (isToday && isPast(potentialStartTime)) continue;

            let isAvailable = true;

            for (const booking of dailyBookedSlots) {
                if(booking.startTime && booking.endTime) {
                    const bookingStart = parseISO(booking.startTime as any);
                    const bookingEnd = parseISO(booking.endTime as any);
                    if (potentialStartTime < bookingEnd && potentialEndTime > bookingStart) {
                        isAvailable = false;
                        break;
                    }
                }
            }
            if (!isAvailable) continue;

            for (const block of dailyTimeOff) {
                const blockStart = parseISO(block.startISO);
                const blockEnd = parseISO(block.endISO);
                if (potentialStartTime < blockEnd && potentialEndTime > blockStart) {
                    isAvailable = false;
                    break;
                }
            }
            
            if (isAvailable) {
                 slots.push({ display: `${format(potentialStartTime, 'HH:mm')} - ${format(potentialEndTime, 'HH:mm')}`, value: startTimeString, status: 'available' });
            }
        }
        return slots;
    }, [selectedDate, product, dailyBookedSlots, dailyTimeOff]);


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Invite Your Group</CardTitle>
                        <CardDescription>Add the names and emails of the people you want to invite. You can add up to 5 other members.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-end gap-2">
                                <FormField
                                    control={form.control}
                                    name={`members.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Member {index + 1} Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Jane Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`members.${index}.email`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Member {index + 1} Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="jane@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => append({ name: '', email: '' })} disabled={fields.length >= 5}>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Another Member
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-primary" />Select Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DateSelection selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                    </CardContent>
                </Card>

                {selectedDate && (
                    <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-primary" />Select Time</CardTitle>
                           <CardDescription>Available slots for {format(selectedDate, 'PPP')}.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             {isFetchingSlots ? <div className="flex justify-center items-center h-24"><Spinner /></div>
                            : displayTimeSlots.length === 0 ? <p className="text-muted-foreground text-center py-4">No available slots for this duration/date.</p>
                            : <div className="grid grid-cols-2 md:grid-cols-3 gap-3"> {displayTimeSlots.map((slot) => ( <TimeSlot key={slot.value} {...slot} isSelected={selectedTime === slot.value} onClick={(clickedSlot) => setSelectedTime(clickedSlot.value)} /> ))} </div>
                            }
                        </CardContent>
                    </Card>
                )}
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Spinner size="sm" className="mr-2" />}
                    Create Private Group and Send Invites
                </Button>
            </form>
        </Form>
    );
}
