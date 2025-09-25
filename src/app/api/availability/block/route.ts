// File: src/app/api/availability/block/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { ADMIN_EMAIL } from '@/config/site';
import { _blockSlot } from '../service'; // Import the testable logic

// Initialize Firebase Admin SDK
initAdmin();
const auth = getAuth();

// Zod schema for input validation remains the same
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
 * This route handler is now a thin wrapper around the testable business logic.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authentication
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ code: 'unauthenticated', message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    
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
    
    // 4. Call the decoupled, testable logic function
    const timeOffDocData = await _blockSlot({ ...validationResult.data, decodedToken });

    // 5. Return success response
    return NextResponse.json(timeOffDocData, { status: 201 });

  } catch (error: any) {
    console.error('Error in block route:', error);
    if (error.message.includes('slot_already_booked')) {
        return NextResponse.json({ code: 'conflict', message: 'This time slot is already booked by a student.' }, { status: 409 });
    }
    return NextResponse.json({ code: 'server_error', message: 'Failed to block time slot.' }, { status: 500 });
  }
}
