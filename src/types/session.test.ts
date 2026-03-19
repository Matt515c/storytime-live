import { describe, expect, it } from 'vitest';

import { createInitialSessionState, SessionPhase, SessionStateSchema } from './session';

describe('SessionPhase', () => {
  it('has all three phases', () => {
    expect(SessionPhase.CHARACTER_CREATION).toBe('CHARACTER_CREATION');
    expect(SessionPhase.SETTING_ESTABLISHMENT).toBe('SETTING_ESTABLISHMENT');
    expect(SessionPhase.ACTIVE_STORYTELLING).toBe('ACTIVE_STORYTELLING');
  });
});

describe('createInitialSessionState', () => {
  it('returns valid initial state', () => {
    const state = createInitialSessionState();
    expect(state.currentPhase).toBe(SessionPhase.CHARACTER_CREATION);
    expect(state.sessionStatus).toBe('idle');
    expect(state.characterDescription).toBe('');
    expect(state.characterReferenceImage).toBeNull();
    expect(state.settingDescription).toBe('');
    expect(state.currentSceneImage).toBeNull();
    expect(state.storyContext).toBe('');
    expect(state.activeTemplate).toBeNull();
    expect(state.placeholderContext).toBeNull();
    expect(state.generationHistory).toEqual([]);
  });

  it('validates against Zod schema', () => {
    const state = createInitialSessionState();
    const result = SessionStateSchema.safeParse(state);
    expect(result.success).toBe(true);
  });
});
