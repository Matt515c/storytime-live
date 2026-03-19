import { TEMPLATE_FABRICATION_SYSTEM_PROMPT } from '@/lib/prompts/template-fabrication';
import type { SessionState } from '@/types/session';

import type { CompletedPrompt, TemplatePrompt } from './types';

export interface TemplateManager {
  preFabricate: (sessionState: SessionState, apiKey: string) => Promise<TemplatePrompt | null>;
  complete: (audienceResponse: string) => CompletedPrompt | null;
  getActive: () => TemplatePrompt | null;
  clear: () => void;
}

const PLACEHOLDER = '[PLACEHOLDER]' as const;

export function createTemplateManager(): TemplateManager {
  let activeTemplate: TemplatePrompt | null = null;

  const preFabricate = async (
    sessionState: SessionState,
    apiKey: string,
  ): Promise<TemplatePrompt | null> => {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: TEMPLATE_FABRICATION_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Character: ${sessionState.characterDescription || 'Not described'}\nSetting: ${sessionState.settingDescription || 'Not described'}\nStory so far: ${sessionState.storyContext || 'Just starting'}\n\nCreate a template prompt for the next scene.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const text = data.content[0]?.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]) as {
        template?: string;
        placeholderContext?: string;
      };

      if (!parsed.template?.includes(PLACEHOLDER)) return null;

      activeTemplate = {
        prompt: parsed.template,
        placeholder: PLACEHOLDER,
        placeholderContext: parsed.placeholderContext ?? 'audience response',
        createdAt: Date.now(),
      };

      return activeTemplate;
    } catch {
      return null;
    }
  };

  const complete = (audienceResponse: string): CompletedPrompt | null => {
    if (!activeTemplate) return null;

    const completedPrompt = activeTemplate.prompt.replace(PLACEHOLDER, audienceResponse);
    const result: CompletedPrompt = {
      prompt: completedPrompt,
      completedAt: Date.now(),
    };

    activeTemplate = null;
    return result;
  };

  const getActive = (): TemplatePrompt | null => activeTemplate;

  const clear = (): void => {
    activeTemplate = null;
  };

  return { preFabricate, complete, getActive, clear };
}

export function createMockTemplateManager(): TemplateManager {
  let activeTemplate: TemplatePrompt | null = null;

  const preFabricate = async (): Promise<TemplatePrompt | null> => {
    activeTemplate = {
      prompt: `A scene showing the hero looking at [PLACEHOLDER]. Storybook illustration style.`,
      placeholder: PLACEHOLDER,
      placeholderContext: 'what the hero sees',
      createdAt: Date.now(),
    };
    return activeTemplate;
  };

  const complete = (audienceResponse: string): CompletedPrompt | null => {
    if (!activeTemplate) return null;

    const completedPrompt = activeTemplate.prompt.replace(PLACEHOLDER, audienceResponse);
    const result: CompletedPrompt = {
      prompt: completedPrompt,
      completedAt: Date.now(),
    };

    activeTemplate = null;
    return result;
  };

  const getActive = (): TemplatePrompt | null => activeTemplate;

  const clear = (): void => {
    activeTemplate = null;
  };

  return { preFabricate, complete, getActive, clear };
}
