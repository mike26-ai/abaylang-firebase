
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, CheckCircle, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import type { Testimonial as TestimonialType } from "@/lib/types";
import { format } from "date-fns"; // For formatting dates

export default function TestimonialsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    rating: 5,
    comment: "",
    location: "",
  });

  const [displayedTestimonials, setDisplayedTestimonials] = useState<TestimonialType[]>([]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoadingTestimonials(true);
      try {
        const testimonialsCol = collection(db, "testimonials");
        const q = query(
          testimonialsCol,
          where("status", "==", "approved"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedTestimonials = querySnapshot.docs.map((doc) => {
          const data = doc.data() as TestimonialType;
          return {
            ...data,
            id: doc.id,
            // Format date for display
            date: data.createdAt ? format(data.createdAt.toDate(), "MMMM yyyy") : "Date not available",
            verified: true, // All approved testimonials are considered verified
          };
        });
        setDisplayedTestimonials(fetchedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        toast({
          title: "Error",
          description: "Could not fetch testimonials.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTestimonials(false);
      }
    };

    fetchTestimonials();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a testimonial.",
        variant: "destructive",
      });
      return;
    }
    if (formData.rating === 0) {
       toast({
        title: "Rating Required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        userId: user.uid,
        name: formData.name,
        userEmail: formData.email, // Storing email for admin reference / contact
        rating: formData.rating,
        comment: formData.comment,
        location: formData.location,
        status: "pending", // Admin approval needed
        createdAt: serverTimestamp(),
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height)-2rem)] bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
        <Card className="border-0 shadow-xl max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-6">
              Your testimonial has been submitted for review. It will appear on the site once approved.
            </p>
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full">Back to Home</Button>
              </Link>
              <Link href="/bookings" className="block">
                <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/5">
                  Book Another Lesson
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Student Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Read what diaspora learners have to say about their experience learning Amharic with Mahir
          </p>
        </div>

        {/* Testimonials Grid */}
        {isLoadingTestimonials ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : displayedTestimonials.length === 0 ? (
          <p className="text-center text-muted-foreground text-lg">No testimonials have been approved yet. Be the first to share your experience below!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {displayedTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-0 shadow-xl bg-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <Star key={i + testimonial.rating} className="w-4 h-4 text-muted-foreground/50" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">&ldquo;{testimonial.comment}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                      </div>
                    </div>
                    {testimonial.verified && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified Student
                      </Badge>
                    )}
                  </div>
                   <p className="text-xs text-muted-foreground/80 mt-3 text-right">{testimonial.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Submit Testimonial Form */}
        <div className="bg-card rounded-xl shadow-xl p-6 sm:p-8 border border-primary/20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Share Your Experience</h2>
            <p className="text-muted-foreground">
              Are you a current or past student? Let others know about your learning journey with Mahir
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={!user}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={!user}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (City, Country)</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g., Toronto, Canada"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={!user}
              />
            </div>

            <div className="space-y-2">
              <Label>Your Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className="focus:outline-none"
                    disabled={!user}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        formData.rating >= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/50 hover:text-yellow-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Testimonial</Label>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Share your experience learning Amharic with Mahir..."
                value={formData.comment}
                onChange={handleInputChange}
                rows={5}
                required
                disabled={!user}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Testimonial"
              )}
            </Button>
            {!user && (
                 <p className="text-sm text-destructive text-center">
                   Please <Link href="/login" className="underline hover:text-destructive/80">log in</Link> or <Link href="/register" className="underline hover:text-destructive/80">sign up</Link> to submit a testimonial.
                 </p>
            )}
            {user && (
                <p className="text-xs text-muted-foreground text-center">
                Your testimonial will be reviewed before being published on the website.
                </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
