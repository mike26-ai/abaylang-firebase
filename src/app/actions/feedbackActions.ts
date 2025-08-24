// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin"; // Import the admin app initializer

// This Server Action receives the form data and the user's ID.
// It now ONLY handles submitting the private feedback.
// The user profile update will be handled on the client-side to comply with security rules.
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // Basic validation on the server
  if (!userId || !rating || rating < 1 || rating > 5) {
    throw new Error("Invalid user ID or rating provided.");
  }

  try {
    // Initialize the Admin SDK to get privileged database access
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);

    // 1. Save the feedback to the internalFeedback collection using the Admin SDK
    await db.collection("internalFeedback").add({
      userId: userId,
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp(),
    });

    // The user profile update logic has been removed from here.
    // It will now be triggered on the client after this action succeeds.

    return { success: true };

  } catch (error) {
    console.error("DETAILED SERVER ACTION ERROR:", JSON.stringify(error, null, 2));
    // This will be caught by the client if the form submission fails.
    throw new Error("Could not save your feedback. Please try again later.");
  }

  // The redirect logic is also moved to the client.
}
