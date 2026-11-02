// @ts-check
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  {
    ignores: ['dist/', '.astro/', 'node_modules/', 'coverage/', 'playwright-report/', 'test-results/'],
  },
  tseslint.configs.strict,
  astro.configs.recommended,
);
