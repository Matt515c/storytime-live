import type { SessionState } from '@/types/session';

import type { InterpretationAdapter } from './interpretation.interface';
import { IntentType } from './types';
import type { IntentClassification } from './types';

interface MockPattern {
  pattern: RegExp;
  classification: IntentClassification;
}

const DEFAULT_PATTERNS: MockPattern[] = [
  {
    pattern: /our hero is|the character is|going to be a/i,
    classification: {
      intent: IntentType.CREATIVE_DIRECTIVE,
      confidence: 0.95,
      reasoning: 'Character description detected',
    },
  },
  {
    pattern: /make the|change the|let's give|instead/i,
    classification: {
      intent: IntentType.MODIFICATION_REQUEST,
      confidence: 0.9,
      reasoning: 'Modification request detected',
    },
  },
  {
    pattern: /what does|what should|what color|what kind/i,
    classification: {
      intent: IntentType.QUESTION_TO_AUDIENCE,
      confidence: 0.95,
      reasoning: 'Question to audience detected',
    },
  },
  {
    pattern: /great.*you want|okay.*so|you said/i,
    classification: {
      intent: IntentType.AUDIENCE_RESPONSE_RELAY,
      confidence: 0.9,
      reasoning: 'Audience response relay detected',
    },
  },
  {
    pattern: /now let's|let's figure out where|now.*begin|ready.*adventure/i,
    classification: {
      intent: IntentType.TRANSITION,
      confidence: 0.9,
      reasoning: 'Phase transition detected',
    },
  },
];

export function createMockInterpretationAdapter(
  customPatterns?: MockPattern[],
): InterpretationAdapter {
  const patterns = customPatterns ?? DEFAULT_PATTERNS;

  const classify = async (
    transcript: string,
    _sessionState: SessionState,
  ): Promise<IntentClassification> => {
    for (const { pattern, classification } of patterns) {
      if (pattern.test(transcript)) {
        const extractedDescription = transcript;
        return { ...classification, extractedDescription };
      }
    }

    return {
      intent: IntentType.CONVERSATION,
      confidence: 0.8,
      reasoning: 'No actionable pattern matched',
    };
  };

  return { classify };
}
