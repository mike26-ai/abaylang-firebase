<<<<<<< HEAD
// File: src/app/actions/bookingActions.ts
'use server';

import { addDoc, collection, getDocs, query, where, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initAdmin } from '@/lib/firebase-admin';

// Define a consistent return type for the action
type BookingActionResult = {
  success: boolean;
  message: string;
  bookingId?: string;
};

/**
 * Creates a secure booking after performing server-side validation.
 * This is the authoritative function for creating a lesson booking.
 * It checks for conflicts with existing bookings AND tutor time off blocks.
 */
export async function createSecureBooking(bookingData: {
  userId: string;
  userName: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  lessonType: string;
  price: number;
  learningGoals: string;
  status: 'confirmed' | 'awaiting-payment';
}): Promise<BookingActionResult> {
  const app = initAdmin();
  const db = getFirestore(app);

  try {
    const { date, time, duration } = bookingData;
    const requestedStartTime = Timestamp.fromDate(new Date(`${date}T${time}:00`));
    const requestedEndTime = Timestamp.fromDate(new Date(requestedStartTime.toMillis() + duration * 60 * 1000));

    // 1. Check for conflict with existing CONFIRMED bookings
    const bookingsRef = db.collection('bookings');
    const bookingConflictQuery = bookingsRef
      .where('status', 'in', ['confirmed', 'awaiting-payment'])
      .where('startTime', '<', requestedEndTime)
      .where('endTime', '>', requestedStartTime);
      
    const bookingConflictSnapshot = await bookingConflictQuery.get();
    if (!bookingConflictSnapshot.empty) {
      return { success: false, message: 'This time slot is no longer available. Please select another time.' };
    }
    
    // 2. Check for conflict with tutor's TIME OFF blocks
    const timeOffRef = db.collection('timeOff');
    const timeOffConflictQuery = timeOffRef
        .where('startTime', '<', requestedEndTime)
        .where('endTime', '>', requestedStartTime);

    const timeOffConflictSnapshot = await timeOffConflictQuery.get();
    if (!timeOffConflictSnapshot.empty) {
        return { success: false, message: "The tutor is unavailable at this time. Please select another slot." };
    }

    // 3. If all checks pass, create the booking document
    const docRef = await addDoc(collection(db, 'bookings'), {
      ...bookingData,
      startTime: requestedStartTime, // Storing the correct timestamp
      endTime: requestedEndTime,     // Storing the correct timestamp
      createdAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Booking successfully created.',
      bookingId: docRef.id,
    };

  } catch (error: any) {
    console.error('Error in createSecureBooking:', error);
    // Provide a more user-friendly error for index issues.
    if (error.code === 'FAILED_PRECONDITION') {
        return { success: false, message: "The database isn't configured for this query yet. Please create the required index in your Firebase console and try again." };
    }
    return {
      success: false,
      message: error.message || 'An unexpected server error occurred.',
    };
  }
}
=======

// File: src/app/actions/bookingActions.ts
'use server';

// NOTE: This file is intentionally left empty in the reverted state.
// The server-side checkout flow does not require any actions in this file.
// The `confirmBookingAfterPayment` function was part of the client-side
// flow that has been removed.

    
>>>>>>> before-product-selection-rewrite
