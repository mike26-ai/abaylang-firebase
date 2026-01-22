
"use client";

import { useReactMediaRecorder } from "react-media-recorder";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, StopCircle, Send, Loader2 } from "lucide-react";
import type { AccentAnalysisOutput } from "@/app/accent-improvement/page";

interface AccentRecorderProps {
    selectedPhrase: { amharic: string; pronunciation: string; english: string };
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: AccentAnalysisOutput) => void;
    onAnalysisError: (error: string) => void;
}

// This component isolates the use of the `react-media-recorder` hook.
export default function AccentRecorder({ selectedPhrase, onAnalysisStart, onAnalysisComplete, onAnalysisError }: AccentRecorderProps) {
    const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } = useReactMediaRecorder({
        audio: true,
        blobPropertyBag: { type: 'audio/webm;codecs=opus' }
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSubmit = async () => {
        if (!mediaBlobUrl) {
            onAnalysisError("Please record your audio first.");
            return;
        }
        setIsAnalyzing(true);
        onAnalysisStart();
        
        // This is where the AI call would happen.
        // For now, we will simulate the "feature unavailable" message.
        setTimeout(() => {
            onAnalysisError("This feature is temporarily unavailable while we upgrade our AI services. Please check back later.");
            setIsAnalyzing(false);
            clearBlobUrl();
        }, 1500);
    };

    return (
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
                        <Button onClick={handleSubmit} className="w-full" disabled={true}>
                            {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Analyze My Pronunciation (Coming Soon)
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
