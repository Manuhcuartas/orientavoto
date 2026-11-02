import type { Page } from '@playwright/test';

/** Opens the quiz and waits until the island is hydrated (interactive), not just rendered. */
export async function openQuiz(page: Page) {
  await page.goto('/cuestionario/');
  await page.waitForFunction(() => document.querySelector('astro-island') && !document.querySelector('astro-island[ssr]'));
}
