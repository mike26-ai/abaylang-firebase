// File: src/app/api/paddle/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { Paddle, EventName, type TransactionCompletedEvent } from '@paddle/paddle-node-sdk';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// --- FIX: Explicitly type the custom data to satisfy TypeScript ---
interface PaddleCustomData {
    booking_id?: string;
}

// --- FIX: Add a check to ensure the API key is not undefined ---
const paddleApiKey = process.env.PADDLE_API_KEY;
if (!paddleApiKey) {
    console.error('CRITICAL: PADDLE_API_KEY is not set in environment variables.');
    // We don't throw here to avoid crashing the server on startup,
    // but the webhook will fail if the key is missing.
}

// Initialize Paddle SDK and Firebase Admin
const paddle = new Paddle(paddleApiKey || '');


/**
 * This is the API route that handles incoming webhook notifications from Paddle.
 * It's responsible for verifying the authenticity of the request and updating
 * the application's database based on the event type.
 */
export async function POST(request: NextRequest) {
  // 1. Verify the webhook signature to ensure the request is genuinely from Paddle.
  // We need the raw request body for the signature verification process.
  const signature = request.headers.get('paddle-signature') || '';
  const rawRequestBody = await request.text();
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!webhookSecret) {
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
      const transaction = event.data as TransactionCompletedEvent['data'];
      
      // --- FIX: Cast customData to our specific type before accessing properties ---
      const customData = transaction.customData as PaddleCustomData | null;
      const bookingId = customData?.booking_id;

      if (!bookingId) {
        console.warn('Received transaction.completed event without a booking_id in customData. This is the data received:', JSON.stringify(transaction, null, 2));
        // Return a 200 OK to acknowledge receipt, even if we can't process it.
        // This prevents Paddle from resending the webhook.
        return NextResponse.json({ received: true, message: "Acknowledged, but no booking_id found." });
      }

      // 4. Update the booking document in Firestore from 'awaiting-payment' to 'confirmed'.
      console.log(`Updating booking ${bookingId} to 'confirmed'.`);
      const bookingDocRef = adminDb.collection('bookings').doc(bookingId);
      
      // Use the .update() method from the admin SDK DocumentReference
      await bookingDocRef.update({
        status: 'confirmed',
        statusHistory: FieldValue.arrayUnion({
          status: 'confirmed',
          changedAt: FieldValue.serverTimestamp(),
          changedBy: 'paddle_webhook',
          reason: `Payment confirmed via Paddle transaction ID: ${transaction.id}`
        })
      });

      console.log(`Booking ${bookingId} successfully confirmed.`);
    }

    // 5. Acknowledge receipt of the event with a 200 OK response.
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    // Return a 400 Bad Request if the signature is invalid or an error occurs.
    return NextResponse.json({ error: 'Webhook signature verification failed or an error occurred.' }, { status: 400 });
  }
}
