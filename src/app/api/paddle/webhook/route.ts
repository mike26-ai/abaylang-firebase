// File: src/app/api/paddle/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
<<<<<<< HEAD
import { Paddle } from '@paddle/paddle-node-sdk';
import { initAdmin } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

// Initialize Paddle SDK and Firebase Admin
const paddle = new Paddle(process.env.PADDLE_API_KEY);
initAdmin();
const db = getFirestore();

/**
 * This is the API route that handles incoming webhook notifications from Paddle.
 * It's responsible for verifying the authenticity of the request and updating
 * the application's database based on the event type.
 */
export async function POST(request: NextRequest) {
  // 1. Verify the webhook signature to ensure the request is genuinely from Paddle.
  // We need the raw request body for the signature verification process.
=======
import { Paddle, type TransactionCompletedEvent } from '@paddle/paddle-node-sdk';
import { initAdmin, adminDb } from '@/lib/firebase-admin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';
import { products, type ProductId } from '@/config/products';

initAdmin();

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
    const { booking_id, user_id, product_id, product_type } = customData;
    console.log(`Webhook: Processing transaction ${transactionId} for booking ${booking_id} of type ${product_type}`);

    const bookingDocRef = adminDb.collection('bookings').doc(booking_id);
    const userDocRef = adminDb.collection('users').doc(user_id);

    await adminDb.runTransaction(async (transaction: Transaction) => {
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
>>>>>>> before-product-selection-rewrite
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
<<<<<<< HEAD
    console.error('Paddle webhook secret is not configured.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }
  
  // Add a check to ensure the request body is not empty before parsing.
  if (!rawRequestBody) {
    console.warn('Received an empty request body for Paddle webhook. Aborting.');
    return NextResponse.json({ error: 'Empty request body.' }, { status: 400 });
  }


  try {
    // The unmarshal method verifies the signature and parses the event.
    // It will throw an error if the signature is invalid.
    const event = paddle.webhooks.unmarshal(rawRequestBody, signature, webhookSecret);

    console.log(`Received Paddle event: ${event?.eventType}`);

    // 2. Handle the specific event type. We are most interested in 'transaction.completed'.
    if (event?.eventType === 'transaction.completed') {
      const transaction = event.data;
      
      // Extract our internal booking_id from the customData field.
      // This is the correct path for Hosted Checkouts using the 'passthrough' URL parameter.
      const bookingId = transaction.customData?.booking_id;

      if (!bookingId) {
        console.warn('Received transaction.completed event without a booking_id in customData. This is the data received:', JSON.stringify(transaction, null, 2));
        // Return a 200 OK to acknowledge receipt, even if we can't process it.
        // This prevents Paddle from resending the webhook.
        return NextResponse.json({ received: true, message: "Acknowledged, but no booking_id found." });
      }

      // 4. Update the booking document in Firestore from 'awaiting-payment' to 'confirmed'.
      console.log(`Updating booking ${bookingId} to 'confirmed'.`);
      const bookingDocRef = doc(db, 'bookings', bookingId as string);
      
      await updateDoc(bookingDocRef, {
        status: 'confirmed',
        statusHistory: arrayUnion({
          status: 'confirmed',
          changedAt: serverTimestamp(),
          changedBy: 'paddle_webhook',
          reason: `Payment confirmed via Paddle transaction ID: ${transaction.id}`
        })
      });

      console.log(`Booking ${bookingId} successfully confirmed.`);
    }

    // 5. Acknowledge receipt of the event with a 200 OK response.
=======
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

>>>>>>> before-product-selection-rewrite
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
<<<<<<< HEAD
    // Return a 400 Bad Request if the signature is invalid or an error occurs.
=======
>>>>>>> before-product-selection-rewrite
    return NextResponse.json({ error: 'Webhook signature verification failed or an error occurred.' }, { status: 400 });
  }
}
