// File: src/app/api/bookings/service.ts
/**
 * This file contains the core, testable business logic for the bookings endpoints.
 * It now uses the server-side product catalog as the single source of truth.
 */
import { adminDb, Timestamp, FieldValue } from '@/lib/firebase-admin';
import type { Timestamp as AdminTimestamp, Transaction, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { addMinutes, parse, format } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { products, type ProductId } from '@/config/products';
import { paddlePriceIds } from '@/config/paddle';
import type { Booking } from '@/lib/types';

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
    
    let startTime: AdminTimestamp | null = null;
    let endTime: AdminTimestamp | null = null;
    let finalDate = payload.date;
    let finalTime = payload.time;

    // This transaction now also handles group session participant updates.
    await adminDb.runTransaction(async (transaction: Transaction) => {
        // --- Group Session Logic ---
        if (product.type === 'group' && payload.groupSessionId) {
            const sessionRef = adminDb!.collection('groupSessions').doc(payload.groupSessionId);
            const sessionDoc = await transaction.get(sessionRef);

            if (!(sessionDoc as any).exists) throw new Error('group_session_not_found');
            
            const sessionData = (sessionDoc as any).data()!;
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

            const bookingsRef = adminDb!.collection('bookings');
            const timeOffRef = adminDb!.collection('timeOff');
            const tutorId = "MahderNegashMamo";

            // Firestore doesn't allow range filters on two different fields.
            // We check for conflicts by querying for any booking or time-off that starts
            // before the new booking ends, and then filtering for ones that end after it starts.

            // 1. Check for booking conflicts
            const potentialBookingConflictsQuery = bookingsRef
                .where('tutorId', '==', tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
                .where('startTime', '<', endTime);

            // 2. Check for time-off conflicts
            const potentialTimeOffConflictsQuery = timeOffRef
                .where('tutorId', '==', tutorId)
                .where('startISO', '<', endTime.toDate().toISOString());
            
            const [potentialBookingsSnapshot, potentialTimeOffSnapshot] = await Promise.all([
                transaction.get(potentialBookingConflictsQuery),
                transaction.get(potentialTimeOffConflictsQuery)
            ]);

            const bookingConflict = potentialBookingsSnapshot.docs.some((doc: any) => {
                const booking = doc.data() as Booking;
                return (booking.endTime as AdminTimestamp).toDate() > startTime!.toDate();
            });

            if (bookingConflict) throw new Error('slot_already_booked');
            
            const timeOffConflict = potentialTimeOffSnapshot.docs.some((doc: any) => {
                const block = doc.data();
                return new Date(block.endISO) > startTime!.toDate();
            });

            if (timeOffConflict) throw new Error('tutor_unavailable');
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
            const userRef = adminDb!.collection('users').doc(payload.userId);
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
