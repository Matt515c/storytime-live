import { describe, expect, it } from 'vitest';

import { SessionPhase } from '@/types/session';

import { createSessionStateManager } from './session-state';

describe('createSessionStateManager', () => {
  it('initializes with default state', () => {
    const manager = createSessionStateManager();
    const state = manager.getState();
    expect(state.currentPhase).toBe(SessionPhase.CHARACTER_CREATION);
    expect(state.sessionStatus).toBe('idle');
    expect(state.characterDescription).toBe('');
    expect(state.currentSceneImage).toBeNull();
  });

  it('updates phase correctly', () => {
    const manager = createSessionStateManager();
    manager.updatePhase(SessionPhase.SETTING_ESTABLISHMENT);
    expect(manager.getState().currentPhase).toBe(SessionPhase.SETTING_ESTABLISHMENT);

    manager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
    expect(manager.getState().currentPhase).toBe(SessionPhase.ACTIVE_STORYTELLING);
  });

  it('accumulates character description on refinement', () => {
    const manager = createSessionStateManager();
    manager.updateCharacter('a red dragon');
    expect(manager.getState().characterDescription).toBe('a red dragon');

    manager.updateCharacter('with a rainbow horn');
    expect(manager.getState().characterDescription).toBe('a red dragon; with a rainbow horn');
  });

  it('stores character reference image', () => {
    const manager = createSessionStateManager();
    manager.updateCharacter('a red dragon', 'https://image.test/dragon.png');
    expect(manager.getState().characterReferenceImage).toBe('https://image.test/dragon.png');
  });

  it('accumulates setting description', () => {
    const manager = createSessionStateManager();
    manager.updateSetting('a cloud kingdom');
    manager.updateSetting('with floating islands');
    expect(manager.getState().settingDescription).toBe('a cloud kingdom; with floating islands');
  });

  it('updates scene image', () => {
    const manager = createSessionStateManager();
    manager.updateScene('https://scene1.png');
    expect(manager.getState().currentSceneImage).toBe('https://scene1.png');

    manager.updateScene('https://scene2.png');
    expect(manager.getState().currentSceneImage).toBe('https://scene2.png');
  });

  it('manages template lifecycle (set → complete → clear)', () => {
    const manager = createSessionStateManager();

    manager.setTemplate('Hero sees [PLACEHOLDER]', 'what the hero sees');
    expect(manager.getState().activeTemplate).toBe('Hero sees [PLACEHOLDER]');
    expect(manager.getState().placeholderContext).toBe('what the hero sees');

    manager.clearTemplate();
    expect(manager.getState().activeTemplate).toBeNull();
    expect(manager.getState().placeholderContext).toBeNull();
  });

  it('maintains reference image chain', () => {
    const manager = createSessionStateManager();

    manager.updateCharacter('dragon', 'https://char.png');
    expect(manager.getState().characterReferenceImage).toBe('https://char.png');

    manager.updateScene('https://setting.png');
    expect(manager.getState().currentSceneImage).toBe('https://setting.png');

    manager.updateScene('https://scene1.png');
    expect(manager.getState().currentSceneImage).toBe('https://scene1.png');
  });

  it('adds to generation history', () => {
    const manager = createSessionStateManager();
    manager.addToHistory('prompt 1', 'https://img1.png');
    manager.addToHistory('prompt 2', 'https://img2.png');
    expect(manager.getState().generationHistory).toHaveLength(2);
    expect(manager.getState().generationHistory[0].prompt).toBe('prompt 1');
  });

  it('resets to initial state', () => {
    const manager = createSessionStateManager();
    manager.updatePhase(SessionPhase.ACTIVE_STORYTELLING);
    manager.updateCharacter('dragon');
    manager.updateScene('https://scene.png');

    manager.reset();
    const state = manager.getState();
    expect(state.currentPhase).toBe(SessionPhase.CHARACTER_CREATION);
    expect(state.characterDescription).toBe('');
    expect(state.currentSceneImage).toBeNull();
  });

  it('updates status', () => {
    const manager = createSessionStateManager();
    manager.updateStatus('listening');
    expect(manager.getState().sessionStatus).toBe('listening');
  });

  it('updates story context', () => {
    const manager = createSessionStateManager();
    manager.updateStoryContext('The hero found a treasure');
    expect(manager.getState().storyContext).toBe('The hero found a treasure');
  });
});
