
// File: src/app/api/bookings/service.ts
/**
 * This file contains the core, testable business logic for the bookings endpoints.
 * It now uses the server-side product catalog as the single source of truth.
 */
import { getFirestore, Timestamp, FieldValue, Transaction } from 'firebase-admin/firestore';
import { addMinutes, parse } from 'date-fns';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { products, type ProductId } from '@/config/products'; // Import the server-side catalog

const db = getFirestore();

interface BookingPayload {
  productId: ProductId;
  userId: string;
  date?: string;
  time?: string;
  paymentNote?: string;
}

export async function _createBooking(payload: BookingPayload, decodedToken: DecodedIdToken) {
    if (decodedToken.uid !== payload.userId) {
        throw new Error('unauthorized');
    }

    const product = products[payload.productId];
    if (!product) {
        throw new Error('Invalid product ID provided.');
    }

    const isPaidLesson = product.price > 0;
    const newBookingRef = db.collection('bookings').doc();

    const isTimeRequired = product.type === 'individual' || product.type === 'group';

    const startTime = (isTimeRequired && payload.date && payload.time) 
        ? Timestamp.fromDate(parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date())) 
        : null;

    const endTime = startTime && typeof product.duration === 'number'
        ? Timestamp.fromDate(addMinutes(startTime.toDate(), product.duration))
        : null;

    if (isTimeRequired && (!startTime || !endTime)) {
        throw new Error('A date and time are required for this lesson type.');
    }

    await db.runTransaction(async (transaction: Transaction) => {
        // --- CONFLICT CHECK: Only run for time-based bookings ---
        if (isTimeRequired && startTime && endTime) {
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
            const tutorId = "MahderNegashMamo";

            // CORRECTED QUERY: Query for time overlap first, then filter status in code.
            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', tutorId)
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

            const conflictingStatuses = ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'];
            const hasBookingConflict = conflictingBookingsSnapshot.docs.some(doc => conflictingStatuses.includes(doc.data().status));

            if (hasBookingConflict) throw new Error('slot_already_booked');
            if (!conflictingTimeOff.empty) throw new Error('tutor_unavailable');
        }

        // Create the booking document
        const newBookingDoc = {
            userId: payload.userId,
            userName: decodedToken.name || 'User',
            userEmail: decodedToken.email || 'No Email',
            date: payload.date || 'N/A_PACKAGE',
            time: payload.time || 'N/A_PACKAGE',
            startTime: startTime,
            endTime: endTime,
            duration: typeof product.duration === 'number' ? product.duration : null,
            lessonType: product.label,
            price: product.price,
            productId: payload.productId, // Store the product ID for the webhook
            productType: product.type, // Store the product type for the webhook
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: 'awaiting-payment', // All bookings start this way
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [{
                status: 'awaiting-payment',
                changedAt: Timestamp.now(),
                changedBy: 'system',
                reason: 'Booking or package purchase initiated.',
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
    });

    const isFreeTrial = product.price === 0;

    // For free trials, redirect directly to the success page.
    if (isFreeTrial) {
        return { 
            bookingId: newBookingRef.id, 
            redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&free_trial=true` 
        };
    }
    
    // For paid lessons, prepare the Paddle checkout URL.
    const customData = {
        booking_id: newBookingRef.id,
        user_id: payload.userId,
        product_id: payload.productId,
        product_type: product.type,
    };

    const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${product.paddlePriceId}?email=${encodeURIComponent(decodedToken.email || '')}&passthrough=${encodeURIComponent(JSON.stringify(customData))}`;

    return { bookingId: newBookingRef.id, redirectUrl: checkoutUrl };
}
