// src/ai/flows/resolve-scheduling-conflicts.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for resolving scheduling conflicts by suggesting alternative room assignments or time slots. It exports the resolveSchedulingConflicts function, the ResolveSchedulingConflictsInput type, and the ResolveSchedulingConflictsOutput type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResolveSchedulingConflictsInputSchema = z.object({
  conflictDescription: z
    .string()
    .describe(
      'A detailed description of the scheduling conflict, including the courses, instructors, rooms, and times involved.'
    ),
  currentTimetable: z
    .string()
    .describe(
      'The current timetable data, including course schedules, room assignments, and instructor schedules. Should be a JSON string.'
    ),
});
export type ResolveSchedulingConflictsInput = z.infer<
  typeof ResolveSchedulingConflictsInputSchema
>;

const ResolveSchedulingConflictsOutputSchema = z.object({
  suggestedSolutions: z
    .string()
    .describe(
      'A list of suggested solutions to resolve the scheduling conflict, including alternative room assignments or time slots.  Should be a JSON string.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI’s reasoning for each suggested solution, explaining why it is a viable alternative and how it minimizes disruption.'
    ),
});
export type ResolveSchedulingConflictsOutput = z.infer<
  typeof ResolveSchedulingConflictsOutputSchema
>;

export async function resolveSchedulingConflicts(
  input: ResolveSchedulingConflictsInput
): Promise<ResolveSchedulingConflictsOutput> {
  return resolveSchedulingConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resolveSchedulingConflictsPrompt',
  input: {schema: ResolveSchedulingConflictsInputSchema},
  output: {schema: ResolveSchedulingConflictsOutputSchema},
  prompt: `You are an AI assistant specialized in resolving scheduling conflicts in academic timetables.

You are provided with a description of the conflict and the current timetable data.

Your task is to analyze the conflict and suggest viable solutions, along with clear reasoning for each suggestion.

Conflict Description: {{{conflictDescription}}}
Current Timetable Data: {{{currentTimetable}}}

Provide your suggestions in JSON format with reasoning for each, that addresses the conflict described above.
`,
});

const resolveSchedulingConflictsFlow = ai.defineFlow(
  {
    name: 'resolveSchedulingConflictsFlow',
    inputSchema: ResolveSchedulingConflictsInputSchema,
    outputSchema: ResolveSchedulingConflictsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
