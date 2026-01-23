// File: src/app/api/availability/service.ts
/**
 * This file contains the core, testable business logic for the availability endpoints.
 */
import { adminDb, Timestamp } from '@/lib/firebaseAdmin';
import { startOfDay, endOfDay, parse } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ADMIN_EMAIL } from '@/config/site';

/**
 * Fetches bookings and time-off blocks for a specific tutor and date.
 * This function contains the actual database query logic.
 * @param tutorId The ID of the tutor.
 * @param date The date string in "yyyy-MM-dd" format.
 * @returns An object with arrays of bookings and time-off blocks.
 */
export async function _getAvailability(tutorId: string, date: string) {
    const db = adminDb();
    if (!db) {
        throw new Error("Database service not available.");
    }
    const selectedDate = parse(date, 'yyyy-MM-dd', new Date());
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);
    
    let bookings: any[] = [];
    let timeOff: any[] = [];

    // Fetch confirmed bookings
    try {
      const bookingsQuery = db.collection('bookings')
        .where('tutorId', '==', tutorId)
        .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
        .where('startTime', '>=', startOfSelectedDay)
        .where('startTime', '<=', endOfSelectedDay);
        
      const bookingsSnapshot = await bookingsQuery.get();
      bookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate().toISOString(),
        endTime: doc.data().endTime?.toDate().toISOString(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      }));
    } catch (error: any) {
      console.error("API Service Error: Failed to fetch bookings:", error.message);
      // Do not throw; allow the function to continue and return partial data.
    }

    // Fetch time-off blocks
    try {
      const timeOffQuery = db.collection('timeOff')
          .where('tutorId', '==', tutorId)
          .where('startISO', '>=', startOfSelectedDay.toISOString())
          .where('startISO', '<=', endOfSelectedDay.toISOString());
          
      const timeOffSnapshot = await timeOffQuery.get();
      timeOff = timeOffSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toISOString(),
      }));
    } catch (error: any) {
        console.error("API Service Error: Failed to fetch timeOff blocks:", error.message);
        // Do not throw; allow the function to continue and return partial data.
    }

    return { bookings, timeOff };
}


/**
 * Core logic to block a time slot in Firestore using a transaction.
 * @param payload The data for the time slot to block.
 * @returns The newly created time-off document.
 */
export async function _blockSlot(payload: { tutorId: string; startISO: string; endISO: string; note?: string; decodedToken: DecodedIdToken; }) {
  const db = adminDb();
  if (!db) {
    throw new Error("Database service not available.");
  }
  const { tutorId, startISO, endISO, note, decodedToken } = payload;
  const startTime = new Date(startISO);
  const endTime = new Date(endISO);

  return await db.runTransaction(async (transaction) => {
    const bookingsRef = db.collection('bookings');
    
    // Check for conflicting confirmed bookings
    const bookingConflictQuery = bookingsRef
        .where('tutorId', '==', tutorId)
        .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
        .where('startTime', '<', Timestamp.fromDate(endTime))
        .where('endTime', '>', Timestamp.fromDate(startTime));
        
    const conflictingBookingsSnapshot = await transaction.get(bookingConflictQuery);

    if (!conflictingBookingsSnapshot.empty) {
        throw new Error('slot_already_booked');
    }

    const newTimeOffRef = db.collection('timeOff').doc();
    const timeOffDoc = {
        tutorId,
        startISO,
        endISO,
        note: note || 'Admin Block',
        blockedById: decodedToken.uid,
        blockedByEmail: decodedToken.email,
        createdAt: Timestamp.now(),
    };
  
    transaction.set(newTimeOffRef, timeOffDoc);
    return { id: newTimeOffRef.id, ...timeOffDoc };
  });
}

/**
 * Core logic to unblock a time slot in Firestore using a transaction.
 * @param timeOffId The ID of the time-off block to delete.
 * @param decodedToken The verified token of the user making the request.
 * @returns A success message.
 */
export async function _unblockSlot(timeOffId: string, decodedToken: DecodedIdToken) {
  const db = adminDb();
  if (!db) {
    throw new Error("Database service not available.");
  }
  return await db.runTransaction(async (transaction) => {
    const timeOffDocRef = db.collection('timeOff').doc(timeOffId);
    const docSnap = await transaction.get(timeOffDocRef);

    if (!docSnap.exists) {
        throw new Error('not_found');
    }

    const timeOffData = docSnap.data();
    const isAdmin = decodedToken.admin === true || decodedToken.email === ADMIN_EMAIL;
    // An admin should be able to delete any block, not just their own
    if (!isAdmin) {
        throw new Error('unauthorized');
    }
    
    transaction.delete(timeOffDocRef);
    return { message: 'Time off block successfully deleted.' };
  });
}
