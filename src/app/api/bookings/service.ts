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

    const isFreeTrial = product.price === 0;
    const newBookingRef = db.collection('bookings').doc();
    const startTime = (payload.date && payload.time) ? Timestamp.fromDate(parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date())) : null;
    const endTime = startTime && product.duration ? Timestamp.fromDate(addMinutes(startTime.toDate(), product.duration as number)) : null;

    if (product.type !== 'package' && (!startTime || !endTime)) {
        throw new Error('A date and time are required for this lesson type.');
    }

    await db.runTransaction(async (transaction: Transaction) => {
        if (startTime && endTime) {
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
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

            const [conflictingBookings, conflictingTimeOff] = await Promise.all([
                transaction.get(bookingConflictQuery),
                transaction.get(timeOffConflictQuery)
            ]);

            if (!conflictingBookings.empty) throw new Error('slot_already_booked');
            if (!conflictingTimeOff.empty) throw new Error('tutor_unavailable');
        }

        const newBookingDoc = {
            userId: payload.userId,
            userName: decodedToken.name || 'User',
            userEmail: decodedToken.email || 'No Email',
            date: payload.date || 'N/A_PACKAGE',
            time: payload.time || 'N/A_PACKAGE',
            startTime: startTime,
            endTime: endTime,
            duration: product.duration,
            lessonType: product.label,
            price: product.price,
            productId: payload.productId,
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: isFreeTrial ? 'confirmed' : 'awaiting-payment',
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [{
                status: isFreeTrial ? 'confirmed' : 'awaiting-payment',
                changedAt: Timestamp.now(),
                changedBy: 'system',
                reason: 'Booking or package purchase initiated.'
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
    });

    if (isFreeTrial) {
        return { bookingId: newBookingRef.id, redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&free_trial=true` };
    }

    const { paddlePriceId } = product;
    if (!paddlePriceId || paddlePriceId.includes('YOUR_')) {
        throw new Error("Payment for this product is not configured.");
    }
    
    // Consistent passthrough data for all transactions
    const passthroughData = { 
        booking_id: newBookingRef.id,
        user_id: payload.userId,
        product_id: payload.productId,
        product_type: product.type
    };
    
    // Revert to direct redirect to Hosted Checkout
    const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${paddlePriceId}?email=${encodeURIComponent(decodedToken.email || "")}&passthrough=${encodeURIComponent(JSON.stringify(passthroughData))}`;

    return { bookingId: newBookingRef.id, redirectUrl: checkoutUrl };
}
