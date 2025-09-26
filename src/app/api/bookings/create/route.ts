// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db, initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { addMinutes, parse } from 'date-fns';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
initAdmin();
const auth = getAuth();

// Zod schema for input validation, matching the client payload
const CreateBookingSchema = z.object({
  date: z.string(), // "YYYY-MM-DD"
  time: z.string(), // "HH:mm"
  duration: z.number().int().positive(),
  lessonType: z.string().min(1),
  price: z.number().min(0),
  tutorId: z.string().min(1),
  userId: z.string().min(1), // Will be verified against auth token
  isFreeTrial: z.boolean(),
  // Optional fields
  tutorName: z.string().optional(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  paymentNote: z.string().optional(),
});

/**
 * POST handler to create a new booking securely.
 * This route handler contains all logic, including validation and a Firestore transaction.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication from client
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);

    // 2. Validate Input Body
    const body = await request.json();
    console.log('Booking request payload received:', body);
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Invalid booking payload:', validationResult.error.flatten());
      return NextResponse.json({ message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    const bookingData = validationResult.data;
    
    // 3. Enforce Ownership and Data Integrity
    // The user ID from the verified token MUST match the user ID in the payload.
    if (decodedToken.uid !== bookingData.userId) {
      console.error(`Unauthorized booking attempt: Token UID (${decodedToken.uid}) does not match payload UID (${bookingData.userId}).`);
      return NextResponse.json({ message: 'User is not authorized to create this booking.' }, { status: 403 });
    }

    const isSpecificTimeBooking = bookingData.date !== 'N/A_PACKAGE' && bookingData.time !== 'N/A_PACKAGE';
    let startTime: Date | null = null;
    let endTime: Date | null = null;
  
    if (isSpecificTimeBooking) {
        startTime = parse(`${bookingData.date} ${bookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
        if (isNaN(startTime.getTime())) {
            throw new Error('Invalid date or time format provided.');
        }
        endTime = addMinutes(startTime, bookingData.duration);
    }
    
    // 4. Perform Firestore transaction to prevent double-bookings
    const newBookingRef = db.collection('bookings').doc();
    
    await db.runTransaction(async (transaction) => {
      if (isSpecificTimeBooking && startTime && endTime) {
        const bookingsRef = db.collection('bookings');
        const timeOffRef = db.collection('timeOff');

        // Check for conflicting confirmed bookings
        const bookingConflictQuery = bookingsRef
            .where('tutorId', '==', bookingData.tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', Timestamp.fromDate(endTime))
            .where('endTime', '>', Timestamp.fromDate(startTime));
        const conflictingBookings = await transaction.get(bookingConflictQuery);
        if (!conflictingBookings.empty) {
            throw new Error('This time slot has just been booked by another student.');
        }

        // Check for conflicting time-off blocks
        const timeOffConflictQuery = timeOffRef
            .where('tutorId', '==', bookingData.tutorId)
            .where('startISO', '<', endTime.toISOString())
            .where('endISO', '>', startTime.toISOString());
        const conflictingTimeOff = await transaction.get(timeOffConflictQuery);
        if (!conflictingTimeOff.empty) {
            throw new Error('The tutor is unavailable at this time due to a scheduled break.');
        }
      }

      // If no conflicts, create the new booking document
      const newBookingDoc = {
          ...bookingData,
          // Use server-generated timestamps for security and consistency
          createdAt: FieldValue.serverTimestamp(),
          // Store ISO timestamps for easier querying
          startTime: startTime ? Timestamp.fromDate(startTime) : null,
          endTime: endTime ? Timestamp.fromDate(endTime) : null,
          status: bookingData.isFreeTrial ? 'confirmed' : 'payment-pending-confirmation', // Start as pending
      };

      transaction.set(newBookingRef, newBookingDoc);
    });

    console.log(`Successfully created booking with ID: ${newBookingRef.id}`);
    return NextResponse.json({ bookingId: newBookingRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking API route:', error);
    // Provide specific error messages to the client
    let status = 500;
    if (error.message.includes('booked') || error.message.includes('unavailable')) {
        status = 409; // Conflict
    }
    return NextResponse.json({ message: error.message || 'Internal server error.' }, { status });
  }
}
