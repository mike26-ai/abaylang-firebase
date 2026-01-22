
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardData {
  id: string;
  amharic: string;
  english: string;
  pronunciation: string;
  category: string;
}

interface StaticFlashcardViewerProps {
  cards: FlashcardData[];
}

export default function StaticFlashcardViewer({ cards }: StaticFlashcardViewerProps) {
  const [flippedStates, setFlippedStates] = useState<Record<string, boolean>>({});
  const [amharicVoice, setAmharicVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // This is the safe place to access `window` and `localStorage`.
    const getVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const amVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('am'));
        setAmharicVoice(amVoice || null);
      }
    };
    
    // Voices might load asynchronously, so we listen for the event.
    if ('speechSynthesis' in window) {
        getVoices(); // Try to get them immediately
        window.speechSynthesis.onvoiceschanged = getVoices;
    }

    return () => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = null;
        }
    };
  }, []);


  const handleFlip = (cardId: string) => {
    setFlippedStates((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      if (amharicVoice) {
        utterance.voice = amharicVoice;
      } else {
         utterance.lang = 'am'; // Fallback if no specific Amharic voice is found
      }
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Audio playback not supported. Pronunciation for "${text}"`);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No flashcards available in this set.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 [perspective:1000px]">
      {cards.map((card) => (
        <div
          key={card.id}
          className={cn(
            "relative h-64 w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d]",
            flippedStates[card.id] ? "[transform:rotateY(180deg)]" : ""
          )}
          onClick={() => handleFlip(card.id)}
        >
          {/* Front of Card (Amharic) */}
          <Card
            className={cn(
              "absolute inset-0 [backface-visibility:hidden] flex flex-col items-center justify-center p-4 border-2 border-primary/30 bg-card"
            )}
          >
            <CardContent className="text-center space-y-2">
              <p className="text-2xl font-bold text-primary">{card.amharic}</p>
              <p className="text-sm text-muted-foreground italic">[{card.pronunciation}]</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card flip when clicking button
                  playAudio(card.amharic);
                }}
              >
                <Volume2 className="w-4 h-4 mr-1" /> Listen
              </Button>
              <p className="text-xs text-muted-foreground/70 mt-3">Click to see English</p>
            </CardContent>
          </Card>

          {/* Back of Card (English) */}
          <Card
            className={cn(
              "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-4 border-2 border-accent/80 bg-accent"
            )}
          >
            <CardContent className="text-center space-y-3">
              <p className="text-xl font-semibold text-accent-foreground">{card.english}</p>
              <p className="text-xs text-muted-foreground capitalize">Category: {card.category}</p>
               <p className="text-xs text-muted-foreground/70 mt-3">Click to see Amharic</p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
