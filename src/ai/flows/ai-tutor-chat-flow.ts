
'use server';
/**
 * @fileOverview An AI-powered Amharic language tutor chat flow.
 *
 * - aiTutorChat - A function that handles the AI tutor chat interaction.
 * - AiTutorChatInput - The input type for the aiTutorChat function.
 * - AiTutorChatOutput - The return type for the aiTutorChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTutorChatInputSchema = z.object({
  userInput: z.string().describe('The message sent by the user to the AI tutor.'),
  // Optional: You could add chat history here for better context in the future
  // history: z.array(z.object({ role: z.enum(['user', 'model']), text: z.string() })).optional(),
});
export type AiTutorChatInput = z.infer<typeof AiTutorChatInputSchema>;

const AiTutorChatOutputSchema = z.object({
  amharicResponse: z.string().describe("The AI tutor's response in Amharic."),
  englishTranslation: z
    .string()
    .optional()
    .describe("An English translation of the Amharic response, if applicable and helpful for the learner."),
});
export type AiTutorChatOutput = z.infer<typeof AiTutorChatOutputSchema>;

export async function aiTutorChat(input: AiTutorChatInput): Promise<AiTutorChatOutput> {
  return aiTutorChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTutorChatPrompt',
  input: {schema: AiTutorChatInputSchema},
  output: {schema: AiTutorChatOutputSchema},
  prompt: `You are Lissan, a friendly, patient, and encouraging Amharic language tutor AI.
The user is practicing their Amharic or asking for language help.

User: {{{userInput}}}

Lissan: (Your primary response should be in Amharic. If appropriate for the context or if the user seems to be struggling, you can provide a concise English translation in parentheses after the Amharic. Keep your response focused on language learning, provide corrections gently, and be encouraging. Aim for short, conversational replies suitable for a chat interface.)
`,
});

const aiTutorChatFlow = ai.defineFlow(
  {
    name: 'aiTutorChatFlow',
    inputSchema: AiTutorChatInputSchema,
    outputSchema: AiTutorChatOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      // Fallback response if the model doesn't generate structured output as expected
      return {
        amharicResponse: 'ይቅርታ፣ አልገባኝም። እንደገና መሞከር ትችላለህ? (Sorry, I didn\'t understand. Can you try again?)',
        englishTranslation: "Sorry, I didn't understand. Can you try again?",
      };
    }
    return output;
  }
);
