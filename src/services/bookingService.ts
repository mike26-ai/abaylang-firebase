// File: src/services/bookingService.ts
import { auth } from "@/lib/firebase";
import { _createBooking } from "@/app/api/bookings/create/service";

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
 * TESTABLE LOGIC (SERVER-SIDE)
 * This function contains the core logic for creating a booking and can be unit-tested.
 * It is called by the /api/bookings/create route handler.
 *
 * @example
 * // How to test this function (e.g., using Jest):
 * jest.mock('firebase-admin/firestore');
 *
 * describe('createBookingLogic', () => {
 *   it('should throw an error if the slot is blocked by timeOff', async () => {
 *     // Mock Firestore to return a conflicting timeOff document
 *     firestore.collection().where().get.mockResolvedValue({ empty: false, docs: [...] });
 *     
 *     // Expect the function to throw a specific error
 *     await expect(createBookingLogic(...)).rejects.toThrow('tutor is unavailable');
 *   });
 *
 *   it('should create a booking document if the slot is free', async () => {
 *     // Mock Firestore to return no conflicts
 *     firestore.collection().where().get.mockResolvedValue({ empty: true });
 *     const setMock = firestore.collection().doc().set;
 *     
 *     await createBookingLogic(...);
 *     
 *     // Expect the set function to have been called with the correct status
 *     expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'awaiting-payment' }));
 *   });
 * });
 */
export const createBookingLogic = _createBooking;


// --- CLIENT-SIDE FUNCTION ---

/**
 * Creates a new booking via a secure, server-side API endpoint.
 * This function uses a transaction on the server to prevent double-bookings.
 * @param bookingPayload - The data for the new booking.
 * @returns An object containing the new booking's ID.
 */
export async function createBooking(bookingPayload: CreateBookingPayload): Promise<{ bookingId: string }> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("Authentication required to create a booking.");
    }
    if (user.uid !== bookingPayload.userId) {
        throw new Error("User mismatch. Cannot create booking for another user.");
    }
    const idToken = await user.getIdToken();

    const response = await fetch(`${API_BASE_URL}/bookings/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
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
