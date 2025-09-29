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
    tutorName: string;
    userId: string;
    userName: string;
    userEmail: string;
    paymentNote?: string;
    isFreeTrial: boolean;
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

        if (!response.ok) {
            // Attempt to parse the JSON error body from the server.
            const data = await response.json().catch(() => ({})); // Fallback to empty object on JSON parse error.
            const errorMessage = data?.message || `Failed with status ${response.status}`;
            console.error("Booking creation failed:", errorMessage, "Full response:", data);
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
        
    } catch (err) {
        console.error('Error in createBooking client function:', err);
        // Re-throw the error so the UI can handle it
        throw err;
    }
}
