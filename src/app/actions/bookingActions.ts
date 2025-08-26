// File: src/app/actions/bookingActions.ts
'use server';

import { doc, updateDoc, serverTimestamp, FieldValue, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { uploadImage } from "./uploadActions";

/**
 * Server Action for a student to confirm they have sent payment for a booking.
 * Optionally handles the upload of a payment proof screenshot.
 * @param formData - The FormData object containing the bookingId and an optional file.
 * @returns An object indicating success or failure.
 */
export async function confirmPaymentSentAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const bookingId = formData.get('bookingId') as string;
  const file = formData.get('file') as File | null;

  if (!bookingId) {
    return { success: false, error: "Booking ID is missing." };
  }

  try {
    let paymentProofUrl: string | undefined = undefined;

    // 1. If a file is provided, attempt to upload it
    if (file && file.size > 0) {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      const uploadResult = await uploadImage(uploadFormData);
      
      // If the upload specifically failed (not skipped), return an error.
      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error || "Failed to upload payment proof." };
      }
      
      // If the upload was successful and returned a URL, set it.
      if (uploadResult.url) {
        paymentProofUrl = uploadResult.url;
      }
      // If the upload was skipped (uploadResult.success is true but no url), we just continue.
    }

    // 2. Update the booking document in Firestore
    const bookingDocRef = doc(db, "bookings", bookingId);
    
    const newStatus = "payment-pending-confirmation";

    const updateData: { status: string; paymentProofUrl?: string; statusHistory: FieldValue } = {
      status: newStatus,
      statusHistory: arrayUnion({
        status: newStatus,
        changedAt: serverTimestamp(),
        changedBy: 'student'
      })
    };

    if (paymentProofUrl) {
      updateData.paymentProofUrl = paymentProofUrl;
    }

    await updateDoc(bookingDocRef, updateData);

    // 3. Return a definitive success message.
    return { success: true };

  } catch (error) {
    console.error("Error in confirmPaymentSentAction:", error);
    // Return a generic error to the client
    return { success: false, error: "A server error occurred while confirming your payment." };
  }
}
