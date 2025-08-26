// File: src/app/actions/feedbackActions.ts
'use server';

import { doc, updateDoc, serverTimestamp, FieldValue, arrayUnion } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * Server Action to save private first-lesson feedback.
 * This action uses the Admin SDK for privileged database access.
 * @param userId - The ID of the user submitting feedback.
 * @param formData - The form data containing the rating and comment.
 * @returns An object indicating success or failure.
 */
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  if (!userId || !rating || rating < 1 || rating > 5) {
    return { success: false, error: "Invalid user ID or rating provided." };
  }

  try {
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);

    await db.collection("internalFeedback").add({
      userId: userId,
      rating: rating,
      comment: comment,
      type: "first-lesson",
      createdAt: serverTimestamp(),
    });

    return { success: true };

  } catch (error) {
    console.error("Error in submitFirstLessonFeedbackAction:", JSON.stringify(error, null, 2));
    return { success: false, error: "Could not save your feedback due to a server error." };
  }
}


/**
 * Server Action for a student to confirm they have sent payment for a booking.
 * This runs in a privileged admin context to bypass client-side security rules.
 * @param bookingId - The ID of the booking being confirmed.
 * @param paymentNote - An optional note from the student about the payment.
 * @returns An object indicating success or failure.
 */
export async function submitPaymentConfirmationAction(
  bookingId: string,
  paymentNote: string
): Promise<{ success: boolean; error?: string }> {
  if (!bookingId) {
    return { success: false, error: "Booking ID is missing." };
  }

  try {
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);
    
    const bookingDocRef = db.collection("bookings").doc(bookingId);
    
    const newStatus = "payment-pending-confirmation";

    // Prepare the data to update in Firestore.
    // The type assertion helps TypeScript understand the structure.
    const updateData: { status: string; paymentNote?: string; statusHistory: FieldValue } = {
      status: newStatus,
      statusHistory: arrayUnion({
        status: newStatus,
        changedAt: new Date(), // FIX: Use new Date() instead of serverTimestamp() inside arrayUnion for Admin SDK
        changedBy: 'student'
      })
    };

    // Only add the paymentNote if the user provided one.
    if (paymentNote.trim()) {
      updateData.paymentNote = paymentNote.trim();
    }

    await bookingDocRef.update(updateData);

    // Return a definitive success message.
    return { success: true };

  } catch (error) {
    console.error("Error in submitPaymentConfirmationAction:", error);
    // Return a generic error to the client.
    return { success: false, error: "A server error occurred while confirming your payment." };
  }
}
