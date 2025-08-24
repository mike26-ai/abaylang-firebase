// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin"; // Import the admin app initializer

// This Server Action receives the form data and attempts to save it.
// It NO LONGER handles user profile updates or redirects. It just saves the feedback.
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // Basic validation on the server
  if (!userId || !rating || rating < 1 || rating > 5) {
    return { success: false, error: "Invalid user ID or rating provided." };
  }

  try {
    // 1. Initialize the Admin SDK to get privileged database access
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);

    // 2. Save feedback to internal collection
    await db.collection("internalFeedback").add({
      userId: userId,
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp(),
    });

    return { success: true };

  } catch (error) {
    // This detailed log will appear on the SERVER console
    console.error("DETAILED SERVER ACTION ERROR (feedbackActions):", JSON.stringify(error, null, 2));
    // Return a generic error message to the client.
    return { success: false, error: "Could not save your feedback. Please try again later." };
  }
}
