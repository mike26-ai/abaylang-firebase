// File: src/app/actions/bookingActions.ts
'use server';

import { doc, updateDoc, serverTimestamp, FieldValue, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Server Action for a student to confirm they have sent payment for a booking.
 * It also saves an optional payment note (e.g., transaction ID) from the student.
 * @param bookingId - The ID of the booking being confirmed.
 * @param paymentNote - An optional note from the student about the payment.
 * @returns An object indicating success or failure.
 */
export async function confirmPaymentSentAction(
  bookingId: string,
  paymentNote: string
): Promise<{ success: boolean; error?: string }> {
  if (!bookingId) {
    return { success: false, error: "Booking ID is missing." };
  }

  try {
    const bookingDocRef = doc(db, "bookings", bookingId);
    
    const newStatus = "payment-pending-confirmation";

    // Prepare the data to update in Firestore.
    // The type assertion helps TypeScript understand the structure.
    const updateData: { status: string; paymentNote?: string; statusHistory: FieldValue } = {
      status: newStatus,
      statusHistory: arrayUnion({
        status: newStatus,
        changedAt: serverTimestamp(),
        changedBy: 'student'
      })
    };

    // Only add the paymentNote if the user provided one.
    if (paymentNote.trim()) {
      updateData.paymentNote = paymentNote.trim();
    }

    await updateDoc(bookingDocRef, updateData);

    // Return a definitive success message.
    return { success: true };

  } catch (error) {
    console.error("Error in confirmPaymentSentAction:", error);
    // Return a generic error to the client.
    return { success: false, error: "A server error occurred while confirming your payment." };
  }
}
