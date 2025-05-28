
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageCircle, BookUser, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-foreground">
              Unlock Amharic with <span className="text-primary">Amharic Connect</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Live, personalized Amharic lessons from an experienced tutor. Start your journey to fluency today!
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild className="hover-lift">
                <Link href="/bookings">Book Your First Lesson</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="hover-lift">
                <Link href="/tutor-profile">Meet Your Tutor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-foreground">
            Why Choose Amharic Connect?
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-lift shadow-lg">
              <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <BookUser className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">Expert Tutor</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Learn from Mahir Abas Mustefa, a passionate and experienced Amharic language instructor.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-lg">
              <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">Flexible Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Easily schedule, reschedule, or cancel lessons through our intuitive booking system.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-lg">
              <CardHeader className="items-center">
                 <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">AI Accent Helper</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Receive personalized AI-powered feedback to improve your pronunciation and accent.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="hover-lift shadow-lg">
              <CardHeader className="items-center">
                 <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <CardTitle className="mt-4">Community Focused</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with your heritage or explore a new culture through the beauty of Amharic language.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-muted-foreground md:text-lg">
            Your Amharic learning adventure begins here. Sign up today and take the first step.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="hover-lift">
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </div>
        </div>
      </section>
       {/* Placeholder image example */}
      <section className="w-full py-12 md:py-24">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl text-foreground mb-6">
            Visual Inspiration
          </h2>
          <Image
            src="https://placehold.co/800x400.png"
            alt="Amharic learning visual"
            width={800}
            height={400}
            className="rounded-lg shadow-md mx-auto"
            data-ai-hint="language learning Ethiopia"
          />
        </div>
      </section>
    </div>
  );
}
