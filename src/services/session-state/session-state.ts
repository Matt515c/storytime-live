import { createInitialSessionState, SessionPhase } from '@/types/session';
import type { SessionState } from '@/types/session';

export interface SessionStateManager {
  getState: () => SessionState;
  updatePhase: (phase: SessionPhase) => void;
  updateCharacter: (description: string, referenceImage?: string) => void;
  updateSetting: (description: string) => void;
  updateScene: (imageUrl: string) => void;
  updateStatus: (status: SessionState['sessionStatus']) => void;
  updateStoryContext: (context: string) => void;
  setTemplate: (template: string, placeholderContext: string) => void;
  clearTemplate: () => void;
  addToHistory: (prompt: string, imageUrl: string) => void;
  reset: () => void;
}

export function createSessionStateManager(): SessionStateManager {
  let state: SessionState = createInitialSessionState();

  const getState = (): SessionState => ({ ...state });

  const updatePhase = (phase: SessionPhase): void => {
    state = { ...state, currentPhase: phase };
  };

  const updateCharacter = (description: string, referenceImage?: string): void => {
    state = {
      ...state,
      characterDescription: state.characterDescription
        ? `${state.characterDescription}; ${description}`
        : description,
      ...(referenceImage && { characterReferenceImage: referenceImage }),
    };
  };

  const updateSetting = (description: string): void => {
    state = {
      ...state,
      settingDescription: state.settingDescription
        ? `${state.settingDescription}; ${description}`
        : description,
    };
  };

  const updateScene = (imageUrl: string): void => {
    state = { ...state, currentSceneImage: imageUrl };
  };

  const updateStatus = (status: SessionState['sessionStatus']): void => {
    state = { ...state, sessionStatus: status };
  };

  const updateStoryContext = (context: string): void => {
    state = { ...state, storyContext: context };
  };

  const setTemplate = (template: string, placeholderContext: string): void => {
    state = { ...state, activeTemplate: template, placeholderContext };
  };

  const clearTemplate = (): void => {
    state = { ...state, activeTemplate: null, placeholderContext: null };
  };

  const addToHistory = (prompt: string, imageUrl: string): void => {
    state = {
      ...state,
      generationHistory: [
        ...state.generationHistory,
        { prompt, imageUrl, timestamp: Date.now() },
      ],
    };
  };

  const reset = (): void => {
    state = createInitialSessionState();
  };

  return {
    getState,
    updatePhase,
    updateCharacter,
    updateSetting,
    updateScene,
    updateStatus,
    updateStoryContext,
    setTemplate,
    clearTemplate,
    addToHistory,
    reset,
  };
}
