// File: src/app/api/availability/get/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { format, startOfDay, endOfDay } from 'date-fns';

// Initialize Firebase Admin SDK
const app = initAdmin();
const db = getFirestore(app);

// Zod schema for input validation
const GetAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
  tutorId: z.string().min(1, 'Tutor ID is required.'),
});

/**
 * GET handler to fetch all bookings and time-off blocks for a specific tutor on a given date.
 * This endpoint is public and does not require authentication.
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
    const selectedDate = new Date(`${date}T00:00:00`); // Ensure date is parsed in local/server timezone
    const startOfSelectedDay = Timestamp.fromDate(startOfDay(selectedDate));
    const endOfSelectedDay = Timestamp.fromDate(endOfDay(selectedDate));
    
    // 2. Fetch confirmed bookings for the given date and tutor
    const bookingsQuery = db.collection('bookings')
      .where('tutorId', '==', tutorId)
      .where('status', '==', 'confirmed')
      .where('startTime', '>=', startOfSelectedDay)
      .where('startTime', '<=', endOfSelectedDay);
      
    const bookingsSnapshot = await bookingsQuery.get();
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: (doc.data().startTime as Timestamp).toDate().toISOString(),
      endTime: (doc.data().endTime as Timestamp).toDate().toISOString(),
    }));

    // 3. Fetch time-off blocks for the same date and tutor
    const timeOffQuery = db.collection('timeOff')
        .where('tutorId', '==', tutorId)
        .where('startISO', '>=', startOfSelectedDay.toDate().toISOString())
        .where('startISO', '<=', endOfSelectedDay.toDate().toISOString());
        
    const timeOffSnapshot = await timeOffQuery.get();
    const timeOff = timeOffSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 4. Return combined data
    return NextResponse.json({ bookings, timeOff });

  } catch (error: any) {
    console.error('Error fetching availability:', error);
    return NextResponse.json({ code: 'server_error', message: 'Failed to fetch availability data.' }, { status: 500 });
  }
}
