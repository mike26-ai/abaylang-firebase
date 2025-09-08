// File: src/app/feedback/first-lesson/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { submitTestimonialAction } from "@/app/actions/testimonialActions";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FirstLessonFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?callbackUrl=/feedback/first-lesson");
    }
  }, [user, loading, router]);

  // This is a client-side wrapper for the Server Action.
  // It handles the form submission state, client-side updates, and potential errors.
  const handleFormAction = async (formData: FormData) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Incomplete", description: "Please select a rating.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    
    // Append user data required by the now-secure testimonial action
    formData.append("userId", user.uid);
    formData.append("userName", user.displayName || "Anonymous");
    formData.append("userEmail", user.email || "");

    try {
      // Step 1: Call the secure server action to save the testimonial.
      await submitTestimonialAction(formData);

      // Step 2: On success, perform the client-side update to the user's own profile.
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        showFirstLessonFeedbackPrompt: false,
        hasSubmittedFirstLessonFeedback: true,
      });

      // Step 3: Redirect the user to their profile page with a success toast.
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve.",
      });
      router.push('/profile');
      
    } catch (error: any) {
      console.error("Error submitting first lesson feedback:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">How was your first lesson?</CardTitle>
          <CardDescription>
            Your private feedback is valuable and helps us improve the experience for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleFormAction} className="space-y-8">
            <div className="space-y-2 text-center">
              <Label htmlFor="rating" className="text-lg">Your Overall Rating</Label>
              <input type="hidden" name="rating" value={rating} />
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment" className="text-lg">Your Comments (Optional)</Label>
              <Textarea
                id="comment"
                name="comment"
                rows={8}
                placeholder="What went well? What could be better? Any specific feedback for your tutor?"
                className="resize-none"
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="mr-2"/> : null}
              {isSubmitting ? "Submitting..." : "Submit Private Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
