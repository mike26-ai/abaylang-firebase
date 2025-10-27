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
    // Look up the product details from the authoritative server-side catalog.
    const product = products[payload.productId];
    if (!product) {
        throw new Error('Invalid product ID provided.');
    }

    const isPackage = product.type === 'package';
    const isTimeSpecific = payload.date && payload.time && !isPackage;

    let startTime: Timestamp | null = null;
    let endTime: Timestamp | null = null;
  
    if (isTimeSpecific) {
        // Use the SERVER-AUTHORITATIVE duration for calculations.
        const duration = product.duration as number;
        const startDateTime = parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date());
        
        if (isNaN(startDateTime.getTime())) {
            throw new Error('Invalid date or time format provided.');
        }

        startTime = Timestamp.fromDate(startDateTime);
        endTime = Timestamp.fromDate(addMinutes(startDateTime, duration));
    }

    return await db.runTransaction(async (transaction: Transaction) => {
        if (isTimeSpecific && startTime && endTime) {
            const bookingsRef = db.collection('bookings');
            const timeOffRef = db.collection('timeOff');
            const groupSessionsRef = db.collection('groupSessions');

            const tutorId = "MahderNegashMamo";

            // Run all conflict checks using the SERVER-AUTHORITATIVE start and end times.
            const bookingConflictQuery = bookingsRef
                .where('tutorId', '==', tutorId)
                .where('status', 'in', ['confirmed', 'awaiting-payment'])
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
                
            const groupSessionConflictQuery = groupSessionsRef
                .where('tutorId', '==', tutorId)
                .where('status', '==', 'scheduled')
                .where('startTime', '<', endTime)
                .where('endTime', '>', startTime);
            
            const timeOffDayQuery = timeOffRef
                .where('tutorId', '==', tutorId)
                .where('startISO', '>=', startTime.toDate().toISOString().split('T')[0]);

            const [
                conflictingBookings,
                conflictingGroupSessions,
                timeOffSnapshot
            ] = await Promise.all([
                transaction.get(bookingConflictQuery),
                transaction.get(groupSessionConflictQuery),
                transaction.get(timeOffDayQuery)
            ]);

            if (!conflictingBookings.empty) throw new Error('slot_already_booked');
            if (!conflictingGroupSessions.empty) throw new Error('slot_already_booked');
            
            const startMillis = startTime.toMillis();
            const endMillis = endTime.toMillis();
            for (const doc of timeOffSnapshot.docs) {
                const block = doc.data();
                if (startMillis < new Date(block.endISO).getTime() && endMillis > new Date(block.startISO).getTime()) {
                    throw new Error('tutor_unavailable');
                }
            }
        }

        // All checks passed, create the new booking document
        const newBookingRef = db.collection('bookings').doc();
        
        // Use authoritative product details for the new booking document
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
            productId: payload.productId, // Store the product ID for reference
            tutorId: "MahderNegashMamo",
            status: product.price === 0 ? 'confirmed' : 'awaiting-payment',
            createdAt: FieldValue.serverTimestamp(),
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
        return { bookingId: newBookingRef.id };
    });
}
