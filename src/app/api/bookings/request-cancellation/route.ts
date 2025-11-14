
// File: src/app/api/bookings/request-cancellation/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin, adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { differenceInHours, parse } from 'date-fns';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { creditToLessonMap } from '@/config/creditMapping';
import type { Booking } from '@/lib/types';


initAdmin();
const auth = getAuth();

const RequestCancellationSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required."),
  resolutionChoice: z.enum(['refund', 'credit', 'reschedule']),
  reason: z.string().min(1, "A reason is required."),
});

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);

    const body = await request.json();
    const validation = RequestCancellationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { bookingId, resolutionChoice, reason } = validation.data;
    const bookingRef = adminDb.collection('bookings').doc(bookingId);
    
    const bookingDoc = await bookingRef.get();
    if (!bookingDoc.exists) {
      return NextResponse.json({ success: false, error: 'Booking not found.' }, { status: 404 });
    }

    const booking = bookingDoc.data()! as Booking;

    // Security Check: Ensure the user owns this booking
    if (booking.userId !== decodedToken.uid) {
      return NextResponse.json({ success: false, error: 'Forbidden: You can only cancel your own bookings.' }, { status: 403 });
    }

    // --- FIX: Relax the status check ---
    // Allow cancellation if the lesson is confirmed OR awaiting payment.
    const allowedStatuses = ['confirmed', 'payment-pending-confirmation'];
    if (!allowedStatuses.includes(booking.status)) {
        return NextResponse.json({ success: false, error: `This lesson cannot be rescheduled as its status is '${booking.status}'.`}, { status: 400});
    }

    // Server-Side Eligibility Check
    if (booking.date === 'N/A_PACKAGE' || !booking.time) {
        return NextResponse.json({ success: false, error: 'This booking type cannot be cancelled.' }, { status: 400 });
    }
    const lessonDateTime = parse(`${booking.date} ${booking.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const hours = booking.groupSessionId ? 3 : 12;
    if (differenceInHours(lessonDateTime, new Date()) < hours) {
        return NextResponse.json({ success: false, error: `Cancellation is not allowed within ${hours} hours of the lesson.` }, { status: 400 });
    }
    
    let newStatus: 'cancellation-requested' | 'cancelled' = 'cancellation-requested';
    if (resolutionChoice === 'reschedule') {
        newStatus = 'cancelled';
    }

    // Use a transaction to ensure atomicity for rescheduling
    if (resolutionChoice === 'reschedule') {
        const userRef = adminDb.collection('users').doc(booking.userId);
        let issuedCredit = null;

        await adminDb.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("User not found for credit issuance.");
            
            const userData = userDoc.data()!;
            const creditType = Object.keys(creditToLessonMap).find(key => creditToLessonMap[key] === booking.productId) || booking.productId;
            
            if (!creditType) {
              throw new Error("Could not determine credit type for rescheduled lesson.");
            }

            const newCredit = {
                lessonType: creditType,
                count: 1,
                purchasedAt: booking.createdAt,
                packageBookingId: bookingId,
            };
            
            // This is what will be returned to the client
            issuedCredit = newCredit;

            transaction.update(userRef, {
                credits: FieldValue.arrayUnion(newCredit)
            });

            transaction.update(bookingRef, {
                status: newStatus,
                statusHistory: FieldValue.arrayUnion({
                  status: newStatus,
                  changedAt: Timestamp.now(),
                  changedBy: 'student',
                  reason: `Lesson cancelled for reschedule. Credit issued. Original reason: ${reason}`,
                }),
              });
        });

        return NextResponse.json({ 
            success: true, 
            message: `Lesson cancelled. A credit has been issued for you to reschedule.`,
            credit: issuedCredit, // Return the issued credit
        });

    } else {
        // For standard refund/credit requests that need admin approval
        await bookingRef.update({
            status: newStatus,
            requestedResolution: resolutionChoice,
            cancellationReason: reason,
            statusHistory: FieldValue.arrayUnion({
              status: newStatus,
              changedAt: Timestamp.now(),
              changedBy: 'student',
              reason: `Requested ${resolutionChoice}. Reason: ${reason}`,
            }),
          });

        return NextResponse.json({ success: true, message: `Request to ${resolutionChoice} has been submitted.` });
    }


  } catch (error: any) {
    console.error('API Error (/bookings/request-cancellation):', error);
    if (error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
