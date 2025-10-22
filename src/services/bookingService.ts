

// File: src/services/bookingService.ts
import { auth, db } from "@/lib/firebase";
import { doc, runTransaction, serverTimestamp, collection, writeBatch } from "firebase/firestore";
import type { UserCredit } from "@/lib/types";

const API_BASE_URL = '/api';

interface CreateBookingPayload {
    date: string;
    time: string;
    duration: number;
    lessonType: string;
    price: number;
    tutorId: string;
    isFreeTrial: boolean;
    userId: string;
    userName: string;
    userEmail: string;
    paymentNote?: string;
    groupSessionId?: string;
    wasRedeemedWithCredit?: boolean;
    creditType?: string;
}

/**
 * Creates a new booking via a secure, server-side API endpoint for payments,
 * or directly via a client-side transaction for credit redemption.
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

    // If redeeming with credit, perform a client-side transaction
    if (bookingPayload.wasRedeemedWithCredit && bookingPayload.creditType) {
        const userRef = doc(db, "users", user.uid);
        const newBookingRef = doc(collection(db, "bookings"));

        try {
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) {
                    throw new Error("User profile not found.");
                }
                const userData = userDoc.data();
                const credits: UserCredit[] = userData.credits || [];
                
                const creditIndex = credits.findIndex(c => c.lessonType === bookingPayload.creditType && c.count > 0);
                
                if (creditIndex === -1) {
                    throw new Error("You do not have sufficient credits for this lesson type.");
                }

                // Decrement the credit count
                credits[creditIndex].count -= 1;
                
                // Set the new booking document
                transaction.set(newBookingRef, {
                    ...bookingPayload,
                    status: 'confirmed', // Credit bookings are confirmed immediately
                    createdAt: serverTimestamp(),
                });

                // Update the user's credits
                transaction.update(userRef, { credits: credits });
            });
            return { bookingId: newBookingRef.id };
        } catch (error) {
            console.error("Credit redemption transaction failed:", error);
            throw error;
        }

    } else {
        // For paid bookings, use the existing secure API route
        const idToken = await user.getIdToken();
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`,
                },
                body: JSON.stringify(bookingPayload),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create booking.');
            }
            
            return data;
            
        } catch (err: any) {
            throw err;
        }
    }
}
