// File: src/app/api/availability/block/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
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
 * This route handler now includes robust error handling.
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
    
    // 4. Call the decoupled, testable logic function from the service file
    const { _blockSlot } = await import('../service');
    const timeOffDocData = await _blockSlot({ ...validationResult.data, decodedToken });

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
