
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAccentImprovementSuggestions } from "@/ai/flows/accent-improvement-suggestions";
import type { AccentImprovementInput, AccentImprovementOutput } from "@/ai/flows/accent-improvement-suggestions";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth"; // To get student profile info (e.g. native language if stored)
import { Sparkles } from "lucide-react";
import { Spinner } from "../ui/spinner";

const accentFormSchema = z.object({
  lessonTranscript: z.string().min(50, { message: "Transcript must be at least 50 characters." }).max(5000, {message: "Transcript cannot exceed 5000 characters."}),
  studentProfile: z.string().min(10, {message: "Brief student info required (e.g., 'Native English speaker')."}).max(200),
});

type AccentFormValues = z.infer<typeof accentFormSchema>;

export function AccentImprovementForm() {
  const { user } = useAuth(); // Can be used to prefill studentProfile or fetch more details
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const form = useForm<AccentFormValues>({
    resolver: zodResolver(accentFormSchema),
    defaultValues: {
      lessonTranscript: "",
      // Example prefill, ideally this comes from user's actual profile data
      studentProfile: user ? `Student name: ${user.displayName || 'N/A'}. Native language: [Please specify e.g., English]` : "Native language: [Please specify e.g., English]",
    },
  });
  
  // Update student profile if user logs in after form is rendered
  if (user && form.getValues("studentProfile").includes("[Please specify e.g., English]")) {
     form.setValue("studentProfile", `Student name: ${user.displayName || 'N/A'}. Native language: [Please specify e.g., English]`);
  }


  async function onSubmit(values: AccentFormValues) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const input: AccentImprovementInput = {
        lessonTranscript: values.lessonTranscript,
        studentProfile: values.studentProfile,
      };
      const result: AccentImprovementOutput = await getAccentImprovementSuggestions(input);
      setSuggestions(result.suggestions);
      toast({
        title: "Suggestions Ready!",
        description: "Check below for your personalized accent improvement tips.",
      });
    } catch (error) {
      console.error("Error getting accent suggestions:", error);
      toast({
        title: "Error",
        description: "Could not fetch suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            AI Accent Helper
          </CardTitle>
          <CardDescription>
            Paste your lesson transcript (or any Amharic text you practiced) and some brief info about yourself (e.g., native language) to get personalized pronunciation tips.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lessonTranscript"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Transcript / Practice Text (Amharic)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Paste your Amharic text here..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Profile (e.g., Native Language)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Native English speaker, learning Amharic for 3 months."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                 {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Generating Suggestions...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-10">
            <Spinner size="lg" />
            <p className="ml-4 text-muted-foreground">The AI is thinking, please wait...</p>
          </CardContent>
        </Card>
      )}

      {suggestions && !isLoading && (
        <Card className="shadow-xl animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Your Personalized Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm sm:prose dark:prose-invert max-w-none bg-muted/30 p-4 rounded-md whitespace-pre-wrap font-mono text-sm">
              {suggestions}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
