import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // E2Eテストを除外
    exclude: ['**/tests/e2e/**', '**/node_modules/**'],
  },
});
