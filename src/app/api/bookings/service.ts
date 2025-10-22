
// File: src/app/api/bookings/service.ts
/**
 * This file contains the core, testable business logic for the bookings endpoints.
 */
import { getFirestore, Timestamp, FieldValue, Transaction } from 'firebase-admin/firestore';
import { addMinutes, parse } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';

const db = getFirestore();

interface BookingPayload {
  date: string;
  time: string;
  duration: number;
  lessonType: string;
  price: number;
  tutorId: string;
  isFreeTrial: boolean;
  userId: string;
  userName?: string;
  userEmail?: string;
  paymentNote?: string;
  groupSessionId?: string;
}


export async function _createBooking(bookingData: BookingPayload, decodedToken: DecodedIdToken) {
    // Security check: Ensure the user ID from the token matches the payload
    if (decodedToken.uid !== bookingData.userId) {
        const error = new Error('unauthorized');
        (error as any).status = 403;
        throw error;
    }

    const isSpecificTimeBooking = bookingData.date !== 'N/A_PACKAGE' && bookingData.time !== 'N/A_PACKAGE';
    let startTime: Timestamp | null = null;
    let endTime: Timestamp | null = null;
  
    if (isSpecificTimeBooking) {
        // Use the duration from the payload for accurate end time calculation
        const startDateTime = parse(`${bookingData.date} ${bookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
        startTime = Timestamp.fromDate(startDateTime);
        endTime = Timestamp.fromDate(addMinutes(startDateTime, bookingData.duration));
    }

    return await db.runTransaction(async (transaction: Transaction) => {
        if (isSpecificTimeBooking && startTime && endTime) {
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
            const groupSessionsRef = db.collection('groupSessions');

            // Check for conflicting confirmed bookings
            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingBookings = await transaction.get(bookingConflictQuery);
            if (!conflictingBookings.empty) {
                throw new Error('slot_already_booked');
            }

            // Check for conflicting group sessions
             const groupSessionConflictQuery = groupSessionsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', '==', 'scheduled')
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingGroupSessions = await transaction.get(groupSessionConflictQuery);
            if (!conflictingGroupSessions.empty) {
                 throw new Error('slot_already_booked');
            }


            // Check for conflicting time-off blocks
            const timeOffConflictQuery = timeOffRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('startISO', '<', endTime.toDate().toISOString())
                .where('endISO', '>', startTime.toDate().toISOString());
            const conflictingTimeOff = await transaction.get(timeOffConflictQuery);
            if (!conflictingTimeOff.empty) {
                throw new Error('tutor_unavailable');
            }
        }

        const newBookingRef = db.collection('bookings').doc();
        const newBookingDoc = {
            ...bookingData,
            startTime: startTime,
            endTime: endTime,
            status: bookingData.isFreeTrial ? 'confirmed' : 'awaiting-payment',
            createdAt: FieldValue.serverTimestamp(),
        };

        transaction.set(newBookingRef, newBookingDoc);
        return { bookingId: newBookingRef.id };
    });
}

    