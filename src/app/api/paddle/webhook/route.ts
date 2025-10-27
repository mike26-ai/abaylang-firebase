// File: src/app/api/paddle/webhook/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { Paddle, type TransactionCompletedEvent } from '@paddle/paddle-node-sdk';
import { initAdmin, adminDb } from '@/lib/firebase-admin';
import { FieldValue, Transaction } from 'firebase-admin/firestore';
import { products, type ProductId } from '@/config/products'; // Import the new product catalog

initAdmin();

interface PaddleCustomData {
    booking_id?: string;
    // --- NEW: For package purchases ---
    user_id?: string;
    package_id?: ProductId; // Use the strongly-typed ProductId
}

const paddleApiKey = process.env.PADDLE_API_KEY;
if (!paddleApiKey) {
    console.error('CRITICAL: PADDLE_API_KEY is not set in environment variables.');
}
const paddle = new Paddle(paddleApiKey || '');


async function handleSingleLessonConfirmation(bookingId: string, transactionId: string) {
    console.log(`Webhook: Updating booking ${bookingId} to 'confirmed'.`);
    const bookingDocRef = adminDb.collection('bookings').doc(bookingId);
    
    await bookingDocRef.update({
        status: 'confirmed',
        paddleTransactionId: transactionId, // Store Paddle's transaction ID for reference
        statusHistory: FieldValue.arrayUnion({
            status: 'confirmed',
            changedAt: FieldValue.serverTimestamp(),
            changedBy: 'paddle_webhook',
            reason: `Payment confirmed via Paddle transaction ID: ${transactionId}`
        })
    });
    console.log(`Webhook: Booking ${bookingId} successfully confirmed.`);
}

async function handlePackageCreditAllocation(userId: string, packageId: ProductId) {
    console.log(`Webhook: Allocating credits for package '${packageId}' to user ${userId}.`);
    const userDocRef = adminDb.collection('users').doc(userId);

    // Look up package details from the authoritative server-side catalog
    const product = products[packageId];
    if (product.type !== 'package' || !product.totalLessons) {
        console.error(`Webhook Error: Invalid package_id '${packageId}' received or missing totalLessons.`);
        throw new Error(`Invalid package product ID: ${packageId}`);
    }
    const creditsToAdd = product.totalLessons;
    const creditType = packageId; // The credit type is the product ID of the package

    await adminDb.runTransaction(async (transaction: Transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists) {
            console.error(`Webhook Error: User with ID ${userId} not found. Cannot allocate credits.`);
            throw new Error(`User not found for credit allocation.`);
        }

        const userData = userDoc.data();
        const currentCredits = userData?.credits || [];
        
        const existingCreditIndex = currentCredits.findIndex((c: any) => c.lessonType === creditType);
        
        let newCredits = [];
        if (existingCreditIndex > -1) {
            // User already has this type of credit, so increment the count
            newCredits = currentCredits.map((c: any, index: number) => 
                index === existingCreditIndex ? { ...c, count: c.count + creditsToAdd } : c
            );
        } else {
            // User does not have this type of credit, so add it
            newCredits = [...currentCredits, { lessonType: creditType, count: creditsToAdd }];
        }

        transaction.update(userDocRef, {
            credits: newCredits,
            lastCreditPurchase: FieldValue.serverTimestamp(),
        });
    });
    
    console.log(`Webhook: Successfully allocated ${creditsToAdd} credits of type '${creditType}' to user ${userId}.`);
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
      
      const bookingId = customData?.booking_id;
      const userId = customData?.user_id;
      const packageId = customData?.package_id;

      // --- LOGIC TO DIFFERENTIATE BOOKING VS. PACKAGE ---
      if (bookingId) {
        // This is a single lesson or group session booking
        await handleSingleLessonConfirmation(bookingId, transaction.id);
      } else if (userId && packageId) {
        // This is a package purchase
        await handlePackageCreditAllocation(userId, packageId);
      } else {
        console.warn('Webhook: Received transaction.completed event with insufficient customData.', customData);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Error processing Paddle webhook:', error.message);
    return NextResponse.json({ error: 'Webhook signature verification failed or an error occurred.' }, { status: 400 });
  }
}
