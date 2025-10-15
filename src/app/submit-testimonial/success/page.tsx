import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Feedback Submitted - ABYLANG',
  description: 'Thank you for your testimonial.',
};

export default function TestimonialSuccessPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl">Thank You!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Your feedback has been received.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-8">
            We appreciate you taking the time to share your experience. Your testimonial will be reviewed by our team shortly.
          </p>
          <Button asChild size="lg">
            <Link href="/profile">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
