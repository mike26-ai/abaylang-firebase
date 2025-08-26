
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

// NOTE: The submitPaymentConfirmationAction has been removed.
// The new workflow is client-side only to prevent server errors.
// The user is now instructed via a dialog to contact the admin directly
// with their proof of payment. This file is kept for the feedback action.
