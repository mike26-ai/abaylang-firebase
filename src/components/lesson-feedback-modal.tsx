
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
import { useState } from "react";
import { Star, Send, CheckCircle } from "lucide-react";
import { Spinner } from "./ui/spinner"; // Added Spinner import

interface LessonFeedbackModalProps {
  lessonId: string;
  lessonType: string;
  lessonDate: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: any) => void; // The actual submission logic (including Firestore) is in the parent
}

export default function LessonFeedbackModal({
  lessonId,
  lessonType,
  lessonDate,
  isOpen,
  onClose,
  onSubmit,
}: LessonFeedbackModalProps) {
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

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleSpecificRating = (category: string, value: number) => {
    setSpecificFeedback((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const feedbackData = {
      lessonId,
      rating,
      feedbackText: feedback, // Changed key to avoid conflict if 'feedback' is a general object
      specificRatings: specificFeedback, // Changed key to match parent
      date: new Date().toISOString(),
    };

    // Simulate API call (actual submission is handled by parent via onSubmit prop)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onSubmit(feedbackData); // This will call the function passed from StudentDashboardPage
    setIsSubmitted(true);
    setIsSubmitting(false);

    // Auto close after 2 seconds
    setTimeout(() => {
      onClose(); // This will trigger the parent to close the modal
      // Reset state after successful submission AND closing
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
    }, 2000);
  };

  // When the modal is closed externally (e.g., by clicking outside or pressing Esc),
  // and it wasn't through the successful submission flow, we should also reset.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (!isSubmitted) { // Only reset if not already reset by successful submission
        setRating(0);
        setFeedback("");
        setSpecificFeedback({
            teachingQuality: 0,
            materialClarity: 0,
            culturalInsights: 0,
            pacing: 0,
            engagement: 0,
        });
      }
      onClose(); // Ensure parent's onClose is always called
    }
  };


  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Star className="w-5 h-5 text-yellow-400" /> {/* Themed color */}
            Rate Your Lesson Experience
          </DialogTitle>
          <DialogDescription>
            Help us improve by sharing your feedback about your {lessonType} lesson on{" "}
            {new Date(lessonDate).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
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

          {/* Specific Feedback Categories */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-foreground">Rate Specific Aspects</Label>
            {[
              { key: "teachingQuality", label: "Teaching Quality" },
              { key: "materialClarity", label: "Material Clarity" },
              { key: "culturalInsights", label: "Cultural Insights" },
              { key: "pacing", label: "Lesson Pacing" },
              { key: "engagement", label: "Engagement Level" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <span className="text-sm font-medium text-foreground">{label}</span>
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
                          star <= specificFeedback[key as keyof typeof specificFeedback]
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

          {/* Written Feedback */}
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

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1" // Primary button will use default theme
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
