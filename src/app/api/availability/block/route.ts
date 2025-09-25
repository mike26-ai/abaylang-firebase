// File: src/app/api/availability/block/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';

// Initialize Firebase Admin SDK
const app = initAdmin();
const db = getFirestore(app);
const auth = getAuth(app);

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
 * Requires admin authentication.
 */
export async function POST(request: NextRequest) {
  // 1. Verify Authentication
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
  
  // 2. Verify Authorization (Admin Check)
  const isAdmin = decodedToken.email === ADMIN_EMAIL || decodedToken.admin === true;
  if (!isAdmin) {
    return NextResponse.json({ code: 'unauthorized', message: 'User does not have admin privileges.' }, { status: 403 });
  }

  // 3. Validate Input Body
  const body = await request.json();
  const validationResult = BlockTimeSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json({ code: 'invalid_input', message: validationResult.error.flatten().fieldErrors }, { status: 400 });
  }
  const { tutorId, startISO, endISO, note } = validationResult.data;

  try {
    const startTime = Timestamp.fromDate(new Date(startISO));
    const endTime = Timestamp.fromDate(new Date(endISO));

    // 4. Check for conflicting bookings
    const bookingsRef = db.collection('bookings');
    const conflictQuery = bookingsRef
      .where('tutorId', '==', tutorId)
      .where('status', '==', 'confirmed')
      .where('startTime', '<', endTime)
      .where('endTime', '>', startTime);
      
    const conflictingBookingsSnapshot = await conflictQuery.get();
    if (!conflictingBookingsSnapshot.empty) {
      return NextResponse.json({ code: 'conflict', message: 'This time slot is already booked by a student.' }, { status: 409 });
    }

    // 5. Create the timeOff document
    const timeOffDoc = {
      tutorId,
      startISO,
      endISO,
      note: note || '',
      blockedById: decodedToken.uid,
      blockedByEmail: decodedToken.email,
      createdAt: Timestamp.now(),
    };
    const docRef = await db.collection('timeOff').add(timeOffDoc);

    // 6. Return success response
    return NextResponse.json({ id: docRef.id, ...timeOffDoc }, { status: 201 });

  } catch (error: any) {
    console.error('Error blocking time slot:', error);
    return NextResponse.json({ code: 'server_error', message: 'Failed to block time slot.' }, { status: 500 });
  }
}
