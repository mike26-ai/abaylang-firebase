// This file is machine-generated - DO NOT EDIT!

'use server';

/**
 * @fileOverview Provides personalized suggestions for accent and pronunciation improvements after lessons using generative AI.
 *
 * - getAccentImprovementSuggestions - A function that takes lesson transcript and student profile information to provide personalized suggestions for accent and pronunciation improvements.
 * - AccentImprovementInput - The input type for the getAccentImprovementSuggestions function.
 * - AccentImprovementOutput - The return type for the getAccentImprovementSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccentImprovementInputSchema = z.object({
  lessonTranscript: z
    .string()
    .describe('The transcript of the Amharic lesson.'),
  studentProfile: z
    .string()
    .describe('The profile information of the student including their native language.'),
});

export type AccentImprovementInput = z.infer<typeof AccentImprovementInputSchema>;

const AccentImprovementOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Personalized suggestions for accent and pronunciation improvements.'
    ),
});

export type AccentImprovementOutput = z.infer<typeof AccentImprovementOutputSchema>;

export async function getAccentImprovementSuggestions(
  input: AccentImprovementInput
): Promise<AccentImprovementOutput> {
  return accentImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accentImprovementPrompt',
  input: {schema: AccentImprovementInputSchema},
  output: {schema: AccentImprovementOutputSchema},
  prompt: `You are an Amharic language expert providing accent and pronunciation improvement suggestions to students after their lessons.

  Based on the lesson transcript and student profile, provide personalized suggestions for accent and pronunciation improvements.

  Lesson Transcript: {{{lessonTranscript}}}
  Student Profile: {{{studentProfile}}}

  Suggestions:`,
});

const accentImprovementFlow = ai.defineFlow(
  {
    name: 'accentImprovementFlow',
    inputSchema: AccentImprovementInputSchema,
    outputSchema: AccentImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
