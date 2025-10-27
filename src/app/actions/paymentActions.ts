// File: src/app/actions/paymentActions.ts
'use server';

import { Paddle, Environment } from '@paddle/paddle-node-sdk';

const paddleApiKey = process.env.PADDLE_API_KEY;
if (!paddleApiKey) {
    console.error("CRITICAL: PADDLE_API_KEY environment variable is not set.");
}

// Initialize Paddle SDK
const paddle = new Paddle(paddleApiKey || '', {
    environment: Environment.sandbox, // Use sandbox for development
});

interface CreateCheckoutPayload {
    priceId: string;
    email: string;
    customData: Record<string, any>;
}

/**
 * Creates a Paddle checkout transaction from the server.
 * This avoids client-side DNS resolution issues within cloud development environments.
 *
 * @param payload - The necessary data to create a checkout.
 * @returns The checkout URL for the newly created transaction.
 */
export async function createPaddleCheckout(payload: CreateCheckoutPayload): Promise<{ url: string }> {
    const { priceId, email, customData } = payload;
    
    if (!paddleApiKey) {
        throw new Error("Paddle payment provider is not configured on the server.");
    }

    try {
        console.log(`Creating Paddle transaction for priceId: ${priceId}`);
        const transaction = await paddle.transactions.create({
            items: [{
                priceId: priceId,
                quantity: 1
            }],
            customer: {
                email: email
            },
            customData: customData,
            // The checkout settings determine the behavior after payment.
            // We want to redirect back to our success page with transaction details.
            checkout: {
                settings: {
                    // This will append transaction details to our success URL
                    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/bookings/success`,
                }
            }
        });

        if (!transaction.checkout?.url) {
            throw new Error("Paddle did not return a checkout URL.");
        }

        console.log(`Successfully created Paddle checkout: ${transaction.checkout.url}`);
        return { url: transaction.checkout.url };

    } catch (error: any) {
        console.error("Error creating Paddle checkout transaction:", error.message);
        // We throw the error to be caught by the calling function, which can then show a toast to the user.
        throw new Error("Could not create payment session. Please try again or contact support.");
    }
}
