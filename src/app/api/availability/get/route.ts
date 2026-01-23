// File: src/app/api/availability/get/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { _getAvailability } from '../service'; // Import the testable logic

// Zod schema for input validation
const GetAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
});

/**
 * GET handler to fetch availability.
 * This route handler is now a thin wrapper around the testable business logic.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  try {
    // 1. Validate input
    const validationResult = GetAvailabilitySchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, error: 'Invalid input', details: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }
    const { date } = validationResult.data;
    // Hardcode tutorId for the single-tutor model
    const tutorId = "MahderNegashMamo";
    
    // 2. Call the decoupled, testable logic function
    const availabilityData = await _getAvailability(tutorId, date);

    // 3. Return combined data
    return NextResponse.json({ success: true, data: availabilityData });

  } catch (error: any) {
    console.error('API Error (/availability/get):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability data', details: error?.message },
      { status: 500 }
    );
  }
}
