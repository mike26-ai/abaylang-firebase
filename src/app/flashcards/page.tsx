
"use client";

import { Layers } from 'lucide-react';
import flashcardsData from '@/data/flashcards.json';
import { FlashcardPractice } from '@/components/flashcards/FlashcardPractice';
import StaticFlashcardViewer from '@/components/flashcards/static-flashcard-viewer';

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
          Use the interactive practice mode to test your knowledge, or browse all cards below.
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-6">Practice Mode</h2>
        <FlashcardPractice cards={flashcardsData.beginner} />
      </div>
      
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-6">Browse All Beginner Cards</h2>
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
