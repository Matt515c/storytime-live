import { z } from 'zod/v4';

export const TemplatePromptSchema = z.object({
  prompt: z.string(),
  placeholder: z.literal('[PLACEHOLDER]'),
  placeholderContext: z.string(),
  createdAt: z.number(),
});

export type TemplatePrompt = z.infer<typeof TemplatePromptSchema>;

export const CompletedPromptSchema = z.object({
  prompt: z.string(),
  completedAt: z.number(),
});

export type CompletedPrompt = z.infer<typeof CompletedPromptSchema>;
