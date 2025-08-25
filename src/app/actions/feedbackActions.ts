// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin";

/**
 * Server Action to save private first-lesson feedback.
 * This action ONLY saves the feedback to a secure collection and does not perform any other operations.
 * @param userId - The ID of the user submitting feedback.
 * @param formData - The form data containing the rating and comment.
 * @returns An object indicating success or failure.
 */
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // Basic validation on the server
  if (!userId || !rating || rating < 1 || rating > 5) {
    console.error("submitFirstLessonFeedbackAction validation failed:", { userId, ratingStr });
    return { success: false, error: "Invalid user ID or rating provided." };
  }

  try {
    // 1. Initialize the Admin SDK to get privileged database access
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);

    // 2. Save feedback to the secure internal collection
    await db.collection("internalFeedback").add({
      userId: userId,
      rating: rating,
      comment: comment,
      type: "first-lesson", // Clarify the type of feedback
      createdAt: serverTimestamp(),
    });

    // 3. Return a definitive success message.
    return { success: true };

  } catch (error) {
    console.error("Error in submitFirstLessonFeedbackAction:", JSON.stringify(error, null, 2));
    // Return a generic error message to the client.
    return { success: false, error: "Could not save your feedback due to a server error." };
  }
}
