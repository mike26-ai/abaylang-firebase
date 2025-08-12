// Using "use client" because this page uses hooks (useState, useAuth, useRouter) for interactivity and auth checks.
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
import { submitTestimonialAction } from "@/app/actions/testimonialActions";


export default function SubmitTestimonialPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!loading && !user) {
      // We pass a 'redirect' query parameter so the login page knows where to send the user back to.
      router.push("/login?redirect=/submit-testimonial");
    }
  }, [user, loading, router]);

  // Show a loading spinner while the authentication state is being checked.
  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Once the user is confirmed, show the form.
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Share Your Experience</CardTitle>
          <CardDescription>
            We'd love to hear about your learning journey with us.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* We use the server action in the <form> element. */}
          <form action={submitTestimonialAction} className="space-y-8">
            <div className="space-y-2 text-center">
              <Label htmlFor="rating" className="text-lg">Your Rating</Label>
              {/* This hidden input will hold the actual rating value for the form submission. */}
              <input type="hidden" name="rating" value={rating} />
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button" // Important: type="button" prevents form submission on click.
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
              <Label htmlFor="comment" className="text-lg">Your Review</Label>
              <Textarea
                id="comment"
                name="comment"
                required
                rows={8}
                placeholder="Tell us about the lesson, the tutor, and what you learned..."
                className="resize-none"
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full">
              Submit Testimonial
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
