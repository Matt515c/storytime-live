import { describe, expect, it } from 'vitest';

import { createInitialSessionState } from '@/types/session';

import { createMockInterpretationAdapter } from './mock.adapter';
import { IntentType } from './types';

describe('createMockInterpretationAdapter', () => {
  const state = createInitialSessionState();

  it('classifies creative directives', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify(
      'Our hero is going to be a big red dragon with wings',
      state,
    );
    expect(result.intent).toBe(IntentType.CREATIVE_DIRECTIVE);
  });

  it('classifies modification requests', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify("Let's make the horn rainbow instead", state);
    expect(result.intent).toBe(IntentType.MODIFICATION_REQUEST);
  });

  it('classifies questions to audience', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify('What does our hero see down below?', state);
    expect(result.intent).toBe(IntentType.QUESTION_TO_AUDIENCE);
  });

  it('classifies audience response relay', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify('Great, you want a pink castle in the clouds!', state);
    expect(result.intent).toBe(IntentType.AUDIENCE_RESPONSE_RELAY);
  });

  it('classifies transitions', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify("Now let's figure out where our hero lives", state);
    expect(result.intent).toBe(IntentType.TRANSITION);
  });

  it('defaults to conversation for unmatched input', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify("That's so cool, guys!", state);
    expect(result.intent).toBe(IntentType.CONVERSATION);
  });

  it('includes extracted description on matched patterns', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify('Our hero is a flying unicorn', state);
    expect(result.extractedDescription).toBe('Our hero is a flying unicorn');
  });

  it('handles ambiguous speech near phase boundaries', async () => {
    const adapter = createMockInterpretationAdapter();
    const result = await adapter.classify("That's so exciting, isn't it?", state);
    expect(result.intent).toBe(IntentType.CONVERSATION);
  });
});
