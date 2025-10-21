// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, initAdmin } from '@/lib/firebase-admin';
import { z } from 'zod';
import { _createBooking } from './service';
import type { DecodedIdToken } from 'firebase-admin/auth';

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
 * This route handler is now a thin wrapper around the testable business logic
 * in the accompanying service.ts file.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication from client and get the authenticated user
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(idToken);
    
    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = CreateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    // 3. Call the decoupled, testable logic function
    const result = await _createBooking(validationResult.data, decodedToken);

    // 4. Return success response
    return NextResponse.json({ success: true, bookingId: result.bookingId }, { status: 201 });

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
