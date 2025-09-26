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

// Zod schema for input validation from the client
const CreateBookingSchema = z.object({
  date: z.string(),
  time: z.string(),
  duration: z.number().int().positive(),
  lessonType: z.string().min(1),
  price: z.number().min(0),
  tutorId: z.string().min(1),
  tutorName: z.string().min(1),
  // Note: userId is in the schema but will be overridden by the server-verified UID
  userId: z.string().min(1), 
  userName: z.string().min(1),
  userEmail: z.string().email(),
  paymentNote: z.string().optional(),
  isFreeTrial: z.boolean(),
});

/**
 * POST handler to create a new booking securely.
 * It verifies the user's identity via an ID token and uses a transaction
 * to prevent race conditions and double-bookings.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication from client
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  }
  const idToken = authHeader.split("Bearer ")[1];

  let decodedToken;
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
  }
  
  const serverVerifiedUserId = decodedToken.uid;

  // 2. Validate Input Body
  const body = await request.json();
  const validationResult = CreateBookingSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ message: "Invalid input", details: validationResult.error.flatten().fieldErrors }, { status: 400 });
  }
  
  const bookingPayload = validationResult.data;

  // 3. Prepare booking data, enforcing ownership
  const finalBookingData = {
    ...bookingPayload,
    userId: serverVerifiedUserId, // CRITICAL: Enforce user ID from verified token
  };

  const isSpecificTimeBooking = finalBookingData.date !== 'N/A_PACKAGE' && finalBookingData.time !== 'N/A_PACKAGE';
  let startTime: Timestamp | null = null;
  let endTime: Timestamp | null = null;
  
  if (isSpecificTimeBooking) {
    const startDateTime = parse(`${finalBookingData.date} ${finalBookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
    startTime = Timestamp.fromDate(startDateTime);
    endTime = Timestamp.fromDate(addMinutes(startDateTime, finalBookingData.duration));
  }
  
  // 4. Run Firestore Transaction
  try {
    const result = await db.runTransaction(async (transaction) => {
      // Conflict checks are only necessary for lessons at a specific time
      if (isSpecificTimeBooking && startTime && endTime) {
        const bookingsRef = db.collection('bookings');
        
        // Check for conflicting bookings
        const bookingConflictQuery = bookingsRef
          .where('tutorId', '==', finalBookingData.tutorId)
          .where('status', 'in', ['confirmed', 'awaiting-payment'])
          .where('startTime', '<', endTime)
          .where('endTime', '>', startTime);
        const conflictingBookings = await transaction.get(bookingConflictQuery);
        if (!conflictingBookings.empty) {
          throw new Error('slot_already_booked');
        }

        // Check for conflicting time-off blocks
        const timeOffRef = db.collection('timeOff');
        const timeOffConflictQuery = timeOffRef
          .where('tutorId', '==', finalBookingData.tutorId)
          .where('startISO', '<', endTime.toDate().toISOString())
          .where('endISO', '>', startTime.toDate().toISOString());
        const conflictingTimeOff = await transaction.get(timeOffConflictQuery);
        if (!conflictingTimeOff.empty) {
          throw new Error('tutor_unavailable');
        }
      }

      // If no conflicts, create the new booking
      const newBookingRef = db.collection('bookings').doc();
      const newBookingDoc = {
        ...finalBookingData,
        startTime: startTime,
        endTime: endTime,
        status: finalBookingData.isFreeTrial ? 'confirmed' : 'awaiting-payment',
        createdAt: FieldValue.serverTimestamp(),
      };
      transaction.set(newBookingRef, newBookingDoc);
      return { bookingId: newBookingRef.id };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking transaction:', error.message);
    if (error.message.includes('slot_already_booked') || error.message.includes('tutor_unavailable')) {
        return NextResponse.json({ message: 'This time slot is no longer available. Please select another time.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create booking on the server.' }, { status: 500 });
  }
}
