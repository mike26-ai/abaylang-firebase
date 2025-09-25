// File: src/app/api/availability/get/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { z } from 'zod';
import { _getAvailability } from '../service'; // Import the testable logic

// Initialize Firebase Admin SDK
initAdmin();

// Zod schema for input validation remains the same
const GetAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  tutorId: z.string().min(1, 'Tutor ID is required.'),
});

/**
 * GET handler to fetch availability.
 * This route handler is now a thin wrapper around the testable business logic.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  // 1. Validate input
  const validationResult = GetAvailabilitySchema.safeParse(params);
  if (!validationResult.success) {
    return NextResponse.json({ code: 'invalid_input', message: validationResult.error.flatten().fieldErrors }, { status: 400 });
  }
  const { date, tutorId } = validationResult.data;
  
  try {
    // 2. Call the decoupled, testable logic function
    const availabilityData = await _getAvailability(tutorId, date);

    // 3. Return combined data
    return NextResponse.json(availabilityData);

  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ code: 'server_error', message: 'Failed to fetch availability data.' }, { status: 500 });
  }
}
