// This file contains server-side logic for handling testimonials.
// By adding 'use server' at the top, all functions in this file are marked as Server Actions.
'use server';

import { adminDb, adminAuth, FieldValue, Timestamp } from '@/lib/firebase-admin';
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from 'next/headers';

// This is the server action that will be called when the form is submitted.
// It will run on the server, not in the browser.
export async function submitTestimonialAction(formData: FormData) {
  const ratingStr = formData.get("rating") as string;
  const comment = formData.get("comment") as string;
  const rating = parseInt(ratingStr, 10);

  // 1. Securely get the user from the ID token in the headers.
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new Error("Unauthorized: No authentication token provided.");
  }
  const idToken = authorization.split('Bearer ')[1];
  
  let decodedToken;
  try {
      if (!adminAuth) throw new Error("Authentication service is not available.");
      decodedToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
      console.error("Error verifying ID token:", error);
      throw new Error("Unauthorized: Invalid authentication token.");
  }
  
  const user = {
      uid: decodedToken.uid,
      name: decodedToken.name || "Anonymous",
      email: decodedToken.email,
  };

  // Basic validation
  if (!rating || rating < 1 || rating > 5 || !comment) {
      throw new Error("Invalid rating or comment.");
  }

  try {
    if (!adminDb) throw new Error("Database service is not available.");
    // 2. Save the new testimonial to Firestore with a 'pending' status
    await adminDb.collection("testimonials").add({
      userId: user.uid,
      name: user.name,
      userEmail: user.email,
      rating: rating,
      comment: comment,
      status: "pending", // All new submissions are pending approval
      createdAt: FieldValue.serverTimestamp(),
    });

  } catch (error) {
    console.error("Error saving testimonial to Firestore:", error);
    // Throw a more specific error to be caught by the client
    throw new Error("Could not save your testimonial due to a server error. Please try again later.");
  }
  
  // 3. Revalidate paths and redirect on SUCCESS. This should be outside the try block.
  revalidatePath('/testimonials');
  revalidatePath('/admin/dashboard');
  redirect("/submit-testimonial/success");
}
