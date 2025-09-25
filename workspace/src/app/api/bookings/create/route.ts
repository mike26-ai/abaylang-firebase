// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, runTransaction, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { addMinutes, parse } from 'date-fns';

// Initialize Firebase Admin SDK
const app = initAdmin();
const db = getFirestore(app);
const auth = getAuth(app);

// Zod schema for input validation
const CreateBookingSchema = z.object({
  date: z.string(), // YYYY-MM-DD or 'N/A_PACKAGE'
  time: z.string(), // HH:mm or 'N/A_PACKAGE'
  duration: z.number().int().positive(),
  lessonType: z.string().min(1),
  price: z.number().min(0),
  tutorId: z.string().min(1),
  tutorName: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  userEmail: z.string().email(),
  paymentNote: z.string().optional(),
  isFreeTrial: z.boolean(),
});

/**
 * POST handler to create a new booking securely.
 * Uses a transaction to prevent race conditions and double-bookings.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication from client
  const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
  if (!idToken) {
    return NextResponse.json({ code: 'unauthenticated', message: 'No authentication token provided.' }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    return NextResponse.json({ code: 'unauthenticated', message: 'Invalid authentication token.' }, { status: 401 });
  }

  // 2. Validate Input Body
  const body = await request.json();
  const validationResult = CreateBookingSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ code: 'invalid_input', message: validationResult.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const bookingData = validationResult.data;

  // 3. Security check: Ensure the user ID from the token matches the payload
  if (decodedToken.uid !== bookingData.userId) {
    return NextResponse.json({ code: 'unauthorized', message: 'User is not authorized to create this booking.' }, { status: 403 });
  }

  // Only run conflict checks for non-package bookings that have a specific date and time
  const isSpecificTimeBooking = bookingData.date !== 'N/A_PACKAGE' && bookingData.time !== 'N/A_PACKAGE';
  let startTime: Timestamp | null = null;
  let endTime: Timestamp | null = null;
  
  if (isSpecificTimeBooking) {
    const startDateTime = parse(`${bookingData.date} ${bookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
    startTime = Timestamp.fromDate(startDateTime);
    endTime = Timestamp.fromDate(addMinutes(startDateTime, bookingData.duration));
  }

  try {
    const { bookingId } = await runTransaction(db, async (transaction) => {
      if (isSpecificTimeBooking && startTime && endTime) {
        const bookingsRef = db.collection('bookings');
        const timeOffRef = db.collection('timeOff');

        // Check for conflicting confirmed bookings
        const bookingConflictQuery = bookingsRef
          .where('tutorId', '==', bookingData.tutorId)
          .where('status', 'in', ['confirmed', 'awaiting-payment'])
          .where('startTime', '<', endTime)
          .where('endTime', '>', startTime);
        const conflictingBookings = await transaction.get(bookingConflictQuery);
        if (!conflictingBookings.empty) {
          throw new Error('This time slot has just been booked by another student.');
        }

        // Check for conflicting time-off blocks
        const timeOffConflictQuery = timeOffRef
            .where('tutorId', '==', bookingData.tutorId)
            .where('startISO', '<', endTime.toDate().toISOString())
            .where('endISO', '>', startTime.toDate().toISOString());
        const conflictingTimeOff = await transaction.get(timeOffConflictQuery);
        if (!conflictingTimeOff.empty) {
            throw new Error('The tutor is unavailable at this time.');
        }
      }

      // If no conflicts, create the new booking
      const newBookingRef = db.collection('bookings').doc();
      const newBookingDoc = {
        ...bookingData,
        startTime: startTime,
        endTime: endTime,
        status: bookingData.isFreeTrial ? 'confirmed' : 'awaiting-payment',
        createdAt: FieldValue.serverTimestamp(),
      };

      transaction.set(newBookingRef, newBookingDoc);

      return { bookingId: newBookingRef.id };
    });

    return NextResponse.json({ bookingId }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.message.includes('booked') || error.message.includes('unavailable')) {
        return NextResponse.json({ code: 'conflict', message: error.message }, { status: 409 });
    }
    return NextResponse.json({ code: 'server_error', message: 'Failed to create booking.' }, { status: 500 });
  }
}
