
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
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export default function FirstLessonFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?callbackUrl=/feedback/first-lesson");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || rating === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Save the feedback to the new collection
      await addDoc(collection(db, "internalFeedback"), {
        userId: user.uid,
        rating: rating,
        comment: comment,
        createdAt: serverTimestamp(),
      });

      // 2. Update the user's profile to disable the prompt
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        showFirstLessonFeedbackPrompt: false,
        hasSubmittedFirstLessonFeedback: true,
      });
      
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve.",
      });
      
      router.push("/profile");

    } catch (error) {
      console.error("Error submitting first lesson feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your feedback. Please try again.",
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
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2 text-center">
              <Label htmlFor="rating" className="text-lg">Your Overall Rating</Label>
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
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={8}
                placeholder="What went well? What could be better? Any specific feedback for your tutor?"
                className="resize-none"
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full" disabled={rating === 0 || isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="mr-2"/> : null}
              {isSubmitting ? "Submitting..." : "Submit Private Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
