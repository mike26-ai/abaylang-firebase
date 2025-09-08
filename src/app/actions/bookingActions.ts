// File: src/app/actions/bookingActions.ts
'use server';

import { doc, updateDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { revalidatePath } from "next/cache";


/**
 * A secure server action to confirm a booking after a successful client-side payment.
 * This is called by the successCallback from the Paddle.js checkout.
 *
 * @param bookingId - The Firestore document ID of the booking to confirm.
 * @param paddleTransactionId - The transaction ID from Paddle for verification.
 * @returns An object indicating success or failure.
 */
export async function confirmBookingAfterPayment(bookingId: string, paddleTransactionId: string): Promise<{ success: boolean; error?: string }> {
  if (!bookingId || !paddleTransactionId) {
    console.error("confirmBookingAfterPayment Error: Missing bookingId or paddleTransactionId.");
    return { success: false, error: "Invalid booking or transaction ID." };
  }

  try {
    const bookingDocRef = doc(db, "bookings", bookingId);

    // Update the booking status to 'confirmed' and log the transaction.
    await updateDoc(bookingDocRef, {
      status: 'confirmed',
      paddleTransactionId: paddleTransactionId, // Store the transaction ID for reference
      statusHistory: arrayUnion({
        status: 'confirmed',
        changedAt: serverTimestamp(),
        changedBy: 'paddle_checkout_success',
        reason: `Payment confirmed via Paddle.js transaction ID: ${paddleTransactionId}`
      })
    });
    
    console.log(`Booking ${bookingId} successfully confirmed via Paddle.js callback.`);
    
    // Revalidate the user's profile page to show the updated booking status
    revalidatePath('/profile');

    return { success: true };

  } catch (error: any) {
    console.error("Error confirming booking after payment:", error);
    return { success: false, error: "Failed to update booking status in the database." };
  }
}
