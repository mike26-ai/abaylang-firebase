// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { initAdmin } from "@/lib/firebase-admin"; // Import the admin app initializer
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// This Server Action receives the form data and attempts to save it.
export async function submitFirstLessonFeedbackAction(userId: string, formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // Basic validation on the server
  if (!userId || !rating || rating < 1 || rating > 5) {
    throw new Error("Invalid user ID or rating provided.");
  }

  try {
    // 1. Initialize the Admin SDK to get privileged database access
    const adminApp = initAdmin();
    const db = getFirestore(adminApp);

    // 2. Save the feedback and update the user's profile in a single transaction
    // Note: The Firestore SDK does not have a native transaction object that spans
    // different collections easily in this syntax. For simplicity, we'll perform
    // these as sequential writes. For a production app, a transaction or batched write is better.
    
    // Save feedback to internal collection
    await db.collection("internalFeedback").add({
      userId: userId,
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp(),
    });

    // Update user's profile to hide the feedback prompt
    const userDocRef = db.collection("users").doc(userId);
    await userDocRef.update({
      showFirstLessonFeedbackPrompt: false,
      hasSubmittedFirstLessonFeedback: true,
    });


  } catch (error) {
    // This detailed log will appear on the SERVER console (e.g., in your Vercel/Node logs)
    // It is crucial for debugging why the database write might fail.
    console.error("DETAILED SERVER ACTION ERROR:", JSON.stringify(error, null, 2));
    // This will be caught by the client if the form submission fails.
    throw new Error("Could not save your feedback. Please try again later.");
  }

  // 3. Revalidate the user's profile page cache and redirect them
  revalidatePath('/profile');
  redirect('/profile?feedback=success');
}
