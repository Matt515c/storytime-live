import type { ImageGenerationAdapter } from '@/services/image-generation';
import type { InterpretationAdapter } from '@/services/interpretation';
import { IntentType } from '@/services/interpretation';
import type { PromptConstructor } from '@/services/prompt-construction';
import type { SessionStateManager } from '@/services/session-state';
import type { TemplateManager } from '@/services/template-manager';
import { SessionPhase } from '@/types/session';

export interface PipelineConfig {
  interpretationAdapter: InterpretationAdapter;
  imageAdapter: ImageGenerationAdapter;
  promptConstructor: PromptConstructor;
  templateManager: TemplateManager;
  stateManager: SessionStateManager;
  apiKey: string;
  onImageGenerated?: (imageUrl: string) => void;
  onStatusChange?: (status: 'listening' | 'processing' | 'generating') => void;
}

export interface StoryPipeline {
  processTranscript: (transcript: string) => Promise<void>;
  getState: () => ReturnType<SessionStateManager['getState']>;
}

export function createStoryPipeline(config: PipelineConfig): StoryPipeline {
  const {
    interpretationAdapter,
    imageAdapter,
    promptConstructor,
    templateManager,
    stateManager,
    apiKey,
    onImageGenerated,
    onStatusChange,
  } = config;

  const generateImage = async (prompt: string): Promise<string> => {
    onStatusChange?.('generating');
    const state = stateManager.getState();
    const result = await imageAdapter.generate({
      prompt,
      referenceImageUrl: state.currentSceneImage ?? undefined,
      width: 1024,
      height: 1024,
    });
    stateManager.updateScene(result.url);
    stateManager.addToHistory(prompt, result.url);
    onImageGenerated?.(result.url);
    onStatusChange?.('listening');
    return result.url;
  };

  const handleCreativeDirective = async (description: string): Promise<void> => {
    onStatusChange?.('processing');
    const state = stateManager.getState();
    const prompt = await promptConstructor.constructPrompt(description, state);

    if (state.currentPhase === SessionPhase.CHARACTER_CREATION) {
      stateManager.updateCharacter(description);
    } else if (state.currentPhase === SessionPhase.SETTING_ESTABLISHMENT) {
      stateManager.updateSetting(description);
    }

    await generateImage(prompt);

    if (state.currentPhase === SessionPhase.CHARACTER_CREATION) {
      stateManager.updateCharacter('', stateManager.getState().currentSceneImage ?? undefined);
    }
  };

  const handleModificationRequest = async (description: string): Promise<void> => {
    onStatusChange?.('processing');
    const state = stateManager.getState();
    const modDescription = `Modify the current scene: ${description}. Keep the existing character and setting.`;
    const prompt = await promptConstructor.constructPrompt(modDescription, state);

    if (state.currentPhase === SessionPhase.CHARACTER_CREATION) {
      stateManager.updateCharacter(description);
    }

    await generateImage(prompt);
  };

  const handleQuestionToAudience = async (): Promise<void> => {
    const state = stateManager.getState();
    const template = await templateManager.preFabricate(state, apiKey);
    if (template) {
      stateManager.setTemplate(template.prompt, template.placeholderContext);
    }
  };

  const handleAudienceResponseRelay = async (description: string): Promise<void> => {
    const completed = templateManager.complete(description);
    if (completed) {
      stateManager.clearTemplate();
      await generateImage(completed.prompt);
    } else {
      await handleCreativeDirective(description);
    }
  };

  const handleTransition = (targetPhase?: string): void => {
    if (targetPhase === 'SETTING_ESTABLISHMENT') {
      stateManager.updatePhase(SessionPhase.SETTING_ESTABLISHMENT);
    } else if (targetPhase === 'ACTIVE_STORYTELLING') {
      stateManager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
    } else {
      const state = stateManager.getState();
      if (state.currentPhase === SessionPhase.CHARACTER_CREATION) {
        stateManager.updatePhase(SessionPhase.SETTING_ESTABLISHMENT);
      } else if (state.currentPhase === SessionPhase.SETTING_ESTABLISHMENT) {
        stateManager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
      }
    }
  };

  const processTranscript = async (transcript: string): Promise<void> => {
    onStatusChange?.('processing');
    const state = stateManager.getState();
    const classification = await interpretationAdapter.classify(transcript, state);

    switch (classification.intent) {
      case IntentType.CREATIVE_DIRECTIVE:
        await handleCreativeDirective(classification.extractedDescription ?? transcript);
        break;
      case IntentType.MODIFICATION_REQUEST:
        await handleModificationRequest(classification.extractedDescription ?? transcript);
        break;
      case IntentType.QUESTION_TO_AUDIENCE:
        await handleQuestionToAudience();
        onStatusChange?.('listening');
        break;
      case IntentType.AUDIENCE_RESPONSE_RELAY:
        await handleAudienceResponseRelay(classification.extractedDescription ?? transcript);
        break;
      case IntentType.TRANSITION:
        handleTransition(classification.targetPhase);
        onStatusChange?.('listening');
        break;
      case IntentType.CONVERSATION:
        onStatusChange?.('listening');
        break;
    }
  };

  const getState = (): ReturnType<SessionStateManager['getState']> => stateManager.getState();

  return { processTranscript, getState };
}
