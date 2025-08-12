// This file contains server-side logic for handling testimonials.
// By adding 'use server' at the top, all functions in this file are marked as Server Actions.
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { auth } from "@/lib/firebase";
import { redirect } from "next/navigation";

// This is the server action that will be called when the form is submitted.
// It will run on the server, not in the browser.
export async function submitTestimonialAction(formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // 1. Get the current logged-in user
  const user = auth.currentUser;

  // This should not happen if page protection is working, but it's a good safeguard.
  if (!user) {
    throw new Error("You must be logged in to submit a testimonial.");
  }

  // Basic validation
  if (!rating || rating < 1 || rating > 5 || !comment) {
      // In a real app, you'd want more robust error handling, maybe returning a message.
      throw new Error("Invalid rating or comment.");
  }

  try {
    // 2. Save the new testimonial to the 'testimonials' collection in Firestore
    await addDoc(collection(db, "testimonials"), {
      userId: user.uid,
      name: user.displayName || "Anonymous", // Use user's display name
      userEmail: user.email,
      rating: rating,
      comment: comment,
      status: "pending", // All new submissions are pending approval
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving testimonial to Firestore:", error);
    // Handle the error appropriately, maybe redirect to an error page
    throw new Error("Could not save your testimonial. Please try again later.");
  }

  // 3. Redirect to the success page
  redirect("/submit-testimonial/success");
}
