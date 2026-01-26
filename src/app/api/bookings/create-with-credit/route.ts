// File: src/app/api/bookings/create-with-credit/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { adminDb, adminAuth, Timestamp, FieldValue } from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { z } from 'zod';
import { products, isValidProductId } from '@/config/products';
import { addMinutes, parse } from 'date-fns';
import type { UserCredit } from '@/lib/types';
import { creditToLessonMap } from '@/config/creditMapping';

// Zod schema for input validation
const CreateWithCreditSchema = z.object({
  creditType: z.string().refine(isValidProductId, { message: 'Invalid credit type.' }),
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

type CreateWithCreditPayload = z.infer<typeof CreateWithCreditSchema>;

async function _createBookingWithCredit(payload: CreateWithCreditPayload, decodedToken: DecodedIdToken) {
    if (!adminDb) throw new Error("Database service not available.");

    if (decodedToken.uid !== payload.userId) {
        throw new Error('unauthorized');
    }
    
    const lessonProductId = creditToLessonMap[payload.creditType];
    if (!lessonProductId || !isValidProductId(lessonProductId)) {
        throw new Error('invalid_credit_mapping');
    }
    const lessonDetails = products[lessonProductId];

    const startDateTime = parse(`${payload.date} ${payload.time}`, 'yyyy-MM-dd HH:mm', new Date());
    const startTime = Timestamp.fromDate(startDateTime);
    const endTime = Timestamp.fromDate(addMinutes(startDateTime, lessonDetails.duration as number));
    const userRef = adminDb.collection('users').doc(payload.userId);
    
    return await adminDb.runTransaction(async (transaction) => {
        // --- 1. Verify Credit Balance & Time Slot Availability ---
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) throw new Error('user_not_found');
        
        const userData = userDoc.data()!;
        const currentCredits: UserCredit[] = userData.credits || [];
        const creditIndex = currentCredits.findIndex(c => c.lessonType === payload.creditType);

        if (creditIndex === -1 || currentCredits[creditIndex].count <= 0) {
            throw new Error('insufficient_credits');
        }

        const bookingsRef = adminDb!.collection('bookings');
        const conflictQuery = bookingsRef
            .where('tutorId', '==', 'MahderNegashMamo')
            .where('status', 'in', ['confirmed', 'awaiting-payment', 'payment-pending-confirmation'])
            .where('startTime', '<', endTime)
            .where('endTime', '>', startTime);
        
        const conflictingBookings = await transaction.get(conflictQuery);
        if (!conflictingBookings.empty) {
            throw new Error('slot_already_booked');
        }
        
        const parentPackageId = currentCredits[creditIndex].packageBookingId;

        // --- 2. Deduct Credit ---
        currentCredits[creditIndex].count -= 1;
        const newCredits = currentCredits.filter(c => c.count > 0);
        transaction.update(userRef, { credits: newCredits });

        // --- 3. Create Booking Document ---
        const newBookingRef = adminDb!.collection('bookings').doc();
        const productDetails = products[payload.creditType as keyof typeof products];
        const newBookingDoc = {
            userId: payload.userId,
            userName: decodedToken.name || 'User',
            userEmail: decodedToken.email || 'No Email',
            date: payload.date,
            time: payload.time,
            startTime: startTime,
            endTime: endTime,
            duration: lessonDetails.duration,
            lessonType: lessonDetails.label,
            price: 0, // Booked with credit
            productId: lessonProductId,
            tutorId: "MahderNegashMamo",
            tutorName: "Mahder N. Mamo",
            status: 'payment-pending-confirmation', // FIX: Use a pending status
            wasRedeemedWithCredit: true,
            creditTypeUsed: payload.creditType,
            parentPackageId: parentPackageId || null, // Add the link to the parent package
            createdAt: FieldValue.serverTimestamp(),
            statusHistory: [{
                status: 'payment-pending-confirmation',
                changedAt: Timestamp.now(),
                changedBy: 'system',
                reason: `Booked via reschedule, using one credit from '${productDetails.label}'.`,
            }],
            ...(payload.notes && { paymentNote: payload.notes }),
        };
        transaction.set(newBookingRef, newBookingDoc);

        return { bookingId: newBookingRef.id };
    });
}


export async function POST(request: NextRequest) {
  try {
    if (!adminAuth) throw new Error("Authentication service is not available.");

    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, message: 'No authentication token provided.' }, { status: 401 });
    }
    const decodedToken: DecodedIdToken = await adminAuth.verifyIdToken(idToken);
    
    const body = await request.json();
    const validationResult = CreateWithCreditSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', details: validationResult.error.flatten() }, { status: 400 });
    }
    
    const result = await _createBookingWithCredit(validationResult.data, decodedToken);

    return NextResponse.json({ 
        success: true, 
        bookingId: result.bookingId,
        redirectUrl: `/profile` // Redirect back to dashboard after reschedule
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in create-with-credit API route:', error);
    let message = 'An internal server error occurred.';
    let status = 500;
    if (error.message === 'unauthorized') {
        message = 'Unauthorized action.';
        status = 403;
    }
    if (error.message === 'slot_already_booked') {
        message = 'This time slot has just been booked. Please select another.';
        status = 409;
    }
    if (error.message === 'insufficient_credits') {
        message = 'You do not have enough credits for this lesson type.';
        status = 400;
    }
    if (error.message === 'user_not_found') {
        message = 'User profile not found.';
        status = 404;
    }
    if (error.message === 'invalid_credit_mapping') {
        message = 'This credit type cannot be used for this lesson.';
        status = 400;
    }
    
    return NextResponse.json({ success: false, message }, { status });
  }
}
