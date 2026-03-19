import { z } from 'zod/v4';

export enum SessionPhase {
  CHARACTER_CREATION = 'CHARACTER_CREATION',
  SETTING_ESTABLISHMENT = 'SETTING_ESTABLISHMENT',
  ACTIVE_STORYTELLING = 'ACTIVE_STORYTELLING',
}

export const SessionPhaseSchema = z.enum([
  SessionPhase.CHARACTER_CREATION,
  SessionPhase.SETTING_ESTABLISHMENT,
  SessionPhase.ACTIVE_STORYTELLING,
]);

export type SessionStatus = 'idle' | 'listening' | 'processing' | 'generating';

export const SessionStatusSchema = z.enum(['idle', 'listening', 'processing', 'generating']);

export interface SessionState {
  currentPhase: SessionPhase;
  sessionStatus: SessionStatus;
  characterDescription: string;
  characterReferenceImage: string | null;
  settingDescription: string;
  currentSceneImage: string | null;
  storyContext: string;
  activeTemplate: string | null;
  placeholderContext: string | null;
  generationHistory: Array<{ prompt: string; imageUrl: string; timestamp: number }>;
}

export const SessionStateSchema = z.object({
  currentPhase: SessionPhaseSchema,
  sessionStatus: SessionStatusSchema,
  characterDescription: z.string(),
  characterReferenceImage: z.string().nullable(),
  settingDescription: z.string(),
  currentSceneImage: z.string().nullable(),
  storyContext: z.string(),
  activeTemplate: z.string().nullable(),
  placeholderContext: z.string().nullable(),
  generationHistory: z.array(
    z.object({
      prompt: z.string(),
      imageUrl: z.string(),
      timestamp: z.number(),
    }),
  ),
});

export function createInitialSessionState(): SessionState {
  return {
    currentPhase: SessionPhase.CHARACTER_CREATION,
    sessionStatus: 'idle',
    characterDescription: '',
    characterReferenceImage: null,
    settingDescription: '',
    currentSceneImage: null,
    storyContext: '',
    activeTemplate: null,
    placeholderContext: null,
    generationHistory: [],
  };
}
