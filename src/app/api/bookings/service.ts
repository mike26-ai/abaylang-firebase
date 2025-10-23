
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
        // IMPORTANT: Parse the date and time from the client and create a Date object.
        // This assumes the server's timezone is consistent or the client sends timezone-aware strings if needed.
        // For simplicity, we'll parse as is, but for production, ensuring UTC would be best.
        const startDateTime = parse(`${bookingData.date} ${bookingData.time}`, 'yyyy-MM-dd HH:mm', new Date());
        if (isNaN(startDateTime.getTime())) {
            throw new Error('Invalid date or time format provided.');
        }
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
            // This is a private lesson, check for conflicts across all relevant collections
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
            const groupSessionsRef = db.collection('groupSessions');

            // 1. Check for conflicting private bookings (with correct statuses)
            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingBookings = await transaction.get(bookingConflictQuery);
            if (!conflictingBookings.empty) {
                console.log("Booking Conflicts Found:", conflictingBookings.docs.map(d => d.data()));
                throw new Error('slot_already_booked');
            }

            // 2. Check for conflicting group sessions (with correct statuses)
            const groupSessionConflictQuery = groupSessionsRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('status', '==', 'scheduled') // Only check for active scheduled sessions
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            const conflictingGroupSessions = await transaction.get(groupSessionConflictQuery);
             if (!conflictingGroupSessions.empty) {
                 console.log("Group Session Conflicts Found:", conflictingGroupSessions.docs.map(d => d.data()));
                 throw new Error('slot_already_booked');
            }

            // 3. Check for conflicting admin time-off blocks
            // This query compares Timestamp objects with the string fields in timeOff, which is incorrect.
            // A robust solution requires storing startISO/endISO as Timestamps in Firestore or fetching and converting.
            // For an immediate fix, we fetch and check in memory, which is safe inside a transaction.
            const timeOffDayQuery = timeOffRef
                .where('tutorId', '==', bookingData.tutorId)
                .where('startISO', '>=', startTime.toDate().toISOString().split('T')[0]); // Broad fetch for the day
            
            const timeOffSnapshot = await transaction.get(timeOffDayQuery);
            const startMillis = startTime.toMillis();
            const endMillis = endTime.toMillis();

            for (const doc of timeOffSnapshot.docs) {
                const block = doc.data();
                const blockStartMillis = new Date(block.startISO).getTime();
                const blockEndMillis = new Date(block.endISO).getTime();
                if (startMillis < blockEndMillis && endMillis > blockStartMillis) {
                    console.log("Time-Off Conflict Found:", block);
                    throw new Error('tutor_unavailable');
                }
            }
        }

        // If all checks pass, create the new booking document
        const newBookingRef = db.collection('bookings').doc();
        const newBookingDoc = {
            ...bookingData,
            startTime: startTime,
            endTime: endTime,
            status: bookingData.isFreeTrial ? 'confirmed' : 'awaiting-payment',
            createdAt: FieldValue.serverTimestamp(), // Use server timestamp for reliability
        };

        transaction.set(newBookingRef, newBookingDoc);
        return { bookingId: newBookingRef.id };
    });
}

    