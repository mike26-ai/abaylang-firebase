// File: src/app/api/availability/block/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, Timestamp, initAdmin } from '@/lib/firebase-admin';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';
import { parseISO } from 'date-fns';

// Import the specific Timestamp type from the admin SDK
import type { firestore as adminFirestore } from 'firebase-admin';

// Initialize Firebase Admin SDK
try {
  initAdmin();
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK in block/route.ts", error);
}
const auth = getAuth();

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
 * Uses a Firestore transaction to ensure atomicity and prevent race conditions.
 * The conflict check query is simplified to avoid needing a composite index.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);
    
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
    const startTime = parseISO(startISO);
    const endTime = parseISO(endISO);


    const timeOffDocData = await adminDb.runTransaction(async (transaction) => {
        const bookingsRef = adminDb.collection('bookings');
        
        // --- FIX: SIMPLIFIED QUERY ---
        // Fetch bookings for the tutor that *could* conflict and filter in memory.
        // This query avoids needing a composite index because it only has one range filter on `startTime`.
        const potentialConflictsQuery = bookingsRef
            .where('tutorId', '==', tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', Timestamp.fromDate(endTime)); // Get all bookings starting before the block ends
      
        const potentialConflictsSnapshot = await transaction.get(potentialConflictsQuery);

        // Now, filter in memory to find true overlaps
        const conflictingBooking = potentialConflictsSnapshot.docs.find(doc => {
            const booking = doc.data();
            // Ensure endTime exists before creating a Date from it.
            if (!booking.endTime) return false;
            
            const bookingEnd = (booking.endTime as adminFirestore.Timestamp).toDate();
            // A true conflict exists if the booking's end time is after our block's start time.
            return bookingEnd > startTime;
        });

        if (conflictingBooking) {
            console.warn("Conflict found:", {
                blockStart: startTime,
                blockEnd: endTime,
                bookingStart: (conflictingBooking.data().startTime as adminFirestore.Timestamp).toDate(),
                bookingEnd: (conflictingBooking.data().endTime as adminFirestore.Timestamp).toDate(),
            })
            throw new Error('slot_already_booked');
        }

        const newTimeOffRef = adminDb.collection('timeOff').doc();
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
