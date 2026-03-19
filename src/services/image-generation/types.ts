import { z } from 'zod/v4';

export const ImageGenerationRequestSchema = z.object({
  prompt: z.string(),
  referenceImageUrl: z.string().optional(),
  width: z.number().default(1024),
  height: z.number().default(1024),
});

export type ImageGenerationRequest = z.infer<typeof ImageGenerationRequestSchema>;

export const ImageResultSchema = z.object({
  url: z.string(),
  durationMs: z.number(),
});

export type ImageResult = z.infer<typeof ImageResultSchema>;
