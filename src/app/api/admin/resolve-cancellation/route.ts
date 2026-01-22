
// File: src/app/api/admin/resolve-cancellation/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { initAdmin, adminDb } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import type { Booking, UserCredit } from '@/lib/types';
import { FieldValue, Transaction, Timestamp } from 'firebase-admin/firestore';

initAdmin();
const auth = getAuth();

const ResolveCancellationSchema = z.object({
  bookingId: z.string().min(1, "bookingId is required."),
  approved: z.boolean(),
});

const lessonTypeCreditMap: Record<string, string> = {
  'Quick Practice': 'quick-practice-bundle',
  'Comprehensive Lesson': 'learning-intensive',
  'Quick Group Conversation': 'quick-group-conversation',
  'Immersive Conversation Practice': 'immersive-conversation-practice',
};

async function handleCreditIssuance(transaction: Transaction, booking: Booking) {
  const userRef = adminDb.collection('users').doc(booking.userId);
  const userDoc = await transaction.get(userRef);

  if (!userDoc.exists) {
    throw new Error(`User with ID ${booking.userId} not found.`);
  }
  
  const userData = userDoc.data()!;
  const lessonType = booking.lessonType || '';
  const creditTypeToGrant = lessonTypeCreditMap[lessonType] || (booking.duration === 30 ? 'starter-bundle' : 'foundation-pack');

  if (!creditTypeToGrant) {
    throw new Error(`No valid credit type mapping found for lesson: "${lessonType}"`);
  }

  const currentCredits: UserCredit[] = userData.credits || [];
  const existingCreditIndex = currentCredits.findIndex(c => c.lessonType === creditTypeToGrant);

  let newCredits: UserCredit[];
  if (existingCreditIndex > -1) {
    newCredits = currentCredits.map((c, index) => 
        index === existingCreditIndex ? { ...c, count: c.count + 1 } : c
    );
  } else {
    newCredits = [...currentCredits, { lessonType: creditTypeToGrant, count: 1, purchasedAt: Timestamp.now() }];
  }

  transaction.update(userRef, { credits: newCredits });
}

export async function POST(request: NextRequest) {
  try {
    const idToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await auth.verifyIdToken(idToken);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();

    if (userDoc.data()?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validation = ResolveCancellationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { bookingId, approved } = validation.data;
    const bookingRef = adminDb.collection('bookings').doc(bookingId);

    await adminDb.runTransaction(async (transaction) => {
      const bookingDoc = await transaction.get(bookingRef);
      if (!bookingDoc.exists) {
        throw new Error('Booking not found.');
      }
      const booking = bookingDoc.data() as Booking;

      if (booking.status !== 'cancellation-requested') {
        throw new Error('This booking is not pending a cancellation request.');
      }

      if (approved) {
        if (booking.requestedResolution === 'credit') {
          await handleCreditIssuance(transaction, booking);
          transaction.update(bookingRef, { status: 'credit-issued' });
        } else if (booking.requestedResolution === 'refund') {
          transaction.update(bookingRef, { status: 'refunded' });
        }
      } else {
        // If denied, revert to original status (e.g., 'confirmed')
        transaction.update(bookingRef, { 
          status: 'confirmed',
          statusHistory: FieldValue.arrayUnion({
            status: 'confirmed',
            changedAt: FieldValue.serverTimestamp(),
            changedBy: 'admin',
            reason: 'Cancellation request denied.',
          }),
        });
      }
    });

    return NextResponse.json({ success: true, message: `Request has been ${approved ? 'approved' : 'denied'}.` });

  } catch (error: any) {
    console.error('API Error (/admin/resolve-cancellation):', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process the request.' }, { status: 500 });
  }
}
