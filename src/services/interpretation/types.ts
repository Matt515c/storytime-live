import { z } from 'zod/v4';

export enum IntentType {
  CREATIVE_DIRECTIVE = 'CREATIVE_DIRECTIVE',
  MODIFICATION_REQUEST = 'MODIFICATION_REQUEST',
  QUESTION_TO_AUDIENCE = 'QUESTION_TO_AUDIENCE',
  AUDIENCE_RESPONSE_RELAY = 'AUDIENCE_RESPONSE_RELAY',
  TRANSITION = 'TRANSITION',
  CONVERSATION = 'CONVERSATION',
}

export const IntentTypeSchema = z.enum([
  IntentType.CREATIVE_DIRECTIVE,
  IntentType.MODIFICATION_REQUEST,
  IntentType.QUESTION_TO_AUDIENCE,
  IntentType.AUDIENCE_RESPONSE_RELAY,
  IntentType.TRANSITION,
  IntentType.CONVERSATION,
]);

export const IntentClassificationSchema = z.object({
  intent: IntentTypeSchema,
  confidence: z.number().min(0).max(1),
  extractedDescription: z.string().optional(),
  targetPhase: z
    .enum(['CHARACTER_CREATION', 'SETTING_ESTABLISHMENT', 'ACTIVE_STORYTELLING'])
    .optional(),
  reasoning: z.string(),
});

export type IntentClassification = z.infer<typeof IntentClassificationSchema>;
