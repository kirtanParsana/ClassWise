// The AI flow that suggests improvements to a timetable.
// It takes a timetable as input and returns suggestions for improvements.
// - suggestTimetableImprovements - A function that takes a timetable as input and returns suggestions for improvements.
// - TimetableInput - The input type for the suggestTimetableImprovements function.
// - TimetableOutput - The return type for the suggestTimetableImprovements function.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimetableInputSchema = z.object({
  timetableData: z.string().describe('The timetable data in JSON format.'),
  constraints: z.string().describe('The constraints used to generate the timetable.'),
  currentIssues: z.string().describe('Any known issues with the current timetable, such as conflicts or inefficiencies.'),
});
export type TimetableInput = z.infer<typeof TimetableInputSchema>;

const TimetableOutputSchema = z.object({
  suggestions: z.array(
    z.string().describe('A suggestion for improving the timetable.')
  ).describe('A list of suggestions for improving the timetable, addressing issues like room utilization, commute times, and conflict resolution.')
});
export type TimetableOutput = z.infer<typeof TimetableOutputSchema>;

export async function suggestTimetableImprovements(input: TimetableInput): Promise<TimetableOutput> {
  return suggestTimetableImprovementsFlow(input);
}

const suggestTimetableImprovementsPrompt = ai.definePrompt({
  name: 'suggestTimetableImprovementsPrompt',
  input: {schema: TimetableInputSchema},
  output: {schema: TimetableOutputSchema},
  prompt: `You are an AI assistant designed to analyze academic timetables and provide actionable suggestions for improvements.

  Analyze the provided timetable data, considering the listed constraints and current issues. Your goal is to identify opportunities for optimization, such as improving room utilization, reducing student and faculty commute times between classes, and resolving any scheduling conflicts.

  Timetable Data: {{{timetableData}}}
  Constraints: {{{constraints}}}
  Current Issues: {{{currentIssues}}}

  Provide a list of specific, practical suggestions that can be implemented to enhance the timetable's efficiency and effectiveness.
  Format your response as a JSON object with a "suggestions" array. Each suggestion should be a string describing a specific improvement.

  Example:
  {
    "suggestions": [
      "Reschedule course X to a larger classroom to accommodate all students.",
      "Move course Y to an earlier time slot to reduce commute time for students coming from location Z.",
      "Combine lab sessions for courses A and B to optimize lab resource utilization."
    ]
  }`,
});

const suggestTimetableImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestTimetableImprovementsFlow',
    inputSchema: TimetableInputSchema,
    outputSchema: TimetableOutputSchema,
  },
  async input => {
    const {output} = await suggestTimetableImprovementsPrompt(input);
    return output!;
  }
);
