
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

        // 1. Ownership & Eligibility Check
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

        // 2. Conflict Check for the new slot
        const newStartDateTime = new Date(`${newDate}T${newTime}`);
        const newStartTime = Timestamp.fromDate(newStartDateTime);
        const newEndTime = Timestamp.fromDate(addMinutes(newStartDateTime, booking.duration || 60));

        const bookingConflictQuery = adminDb.collection('bookings')
            .where('tutorId', '==', booking.tutorId)
            .where('status', 'in', ['confirmed', 'payment-pending-confirmation'])
            .where('startTime', '<', newEndTime)
            .where('endTime', '>', newStartTime);
        
        // This is the invalid query. Firestore does not support range filters on two different fields.
        // const timeOffConflictQuery = adminDb.collection('timeOff')
        //     .where('tutorId', '==', booking.tutorId)
        //     .where('endISO', '>', newStartTime.toDate().toISOString())
        //     .where('startISO', '<', newEndTime.toDate().toISOString());
        
        // ** THE FIX **: Replace the single invalid query with two valid queries.
        // Query 1: Find blocks that start before the new lesson ends.
        // We MUST compare string fields against string values.
        const timeOffConflictQuery1 = adminDb.collection('timeOff')
            .where('tutorId', '==', booking.tutorId)
            .where('startISO', '<', newEndTime.toDate().toISOString());
        
        // Query 2: Find blocks that end after the new lesson starts.
        // We MUST compare string fields against string values.
        const timeOffConflictQuery2 = adminDb.collection('timeOff')
            .where('tutorId', '==', booking.tutorId)
            .where('endISO', '>', newStartTime.toDate().toISOString());
        
        const [bookingConflicts, timeOffConflicts1, timeOffConflicts2] = await Promise.all([
            transaction.get(bookingConflictQuery),
            transaction.get(timeOffConflictQuery1),
            transaction.get(timeOffConflictQuery2)
        ]);

        // ** THE FIX **: Manually find the intersection of the two time-off queries.
        const timeOffConflictDocs = timeOffConflicts1.docs.filter(doc1 => 
            timeOffConflicts2.docs.some(doc2 => doc2.id === doc1.id)
        );
        
        // Exclude the current booking being rescheduled from the booking conflict check
        const hasBookingConflict = bookingConflicts.docs.some(doc => doc.id !== originalBookingId);
        if (hasBookingConflict) throw new Error('conflict');
        // Check for conflicts from the manually intersected time-off results
        if (timeOffConflictDocs.length > 0) throw new Error('conflict');

        // 3. Atomic Update
        const updateData = {
            date: newDate,
            time: newTime,
            startTime: newStartTime,
            endTime: newEndTime,
            status: 'confirmed', // Ensure status is confirmed after reschedule
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
    console.error('BOOKING.RESCHEDULE.ERROR', { message: error.message, stack: error.stack });
    if (error.message === 'not_found') {
        return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
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
    if (error.message === 'conflict') {
        return NextResponse.json({ success: false, error: 'conflict', details: 'Selected time is unavailable. Please choose another slot.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}
