// This file contains server-side logic for handling testimonials.
// By adding 'use server' at the top, all functions in this file are marked as Server Actions.
'use server';

// This is the server action that will be called when the form is submitted.
// It will run on the server, not in the browser.
export async function submitTestimonialAction(formData: FormData) {
  
  const rating = formData.get("rating");
  const comment = formData.get("comment");

  console.log("--- New Testimonial Submission ---");
  console.log("Rating:", rating);
  console.log("Comment:", comment);
  console.log("---------------------------------");
  
  // In the next step, we will add the logic here to save the data to Firestore.
}
