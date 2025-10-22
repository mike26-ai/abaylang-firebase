

// File: src/app/api/bookings/service.ts
/**
 * This file contains the core, testable business logic for the bookings endpoints.
 */
import { getFirestore, Timestamp, FieldValue, Transaction } from 'firebase-admin/firestore';
import { addMinutes, parse, differenceInHours } from 'date-fns';
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
    if (decodedToken.uid !== bookingData.userId) {
        const error = new Error('unauthorized');
        (error as any).status = 403;
        throw error;
    }

    const isSpecificTimeBooking = bookingData.date !== 'N/A_PACKAGE' && bookingData.time !== 'N/A_PACKAGE';
    let startTime: Timestamp | null = null;
    let endTime: Timestamp | null = null;
  
    if (isSpecificTimeBooking) {
        const startDateTime = parse(`${bookingData.date} ${bookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
        startTime = Timestamp.fromDate(startDateTime);
        endTime = Timestamp.fromDate(addMinutes(startDateTime, bookingData.duration));
    }

    return await db.runTransaction(async (transaction: Transaction) => {
        // If it is a group session booking, perform group-specific checks
        if (bookingData.groupSessionId) {
            const groupSessionRef = db.collection('groupSessions').doc(bookingData.groupSessionId);
            const groupSessionDoc = await transaction.get(groupSessionRef);
            if (!groupSessionDoc.exists) {
                throw new Error('Group session not found.');
            }
            const groupSessionData = groupSessionDoc.data()!;

            // Check if registration is closed (e.g., 3 hours before start)
            const registrationDeadline = new Date(groupSessionData.startTime.toDate().getTime() - 3 * 60 * 60 * 1000);
            if (new Date() > registrationDeadline) {
                throw new Error('group_session_registration_closed');
            }

            // Check if the session is full
            if (groupSessionData.participantCount >= groupSessionData.maxStudents) {
                throw new Error('group_session_full');
            }
            
            // Increment participant count
            transaction.update(groupSessionRef, { 
                participantCount: FieldValue.increment(1),
                participantIds: FieldValue.arrayUnion(bookingData.userId)
            });

        } else if (isSpecificTimeBooking && startTime && endTime) {
            // This is a private lesson, check for conflicts
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
            const groupSessionsRef = db.collection('groupSessions');

            // Conflict checks for private lessons
            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingBookings = await transaction.get(bookingConflictQuery);
            if (!conflictingBookings.empty) {
                throw new Error('slot_already_booked');
            }

            const groupSessionConflictQuery = groupSessionsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', '==', 'scheduled')
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingGroupSessions = await transaction.get(groupSessionConflictQuery);
            if (!conflictingGroupSessions.empty) {
                 throw new Error('slot_already_booked');
            }

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
