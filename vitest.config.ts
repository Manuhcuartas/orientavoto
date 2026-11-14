import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Unit tests always run against the fictitious fixtures, never the real content in data/.
    alias: { '@data': fileURLToPath(new URL('tests/fixtures/data', import.meta.url)) },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
