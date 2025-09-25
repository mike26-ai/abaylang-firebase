// File: src/app/api/availability/service.ts
/**
 * This file contains the core, testable business logic for the availability endpoints.
 * It is imported and used by the route handlers, but is decoupled from the Next.js
 * request/response objects.
 */
import { getFirestore, Timestamp, runTransaction } from 'firebase-admin/firestore';
import { startOfDay, endOfDay, parse } from 'date-fns';

const db = getFirestore();

export async function _getAvailability(tutorId: string, date: string) {
    const selectedDate = parse(date, 'yyyy-MM-dd', new Date());
    const startOfSelectedDay = startOfDay(selectedDate);
    const endOfSelectedDay = endOfDay(selectedDate);
    
    // Fetch confirmed bookings
    const bookingsQuery = db.collection('bookings')
      .where('tutorId', '==', tutorId)
      .where('status', 'in', ['confirmed', 'awaiting-payment'])
      .where('startTime', '>=', startOfSelectedDay)
      .where('startTime', '<=', endOfSelectedDay);
      
    const bookingsSnapshot = await bookingsQuery.get();
    const bookings = bookingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Timestamps to ISO strings for JSON serialization
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

    return { bookings, timeOff };
}


export async function _blockSlot(payload: { tutorId: string; startISO: string; endISO: string; note?: string; decodedToken: any; }) {
    const { tutorId, startISO, endISO, note, decodedToken } = payload;
    const startTime = Timestamp.fromDate(new Date(startISO));
    const endTime = Timestamp.fromDate(new Date(endISO));

    return await runTransaction(db, async (transaction) => {
        const bookingsRef = db.collection('bookings');
        const conflictQuery = bookingsRef
            .where('tutorId', '==', tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment'])
            .where('startTime', '<', endTime)
            .where('endTime', '>', startTime);
      
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


export async function _unblockSlot(timeOffId: string, decodedToken: any) {
    return await runTransaction(db, async (transaction) => {
        const timeOffDocRef = db.collection('timeOff').doc(timeOffId);
        const docSnap = await transaction.get(timeOffDocRef);

        if (!docSnap.exists) {
            const error = new Error('not_found');
            (error as any).status = 404;
            throw error;
        }

        const timeOffData = docSnap.data();
        const isAdmin = decodedToken.admin === true || decodedToken.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        const isOwner = timeOffData?.blockedById === decodedToken.uid;

        if (!isAdmin && !isOwner) {
            const error = new Error('unauthorized');
            (error as any).status = 403;
            throw error;
        }
        
        transaction.delete(timeOffDocRef);
        return { message: 'Time off block successfully deleted.' };
    });
}
