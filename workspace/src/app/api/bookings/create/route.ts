// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { z } from 'zod';
import { _createBooking } from '@/app/api/bookings/service'; // Corrected import path

// Initialize Firebase Admin SDK
initAdmin();
const auth = getAuth();

// Zod schema for input validation
const CreateBookingSchema = z.object({
  date: z.string(),
  time: z.string(),
  duration: z.number().int().positive(),
  lessonType: z.string().min(1),
  price: z.number().min(0),
  tutorId: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  paymentNote: z.string().optional(),
  isFreeTrial: z.boolean(),
});

/**
 * POST handler to create a new booking securely.
 * This route handler is now a thin wrapper around the testable business logic.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication from client
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);

    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    // 3. Call the decoupled, testable logic function
    const result = await _createBooking(validationResult.data, decodedToken);
    
    return NextResponse.json({ success: true, bookingId: result.bookingId }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking route:', error.message);
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, message: 'User is not authorized to create this booking.' }, { status: 403 });
    }
    if (error.message === 'slot_already_booked') {
        return NextResponse.json({ success: false, message: 'This time slot has just been booked by another student.' }, { status: 409 });
    }
    if (error.message === 'tutor_unavailable') {
        return NextResponse.json({ success: false, message: 'The tutor is unavailable at this time.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, message: 'Failed to create booking.' }, { status: 500 });
  }
}
