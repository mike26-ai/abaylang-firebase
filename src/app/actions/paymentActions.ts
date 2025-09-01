'use server';

import { Paddle } from '@paddle/paddle-node-sdk';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { siteConfig } from '@/config/site';
import { redirect } from 'next/navigation';

// Initialize Paddle SDK with the API key from environment variables.
// This is done securely on the server.
const paddle = new Paddle(process.env.PADDLE_API_KEY || '');

interface CreateCheckoutSessionArgs {
  bookingId: string;
  priceInCents: number;
  lessonType: string;
  userEmail: string;
  userId: string;
  userName: string;
}

/**
 * Creates a Paddle Checkout transaction for a booking.
 * @param args - The arguments for creating the checkout session.
 * @returns An object with either the checkout URL or an error message.
 */
export async function createPaddleCheckout(args: CreateCheckoutSessionArgs) {
  const { bookingId, priceInCents, lessonType, userEmail, userId, userName } = args;

  // 1. Validate that the price on the server matches the expected price.
  // This is a security measure to prevent price manipulation from the client.
  const bookingRef = doc(db, 'bookings', bookingId);
  const bookingSnap = await getDoc(bookingRef);

  if (!bookingSnap.exists()) {
    return { error: 'Booking not found. Please try again.' };
  }
  const bookingData = bookingSnap.data() as Booking;
  const serverPriceInCents = (bookingData.price || 0) * 100;

  if (serverPriceInCents !== priceInCents) {
    return { error: 'Price mismatch. Please refresh the page and try again.' };
  }

  // 2. Create the Paddle transaction.
  try {
    const transaction = await paddle.transactions.create({
      items: [
        {
          price: {
            // Paddle requires a price object. We create one dynamically for each transaction.
            description: lessonType,
            name: lessonType,
            product: {
              name: siteConfig.name, // The name of your website/product
            },
            unitPrice: {
              amount: String(priceInCents),
              currencyCode: 'USD',
            },
            // You can add more tax information if needed, but Paddle can handle this automatically
            // taxMode: 'account_setting',
          },
          quantity: 1,
        },
      ],
      // Pass our internal booking ID to Paddle. This is crucial for the webhook
      // to identify which booking to update after a successful payment.
      customData: {
        booking_id: bookingId,
        user_id: userId,
      },
      // Customer details for Paddle's records and receipt.
      customer: {
        email: userEmail,
        name: userName,
      },
      // URLs for redirection after payment
      checkout: {
        settings: {
          successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/payment-success?bookingId=${bookingId}`,
          cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings/payment-cancel`,
        },
      },
    });

    // 3. If the transaction is created successfully, return the checkout URL.
    if (transaction.checkout?.url) {
      // It's best practice to redirect on the server after a successful server action.
      // This is more secure and reliable than returning the URL to the client.
      redirect(transaction.checkout.url);
    } else {
      return { error: 'Could not create a payment session. Please try again later.' };
    }
  } catch (error) {
    console.error('Paddle transaction creation failed:', error);
    return { error: 'An unexpected error occurred with our payment provider.' };
  }
}
