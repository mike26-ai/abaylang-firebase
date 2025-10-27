
// File: src/services/bookingService.ts
import { auth } from "@/lib/firebase";
import type { ProductId } from "@/config/products";

const API_BASE_URL = '/api';

interface CreateBookingPayload {
    productId: ProductId;
    userId: string;
    date?: string;
    time?: string;
    paymentNote?: string;
}

/**
 * Creates a new booking via a secure, server-side API endpoint.
 * This function uses a transaction on the server to prevent double-bookings.
 * @param bookingPayload - The data for the new booking.
 * @returns An object containing the new booking's ID and the Paddle redirect URL.
 */
export async function createBooking(bookingPayload: CreateBookingPayload): Promise<{ bookingId: string; redirectUrl: string }> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Authentication required to create a booking.");
    }
    // Security check on the client for immediate feedback
    if (user.uid !== bookingPayload.userId) {
        throw new Error("User mismatch. Cannot create booking for another user.");
    }
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`, // Send the token for server-side verification
        },
        body: JSON.stringify(bookingPayload),
    });

    const data = await response.json();

    if (!response.ok) {
        // Forward the server's error message if available, otherwise use a generic one.
        throw new Error(data.message || 'Failed to create booking.');
    }

    return data;
}
