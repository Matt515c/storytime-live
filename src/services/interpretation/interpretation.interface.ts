import type { SessionState } from '@/types/session';

import type { IntentClassification } from './types';

export interface InterpretationAdapter {
  classify: (transcript: string, sessionState: SessionState) => Promise<IntentClassification>;
}
