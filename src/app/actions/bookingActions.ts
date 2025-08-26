// File: src/app/actions/bookingActions.ts
'use server';

import { doc, updateDoc } from "firebase/firestore";
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

    // 1. If a file is provided, upload it to Cloudinary
    if (file && file.size > 0) {
      const uploadResult = await uploadImage(formData); // The action expects 'file' key in FormData
      if (uploadResult.success && uploadResult.url) {
        paymentProofUrl = uploadResult.url;
      } else {
        // If upload fails, return an error to the client
        return { success: false, error: uploadResult.error || "Failed to upload payment proof." };
      }
    }

    // 2. Update the booking document in Firestore
    const bookingDocRef = doc(db, "bookings", bookingId);
    
    const updateData: { status: string; paymentProofUrl?: string } = {
      status: "payment-pending-confirmation"
    };

    if (paymentProofUrl) {
      updateData.paymentProofUrl = paymentProofUrl;
    }

    await updateDoc(bookingDocRef, updateData);

    return { success: true };

  } catch (error) {
    console.error("Error in confirmPaymentSentAction:", error);
    // Return a generic error to the client
    return { success: false, error: "A server error occurred while confirming your payment." };
  }
}
