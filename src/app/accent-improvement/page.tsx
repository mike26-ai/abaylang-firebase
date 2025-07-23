
import type { Metadata } from 'next';
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: 'Accent Improvement Helper - ABYLANG',
  description: 'AI-powered suggestions to improve your Amharic accent and pronunciation.',
};

export default function AccentImprovementPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          AI Accent Helper
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          This advanced AI feature is currently under development and will be available in a future version of ABYLANG. Stay tuned for personalized accent and pronunciation improvement tools!
        </p>
      </header>
    </div>
  );
}
