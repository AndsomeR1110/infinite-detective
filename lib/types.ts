// lib/types.ts
import { z } from 'zod';

// Zod Schemas for Runtime Validation & AI SDK
// ----------------------------------------------------------------------

export const AtmosphereSchema = z.object({
  weather: z.enum(['clear', 'rain', 'fog', 'acid_storm', 'heavy_smog']),
  lightLevel: z.enum(['bright', 'dim', 'pitch_black', 'neon_flicker', 'strobe']),
  tension: z.enum(['calm', 'uneasy', 'high', 'combat', 'terror']),
  colorPalette: z.string().describe("A CSS class or hex code representing the mood, e.g., 'bg-slate-900' or '#1a1a2e'"),
});

export const PlayerStateSchema = z.object({
  hp: z.number().min(0).max(100),
  sanity: z.number().min(0).max(100).describe("0 is complete psychosis, 100 is perfectly lucid."),
  inventory: z.array(z.string()),
  location: z.string(),
});

export const GameOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  actionType: z.enum(['move', 'investigate', 'talk', 'fight', 'hack']),
});

export const GameResponseSchema = z.object({
  narrative: z.string().describe("The story segment. If sanity is low, this text should reflect that."),
  choices: z.array(GameOptionSchema).max(4),
  audioCue: z.string().optional().describe("Description of a sound effect to play, e.g., 'distant_siren'"),
  newState: PlayerStateSchema,
  atmosphere: AtmosphereSchema,
});

// TypeScript Interfaces (derived from Zod schemas)
// ----------------------------------------------------------------------

export type Atmosphere = z.infer<typeof AtmosphereSchema>;
export type PlayerState = z.infer<typeof PlayerStateSchema>;
export type GameOption = z.infer<typeof GameOptionSchema>;
export type GameResponse = z.infer<typeof GameResponseSchema>;
