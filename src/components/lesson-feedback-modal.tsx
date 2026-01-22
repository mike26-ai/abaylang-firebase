
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { format as formatDate, parseISO, parse } from "date-fns";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface LessonFeedbackModalProps {
  lessonId: string;
  lessonType: string;
  lessonDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<any>;
}

export default function LessonFeedbackModal({
  lessonId,
  lessonType,
  lessonDate,
  isOpen,
  onClose,
  onSubmit,
}: LessonFeedbackModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [specificFeedback, setSpecificFeedback] = useState({
    teachingQuality: 0,
    materialClarity: 0,
    culturalInsights: 0,
    pacing: 0,
    engagement: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSubmitted(false);
        setRating(0);
        setFeedback("");
        setSpecificFeedback({
          teachingQuality: 0,
          materialClarity: 0,
          culturalInsights: 0,
          pacing: 0,
          engagement: 0,
        });
      }, 300);
    }
  }, [isOpen]);

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSpecificRating = (category: keyof typeof specificFeedback, value: number) => {
    setSpecificFeedback((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to submit feedback.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Rating Required", description: "Please provide an overall rating.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        userId: user.uid,
        name: user.displayName,
        userEmail: user.email,
        rating,
        comment: feedback,
        specificRatings: specificFeedback,
        status: "pending",
        createdAt: serverTimestamp(),
        lessonId,
        lessonType,
        date: lessonDate,
      });

      setIsSubmitted(true);
      await onSubmit(); // Notify parent to refetch data
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({ title: "Submission Failed", description: "Could not submit your feedback. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const parsedDate = lessonDate ? parse(lessonDate, 'yyyy-MM-dd', new Date()) : new Date();
  const formattedLessonDate = !isNaN(parsedDate.getTime()) ? formatDate(parsedDate, "PPP") : "a recent lesson";

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Thank You!</h3>
            <p className="text-muted-foreground">Your feedback has been submitted.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-yellow-400" />
            Rate Your Lesson Experience
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback about your {lessonType} lesson on{" "}
            {formattedLessonDate}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-medium text-foreground">Overall Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110 p-1"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating > 0 && (
                  <>
                    {rating === 1 && "Poor"}
                    {rating === 2 && "Fair"}
                    {rating === 3 && "Good"}
                    {rating === 4 && "Very Good"}
                    {rating === 5 && "Excellent"}
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium text-foreground">Rate Specific Aspects</Label>
            {(Object.keys(specificFeedback) as Array<keyof typeof specificFeedback>).map((key) => (
              <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleSpecificRating(key, star)}
                      className="focus:outline-none p-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= specificFeedback[key]
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-base font-medium text-foreground">
              Additional Comments
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts about the lesson, what you enjoyed, and any suggestions for improvement..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <Spinner size="sm" className="mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
