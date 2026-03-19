import { describe, expect, it, vi } from 'vitest';

import { createMockImageAdapter } from '@/services/image-generation';
import { createMockInterpretationAdapter } from '@/services/interpretation';
import { createMockPromptConstructor } from '@/services/prompt-construction';
import { createSessionStateManager } from '@/services/session-state';
import { createMockTemplateManager } from '@/services/template-manager';
import { SessionPhase } from '@/types/session';

import { createStoryPipeline } from './story-pipeline';

function createTestPipeline(overrides: Record<string, unknown> = {}) {
  const stateManager = createSessionStateManager();
  const onImageGenerated = vi.fn();
  const onStatusChange = vi.fn();

  const pipeline = createStoryPipeline({
    interpretationAdapter: createMockInterpretationAdapter(),
    imageAdapter: createMockImageAdapter({ delayMs: 1 }),
    promptConstructor: createMockPromptConstructor(),
    templateManager: createMockTemplateManager(),
    stateManager,
    apiKey: 'test',
    onImageGenerated,
    onStatusChange,
    ...overrides,
  });

  return { pipeline, stateManager, onImageGenerated, onStatusChange };
}

describe('StoryPipeline', () => {
  describe('CHARACTER_CREATION phase', () => {
    it('generates image on creative directive', async () => {
      const { pipeline, stateManager, onImageGenerated } = createTestPipeline();
      await pipeline.processTranscript('Our hero is going to be a big red dragon with wings');
      expect(onImageGenerated).toHaveBeenCalledOnce();
      expect(stateManager.getState().characterDescription).toContain('dragon');
    });

    it('generates modification image on modification request', async () => {
      const { pipeline, onImageGenerated } = createTestPipeline();
      await pipeline.processTranscript('Our hero is a blue unicorn');
      await pipeline.processTranscript("Let's make the horn rainbow instead");
      expect(onImageGenerated).toHaveBeenCalledTimes(2);
    });

    it('does not generate on conversation', async () => {
      const { pipeline, onImageGenerated } = createTestPipeline();
      await pipeline.processTranscript("That's awesome, guys!");
      expect(onImageGenerated).not.toHaveBeenCalled();
    });
  });

  describe('Phase transitions', () => {
    it('transitions from CHARACTER_CREATION to SETTING_ESTABLISHMENT', async () => {
      const { pipeline, stateManager } = createTestPipeline();
      await pipeline.processTranscript("Now let's figure out where our hero lives");
      expect(stateManager.getState().currentPhase).toBe(SessionPhase.SETTING_ESTABLISHMENT);
    });

    it('transitions from SETTING_ESTABLISHMENT to ACTIVE_STORYTELLING', async () => {
      const { pipeline, stateManager } = createTestPipeline();
      stateManager.updatePhase(SessionPhase.SETTING_ESTABLISHMENT);
      await pipeline.processTranscript("Now let's begin the adventure!");
      expect(stateManager.getState().currentPhase).toBe(SessionPhase.ACTIVE_STORYTELLING);
    });
  });

  describe('ACTIVE_STORYTELLING phase', () => {
    it('pre-fabricates template on question to audience', async () => {
      const { pipeline, stateManager } = createTestPipeline();
      stateManager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
      await pipeline.processTranscript('What does our hero see down below?');
      expect(stateManager.getState().activeTemplate).not.toBeNull();
    });

    it('completes template on audience response relay', async () => {
      const { pipeline, stateManager, onImageGenerated } = createTestPipeline();
      stateManager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);

      await pipeline.processTranscript('What does our hero see?');
      expect(stateManager.getState().activeTemplate).not.toBeNull();

      await pipeline.processTranscript('Great, you want a big pink castle!');
      expect(stateManager.getState().activeTemplate).toBeNull();
      expect(onImageGenerated).toHaveBeenCalled();
    });

    it('falls back to standard flow when no template active', async () => {
      const { pipeline, stateManager, onImageGenerated } = createTestPipeline();
      stateManager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);

      await pipeline.processTranscript('Great, you want a flying carpet!');
      expect(onImageGenerated).toHaveBeenCalled();
    });
  });

  describe('Reference image chain', () => {
    it('maintains scene image throughout generations', async () => {
      const { pipeline, stateManager } = createTestPipeline();

      await pipeline.processTranscript('Our hero is a red dragon');
      const scene1 = stateManager.getState().currentSceneImage;
      expect(scene1).not.toBeNull();

      await pipeline.processTranscript("Now let's figure out where our hero lives");
      await pipeline.processTranscript('The character is in a cloud kingdom');
      const scene2 = stateManager.getState().currentSceneImage;
      expect(scene2).not.toBeNull();
      expect(scene2).not.toBe(scene1);
    });

    it('passes reference image to image generation', async () => {
      const mockImageAdapter = createMockImageAdapter({ delayMs: 1 });
      const generateSpy = vi.spyOn(mockImageAdapter, 'generate');

      const { pipeline, stateManager } = createTestPipeline({
        imageAdapter: mockImageAdapter,
      });

      await pipeline.processTranscript('Our hero is a red dragon');
      const firstImage = stateManager.getState().currentSceneImage;

      await pipeline.processTranscript("Let's make the wings bigger instead");

      const secondCall = generateSpy.mock.calls[1];
      expect(secondCall[0].referenceImageUrl).toBe(firstImage);
    });
  });

  describe('Generation history', () => {
    it('tracks all generations', async () => {
      const { pipeline, stateManager } = createTestPipeline();
      await pipeline.processTranscript('Our hero is a red dragon');
      await pipeline.processTranscript("Let's make the tail blue instead");
      expect(stateManager.getState().generationHistory).toHaveLength(2);
    });
  });

  describe('Full session simulation', () => {
    it('runs a complete storytelling session across all 3 phases', async () => {
      const { pipeline, stateManager, onImageGenerated } = createTestPipeline();

      // Phase 1: CHARACTER_CREATION
      expect(stateManager.getState().currentPhase).toBe(SessionPhase.CHARACTER_CREATION);
      await pipeline.processTranscript('Our hero is going to be a dragon-unicorn');
      expect(onImageGenerated).toHaveBeenCalledTimes(1);

      await pipeline.processTranscript("Let's make the horn rainbow instead");
      expect(onImageGenerated).toHaveBeenCalledTimes(2);

      // Transition to Setting
      await pipeline.processTranscript("Now let's figure out where our hero lives");
      expect(stateManager.getState().currentPhase).toBe(SessionPhase.SETTING_ESTABLISHMENT);

      // Phase 2: SETTING_ESTABLISHMENT
      await pipeline.processTranscript('The character is in a magical cloud kingdom');
      expect(onImageGenerated).toHaveBeenCalledTimes(3);

      // Transition to Storytelling
      await pipeline.processTranscript("Now let's begin the adventure!");
      expect(stateManager.getState().currentPhase).toBe(SessionPhase.ACTIVE_STORYTELLING);

      // Phase 3: ACTIVE_STORYTELLING
      await pipeline.processTranscript('What does our hero see down below?');
      expect(stateManager.getState().activeTemplate).not.toBeNull();

      await pipeline.processTranscript('Okay, so the hero sees a pink castle!');
      expect(stateManager.getState().activeTemplate).toBeNull();
      expect(onImageGenerated).toHaveBeenCalledTimes(4);

      // Verify no generation on conversation
      const countBefore = onImageGenerated.mock.calls.length;
      await pipeline.processTranscript("That's amazing, guys!");
      expect(onImageGenerated).toHaveBeenCalledTimes(countBefore);

      // Verify history
      expect(stateManager.getState().generationHistory.length).toBeGreaterThanOrEqual(4);
    });
  });
});
