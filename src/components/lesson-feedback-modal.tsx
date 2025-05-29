"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Spinner } from "./ui/spinner";


interface LessonFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedbackData: {
    lessonId: string;
    rating: number;
    comment: string;
    specificRatings: Record<string, number>;
  }) => void; // This prop will be called by the dashboard to update its local state
  lessonId: string;
  lessonType: string;
  lessonDate: string;
}

export default function LessonFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
  lessonId,
  lessonType,
  lessonDate,
}: LessonFeedbackModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [specificRatings, setSpecificRatings] = useState({
    teachingQuality: 5,
    materialClarity: 5,
    culturalInsights: 5,
    pacing: 5,
    engagement: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingCategories = [
    { key: "teachingQuality", label: "Teaching Quality" },
    { key: "materialClarity", label: "Material Clarity" },
    { key: "culturalInsights", label: "Cultural Insights" },
    { key: "pacing", label: "Lesson Pacing" },
    { key: "engagement", label: "Engagement" },
  ];

  const handleSpecificRatingChange = (categoryKey: string, value: number) => {
    setSpecificRatings((prev) => ({ ...prev, [categoryKey]: value }));
  };

  const handleSubmitFeedback = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to submit feedback.", variant: "destructive" });
      return;
    }
    if (comment.trim().length < 10) {
      toast({ title: "Error", description: "Comment must be at least 10 characters.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Save to Firestore 'testimonials' collection
      const testimonialData = {
        userId: user.uid,
        name: user.displayName || "Anonymous Student",
        userEmail: user.email,
        rating: rating,
        comment: comment,
        lessonId: lessonId, // Link feedback to specific lesson
        lessonType: lessonType,
        lessonDate: lessonDate, // Store lesson date for context
        specificRatings: specificRatings,
        status: "pending", // All new testimonials/feedback are pending approval
        createdAt: serverTimestamp(),
        helpful: 0,
        studentInitials: user.displayName?.split(" ").map(n => n[0]).join("").toUpperCase() || "S",
        verified: true, // Assuming if they booked and are rating, they are verified for this lesson
      };
      await addDoc(collection(db, "testimonials"), testimonialData);

      toast({ title: "Feedback Submitted!", description: "Thank you for your valuable input." });
      onSubmit({ lessonId, rating, comment, specificRatings }); // Call the prop to notify the dashboard
      onClose(); // Close the modal
      // Reset form
      setRating(5);
      setComment("");
      setSpecificRatings({ teachingQuality: 5, materialClarity: 5, culturalInsights: 5, pacing: 5, engagement: 5 });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ title: "Submission Error", description: "Could not submit your feedback. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Rate Your Lesson</DialogTitle>
          <DialogDescription>
            Provide feedback for your {lessonType} on {new Date(lessonDate).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label className="text-base font-medium">Overall Rating</Label>
            <div className="flex items-center gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  className="p-1 h-auto w-auto"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      rating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/50"
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>

          {ratingCategories.map((cat) => (
             <div key={cat.key}>
              <Label className="text-sm font-medium">{cat.label}</Label>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSpecificRatingChange(cat.key, star)}
                    className="p-0.5 h-auto w-auto"
                  >
                    <Star
                      className={`w-5 h-5 transition-colors ${
                         (specificRatings as any)[cat.key] >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <Label htmlFor="comment" className="text-base font-medium">Comments</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on the lesson..."
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmitFeedback} disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}