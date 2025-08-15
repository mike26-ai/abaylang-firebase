// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { initAdmin } from "@/lib/firebase-admin"; // Import the admin app initializer

// This Server Action receives the form data and the user's ID.
// It runs on the server, so it has trusted access to the database.
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // Basic validation on the server
  if (!userId || !rating || rating < 1 || rating > 5) {
    // In a real app, you might return an error object.
    // For now, we'll throw an error which can be caught client-side if needed.
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

    // 2. Update the user's profile to permanently disable the prompt using the Admin SDK
    const userDocRef = db.collection("users").doc(userId);
    // **FIXED**: The object now ONLY contains the two fields permitted by the security rule.
    await userDocRef.update({
      showFirstLessonFeedbackPrompt: false,
      hasSubmittedFirstLessonFeedback: true,
    });

  } catch (error) {
    console.error("DETAILED SERVER ACTION ERROR:", JSON.stringify(error, null, 2));
    // This will be caught by the client if the form submission fails.
    throw new Error("Could not save your feedback. Please try again later.");
  }

  // 3. Revalidate the user's profile page cache and redirect them
  revalidatePath("/profile");
  redirect("/profile?feedback=success"); // Redirect with a query param to show success
}
