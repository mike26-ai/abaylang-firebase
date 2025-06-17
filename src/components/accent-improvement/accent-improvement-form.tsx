
"use client";

// This component is not used in the MVP as AI features are removed.
// Kept for potential future reintegration. User sees "Coming Soon" on the page.

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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
// import { getAccentImprovementSuggestions } from "@/ai/flows/accent-improvement-suggestions"; // Removed for MVP
// import type { AccentImprovementInput, AccentImprovementOutput } from "@/ai/flows/accent-improvement-suggestions"; // Removed for MVP
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles } from "lucide-react";
import { Spinner } from "../ui/spinner";

const accentFormSchema = z.object({
  lessonTranscript: z.string().min(50, { message: "Transcript must be at least 50 characters." }).max(5000, {message: "Transcript cannot exceed 5000 characters."}),
  studentProfile: z.string().min(10, {message: "Brief student info required (e.g., 'Native English speaker')."}).max(200),
});

type AccentFormValues = z.infer<typeof accentFormSchema>;

export function AccentImprovementForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const form = useForm<AccentFormValues>({
    resolver: zodResolver(accentFormSchema),
    defaultValues: {
      lessonTranscript: "",
      studentProfile: user ? `Student name: ${user.displayName || 'N/A'}. Native language: [Please specify e.g., English]` : "Native language: [Please specify e.g., English]",
    },
  });
  
  if (user && form.getValues("studentProfile").includes("[Please specify e.g., English]")) {
     form.setValue("studentProfile", `Student name: ${user.displayName || 'N/A'}. Native language: [Please specify e.g., English]`);
  }


  async function onSubmit(values: AccentFormValues) {
    setIsLoading(true);
    setSuggestions(null);
    toast({
        title: "Feature Coming Soon",
        description: "The AI Accent Helper is under development. Thank you for your interest!",
        variant: "default",
      });
    // try { // AI Logic removed for MVP
    //   const input: AccentImprovementInput = {
    //     lessonTranscript: values.lessonTranscript,
    //     studentProfile: values.studentProfile,
    //   };
    //   const result: AccentImprovementOutput = await getAccentImprovementSuggestions(input);
    //   setSuggestions(result.suggestions);
    //   toast({
    //     title: "Suggestions Ready!",
    //     description: "Check below for your personalized accent improvement tips.",
    //   });
    // } catch (error) {
    //   console.error("Error getting accent suggestions:", error);
    //   toast({
    //     title: "Error",
    //     description: "Could not fetch suggestions. Please try again.",
    //     variant: "destructive",
    //   });
    // } finally {
      setIsLoading(false);
    // }
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            AI Accent Helper (Coming Soon)
          </CardTitle>
          <CardDescription>
            This feature is under development. In the future, you'll be able to paste Amharic text here to get pronunciation tips.
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
                        disabled // Disabled for MVP
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
                        disabled // Disabled for MVP
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading || true}> {/* Disabled for MVP */}
                 {isLoading ? <Spinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Get Suggestions (Coming Soon)
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Suggestion display logic removed for MVP */}
    </div>
  );
}
