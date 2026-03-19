import { INTERPRETATION_SYSTEM_PROMPT } from '@/lib/prompts/interpretation';
import type { SessionState } from '@/types/session';

import type { InterpretationAdapter } from './interpretation.interface';
import { IntentClassificationSchema, IntentType } from './types';
import type { IntentClassification } from './types';

const FALLBACK_CLASSIFICATION: IntentClassification = {
  intent: IntentType.CONVERSATION,
  confidence: 0.5,
  reasoning: 'Failed to classify — defaulting to CONVERSATION',
};

export function createAnthropicInterpretationAdapter(apiKey: string): InterpretationAdapter {
  const classify = async (
    transcript: string,
    sessionState: SessionState,
  ): Promise<IntentClassification> => {
    const startTime = performance.now();

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
          system: INTERPRETATION_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `Current phase: ${sessionState.currentPhase}\nCharacter: ${sessionState.characterDescription || 'Not yet created'}\nSetting: ${sessionState.settingDescription || 'Not yet established'}\nStory context: ${sessionState.storyContext || 'None yet'}\n\nNarrator just said: "${transcript}"`,
            },
          ],
        }),
      });

      if (!response.ok) {
        console.error(`Anthropic API error: ${response.status}`);
        return FALLBACK_CLASSIFICATION;
      }

      const data = (await response.json()) as {
        content: Array<{ type: string; text: string }>;
      };
      const text = data.content[0]?.text ?? '';

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return FALLBACK_CLASSIFICATION;
      }

      const parsed = JSON.parse(jsonMatch[0]) as unknown;
      const result = IntentClassificationSchema.safeParse(parsed);

      if (!result.success) {
        return FALLBACK_CLASSIFICATION;
      }

      const durationMs = performance.now() - startTime;
      console.info(
        `[Interpretation] Classified as ${result.data.intent} in ${durationMs.toFixed(0)}ms`,
      );

      return result.data;
    } catch {
      return FALLBACK_CLASSIFICATION;
    }
  };

  return { classify };
}
