
import { TestimonialForm } from "@/components/testimonials/testimonial-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Testimonial',
  description: 'Share your experience with Amharic Connect.',
};

export default function SubmitTestimonialPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Share Your Experience
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          We value your feedback! Please take a moment to share your testimonial.
        </p>
      </header>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Write a Testimonial</CardTitle>
            <CardDescription>Your feedback helps us grow and improve.</CardDescription>
          </CardHeader>
          <CardContent>
            <TestimonialForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
