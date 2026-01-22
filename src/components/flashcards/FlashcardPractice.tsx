
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, RotateCw, Volume2, Check, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Flashcard {
  id: string
  amharic: string
  english: string
  pronunciation: string
  example?: string
  category: string
}

interface FlashcardPracticeProps {
  cards: Flashcard[]
  onComplete?: (results: { correct: number; total: number }) => void
}

export function FlashcardPractice({ cards, onComplete }: FlashcardPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0,
  })
  const [isCompleted, setIsCompleted] = useState(false)
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([])

  // Shuffle cards on component mount or when cards prop changes
  useEffect(() => {
    handleRestart();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);


  const currentCard = shuffledCards[currentIndex]
  const progress = shuffledCards.length > 0 ? ((currentIndex + 1) / shuffledCards.length) * 100 : 0


  const handleFlip = () => {
    setFlipped(!flipped)
  }

  const handleNext = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    } else {
      setIsCompleted(true)
      if (onComplete) {
        onComplete({
          correct: results.correct,
          total: shuffledCards.length,
        })
      }
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const handleKnew = () => {
    setResults((prev) => ({ ...prev, correct: prev.correct + 1 }))
    handleNext()
  }

  const handleDidntKnow = () => {
    setResults((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }))
    handleNext()
  }

  const handleRestart = () => {
    setShuffledCards([...cards].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
    setFlipped(false)
    setResults({ correct: 0, incorrect: 0 })
    setIsCompleted(false)
  }

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window && currentCard) {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const amharicVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('am'));
      if (amharicVoice) {
        utterance.voice = amharicVoice;
      } else {
        utterance.lang = 'am';
      }
      window.speechSynthesis.speak(utterance);
    } else {
      console.log("Audio playback not supported for:", text)
    }
  }

  if (shuffledCards.length === 0) {
    return (
      <Card className="shadow-lg border-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No flashcards available for practice.</p>
        </CardContent>
      </Card>
    )
  }
  
  if (!currentCard && !isCompleted && shuffledCards.length > 0) {
    return (
        <Card className="shadow-lg border-border">
            <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading flashcard...</p>
            </CardContent>
        </Card>
    );
  }


  if (isCompleted) {
    return (
      <Card className="shadow-lg border-border">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Practice Complete!</h3>
            <p className="text-muted-foreground mb-6">
              You got {results.correct} out of {shuffledCards.length} cards correct.
            </p>

            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-medium text-primary">{shuffledCards.length > 0 ? Math.round((results.correct / shuffledCards.length) * 100) : 0}%</span>
              </div>
              <Progress value={shuffledCards.length > 0 ? (results.correct / shuffledCards.length) * 100 : 0} className="h-2 bg-secondary" />
            </div>

            <div className="flex gap-3 justify-center">
              <Button onClick={handleRestart}>
                <RotateCw className="w-4 h-4 mr-2" />
                Practice Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-border">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {shuffledCards.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {results.correct} correct • {results.incorrect} incorrect
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-secondary" />
        </div>

        <div
          className="relative min-h-[250px] cursor-pointer [perspective:1000px]"
          onClick={handleFlip}
        >
          <div
            className={cn(
              "absolute inset-0 [backface-visibility:hidden] transition-transform duration-500 [transform-style:preserve-3d] rounded-xl p-6 flex flex-col items-center justify-center border bg-card",
              !flipped ? "[transform:rotateY(0deg)]" : "[transform:rotateY(180deg)]"
            )}
          >
            <div className="absolute top-3 left-3">
              <span className="text-xs font-medium text-muted-foreground capitalize">{currentCard.category}</span>
            </div>
            <div className="absolute top-3 right-3">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio(currentCard.amharic)
                }}
              >
                <Volume2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Button>
            </div>

            <div className="text-center">
              <h3 className="text-3xl font-bold text-foreground mb-2">{currentCard.amharic}</h3>
              <p className="text-sm text-muted-foreground mb-4 italic">[{currentCard.pronunciation}]</p>
              <p className="text-xs text-muted-foreground/70">Click to reveal translation</p>
            </div>
          </div>

          <div
            className={cn(
              "absolute inset-0 [backface-visibility:hidden] transition-transform duration-500 [transform-style:preserve-3d] rounded-xl p-6 flex flex-col items-center justify-center bg-accent border border-border",
              flipped ? "[transform:rotateY(0deg)]" : "[transform:rotateY(-180deg)]"
            )}
          >
            <div className="text-center">
              <h3 className="text-2xl font-medium text-foreground mb-4">{currentCard.english}</h3>
              {currentCard.example && (
                <p className="text-sm text-muted-foreground mb-4">
                  <span className="font-semibold">Example:</span> {currentCard.example}
                </p>
              )}
              <p className="text-xs text-muted-foreground/70">Click to see the Amharic word</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" className="border-destructive/50 hover:bg-destructive/10 text-destructive hover:text-destructive" onClick={handleDidntKnow}>
              <X className="w-4 h-4 mr-1" />
<<<<<<< HEAD
              Didn't Know
=======
              Didn&apos;t Know
>>>>>>> before-product-selection-rewrite
            </Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleKnew}>
              <Check className="w-4 h-4 mr-1" />
              Knew It
            </Button>
          </div>

          <Button variant="outline" onClick={handleNext} disabled={currentIndex === shuffledCards.length -1 && isCompleted}>
             {currentIndex === shuffledCards.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
