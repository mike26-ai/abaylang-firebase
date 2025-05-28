
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, RotateCcw, Volume2 } from "lucide-react"

export function PronunciationFeedbackTool() {
  const [isRecording, setIsRecording] = useState(false)
  const [hasRecording, setHasRecording] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [currentWord, setCurrentWord] = useState("ሰላም") // "Hello" in Amharic
  const [accuracy, setAccuracy] = useState<number | null>(null)

  const amharicWords = [
    { amharic: "ሰላም", english: "Hello", pronunciation: "se-lam" },
    { amharic: "እንዴት ነህ", english: "How are you?", pronunciation: "in-det neh" },
    { amharic: "አመሰግናለሁ", english: "Thank you", pronunciation: "a-me-seg-na-le-hu" },
    { amharic: "እንኳን ደህና መጣህ", english: "Welcome", pronunciation: "in-kwan deh-na me-tah" },
    { amharic: "ይቅርታ", english: "Excuse me", pronunciation: "yik-ir-ta" },
  ]

  const currentWordData = amharicWords.find((w) => w.amharic === currentWord) || amharicWords[0]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)

      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false)
        setHasRecording(true)
        stream.getTracks().forEach((track) => track.stop())

        // Simulate AI feedback
        const randomAccuracy = Math.floor(Math.random() * 30) + 70 // 70-100%
        setAccuracy(randomAccuracy)

        if (randomAccuracy >= 90) {
          setFeedback("Excellent pronunciation! Your accent is very clear.")
        } else if (randomAccuracy >= 80) {
          setFeedback("Good job! Try to emphasize the second syllable more.")
        } else {
          setFeedback("Keep practicing! Focus on the vowel sounds.")
        }
      }, 3000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      alert("Please allow microphone access to use this feature.")
    }
  }

  const playExample = () => {
    // In a real app, this would play the audio pronunciation
    alert(`Playing pronunciation for: ${currentWordData.pronunciation}`)
  }

  const resetRecording = () => {
    setHasRecording(false)
    setFeedback(null)
    setAccuracy(null)
  }

  const nextWord = () => {
    const currentIndex = amharicWords.findIndex((w) => w.amharic === currentWord)
    const nextIndex = (currentIndex + 1) % amharicWords.length
    setCurrentWord(amharicWords[nextIndex].amharic)
    resetRecording()
  }

  return (
    <div className="space-y-4">
      <Card className="p-6 text-center bg-gradient-to-br from-accent/30 to-background border-border shadow-lg">
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold text-foreground">{currentWordData.amharic}</div>
          <div className="text-lg text-muted-foreground">{currentWordData.english}</div>
          <div className="text-sm text-primary font-mono">[{currentWordData.pronunciation}]</div>

          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={playExample} className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Listen
            </Button>
            <Button variant="outline" size="sm" onClick={nextWord} className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Next Word
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={isRecording ? undefined : startRecording}
          disabled={isRecording}
          className={`w-20 h-20 rounded-full text-primary-foreground ${
            isRecording ? "bg-destructive hover:bg-destructive/90 animate-pulse" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
        </Button>

        <div className="text-center">
          {isRecording && <div className="text-destructive font-medium">Recording... (3s)</div>}
          {!isRecording && !hasRecording && <div className="text-muted-foreground">Click to start recording</div>}
        </div>

        {feedback && accuracy && (
          <Card className="w-full max-w-md border-border shadow-lg">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Accuracy Score:</span>
                <Badge
                  className={
                    accuracy >= 90
                      ? "bg-primary/20 text-primary" // Success-like
                      : accuracy >= 80
                        ? "bg-yellow-400/20 text-yellow-700" // Warning-like
                        : "bg-destructive/20 text-destructive" // Error-like
                  }
                >
                  {accuracy}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">{feedback}</div>
              <Button variant="outline" size="sm" onClick={resetRecording} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
