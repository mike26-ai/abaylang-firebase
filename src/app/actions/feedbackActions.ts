// File: src/app/actions/feedbackActions.ts
'use server';

import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/firebase"; 

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
    // 1. Save the feedback to the internalFeedback collection
    await addDoc(collection(db, "internalFeedback"), {
      userId: userId,
      rating: rating,
      comment: comment,
      createdAt: serverTimestamp(),
    });

    // 2. Update the user's profile to permanently disable the prompt
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      showFirstLessonFeedbackPrompt: false,
      hasSubmittedFirstLessonFeedback: true,
    });

  } catch (error) {
    console.error("Error in submitFirstLessonFeedbackAction:", error);
    // This will be caught by the client if the form submission fails.
    throw new Error("Could not save your feedback. Please try again later.");
  }

  // 3. Revalidate the user's profile page cache and redirect them
  revalidatePath("/profile");
  redirect("/profile?feedback=success"); // Redirect with a query param to show success
}
