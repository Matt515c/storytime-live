import { z } from 'zod/v4';

export const TranscriptResultSchema = z.object({
  text: z.string(),
  isFinal: z.boolean(),
  confidence: z.number().min(0).max(1),
  durationMs: z.number(),
});

export type TranscriptResult = z.infer<typeof TranscriptResultSchema>;
