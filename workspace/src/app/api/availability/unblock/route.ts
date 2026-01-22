// File: src/app/api/availability/unblock/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import { z } from 'zod';
import { _unblockSlot } from '@/app/api/availability/service'; // Corrected import path

// Initialize Firebase Admin SDK
try {
  initAdmin();
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK in unblock/route.ts", error);
}
const auth = getAuth();

// Zod schema for input validation
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
      return NextResponse.json({ success: false, error: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(idToken);

    // 2. Validate Input Body
    const body = await request.json();
    const validationResult = UnblockTimeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    const { timeOffId } = validationResult.data;

    // 3. Call the decoupled, testable logic function
    const result = await _unblockSlot(timeOffId, decodedToken);

    // 4. Return success response
    return NextResponse.json({ success: true, data: result }, { status: 200 });

  } catch (error: any) {
    console.error('API Error (/availability/unblock):', error);
    if (error.message === 'not_found') {
        return NextResponse.json({ success: false, error: 'Time off block not found.', details: error.message }, { status: 404 });
    }
    if (error.message === 'unauthorized') {
        return NextResponse.json({ success: false, error: 'User is not authorized to delete this time block.', details: error.message }, { status: 403 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to unblock time slot.', details: error?.message },
      { status: 500 }
    );
  }
}
