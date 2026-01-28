import { adminDb, Timestamp, FieldValue } from '@/lib/firebase-admin';
import type { Booking, TimeOff } from '@/lib/types';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Transaction, QueryDocumentSnapshot, Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

export async function _getAvailability(tutorId: string, date: string) {
    if (!adminDb) throw new Error("Firebase Admin SDK not initialized.");

    const dayStart = startOfDay(parseISO(date));
    const dayEnd = endOfDay(parseISO(date));

    const dayStartTimestamp = Timestamp.fromDate(dayStart);
    
    const bookingsQuery = adminDb.collection('bookings')
        .where('tutorId', '==', tutorId)
        .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
        .where('startTime', '<', Timestamp.fromDate(dayEnd));

    const timeOffQuery = adminDb.collection('timeOff')
        .where('tutorId', '==', tutorId)
        .where('startISO', '<', dayEnd.toISOString());

    const [bookingsSnapshot, timeOffSnapshot] = await Promise.all([
        bookingsQuery.get(),
        timeOffQuery.get()
    ]);
    
    const bookings = bookingsSnapshot.docs
        .map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as Booking))
        .filter((booking: Booking) => (booking.endTime as AdminTimestamp).toDate() > dayStart);

    const timeOff = timeOffSnapshot.docs
        .map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...doc.data() } as TimeOff))
        .filter((block: TimeOff) => new Date(block.endISO) > dayStart);

    return { bookings, timeOff };
}


interface BlockSlotPayload {
  tutorId: string;
  startISO: string;
  endISO: string;
  note?: string;
  decodedToken: DecodedIdToken;
}

export async function _blockSlot(payload: BlockSlotPayload) {
    if (!adminDb) throw new Error("Firebase Admin SDK not initialized.");

    const { tutorId, startISO, endISO, note, decodedToken } = payload;
    const newTimeOffRef = adminDb.collection('timeOff').doc();
    const startTime = new Date(startISO);
    const endTime = new Date(endISO);

    await adminDb.runTransaction(async (transaction: Transaction) => {
        if (!adminDb) { // Added null check for type safety inside transaction
          throw new Error("Database service is not available inside transaction.");
        }
        const bookingsRef = adminDb.collection('bookings');
        const conflictQuery = bookingsRef
            .where('tutorId', '==', tutorId)
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', Timestamp.fromDate(endTime))
            .where('endTime', '>', Timestamp.fromDate(startTime));
            
        const conflictingBookings = await transaction.get(conflictQuery);
        
        if (!conflictingBookings.empty) {
            throw new Error('slot_already_booked');
        }

        transaction.set(newTimeOffRef, {
            tutorId,
            startISO,
            endISO,
            note: note || 'Admin Block',
            blockedById: decodedToken.uid,
            blockedByEmail: decodedToken.email,
            createdAt: FieldValue.serverTimestamp(),
        });
    });

    const newTimeOffDoc = await newTimeOffRef.get();
    return { id: newTimeOffDoc.id, ...newTimeOffDoc.data() };
}

export async function _unblockSlot(timeOffId: string, decodedToken: DecodedIdToken) {
    if (!adminDb) throw new Error("Firebase Admin SDK not initialized.");
    
    const timeOffRef = adminDb.collection('timeOff').doc(timeOffId);
    
    await adminDb.runTransaction(async (transaction: Transaction) => {
        const doc = await transaction.get(timeOffRef);
        if (!doc.exists) {
            throw new Error('not_found');
        }
        
        transaction.delete(timeOffRef);
    });

    return { message: 'Time slot successfully unblocked.' };
}
