
import { AccentImprovementForm } from "@/components/accent-improvement/accent-improvement-form";
import type { Metadata } from 'next';
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: 'Accent Improvement Helper',
  description: 'Get AI-powered suggestions to improve your Amharic accent and pronunciation.',
};

export default function AccentImprovementPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Improve Your Amharic Accent
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Use our AI tool to get personalized feedback on your pronunciation based on your practice text.
        </p>
      </header>
      <div className="max-w-2xl mx-auto">
        <AccentImprovementForm />
      </div>
    </div>
  );
}
