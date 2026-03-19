import { describe, expect, it } from 'vitest';

import { INTERPRETATION_SYSTEM_PROMPT } from './interpretation';
import { PROMPT_CONSTRUCTION_SYSTEM_PROMPT } from './prompt-construction';
import { TEMPLATE_FABRICATION_SYSTEM_PROMPT } from './template-fabrication';

describe('System Prompts', () => {
  describe('INTERPRETATION_SYSTEM_PROMPT', () => {
    it('is a non-empty string', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT).toBeTruthy();
      expect(typeof INTERPRETATION_SYSTEM_PROMPT).toBe('string');
    });

    it('contains all intent types', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('CREATIVE_DIRECTIVE');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('MODIFICATION_REQUEST');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('QUESTION_TO_AUDIENCE');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('AUDIENCE_RESPONSE_RELAY');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('TRANSITION');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('CONVERSATION');
    });

    it('contains all phases', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('CHARACTER_CREATION');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('SETTING_ESTABLISHMENT');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('ACTIVE_STORYTELLING');
    });

    it('contains narrator-as-filter context', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('narrator');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('human filter');
    });

    it('contains examples for each intent type', () => {
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('dragon-unicorn');
      expect(INTERPRETATION_SYSTEM_PROMPT).toContain('What does our hero see');
    });
  });

  describe('PROMPT_CONSTRUCTION_SYSTEM_PROMPT', () => {
    it('is a non-empty string', () => {
      expect(PROMPT_CONSTRUCTION_SYSTEM_PROMPT).toBeTruthy();
      expect(typeof PROMPT_CONSTRUCTION_SYSTEM_PROMPT).toBe('string');
    });

    it('specifies art style', () => {
      expect(PROMPT_CONSTRUCTION_SYSTEM_PROMPT).toContain('storybook illustration');
      expect(PROMPT_CONSTRUCTION_SYSTEM_PROMPT).toContain('children');
    });

    it('includes conciseness requirement', () => {
      expect(PROMPT_CONSTRUCTION_SYSTEM_PROMPT).toContain('CONCISE');
    });
  });

  describe('TEMPLATE_FABRICATION_SYSTEM_PROMPT', () => {
    it('is a non-empty string', () => {
      expect(TEMPLATE_FABRICATION_SYSTEM_PROMPT).toBeTruthy();
      expect(typeof TEMPLATE_FABRICATION_SYSTEM_PROMPT).toBe('string');
    });

    it('explains the placeholder pattern', () => {
      expect(TEMPLATE_FABRICATION_SYSTEM_PROMPT).toContain('[PLACEHOLDER]');
    });

    it('requires text replacement approach', () => {
      expect(TEMPLATE_FABRICATION_SYSTEM_PROMPT).toContain('text substitution');
    });

    it('includes an example template', () => {
      expect(TEMPLATE_FABRICATION_SYSTEM_PROMPT).toContain('template');
      expect(TEMPLATE_FABRICATION_SYSTEM_PROMPT).toContain('placeholderContext');
    });
  });
});
