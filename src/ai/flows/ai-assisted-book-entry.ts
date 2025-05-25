'use server';

/**
 * @fileOverview An AI agent to assist with book entry by autocompleting details.
 *
 * - aiAssistedBookEntry - A function that handles the book entry process.
 * - AiAssistedBookEntryInput - The input type for the aiAssistedBookEntry function.
 * - AiAssistedBookEntryOutput - The return type for the aiAssistedBookEntry function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAssistedBookEntryInputSchema = z.object({
  partialBookInfo: z.string().describe('Partial information about the book, such as title or subject.'),
});
export type AiAssistedBookEntryInput = z.infer<typeof AiAssistedBookEntryInputSchema>;

const AiAssistedBookEntryOutputSchema = z.object({
  title: z.string().describe('The title of the book.'),
  author: z.string().describe('The author of the book.'),
  isbn: z.string().describe('The ISBN of the book.'),
  publicationDate: z.string().describe('The publication date of the book.'),
  summary: z.string().describe('A short summary of the book.'),
});
export type AiAssistedBookEntryOutput = z.infer<typeof AiAssistedBookEntryOutputSchema>;

export async function aiAssistedBookEntry(input: AiAssistedBookEntryInput): Promise<AiAssistedBookEntryOutput> {
  return aiAssistedBookEntryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAssistedBookEntryPrompt',
  input: {schema: AiAssistedBookEntryInputSchema},
  output: {schema: AiAssistedBookEntryOutputSchema},
  prompt: `You are a librarian assisting with cataloging books. Given the following partial information about a book, please fill in the missing details.

Partial Book Information: {{{partialBookInfo}}}

Book Details:{
  "title": "",
  "author": "",
  "isbn": "",
  "publicationDate": "",
  "summary": ""
}

Ensure that the output is a valid JSON object.`,
});

const aiAssistedBookEntryFlow = ai.defineFlow(
  {
    name: 'aiAssistedBookEntryFlow',
    inputSchema: AiAssistedBookEntryInputSchema,
    outputSchema: AiAssistedBookEntryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
