// File: src/app/api/availability/service.ts
/**
 * This file contains the core, testable business logic for the availability endpoints.
 */
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { parse, startOfDay, endOfDay } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { ADMIN_EMAIL } from '@/config/site';

const db = getFirestore();

/**
 * Testable logic to fetch availability for a tutor on a given date.
 */
export async function _getAvailability(tutorId: string, date: string) {
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
      startTime: (doc.data().startTime as Timestamp)?.toDate().toISOString(),
      endTime: (doc.data().endTime as Timestamp)?.toDate().toISOString(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString(),
    }));
  } catch (error: any) {
    console.error("API Service Error: Failed to fetch bookings:", error.message);
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
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString(),
    }));
  } catch (error: any) {
      console.error("API Service Error: Failed to fetch timeOff blocks:", error.message);
  }
  
  return { bookings, timeOff };
}


/**
 * Testable logic to block a time slot for a tutor.
 */
export async function _blockSlot(payload: { tutorId: string; startISO: string; endISO: string; note?: string; decodedToken: DecodedIdToken }) {
  const { tutorId, startISO, endISO, note, decodedToken } = payload;

  return await db.runTransaction(async (transaction) => {
      const bookingsRef = db.collection('bookings');
      const conflictQuery = bookingsRef
          .where('tutorId', '==', tutorId)
          .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
          .where('startTime', '<', Timestamp.fromDate(new Date(endISO)))
          .where('endTime', '>', Timestamp.fromDate(new Date(startISO)));
    
      const conflictingBookingsSnapshot = await transaction.get(conflictQuery);

      if (!conflictingBookingsSnapshot.empty) {
          throw new Error('slot_already_booked');
      }

      const newTimeOffRef = db.collection('timeOff').doc();
      const timeOffDoc = {
          tutorId,
          startISO,
          endISO,
          note: note || '',
          blockedById: decodedToken.uid,
          blockedByEmail: decodedToken.email,
          createdAt: Timestamp.now(),
      };
    
      transaction.set(newTimeOffRef, timeOffDoc);
      return { id: newTimeOffRef.id, ...timeOffDoc };
  });
}


/**
 * Testable logic to unblock a time slot.
 */
export async function _unblockSlot(timeOffId: string, decodedToken: DecodedIdToken) {
  return await db.runTransaction(async (transaction) => {
      const timeOffDocRef = db.collection('timeOff').doc(timeOffId);
      const docSnap = await transaction.get(timeOffDocRef);

      if (!docSnap.exists) {
          throw new Error('not_found');
      }

      const timeOffData = docSnap.data();
      const isAdmin = decodedToken.admin === true || decodedToken.email === ADMIN_EMAIL;
      const isOwner = timeOffData?.blockedById === decodedToken.uid;

      if (!isAdmin && !isOwner) {
          throw new Error('unauthorized');
      }
      
      transaction.delete(timeOffDocRef);
      return { message: 'Time off block successfully deleted.' };
  });
}
