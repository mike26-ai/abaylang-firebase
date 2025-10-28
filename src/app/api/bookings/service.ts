
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
    
    // This transaction now also handles the simulated credit allocation for packages.
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

        // --- SIMULATED CREDIT ALLOCATION (for packages during testing) ---
        if (product.type === 'package' && product.totalLessons) {
            const userRef = db.collection('users').doc(payload.userId);
            const userDoc = await transaction.get(userRef);
            if(userDoc.exists) {
                const userData = userDoc.data()!;
                const currentCredits = userData.credits || [];
                const creditType = payload.productId;
                const creditsToAdd = product.totalLessons;
                
                const existingCreditIndex = currentCredits.findIndex((c: any) => c.lessonType === creditType);
                let newCredits = [];
                if (existingCreditIndex > -1) {
                    newCredits = currentCredits.map((c: any, index: number) => 
                        index === existingCreditIndex ? { ...c, count: c.count + creditsToAdd } : c
                    );
                } else {
                    newCredits = [...currentCredits, { lessonType: creditType, count: creditsToAdd }];
                }
                transaction.update(userRef, { credits: newCredits, lastCreditPurchase: FieldValue.serverTimestamp() });
            }
        }
        
        // --- STATUS SIMULATION ---
        // For testing, all paid items are immediately 'confirmed' or 'completed'
        // This bypasses the need for the webhook during development.
        let simulatedStatus: 'confirmed' | 'completed' = 'confirmed';
        if (product.type === 'package') {
            simulatedStatus = 'completed'; // Package purchases are marked completed.
        } else if (product.price === 0) {
            simulatedStatus = 'confirmed'; // Free trials are confirmed.
        } else {
             simulatedStatus = 'confirmed'; // All other paid lessons are simulated as confirmed.
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
            productId: payload.productId,
            productType: product.type,
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: simulatedStatus, // USE THE SIMULATED STATUS
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [{
                status: simulatedStatus,
                changedAt: Timestamp.now(),
                changedBy: 'system_simulation',
                reason: 'Booking confirmed via dev simulation.',
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
    });

    const isFreeTrial = product.price === 0;

    // **THE FIX**: ALWAYS redirect to the internal success page during simulation.
    // For free trials, use the `free_trial` flag.
    if (isFreeTrial) {
        return { 
            bookingId: newBookingRef.id, 
            redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&free_trial=true` 
        };
    }
    
    // For ALL other "paid" lessons, use the `simulated_payment` flag.
    return { 
        bookingId: newBookingRef.id, 
        redirectUrl: `/bookings/success?booking_id=${newBookingRef.id}&simulated_payment=true` 
    };
}
