// File: src/app/api/availability/block/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp, runTransaction } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';

// Initialize Firebase Admin SDK
try {
  initAdmin();
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK in block/route.ts", error);
}

const auth = getAuth();
const db = getFirestore();

// Zod schema for input validation
const BlockTimeSchema = z.object({
  tutorId: z.string().min(1),
  startISO: z.string().datetime(),
  endISO: z.string().datetime(),
  note: z.string().optional(),
}).refine(data => new Date(data.endISO) > new Date(data.startISO), {
    message: "End time must be after start time",
    path: ["endISO"],
});

/**
 * POST handler to block a time slot for a tutor.
 * This route handler now contains all its own logic.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // 2. Verify Authorization (Admin Check)
    const isAdmin = decodedToken.email === ADMIN_EMAIL || decodedToken.admin === true;
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'User does not have admin privileges.' }, { status: 403 });
    }

    // 3. Validate Input Body
    const body = await request.json();
    const validationResult = BlockTimeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // 4. Perform Firestore transaction
    const { tutorId, startISO, endISO, note } = validationResult.data;
    const startTime = Timestamp.fromDate(new Date(startISO));
    const endTime = Timestamp.fromDate(new Date(endISO));

    const timeOffDocData = await runTransaction(db, async (transaction) => {
        const bookingsRef = db.collection('bookings');
        const conflictQuery = bookingsRef
            .where('tutorId', '==', tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', endTime)
            .where('endTime', '>', startTime);
      
        const conflictingBookingsSnapshot = await transaction.get(conflictQuery);

        if (!conflictingBookingsSnapshot.empty) {
            throw new Error('slot_already_booked');
        }

        const newTimeOffRef = db.collection('timeOff').doc();
        const timeOffDoc = {
            tutorId,
            startISO,
            endISO,
            note: note || '',
            blockedById: decodedToken.uid,
            blockedByEmail: decodedToken.email,
            createdAt: Timestamp.now(),
        };
      
        transaction.set(newTimeOffRef, timeOffDoc);
        return { id: newTimeOffRef.id, ...timeOffDoc };
    });


    // 5. Return success response
    return NextResponse.json({ success: true, data: timeOffDocData }, { status: 201 });

  } catch (error: any) {
    console.error('API Error (/availability/block):', error);
    if (error.message.includes('slot_already_booked')) {
        return NextResponse.json({ success: false, error: 'This time slot is already booked by a student.', details: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to block time slot.', details: error?.message },
      { status: 500 }
    );
  }
}
