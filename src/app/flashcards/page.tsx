
"use client";

import { Layers } from 'lucide-react'; // Changed from CardStackIcon
import StaticFlashcardViewer from '@/components/flashcards/static-flashcard-viewer';
import flashcardsData from '@/data/flashcards.json';
// Note: Metadata should be defined statically or handled differently for client components if dynamic.
// For this MVP, we will assume static metadata is acceptable.

// export const metadata: Metadata = { // Cannot be used in client component this way
//   title: 'Amharic Flashcards - ABYLANG',
//   description: 'Practice common Amharic words and phrases with our flashcards.',
// };

export default function FlashcardsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Layers className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Amharic Flashcards
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice common Amharic words and phrases. Click on a card to flip it! These are beginner-level flashcards for now.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <StaticFlashcardViewer cards={flashcardsData.beginner} />
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-muted-foreground">
          More flashcard sets for different levels and categories are coming soon!
        </p>
      </div>
    </div>
  );
}
