
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { Star } from "lucide-react";
import { Spinner } from "../ui/spinner";

const testimonialSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, { message: "Comment must be at least 10 characters." }).max(1000),
  // Optional image upload can be added later
});

type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export function TestimonialForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: user?.displayName || "",
      rating: 0,
      comment: "",
    },
  });

  // Update name field if user logs in after form is rendered
  if (user && user.displayName && form.getValues("name") !== user.displayName) {
    form.setValue("name", user.displayName);
  }


  async function onSubmit(values: TestimonialFormValues) {
    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to submit a testimonial.", variant: "destructive" });
      return;
    }
    if (values.rating === 0) {
      form.setError("rating", { type: "manual", message: "Please select a star rating." });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "testimonials"), {
        userId: user.uid,
        name: values.name,
        rating: values.rating,
        comment: values.comment,
        status: "pending", // Admin approval needed
        createdAt: serverTimestamp(),
        userEmail: user.email, // Storing email for admin reference
      });
      toast({
        title: "Testimonial Submitted!",
        description: "Thank you for your feedback. It will be reviewed shortly.",
      });
      form.reset({ name: user.displayName || "", rating: 0, comment: ""});
      setCurrentRating(0);
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= currentRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground hover:text-yellow-300"
                      }`}
                      onClick={() => {
                        field.onChange(star);
                        setCurrentRating(star);
                      }}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Testimonial</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your experience..."
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Optional Image Upload - Placeholder for future
        <FormField
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        <Button type="submit" className="w-full" disabled={isLoading || !user}>
          {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
          {user ? "Submit Testimonial" : "Log in to Submit"}
        </Button>
      </form>
    </Form>
  );
}
