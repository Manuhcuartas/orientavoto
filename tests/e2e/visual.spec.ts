import { expect, test, type Page } from '@playwright/test';

// Visual regression for every page and quiz step, in the three projects.
// Randomness is made deterministic by replacing crypto.getRandomValues with a
// seeded PRNG, so shuffled lists and tie order are the same on every run.
// Baselines are per platform (`-darwin`, `-linux`): fonts differ between macOS and CI.

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let s = 2026;
    const next = () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (t ^ (t >>> 14)) >>> 0;
    };
    crypto.getRandomValues = <T extends ArrayBufferView | null>(array: T): T => {
      if (array instanceof Uint32Array) for (let i = 0; i < array.length; i++) array[i] = next();
      else if (array) new Uint8Array(array.buffer).forEach((_, i, a) => (a[i] = next() & 0xff));
      return array;
    };
  });
});

const shot = (page: Page, name: string) => expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true, animations: 'disabled' });

async function startQuiz(page: Page) {
  await page.goto('/cuestionario/');
  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: 'Madrid' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByText('Afirmación 1 de 25 · Tema: Tema 1')).toBeVisible();
}

/** The answer set worked out by hand in tests/unit/results.test.ts. */
async function answerFixedSet(page: Page) {
  const heading = page.locator('main h1');
  const answer = async (name: string, important = false) => {
    const before = await heading.textContent();
    if (important) await page.getByRole('button', { name: 'Importante para mí' }).click();
    await page.getByRole('button', { name, exact: true }).click();
    await expect(heading).not.toHaveText(before ?? '');
  };
  await answer('De acuerdo', true);
  await answer('De acuerdo');
  await answer('En desacuerdo');
  await answer('Neutral');
  await answer('En desacuerdo');
  for (let i = 5; i < 25; i++) await answer('Saltar');
  await expect(page.getByRole('heading', { level: 1, name: 'Tus resultados' })).toBeVisible();
}

test.describe('visual', () => {
  test('home', async ({ page }) => {
    await page.goto('/');
    await shot(page, 'inicio');
  });

  test('province step', async ({ page }) => {
    await page.goto('/cuestionario/');
    await expect(page.getByRole('combobox', { name: 'Circunscripción (provincia)' })).toBeVisible();
    await shot(page, 'provincia');
  });

  test('first statement', async ({ page }) => {
    await startQuiz(page);
    await shot(page, 'afirmacion-1');
  });

  test('results', async ({ page }) => {
    await startQuiz(page);
    await answerFixedSet(page);
    await shot(page, 'resultados');
  });

  test('breakdown', async ({ page }) => {
    await startQuiz(page);
    await answerFixedSet(page);
    await page.getByRole('button', { name: 'Ver el desglose por afirmación' }).click();
    await page.locator('details.breakdown__item').first().locator('summary').click();
    await shot(page, 'desglose');
  });

  test('party list', async ({ page }) => {
    await page.goto('/partidos/');
    await expect(page.locator('.party-card')).toHaveCount(8);
    await shot(page, 'partidos');
  });

  test('methodology', async ({ page }) => {
    await page.goto('/metodologia/');
    await shot(page, 'metodologia');
  });

  test('privacy', async ({ page }) => {
    await page.goto('/privacidad/');
    await shot(page, 'privacidad');
  });
});
