'use server';
/**
 * @fileOverview An AI flow for providing accent and pronunciation feedback on Amharic phrases.
 *
 * - analyzeAccent - A function that handles the accent analysis process.
 * - AccentAnalysisInput - The input type for the analyzeAccent function.
 * - AccentAnalysisOutput - The return type for the analyzeAccent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input schema for the accent analysis flow
const AccentAnalysisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A user's audio recording of an Amharic phrase, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:audio/webm;codecs=opus;base64,<encoded_data>'."
    ),
  phraseText: z.string().describe('The original Amharic phrase text the user was attempting to pronounce.'),
});
export type AccentAnalysisInput = z.infer<typeof AccentAnalysisInputSchema>;

// Output schema for the structured feedback from the AI
const AccentAnalysisOutputSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('An overall pronunciation score from 0 to 100.'),
  feedback: z.string().describe('Detailed, constructive feedback on pronunciation, tone, and rhythm. Should be encouraging.'),
  phoneticCorrection: z.string().describe('A simplified phonetic transcription of the correct pronunciation to help the user.'),
  wordByWordAnalysis: z.array(z.object({
    word: z.string(),
    accuracy: z.enum(['good', 'average', 'poor']),
    comment: z.string().optional(),
  })).describe('A breakdown of each word in the phrase with an accuracy rating and a brief comment.'),
});
export type AccentAnalysisOutput = z.infer<typeof AccentAnalysisOutputSchema>;


// This is the main function that will be called from the frontend.
export async function analyzeAccent(input: AccentAnalysisInput): Promise<AccentAnalysisOutput> {
  return accentImprovementFlow(input);
}

// Define the Genkit prompt with input and output schemas
const accentAnalysisPrompt = ai.definePrompt({
  name: 'accentAnalysisPrompt',
  input: { schema: AccentAnalysisInputSchema },
  output: { schema: AccentAnalysisOutputSchema },
  prompt: `You are an expert Amharic language tutor specializing in pronunciation and accent coaching. Your task is to analyze a student's audio recording and provide structured, encouraging feedback.

  The student was trying to say the following Amharic phrase:
  "{{{phraseText}}}"

  Here is their audio recording:
  {{media url=audioDataUri}}

  Please perform the following steps:
  1.  Listen carefully to the audio and compare the student's pronunciation to the correct pronunciation of the phrase.
  2.  Provide an "overallScore" from 0 (very poor) to 100 (native-like). Be fair but encouraging.
  3.  Write detailed "feedback" explaining what they did well and which specific sounds or words they could improve. Mention rhythm and intonation if relevant.
  4.  Provide a simple "phoneticCorrection" using English-like phonetics to guide them.
  5.  Create a "wordByWordAnalysis" for each word in the original phrase. For each word, provide an accuracy rating ('good', 'average', 'poor') and a short, helpful comment if needed.

  Your response MUST be in the structured JSON format defined by the output schema. Be supportive and focus on helping the student improve.`,
});

// Define the Genkit flow that orchestrates the AI call
const accentImprovementFlow = ai.defineFlow(
  {
    name: 'accentImprovementFlow',
    inputSchema: AccentAnalysisInputSchema,
    outputSchema: AccentAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await accentAnalysisPrompt(input);
    if (!output) {
        throw new Error("The AI model did not return a valid response. Please try again.");
    }
    return output;
  }
);
