
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Dynamically import the component that uses the problematic hook
const AccentRecorder = dynamic(() => import('@/components/ai/AccentRecorder'), {
  ssr: false, // This is the crucial part - it disables server-side rendering for this component
  loading: () => (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">Loading Recorder...</p>
    </div>
  ),
});


// Mock type for AccentAnalysisOutput to prevent breaking the UI
export type AccentAnalysisOutput = {
  overallScore: number;
  feedback: string;
  phoneticCorrection: string;
  wordByWordAnalysis: {
    word: string;
    accuracy: 'good' | 'average' | 'poor';
    comment?: string;
  }[];
};

const practicePhrases = [
  { amharic: "ሰላም", pronunciation: "se-lam", english: "Hello" },
  { amharic: "አመሰግናለሁ", pronunciation: "a-me-seg-na-le-hu", english: "Thank you" },
  { amharic: "ስምህ ማን ነው?", pronunciation: "sim-ih man new?", english: "What is your name? (to male)" },
  { amharic: "ደህና ነኝ", pronunciation: "deh-na negn", english: "I am fine" },
];


export default function AccentImprovementPage() {
  const [selectedPhrase, setSelectedPhrase] = useState(practicePhrases[0]);
  const [feedback, setFeedback] = useState<AccentAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handlePhraseSelect = (phrase: typeof practicePhrases[0]) => {
    setSelectedPhrase(phrase);
    setFeedback(null);
    setError(null);
  };
  
  return (
    <div className="container py-12 px-4 md:px-6">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          AI Accent Improvement
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Practice your pronunciation and get instant feedback from our AI language tutor.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Practice Phrases</CardTitle>
              <CardDescription>Select a phrase to practice.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {practicePhrases.map((phrase) => (
                  <Button
                    key={phrase.amharic}
                    variant={selectedPhrase.amharic === phrase.amharic ? 'default' : 'outline'}
                    onClick={() => handlePhraseSelect(phrase)}
                    className="justify-start"
                  >
                    {phrase.amharic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* The Recorder component is now rendered on the client only */}
          <AccentRecorder
            selectedPhrase={selectedPhrase}
            onAnalysisStart={() => setIsLoading(true)}
            onAnalysisComplete={(result) => {
              setFeedback(result);
              setIsLoading(false);
            }}
            onAnalysisError={(err) => {
              setError(err);
              setIsLoading(false);
            }}
           />

        </div>

        <div className="lg:col-span-2">
          <Card className="shadow-lg min-h-full">
            <CardHeader>
              <CardTitle>AI Feedback</CardTitle>
              <CardDescription>Your analysis will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="text-muted-foreground">Analyzing your audio... this may take a moment.</p>
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Feature Unavailable</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {feedback && (
                <div className="space-y-6 animate-in fade-in-50 duration-500">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
                    <div className="flex items-center gap-4">
                      <div className="relative h-24 w-24">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="3"
                            strokeDasharray={`${feedback.overallScore}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{feedback.overallScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{feedback.feedback}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                     <h3 className="text-lg font-semibold mb-2">Phonetic Correction</h3>
                     <p className="p-3 bg-muted/50 rounded-md font-mono text-foreground">{feedback.phoneticCorrection}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Word-by-Word Analysis</h3>
                    <div className="space-y-2">
                      {feedback.wordByWordAnalysis.map((word, index) => (
                        <div key={`${word.word ?? 'word'}-${index}`} className="p-3 border rounded-md">
                           <div className="flex justify-between items-center">
                                <span className="font-semibold text-foreground">{word.word}</span>
                                <Badge variant={word.accuracy === 'good' ? 'default' : word.accuracy === 'average' ? 'secondary' : 'destructive'}>{word.accuracy}</Badge>
                           </div>
                           {word.comment && <p className="text-sm text-muted-foreground mt-1">{word.comment}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
