import { z } from 'zod/v4';

const ServerEnvSchema = z.object({
  DEEPGRAM_API_KEY: z.string().min(1, 'DEEPGRAM_API_KEY is required'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  FAL_API_KEY: z.string().min(1, 'FAL_API_KEY is required'),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export function validateServerEnv(): ServerEnv {
  const result = ServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Missing or invalid environment variables:\n${errors}`);
  }
  return result.data;
}

export function validateClientEnv(): ClientEnv {
  const result = ClientEnvSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
  if (!result.success) {
    console.warn('Client environment validation warnings:', result.error.issues);
    return { NEXT_PUBLIC_APP_URL: undefined };
  }
  return result.data;
}
