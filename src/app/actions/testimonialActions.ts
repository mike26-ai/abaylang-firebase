// This file contains server-side logic for handling testimonials.
// By adding 'use server' at the top, all functions in this file are marked as Server Actions.
'use server';

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "@/lib/firebase-admin"; // Import the admin app initializer
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// This is the server action that will be called when the form is submitted.
// It will run on the server, not in the browser.
export async function submitTestimonialAction(formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // 1. Initialize the Firebase Admin SDK and get the user
  // const app = initAdmin(); // Temporarily disabled to prevent crash without env vars
  // const auth = getAuth(app);
  // const db = getFirestore(app);


  // NOTE FOR A REAL APP: The following is a conceptual fix. A full solution requires
  // passing the user's ID token from the client to this server action, or using a library
  // that manages server-side sessions.
  // For now, we will simulate the database write to the console to avoid the crash.
  
  const mockUser = {
      uid: "mockUserId", // In a real app, this would come from a verified token
      displayName: "Mock User",
      email: "mock@example.com",
  };
  
  const user = mockUser; // Replace with actual user session logic later

  if (!user) {
    throw new Error("You must be logged in to submit a testimonial.");
  }

  // Basic validation
  if (!rating || rating < 1 || rating > 5 || !comment) {
      // In a real app, you'd want more robust error handling, maybe returning a message.
      throw new Error("Invalid rating or comment.");
  }

  try {
    // 2. SIMULATE saving the new testimonial to Firestore
    console.log("--- TESTIMONIAL SUBMISSION (SIMULATED) ---");
    console.log("User ID:", user.uid);
    console.log("Name:", user.displayName);
    console.log("Rating:", rating);
    console.log("Comment:", comment);
    console.log("Status: pending");
    console.log("------------------------------------------");

    // This is the code that would run if admin SDK were initialized:
    /*
    await db.collection("testimonials").add({
      userId: user.uid,
      name: user.displayName || "Anonymous", // Use user's display name
      userEmail: user.email,
      rating: rating,
      comment: comment,
      status: "pending", // All new submissions are pending approval
      createdAt: serverTimestamp(),
    });
    */

  } catch (error) {
    console.error("Error saving testimonial to Firestore:", error);
    // Handle the error appropriately, maybe redirect to an error page
    throw new Error("Could not save your testimonial. Please try again later.");
  }
  
  // Revalidate the testimonials page cache if you have one
  revalidatePath('/testimonials');

  // 3. Redirect to the success page
  redirect("/submit-testimonial/success");
}
