
// File: src/app/api/paddle/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { Paddle, type TransactionCompletedEvent } from '@paddle/paddle-node-sdk';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import type { Transaction } from 'firebase-admin/firestore';
import { products, type ProductId } from '@/config/products';

interface PaddleCustomData {
    booking_id: string; // This is now mandatory for all transactions
    user_id: string;
    product_id: ProductId;
    product_type: 'individual' | 'group' | 'private-group' | 'package';
}

const paddleApiKey = process.env.PADDLE_API_KEY;
if (!paddleApiKey) {
    console.error('CRITICAL: PADDLE_API_KEY is not set in environment variables.');
}
const paddle = new Paddle(paddleApiKey || '');


async function handleTransactionConfirmation(transactionId: string, customData: PaddleCustomData) {
    const db = adminDb;
    if (!db) {
      console.error("Webhook Error: Firebase Admin SDK not initialized.");
      return;
    }

    const { booking_id, user_id, product_id, product_type } = customData;
    console.log(`Webhook: Processing transaction ${transactionId} for booking ${booking_id} of type ${product_type}`);

    const bookingDocRef = db.collection('bookings').doc(booking_id);
    const userDocRef = db.collection('users').doc(user_id);

    await db.runTransaction(async (transaction: Transaction) => {
        const bookingDoc = await transaction.get(bookingDocRef);
        if (!bookingDoc.exists) {
            console.error(`Webhook Error: Booking with ID ${booking_id} not found.`);
            // Don't throw, just log and exit. The transaction might be for something else.
            return;
        }

        // --- Step 1: Handle credit allocation if it's a package ---
        if (product_type === 'package') {
            const product = products[product_id];
            if (!product || product.type !== 'package' || !product.totalLessons) {
                console.error(`Webhook Error: Invalid package_id '${product_id}' received.`);
                return; // Exit transaction
            }
            
            const creditsToAdd = product.totalLessons;
            const creditType = product_id; // e.g., 'learning-intensive'

            const userDoc = await transaction.get(userDocRef);
            if (!userDoc.exists) {
                console.error(`Webhook Error: User with ID ${user_id} not found. Cannot allocate credits.`);
                return; // Exit transaction
            }

            const userData = userDoc.data();
            const currentCredits = userData?.credits || [];
            const existingCreditIndex = currentCredits.findIndex((c: any) => c.lessonType === creditType);
            
            let newCredits = [];
            if (existingCreditIndex > -1) {
                newCredits = currentCredits.map((c: any, index: number) => 
                    index === existingCreditIndex ? { ...c, count: c.count + creditsToAdd } : c
                );
            } else {
                newCredits = [...currentCredits, { lessonType: creditType, count: creditsToAdd }];
            }

            transaction.update(userDocRef, {
                credits: newCredits,
                lastCreditPurchase: FieldValue.serverTimestamp(),
            });
            console.log(`Webhook: Successfully allocated ${creditsToAdd} credits of type '${creditType}' to user ${user_id}.`);
        }

        // --- Step 2: Update the booking document status ---
        // For packages, this marks the purchase as 'completed'.
        // For single lessons, this marks the lesson as 'confirmed'.
        const finalStatus = product_type === 'package' ? 'completed' : 'confirmed';
        
        transaction.update(bookingDocRef, {
            status: finalStatus,
            paddleTransactionId: transactionId,
            statusHistory: FieldValue.arrayUnion({
                status: finalStatus,
                changedAt: FieldValue.serverTimestamp(),
                changedBy: 'paddle_webhook',
                reason: `Payment confirmed for ${product_type} via Paddle transaction ID: ${transactionId}`
            })
        });
        console.log(`Webhook: Booking ${booking_id} status updated to '${finalStatus}'.`);
    });
}


export async function POST(request: NextRequest) {
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Webhook secret not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }
  
  if (!rawRequestBody) {
    return NextResponse.json({ error: 'Empty request body.' }, { status: 400 });
  }

  try {
    const event = paddle.webhooks.unmarshal(rawRequestBody, signature, webhookSecret);
    console.log(`Received Paddle event: ${event?.eventType}`);

    if (event?.eventType === 'transaction.completed') {
      const transaction = event.data;
      const customData = transaction.customData as PaddleCustomData | null;
      
      if (customData && customData.booking_id && customData.user_id && customData.product_id) {
        await handleTransactionConfirmation(transaction.id, customData);
      } else {
        console.warn('Webhook: Received transaction.completed event with incomplete customData.', customData);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed or an error occurred.' }, { status: 400 });
  }
}
