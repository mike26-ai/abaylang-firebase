
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
  groupSessionId?: string;
}

export async function _createBooking(payload: BookingPayload, decodedToken: DecodedIdToken) {
    if (decodedToken.uid !== payload.userId) {
        throw new Error('unauthorized');
    }

    // --- SINGLE SOURCE OF TRUTH ---
    const product = products[payload.productId];
    if (!product) {
        throw new Error('Invalid product ID provided.');
    }

    const isPackage = product.type === 'package';
    const isTimeSpecific = !isPackage && (payload.date && payload.time);
    
    // --- PATH 1: PACKAGE PURCHASE ---
    if (isPackage) {
        const { paddlePriceId } = product;
        if (!paddlePriceId || paddlePriceId.includes('YOUR_')) {
            throw new Error("Payment for this package is not configured.");
        }

        const customData: Record<string, string> = {
            user_id: payload.userId,
            package_id: payload.productId,
        };
        
        const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${paddlePriceId}?email=${encodeURIComponent(decodedToken.email || "")}&passthrough=${encodeURIComponent(JSON.stringify(customData))}`;
        
        // For packages, we ONLY return a redirect URL. No booking document is created.
        return { bookingId: null, redirectUrl: checkoutUrl };
    }

    // --- PATH 2: TIME-SPECIFIC LESSON BOOKING ---
    if (!isTimeSpecific) {
        throw new Error('A date and time are required for this lesson type.');
    }

    const duration = product.duration as number;
    const startDateTime = parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (isNaN(startDateTime.getTime())) {
        throw new Error('Invalid date or time format provided.');
    }

    const startTime = Timestamp.fromDate(startDateTime);
    const endTime = Timestamp.fromDate(addMinutes(startDateTime, duration));

    const newBookingRef = db.collection('bookings').doc();

    await db.runTransaction(async (transaction: Transaction) => {
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

        const newBookingDoc = {
            userId: payload.userId,
            userName: decodedToken.name || 'User',
            userEmail: decodedToken.email || 'No Email',
            date: payload.date,
            time: payload.time,
            startTime: startTime,
            endTime: endTime,
            duration: duration,
            lessonType: product.label,
            price: product.price,
            productId: payload.productId,
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: product.price === 0 ? 'confirmed' : 'awaiting-payment',
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [{
                status: product.price === 0 ? 'confirmed' : 'awaiting-payment',
                changedAt: Timestamp.now(),
                changedBy: 'system',
                reason: 'Booking created.'
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
    });

    if (product.price > 0) {
        const { paddlePriceId } = product;
        if (!paddlePriceId || paddlePriceId.includes('YOUR_')) {
            throw new Error("Payment for this product is not configured.");
        }
        
        const customData = { booking_id: newBookingRef.id };
        const checkoutUrl = `https://sandbox-billing.paddle.com/checkout/buy/${paddlePriceId}?email=${encodeURIComponent(decodedToken.email || "")}&passthrough=${encodeURIComponent(JSON.stringify(customData))}`;
        
        return { bookingId: newBookingRef.id, redirectUrl: checkoutUrl };
    }

    // For free trials, return a success redirect.
    return { bookingId: newBookingRef.id, redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&free_trial=true` };
}
