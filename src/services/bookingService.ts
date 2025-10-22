
// File: src/services/bookingService.ts
import { auth } from "@/lib/firebase";

const API_BASE_URL = '/api';

interface CreateBookingPayload {
    date: string;
    time: string;
    duration: number;
    lessonType: string;
    price: number;
    tutorId: string;
    isFreeTrial: boolean;
    // User details are now required for the server payload
    userId: string;
    userName: string;
    userEmail: string;
    paymentNote?: string;
    groupSessionId?: string; // Add this line
}

/**
 * Creates a new booking via a secure, server-side API endpoint.
 * This function retrieves the current user's ID token and sends it for server-side verification.
 * @param bookingPayload - The data for the new booking.
 * @returns An object containing the new booking's ID.
 */
export async function createBooking(bookingPayload: CreateBookingPayload): Promise<{ bookingId: string }> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Authentication required to create a booking.");
    }
    // Security check on the client for immediate feedback
    if (user.uid !== bookingPayload.userId) {
        throw new Error("User mismatch. Cannot create booking for another user.");
    }
    const idToken = await user.getIdToken();

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`, // Send the token for server-side verification
            },
            body: JSON.stringify(bookingPayload),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            // Forward the server's specific error message if it exists, otherwise use a generic one.
            throw new Error(data.message || 'Failed to create booking.');
        }
        
        return data;
        
    } catch (err: any) {
        // Re-throw the clean error message from the server or the network error.
        // This allows the UI to catch specific messages like "slot_already_booked".
        throw err;
    }
}
