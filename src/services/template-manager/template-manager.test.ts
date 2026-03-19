import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createInitialSessionState } from '@/types/session';

import { createMockTemplateManager, createTemplateManager } from './template-manager';

describe('createMockTemplateManager', () => {
  it('pre-fabricates a template with placeholder', async () => {
    const manager = createMockTemplateManager();
    const template = await manager.preFabricate(createInitialSessionState(), '');
    expect(template).not.toBeNull();
    expect(template!.prompt).toContain('[PLACEHOLDER]');
    expect(template!.placeholderContext).toBeTruthy();
  });

  it('completes template via text replacement', async () => {
    const manager = createMockTemplateManager();
    await manager.preFabricate(createInitialSessionState(), '');
    const completed = manager.complete('a big pink castle');
    expect(completed).not.toBeNull();
    expect(completed!.prompt).toContain('a big pink castle');
    expect(completed!.prompt).not.toContain('[PLACEHOLDER]');
  });

  it('completion does NOT make an LLM call', async () => {
    const manager = createMockTemplateManager();
    await manager.preFabricate(createInitialSessionState(), '');

    const startTime = performance.now();
    const completed = manager.complete('a pink castle');
    const durationMs = performance.now() - startTime;

    expect(completed).not.toBeNull();
    expect(durationMs).toBeLessThan(10);
  });

  it('returns null on complete when no template active', () => {
    const manager = createMockTemplateManager();
    const result = manager.complete('test');
    expect(result).toBeNull();
  });

  it('clears active template after completion', async () => {
    const manager = createMockTemplateManager();
    await manager.preFabricate(createInitialSessionState(), '');
    manager.complete('test');
    expect(manager.getActive()).toBeNull();
  });

  it('replaces template when new question arrives before answer', async () => {
    const manager = createMockTemplateManager();
    await manager.preFabricate(createInitialSessionState(), '');
    const first = manager.getActive();

    await manager.preFabricate(createInitialSessionState(), '');
    const second = manager.getActive();

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
  });

  it('clear removes active template', async () => {
    const manager = createMockTemplateManager();
    await manager.preFabricate(createInitialSessionState(), '');
    expect(manager.getActive()).not.toBeNull();
    manager.clear();
    expect(manager.getActive()).toBeNull();
  });
});

describe('createTemplateManager', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn(() => 0) });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('pre-fabricates via API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                template:
                  'Hero looking at [PLACEHOLDER] in a cloud kingdom. Storybook illustration.',
                placeholderContext: 'what the hero sees',
              }),
            },
          ],
        }),
      }),
    );

    const manager = createTemplateManager();
    const result = await manager.preFabricate(createInitialSessionState(), 'key');
    expect(result).not.toBeNull();
    expect(result!.prompt).toContain('[PLACEHOLDER]');
  });

  it('returns null on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const manager = createTemplateManager();
    const result = await manager.preFabricate(createInitialSessionState(), 'key');
    expect(result).toBeNull();
  });

  it('returns null when template missing placeholder', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                template: 'Hero looking at something. Storybook illustration.',
                placeholderContext: 'what the hero sees',
              }),
            },
          ],
        }),
      }),
    );

    const manager = createTemplateManager();
    const result = await manager.preFabricate(createInitialSessionState(), 'key');
    expect(result).toBeNull();
  });
});
