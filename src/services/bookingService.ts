
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
    groupSessionId?: string; // Add this to handle joining a group session
}

interface CreateWithCreditPayload {
    creditType: string;
    userId: string;
    date: string;
    time: string;
    notes?: string;
}

interface PrivateGroupMember {
  name: string;
  email: string;
}

interface CreatePrivateGroupPayload {
    date: string;
    time: string;
    duration: number;
    lessonType: string;
    pricePerStudent: number;
    tutorId: string;
    leader: PrivateGroupMember;
    members: PrivateGroupMember[];
}


/**
 * Creates a new booking via a secure, server-side API endpoint.
 * This function uses a transaction on the server to prevent double-bookings.
 * @param bookingPayload - The data for the new booking.
 * @returns An object containing the new booking's ID and the redirect URL.
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

export async function createBookingWithCredit(payload: CreateWithCreditPayload): Promise<{ bookingId: string; redirectUrl: string }> {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");
    if (user.uid !== payload.userId) throw new Error("User mismatch.");

    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/bookings/create-with-credit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking with credit.');
    }
    return data;
}


interface RescheduleRequestPayload {
    bookingId: string;
    reason: string;
}

/**
 * Initiates a reschedule by cancelling the old lesson and issuing a credit.
 * @param payload - The ID of the booking to cancel and the reason.
 * @returns A success message.
 */
export async function requestReschedule(payload: RescheduleRequestPayload): Promise<{ success: boolean; message: string; credit: any; }> {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required.");
    
    const idToken = await user.getIdToken();
    const response = await fetch(`${API_BASE_URL}/bookings/request-cancellation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            ...payload,
            resolutionChoice: 'reschedule',
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to process reschedule request.');
    }
    return data;
}


export async function createPrivateGroupBooking(payload: CreatePrivateGroupPayload): Promise<{ bookingId: string; groupSessionId: string }> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required.");
  }
  const idToken = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}/bookings/create-private-group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create private group booking.');
  }
  return result;
}
