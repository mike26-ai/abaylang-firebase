// File: src/app/api/bookings/service.ts
/**
 * This file contains the core, testable business logic for the bookings endpoints.
 * It now uses the server-side product catalog as the single source of truth.
 */
import { adminDb, Timestamp, FieldValue } from '@/lib/firebase-admin';
import type { Transaction } from 'firebase-admin/firestore';
import { addMinutes, parse, format } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { products, type ProductId } from '@/config/products';
import { paddlePriceIds } from '@/config/paddle';

interface BookingPayload {
  productId: ProductId;
  userId: string;
  date?: string;
  time?: string;
  groupSessionId?: string; // For joining group sessions
  paymentNote?: string;
}

export async function _createBooking(payload: BookingPayload, decodedToken: DecodedIdToken) {
    if (!adminDb) {
      throw new Error("Database service not available.");
    }

    if (decodedToken.uid !== payload.userId) {
        throw new Error('unauthorized');
    }

    const product = products[payload.productId];
    if (!product) {
        throw new Error('Invalid product ID provided.');
    }

    const isPaidLesson = product.price > 0;
    const newBookingRef = adminDb.collection('bookings').doc();
    
    let startTime: any = null;
    let endTime: any = null;
    let finalDate = payload.date;
    let finalTime = payload.time;

    // This transaction now also handles group session participant updates.
    await adminDb.runTransaction(async (transaction: Transaction) => {
        // --- Group Session Logic ---
        if (product.type === 'group' && payload.groupSessionId) {
            const sessionRef = adminDb.collection('groupSessions').doc(payload.groupSessionId);
            const sessionDoc = await transaction.get(sessionRef);

            if (!sessionDoc.exists) throw new Error('group_session_not_found');
            
            const sessionData = sessionDoc.data()!;
            if (sessionData.participantCount >= sessionData.maxStudents) {
                throw new Error('group_session_full');
            }
            if (new Date(sessionData.startTime.toDate()) < new Date()) {
                throw new Error('group_session_registration_closed');
            }

            // Set booking time details from the session
            startTime = sessionData.startTime;
            endTime = sessionData.endTime;

            if (startTime && endTime) {
                finalDate = format(startTime.toDate(), 'yyyy-MM-dd');
                finalTime = format(startTime.toDate(), 'HH:mm');
            } else {
                throw new Error('group_session_time_missing');
            }
            
            transaction.update(sessionRef, {
                participantCount: FieldValue.increment(1),
                participantIds: FieldValue.arrayUnion(payload.userId)
            });
        } 
        // --- Individual Lesson Logic ---
        else if (product.type === 'individual') {
            if (!payload.date || !payload.time) {
                throw new Error('A date and time are required for this lesson type.');
            }
            const startDateTime = parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date());
            if (isNaN(startDateTime.getTime())) {
                throw new Error('Invalid date or time format provided.');
            }
            startTime = Timestamp.fromDate(startDateTime);
            endTime = Timestamp.fromDate(addMinutes(startTime.toDate(), product.duration as number));

            const bookingsRef = adminDb.collection('bookings');
            const timeOffRef = adminDb.collection('timeOff');
            const tutorId = "MahderNegashMamo";

            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            
            const timeOffConflictQuery = timeOffRef
                .where('tutorId', '==', tutorId)
                .where('startISO', '<', endTime.toDate().toISOString())
                .where('endISO', '>', startTime.toDate().toISOString());

            const [conflictingBookingsSnapshot, conflictingTimeOff] = await Promise.all([
                transaction.get(bookingConflictQuery),
                transaction.get(timeOffConflictQuery)
            ]);

            if (!conflictingBookingsSnapshot.empty) throw new Error('slot_already_booked');
            if (!conflictingTimeOff.empty) throw new Error('tutor_unavailable');
        }

        let initialStatus: 'confirmed' | 'payment-pending-confirmation' = 'payment-pending-confirmation';
        if (!isPaidLesson) { // Free trials are confirmed immediately
            initialStatus = 'confirmed';
        }

        const newBookingDoc = {
            userId: payload.userId,
            userName: decodedToken.name || 'User',
            userEmail: decodedToken.email || 'No Email',
            date: finalDate || 'N/A_PACKAGE',
            time: finalTime || 'N/A_PACKAGE',
            startTime: startTime,
            endTime: endTime,
            duration: typeof product.duration === 'number' ? product.duration : null,
            lessonType: product.label,
            price: product.price,
            productId: payload.productId,
            productType: product.type,
            groupSessionId: payload.groupSessionId || null,
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: initialStatus,
            createdAt: Timestamp.now(),
            statusHistory: [{
                status: initialStatus,
                changedAt: Timestamp.now(),
                changedBy: 'system_booking',
                reason: 'Booking created.',
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };
        
        console.info("FINAL_BOOKING_PAYLOAD", newBookingDoc);
        transaction.set(newBookingRef, newBookingDoc);

        if (product.type === 'package' && product.totalLessons) {
            const userRef = adminDb.collection('users').doc(payload.userId);
            const newCreditObject = { 
                lessonType: payload.productId, 
                count: product.totalLessons, 
                purchasedAt: Timestamp.now(),
                packageBookingId: newBookingRef.id
            };
            transaction.update(userRef, { 
                credits: FieldValue.arrayUnion(newCreditObject),
                lastCreditPurchase: Timestamp.now() 
            });
        }
    });

    if (!isPaidLesson) {
        return { 
            bookingId: newBookingRef.id, 
            redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&free_trial=true` 
        };
    }

    return { 
        bookingId: newBookingRef.id, 
        redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&simulated_payment=true` 
    };
}
