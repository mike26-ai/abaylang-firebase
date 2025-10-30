
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

                // FIX: Replace FieldValue.serverTimestamp() with Timestamp.now()
                const newCreditObject = { 
                    lessonType: creditType, 
                    count: creditsToAdd, 
                    purchasedAt: Timestamp.now(), // Use Timestamp.now()
                    packageBookingId: newBookingRef.id // Link credits to this booking
                };
                
                if (existingCreditIndex > -1) {
                    newCredits = currentCredits.map((c: any, index: number) => 
                        index === existingCreditIndex ? { ...c, count: c.count + creditsToAdd, purchasedAt: Timestamp.now(), packageBookingId: newBookingRef.id } : c
                    );
                } else {
                    newCredits = [...currentCredits, newCreditObject];
                }
                transaction.update(userRef, { credits: newCredits, lastCreditPurchase: Timestamp.now() });
            }
        }
        
        let initialStatus: 'confirmed' | 'payment-pending-confirmation' | 'completed' = 'payment-pending-confirmation';
        if (product.type === 'package') {
            initialStatus = 'completed';
        } else if (product.price === 0) {
            initialStatus = 'confirmed';
        }

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
            status: initialStatus,
            createdAt: Timestamp.now(), // Use Timestamp.now() for consistency
            statusHistory: [{
                status: initialStatus,
                changedAt: Timestamp.now(),
                changedBy: 'system_booking',
                reason: 'Booking created.',
            }],
            ...(payload.paymentNote && { paymentNote: payload.paymentNote }),
        };

        transaction.set(newBookingRef, newBookingDoc);
    });

    // Determine redirect URL based on payment type
    const isFreeTrial = product.price === 0;

    if (isFreeTrial) {
        // Redirect free trials to the dashboard directly
        return { 
            bookingId: newBookingRef.id, 
            redirectUrl: `/profile?booking_id=${newBookingRef.id}&new_booking=true&type=free_trial` 
        };
    }
    
    // For paid lessons (including packages), redirect to the dashboard to show the confirmation popup
    return { 
        bookingId: newBookingRef.id, 
        redirectUrl: `/profile?booking_id=${newBookingRef.id}&new_booking=true&type=paid` 
    };
}
