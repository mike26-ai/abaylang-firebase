
// File: src/app/api/bookings/reschedule/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin, adminDb, Timestamp } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { FieldValue } from 'firebase-admin/firestore';
import type { Booking } from '@/lib/types';
import { differenceInHours, parseISO, addMinutes, parse } from 'date-fns';

initAdmin();
const auth = getAuth();

const RescheduleBookingSchema = z.object({
  originalBookingId: z.string().min(1, "Booking ID is required."),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format."),
  newTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format."),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  console.log('BOOKING.RESCHEDULE request received');
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    
    const body = await request.json();
    const validation = RescheduleBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Invalid input.', details: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { originalBookingId, newDate, newTime, reason } = validation.data;
    const userId = decodedToken.uid;
    console.log('BOOKING.RESCHEDULE', { bookingId: originalBookingId, userId, newDate, newTime });

    const bookingRef = adminDb.collection('bookings').doc(originalBookingId);
    
    const updatedBooking = await adminDb.runTransaction(async (transaction) => {
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists) {
            throw new Error('not_found');
        }
        const booking = bookingDoc.data() as Booking;

        if (booking.userId !== userId) {
            throw new Error('unauthorized');
        }
        
        const isReschedulable = booking.status === 'confirmed' || booking.status === 'payment-pending-confirmation';
        if (!isReschedulable) {
            throw new Error('not_reschedulable');
        }
        
        const hours = booking.groupSessionId ? 3 : 12;
        const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
        if (differenceInHours(lessonDateTime, new Date()) < hours) {
            throw new Error('reschedule_window_closed');
        }

        const newStartDateTime = parse(`${newDate}T${newTime}`, "yyyy-MM-dd'T'HH:mm", new Date());
        const newStartTime = Timestamp.fromDate(newStartDateTime);
        const newEndTime = Timestamp.fromDate(addMinutes(newStartDateTime, booking.duration || 60));

        const bookingConflictQuery = adminDb.collection('bookings')
            .where('tutorId', '==', booking.tutorId)
            .where('status', 'in', ['confirmed', 'payment-pending-confirmation'])
            .where('startTime', '<', newEndTime)
            .where('endTime', '>', newStartTime);

        const timeOffConflictQuery = adminDb.collection('timeOff')
            .where('tutorId', '==', booking.tutorId)
            .where('endISO', '>', newStartTime.toDate().toISOString())
            .where('startISO', '<', newEndTime.toDate().toISOString());
        
        const [bookingConflicts, timeOffConflicts] = await Promise.all([
            transaction.get(bookingConflictQuery),
            transaction.get(timeOffConflictQuery)
        ]);

        const hasBookingConflict = bookingConflicts.docs.some(doc => doc.id !== originalBookingId);
        if (hasBookingConflict) throw new Error('conflict:booking');
        if (!timeOffConflicts.empty) throw new Error('conflict:timeoff');
        
        const updateData = {
            date: newDate,
            time: newTime,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'confirmed',
            updatedAt: FieldValue.serverTimestamp(),
            statusHistory: FieldValue.arrayUnion({
                status: 'rescheduled',
                changedAt: FieldValue.serverTimestamp(),
                by: userId,
                reason: reason || 'Student rescheduled lesson.',
            }),
        };
        transaction.update(bookingRef, updateData);
        
        return { ...booking, ...updateData, id: originalBookingId };
    });
    
    console.log('BOOKING.RESCHEDULE.SUCCESS', { bookingId: originalBookingId });
    return NextResponse.json({ success: true, booking: updatedBooking });

  } catch (error: any) {
    console.error('BOOKING.RESCHEDULE.ERROR', { message: error.message, code: error.code, stack: error.stack });
    
    if (error.code === 5) { // 'NOT_FOUND' for Firestore
        return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }
     if (error.code === 9) { // 'FAILED_PRECONDITION' for missing index
      return NextResponse.json({ success: false, error: 'database_indexing', details: 'The database is currently creating the required indexes for this feature. Please try again in a few minutes.' }, { status: 409 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, error: 'You do not own this booking.' }, { status: 403 });
    }
    if (error.message === 'not_reschedulable') {
        return NextResponse.json({ success: false, error: 'This lesson cannot be rescheduled as it is not in a confirmed state.' }, { status: 400 });
    }
     if (error.message === 'reschedule_window_closed') {
        return NextResponse.json({ success: false, error: 'The 12-hour window for rescheduling has passed.' }, { status: 400 });
    }
    if (error.message.startsWith('conflict:')) {
        return NextResponse.json({ success: false, error: 'conflict', details: 'Selected time is unavailable. Please choose another slot.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}
