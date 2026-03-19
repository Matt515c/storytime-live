import { afterEach, describe, expect, it, vi } from 'vitest';

import { validateClientEnv, validateServerEnv } from './env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('validateServerEnv', () => {
  it('validates with all keys present', () => {
    vi.stubEnv('DEEPGRAM_API_KEY', 'dg-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'ant-key');
    vi.stubEnv('FAL_API_KEY', 'fal-key');

    const env = validateServerEnv();
    expect(env.DEEPGRAM_API_KEY).toBe('dg-key');
    expect(env.ANTHROPIC_API_KEY).toBe('ant-key');
    expect(env.FAL_API_KEY).toBe('fal-key');
  });

  it('throws when keys are missing', () => {
    vi.stubEnv('DEEPGRAM_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('FAL_API_KEY', '');

    expect(() => validateServerEnv()).toThrow('Missing or invalid environment variables');
  });
});

describe('validateClientEnv', () => {
  it('validates with URL present', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://example.com');
    const env = validateClientEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBe('https://example.com');
  });

  it('returns undefined for missing optional URL', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    const env = validateClientEnv();
    expect(env.NEXT_PUBLIC_APP_URL).toBeUndefined();
  });
});
