
"use client";

import { useState } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Play, Send, BrainCircuit, Loader2, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { analyzeAccent, type AccentAnalysisOutput } from '@/ai/flows/accent-improvement-flow';

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

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: 'audio/webm;codecs=opus' }
  });

  const handlePhraseSelect = (phrase: typeof practicePhrases[0]) => {
    setSelectedPhrase(phrase);
    setFeedback(null);
    setError(null);
    clearBlobUrl();
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        resolve(dataUrl);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSubmit = async () => {
    if (!mediaBlobUrl) {
      setError("Please record your audio first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const audioBlob = await fetch(mediaBlobUrl).then(res => res.blob());
      const audioDataUri = await blobToBase64(audioBlob);

      const result = await analyzeAccent({
        audioDataUri: audioDataUri,
        phraseText: selectedPhrase.amharic,
      });

      setFeedback(result);
    } catch (e: any) {
      console.error("Error analyzing accent:", e);
      setError(e.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getWordAccuracyColor = (accuracy: 'good' | 'average' | 'poor') => {
    switch (accuracy) {
      case 'good': return 'text-green-600';
      case 'average': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
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
                {practicePhrases.map((phrase, index) => (
                  <Button
                    key={index}
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

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Record Your Audio</CardTitle>
              <CardDescription>Record yourself saying the selected phrase.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-accent rounded-lg text-center">
                <p className="font-bold text-2xl text-primary">{selectedPhrase.amharic}</p>
                <p className="text-sm text-muted-foreground italic">[{selectedPhrase.pronunciation}]</p>
              </div>
              <div className="flex items-center justify-center gap-4">
                <Button onClick={startRecording} disabled={status === 'recording'} size="lg">
                  <Mic className="mr-2 h-5 w-5" /> Start
                </Button>
                <Button onClick={stopRecording} disabled={status !== 'recording'} variant="destructive" size="lg">
                  <StopCircle className="mr-2 h-5 w-5" /> Stop
                </Button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Status: <Badge variant={status === 'recording' ? 'destructive' : 'secondary'}>{status}</Badge>
              </p>
              {mediaBlobUrl && status === 'stopped' && (
                <div className="space-y-3">
                  <audio src={mediaBlobUrl} controls className="w-full" />
                  <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Analyze My Pronunciation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
                  <AlertTitle>Analysis Failed</AlertTitle>
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
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
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
                        <div key={index} className="p-3 border rounded-md">
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
