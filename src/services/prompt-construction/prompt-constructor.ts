import { PROMPT_CONSTRUCTION_SYSTEM_PROMPT } from '@/lib/prompts/prompt-construction';
import type { SessionState } from '@/types/session';

export interface PromptConstructor {
  constructPrompt: (description: string, sessionState: SessionState) => Promise<string>;
}

const ART_STYLE_SUFFIX =
  'storybook illustration style, vibrant colors, whimsical, children\'s book art, soft lighting, painterly quality';

export function createAnthropicPromptConstructor(apiKey: string): PromptConstructor {
  const constructPrompt = async (
    description: string,
    sessionState: SessionState,
  ): Promise<string> => {
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
          max_tokens: 256,
          system: PROMPT_CONSTRUCTION_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Character: ${sessionState.characterDescription || 'Not yet created'}\nSetting: ${sessionState.settingDescription || 'Not yet established'}\n\nConvert this to an image prompt: "${description}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        return buildFallbackPrompt(description);
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const text = data.content[0]?.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { prompt?: string };
        if (parsed.prompt) {
          return parsed.prompt;
        }
      }

      return buildFallbackPrompt(description);
    } catch {
      return buildFallbackPrompt(description);
    }
  };

  return { constructPrompt };
}

export function buildFallbackPrompt(description: string): string {
  return `${description}. ${ART_STYLE_SUFFIX}`;
}

export function createMockPromptConstructor(): PromptConstructor {
  const constructPrompt = async (description: string): Promise<string> => {
    return buildFallbackPrompt(description);
  };

  return { constructPrompt };
}
