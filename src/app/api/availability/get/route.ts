// File: src/app/api/availability/get/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { startOfDay, endOfDay, parse } from 'date-fns';

// Initialize Firebase Admin SDK
try {
  initAdmin();
} catch (error) {
  console.error("CRITICAL: Failed to initialize Firebase Admin SDK in get/route.ts", error);
}

const db = getFirestore();

// Zod schema for input validation
const GetAvailabilitySchema = z.object({
  tutorId: z.string().min(1, 'Tutor ID is required.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.'),
});

/**
 * GET handler to fetch availability.
 * This route handler now contains all its own logic.
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
    const { date, tutorId } = validationResult.data;
    
    // 2. Perform Firestore queries
    const selectedDate = parse(date, 'yyyy-MM-dd', new Date());
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);
    
    // Fetch confirmed bookings
    const bookingsQuery = db.collection('bookings')
      .where('tutorId', '==', tutorId)
      .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
      .where('startTime', '>=', startOfSelectedDay)
      .where('startTime', '<=', endOfSelectedDay);
      
    const bookingsSnapshot = await bookingsQuery.get();
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: (doc.data().startTime as Timestamp)?.toDate().toISOString(),
      endTime: (doc.data().endTime as Timestamp)?.toDate().toISOString(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString(),
    }));

    // Fetch time-off blocks
    const timeOffQuery = db.collection('timeOff')
        .where('tutorId', '==', tutorId)
        .where('startISO', '>=', startOfSelectedDay.toISOString())
        .where('startISO', '<=', endOfSelectedDay.toISOString());
        
    const timeOffSnapshot = await timeOffQuery.get();
    const timeOff = timeOffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString(),
    }));

    // 3. Return combined data
    return NextResponse.json({ success: true, data: { bookings, timeOff } });

  } catch (error: any) {
    console.error('API Error (/availability/get):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch availability data', details: error?.message },
      { status: 500 }
    );
  }
}
