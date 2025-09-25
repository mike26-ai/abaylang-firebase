// File: src/app/api/availability/unblock/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { _unblockSlot } from '../service'; // Import the testable logic

// Initialize Firebase Admin SDK
initAdmin();
const auth = getAuth();

// Zod schema for input validation remains the same
const UnblockTimeSchema = z.object({
  timeOffId: z.string().min(1, 'timeOffId is required.'),
});

/**
 * POST handler to unblock (delete) a time-off slot.
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

    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = UnblockTimeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ code: 'invalid_input', message: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    const { timeOffId } = validationResult.data;

    // 3. Call the decoupled, testable logic function
    const result = await _unblockSlot(timeOffId, decodedToken);

    // 4. Return success response
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('Error in unblock route:', error);
    if (error.message === 'not_found') {
        return NextResponse.json({ code: 'not_found', message: 'Time off block not found.' }, { status: 404 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ code: 'unauthorized', message: 'User is not authorized to delete this time block.' }, { status: 403 });
    }
    return NextResponse.json({ code: 'server_error', message: 'Failed to unblock time slot.' }, { status: 500 });
  }
}
