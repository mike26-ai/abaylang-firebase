// File: src/app/api/bookings/create/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { z } from 'zod';
import { _createBooking } from '@/app/api/bookings/service';
import { isValidProductId } from '@/config/products';

// Zod schema for input validation, now including productId
const CreateBookingRequestSchema = z.object({
  productId: z.string().refine(isValidProductId, { message: 'Invalid product ID.' }),
  userId: z.string().min(1),
  date: z.string().optional(),
  time: z.string().optional(),
  groupSessionId: z.string().optional(),
  paymentNote: z.string().optional(),
});


/**
 * POST handler to create a new booking securely.
 * This route handler is now a thin wrapper around the testable business logic.
 * It validates the user and the productId, then passes control to the service.
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminAuth) {
      throw new Error("Firebase Admin SDK not initialized.");
    }
    // 1. Verify Authentication from client and get the authenticated user
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(idToken);
    
    // 2. Validate Input Body
    const body = await request.json();
    console.debug("API_RECEIVED_PAYLOAD", body); // Temporary debug log
    const validationResult = CreateBookingRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    // 3. Call the decoupled, testable logic function
    const result = await _createBooking(validationResult.data, decodedToken);

    // 4. Return success response with the redirect URL
    return NextResponse.json({ success: true, ...result }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create booking API route:', error);
    if (error.message === 'slot_already_booked') {
        return NextResponse.json({ success: false, message: 'This time slot has just been booked. Please select another.' }, { status: 409 });
    }
    if (error.message === 'tutor_unavailable') {
        return NextResponse.json({ success: false, message: 'The tutor is unavailable at this time due to a scheduled break.' }, { status: 409 });
    }
     if (error.message === 'group_session_full') {
        return NextResponse.json({ success: false, message: 'This group session is now full.' }, { status: 409 });
    }
    if (error.message === 'group_session_registration_closed') {
        return NextResponse.json({ success: false, message: 'Registration for this group session has closed.' }, { status: 409 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, message: 'Unauthorized action.' }, { status: 403 });
    }
    return NextResponse.json({ success: false, message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
