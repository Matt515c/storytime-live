import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,mts,js,mjs}',
        '.next/',
        'next-env.d.ts',
        'postcss.config.mjs',
      ],
    },
  },
});
