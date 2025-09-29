
// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db, initAdmin, Timestamp } from '@/lib/firebase-admin'; // Use our centralized admin init
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { addMinutes, parse } from 'date-fns';

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
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);


    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    const bookingPayload = validationResult.data;
    
    // 3. Perform Firestore transaction to prevent double-bookings
    const newBookingRef = db.collection('bookings').doc();
    
    await db.runTransaction(async (transaction) => {
      const isSpecificTimeBooking = bookingPayload.date !== 'N/A_PACKAGE' && bookingPayload.time !== 'N/A_PACKAGE';
      let startTime: Date | null = null;
      let endTime: Date | null = null;
    
      if (isSpecificTimeBooking) {
          startTime = parse(`${bookingPayload.date} ${bookingPayload.time}`, 'yyyy-MM-dd HH:mm', new Date());
          if (isNaN(startTime.getTime())) {
              throw new Error('Invalid date or time format provided.');
          }
          endTime = addMinutes(startTime, bookingPayload.duration);

          const bookingsRef = db.collection('bookings');
          const timeOffRef = db.collection('timeOff');

          // Fetch bookings for the tutor and filter in-memory to avoid composite index
          const bookingsSnapshot = await transaction.get(
              bookingsRef.where('tutorId', '==', bookingPayload.tutorId).where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
          );
          
          const conflictingBookings = bookingsSnapshot.docs.filter(doc => {
              const b = doc.data();
              if (b.startTime && b.endTime && b.startTime.toDate && b.endTime.toDate) {
                  const existingStart = b.startTime.toDate();
                  const existingEnd = b.endTime.toDate();
                  return existingStart < endTime! && existingEnd > startTime!;
              }
              return false;
          });

          if (conflictingBookings.length > 0) {
              throw new Error('This time slot is already booked by another student.');
          }

          // Fetch time-off blocks and filter in-memory
          const timeOffSnapshot = await transaction.get(timeOffRef.where('tutorId', '==', bookingPayload.tutorId));
          const allBreaks = timeOffSnapshot.docs.map(doc => doc.data());
          
          // --- DEBUG LOGGING ---
          console.log("📅 Booking request (UTC):", startTime.toISOString(), "to", endTime.toISOString());
          console.log("📅 Booking request (Server Local Time):", startTime.toString(), "to", endTime.toString());
          console.log("⏸️ Tutor breaks fetched from Firestore:", JSON.stringify(allBreaks, null, 2));
          // --- END DEBUG LOGGING ---

          const conflictingTimeOff = allBreaks.filter(t => {
              if(t.startISO && t.endISO) {
                  const blockStart = new Date(t.startISO);
                  const blockEnd = new Date(t.endISO);
                  // Log each comparison for detailed debugging
                  console.log(`Checking break: ${blockStart.toISOString()} - ${blockEnd.toISOString()}`);
                  console.log(`Condition 1 (blockStart < endTime): ${blockStart < endTime!}`);
                  console.log(`Condition 2 (blockEnd > startTime): ${blockEnd > startTime!}`);
                  return blockStart < endTime! && blockEnd > startTime!;
              }
              return false;
          });

          if (conflictingTimeOff.length > 0) {
              throw new Error('The tutor is unavailable at this time due to a scheduled break.');
          }
      }

      // If no conflicts, create the new booking document with verified user data
      const newBookingDoc = {
          ...bookingPayload,
          // --- SECURITY ENHANCEMENT ---
          // Overwrite user data from the payload with verified data from the auth token
          userId: user.uid,
          userName: user.displayName || 'User',
          userEmail: user.email || 'No Email',
          // --- END SECURITY ENHANCEMENT ---
          createdAt: Timestamp.now(),
          startTime: startTime ? Timestamp.fromDate(startTime) : null,
          endTime: endTime ? Timestamp.fromDate(endTime) : null,
          status: bookingPayload.isFreeTrial ? 'confirmed' : 'payment-pending-confirmation',
      };

      transaction.set(newBookingRef, newBookingDoc);
    });

    return NextResponse.json({ success: true, bookingId: newBookingRef.id }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking API route:', error);
    let status = 500;
    let message = error.message || 'Internal server error.';
    if (message.includes('booked') || message.includes('unavailable')) {
        status = 409; // Conflict
    }
    return NextResponse.json({ success: false, message: message }, { status });
  }
}
