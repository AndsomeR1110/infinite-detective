// app/api/game/generate/route.ts
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { GameResponseSchema } from '@/lib/types';
import { getSystemPrompt } from '@/lib/prompts';
import { z } from 'zod';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. Parse Input
  const { history, currentState } = await req.json();

  // Validate input state briefly (optional but good practice)
  if (!currentState || typeof currentState.sanity !== 'number') {
    return new Response('Invalid Game State', { status: 400 });
  }

  // 2. Construct Dynamic System Prompt
  const systemPrompt = getSystemPrompt(currentState);

  // 3. Call LLM with StreamObject
  const result = await streamObject({
    model: openai('gpt-4-turbo'), // Or 'gpt-3.5-turbo' depending on budget/needs
    schema: GameResponseSchema,
    system: systemPrompt,
    messages: history, // Pass the chat history so the AI remembers context
    temperature: 0.8, // Slightly creative for storytelling
  });

  // 4. Return the stream
  return result.toTextStreamResponse();
}
