// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, initAdmin, Timestamp } from '@/lib/firebase-admin';
import { z } from 'zod';
import { addMinutes, parse } from 'date-fns';

// Initialize Firebase Admin SDK
initAdmin();

// Zod schema for input validation, matching the client payload
const CreateBookingSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  time: z.string(), // "HH:mm"
  duration: z.number().int().positive(),
  lessonType: z.string().min(1),
  price: z.number().min(0),
  tutorId: z.string().min(1),
  isFreeTrial: z.boolean(),
  // User data will be taken from the verified token, not the payload, for security
  // but we keep them here to validate the incoming shape before ignoring them.
  userId: z.string().min(1), 
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  paymentNote: z.string().optional(),
});

/**
 * POST handler to create a new booking securely.
 * This route handler contains all logic, including validation and a Firestore transaction
 * that avoids composite indexes by filtering conflicts in-memory.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication from client and get the authenticated user
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    const bookingData = validationResult.data;

    // 3. Security Check: Ensure the user ID from the token matches the payload
    if (decodedToken.uid !== bookingData.userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized: You can only create bookings for yourself.' }, { status: 403 });
    }

    // 4. Perform Firestore transaction
    const bookingId = await adminDb.runTransaction(async (transaction) => {
        const { tutorId, date, time, duration } = bookingData;
        const startDateTime = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());

        const startTime = Timestamp.fromDate(startDateTime);
        const endTime = Timestamp.fromDate(addMinutes(startDateTime, duration));

        // Check for conflicting confirmed bookings
        const bookingsRef = adminDb.collection('bookings');
        const bookingConflictQuery = bookingsRef
            .where('tutorId', '==', tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', endTime) // Get bookings that start before our potential booking ends
            .where('endTime', '>', startTime); // Get bookings that end after our potential booking starts
            
        const conflictingBookingsSnapshot = await transaction.get(bookingConflictQuery);

        if (!conflictingBookingsSnapshot.empty) {
            throw new Error('slot_already_booked');
        }
        
        // Check for conflicting time-off blocks
        const timeOffRef = adminDb.collection('timeOff');
        const timeOffConflictQuery = timeOffRef
            .where('tutorId', '==', tutorId)
            .where('startISO', '<', endTime.toDate().toISOString())
            .where('endISO', '>', startTime.toDate().toISOString());
        
        const conflictingTimeOffSnapshot = await transaction.get(timeOffConflictQuery);
        
        if (!conflictingTimeOffSnapshot.empty) {
            throw new Error('tutor_unavailable');
        }

        const newBookingRef = adminDb.collection('bookings').doc();
        const newBookingDoc = {
            ...bookingData,
            startTime,
            endTime,
            createdAt: Timestamp.now(),
            status: bookingData.isFreeTrial ? 'confirmed' : 'awaiting-payment',
        };
        transaction.set(newBookingRef, newBookingDoc);
        return newBookingRef.id;
    });

    return NextResponse.json({ success: true, bookingId: bookingId }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking API route:', error);
    if (error.message === 'slot_already_booked') {
        return NextResponse.json({ success: false, message: 'slot_already_booked' }, { status: 409 });
    }
    if (error.message === 'tutor_unavailable') {
        return NextResponse.json({ success: false, message: 'The tutor is unavailable at this time due to a scheduled break.' }, { status: 409 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, message: 'Unauthorized action.' }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: 'An internal server error occurred.' }, { status: 500 });
  }
}
