
import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LissanHub Blog',
  description: 'Insights, tips, and stories to help you master Amharic!',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-10 text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
                <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                LissanHub Blog
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
                Our blog is currently under construction. Please check back soon for insightful articles, learning tips, and cultural stories to enhance your Amharic journey!
            </p>
        </header>
        <div className="text-center">
            <p className="text-muted-foreground">Content coming soon...</p>
        </div>
      </div>
    </div>
  )
}
