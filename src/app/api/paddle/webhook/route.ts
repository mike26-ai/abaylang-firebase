
// File: src/app/api/paddle/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { Paddle, EventName, type TransactionCompletedEvent } from '@paddle/paddle-node-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';

interface PaddleCustomData {
    booking_id?: string;
    // NEW: Add fields for package purchases
    user_id?: string;
    package_type?: string; // e.g., 'quick-practice-bundle'
    credits_to_add?: string; // Send as string to be safe
}

const paddleApiKey = process.env.PADDLE_API_KEY;
if (!paddleApiKey) {
    console.error('CRITICAL: PADDLE_API_KEY is not set in environment variables.');
}
const paddle = new Paddle(paddleApiKey || '');


async function handleSingleLessonConfirmation(bookingId: string, transactionId: string) {
    console.log(`Updating booking ${bookingId} to 'confirmed'.`);
    const bookingDocRef = adminDb.collection('bookings').doc(bookingId);
    
    await bookingDocRef.update({
        status: 'confirmed',
        statusHistory: FieldValue.arrayUnion({
            status: 'confirmed',
            changedAt: FieldValue.serverTimestamp(),
            changedBy: 'paddle_webhook',
            reason: `Payment confirmed via Paddle transaction ID: ${transactionId}`
        })
    });
    console.log(`Booking ${bookingId} successfully confirmed.`);
}

async function handlePackageCreditAllocation(userId: string, packageType: string, creditsToAdd: number) {
    console.log(`Allocating ${creditsToAdd} credits of type ${packageType} to user ${userId}.`);
    const userDocRef = adminDb.collection('users').doc(userId);

    await adminDb.runTransaction(async (transaction: Transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) {
            console.error(`User with ID ${userId} not found. Cannot allocate credits.`);
            throw new Error(`User not found for credit allocation.`);
        }

        const userData = userDoc.data();
        const currentCredits = userData?.credits || [];
        
        const existingCreditIndex = currentCredits.findIndex((c: any) => c.lessonType === packageType);
        
        let newCredits = [];
        if (existingCreditIndex > -1) {
            // User already has this type of credit, so increment the count
            newCredits = currentCredits.map((c: any, index: number) => 
                index === existingCreditIndex ? { ...c, count: c.count + creditsToAdd } : c
            );
        } else {
            // User does not have this type of credit, so add it
            newCredits = [...currentCredits, { lessonType: packageType, count: creditsToAdd }];
        }

        transaction.update(userDocRef, {
            credits: newCredits,
            lastCreditPurchase: FieldValue.serverTimestamp(),
        });
    });
    
    console.log(`Successfully allocated credits to user ${userId}.`);
}


export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Paddle webhook secret is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }
  
  if (!rawRequestBody) {
    console.warn('Received an empty request body for Paddle webhook. Aborting.');
    return NextResponse.json({ error: 'Empty request body.' }, { status: 400 });
  }

  try {
    const event = paddle.webhooks.unmarshal(rawRequestBody, signature, webhookSecret);
    console.log(`Received Paddle event: ${event?.eventType}`);

    if (event?.eventType === 'transaction.completed') {
      const transaction = event.data as TransactionCompletedEvent['data'];
      const customData = transaction.customData as PaddleCustomData | null;
      
      const bookingId = customData?.booking_id;
      const userId = customData?.user_id;
      const packageType = customData?.package_type;
      const creditsToAddStr = customData?.credits_to_add;

      // --- NEW LOGIC: Differentiate between a single booking and a package purchase ---
      if (bookingId) {
        // This is a single lesson or group session booking
        await handleSingleLessonConfirmation(bookingId, transaction.id);

      } else if (userId && packageType && creditsToAddStr) {
        // This is a package purchase
        const creditsToAdd = parseInt(creditsToAddStr, 10);
        if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
            console.error(`Invalid credits_to_add value received: ${creditsToAddStr}`);
            return NextResponse.json({ received: true, message: "Acknowledged, but invalid credits_to_add." });
        }
        await handlePackageCreditAllocation(userId, packageType, creditsToAdd);

      } else {
        console.warn('Received transaction.completed event with insufficient customData.', JSON.stringify(transaction, null, 2));
        return NextResponse.json({ received: true, message: "Acknowledged, but insufficient data." });
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed or an error occurred.' }, { status: 400 });
  }
}
