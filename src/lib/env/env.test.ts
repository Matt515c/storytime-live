import { afterEach, describe, expect, it, vi } from 'vitest';

import { validateClientEnv, validateServerEnv } from './env';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('validateServerEnv', () => {
  it('validates with all required keys present', () => {
    vi.stubEnv('ELEVENLABS_API_KEY', 'el-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'ant-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8-token');

    const env = validateServerEnv();
    expect(env.ELEVENLABS_API_KEY).toBe('el-key');
    expect(env.ANTHROPIC_API_KEY).toBe('ant-key');
    expect(env.REPLICATE_API_TOKEN).toBe('r8-token');
  });

  it('throws when required keys are missing', () => {
    vi.stubEnv('ELEVENLABS_API_KEY', '');
    vi.stubEnv('ANTHROPIC_API_KEY', '');
    vi.stubEnv('REPLICATE_API_TOKEN', '');

    expect(() => validateServerEnv()).toThrow('Missing or invalid environment variables');
  });

  it('allows optional legacy keys to be absent', () => {
    vi.stubEnv('ELEVENLABS_API_KEY', 'el-key');
    vi.stubEnv('ANTHROPIC_API_KEY', 'ant-key');
    vi.stubEnv('REPLICATE_API_TOKEN', 'r8-token');

    const env = validateServerEnv();
    expect(env.DEEPGRAM_API_KEY).toBeUndefined();
    expect(env.FAL_API_KEY).toBeUndefined();
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
