import { expect, test, type Page } from '@playwright/test';

// Full quiz flow on the fictitious dataset, in the three projects (mobile, tablet, desktop).
// The «skipped and important» case reuses the answer set worked out by hand in
// tests/unit/results.test.ts, so the percentages on screen are checked end to end.

type Answer = 'De acuerdo' | 'Neutral' | 'En desacuerdo' | 'Saltar';

async function start(page: Page, province: string) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Empezar' }).click();
  await expect(page).toHaveURL(/\/cuestionario\/$/);
  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: province });
  await page.getByRole('button', { name: 'Continuar' }).click();
}

async function answer(page: Page, choice: Answer, { important = false } = {}) {
  const heading = page.locator('main h1');
  const before = await heading.textContent();
  if (important) await page.getByRole('button', { name: 'Importante para mí' }).click();
  await page.getByRole('button', { name: choice, exact: true }).click();
  // Wait for the step to change (next statement or results).
  await expect(heading).not.toHaveText(before ?? '');
}

/** Badge text and displayed percentage of every ranked row, in order. */
async function ranking(page: Page) {
  const rows = page.locator('ol .result');
  return rows.evaluateAll((items) =>
    items.map((li) => [
      li.querySelector('.party-badge')?.textContent?.trim(),
      li.querySelector('.result__percent')?.firstChild?.textContent?.replace(/\s+/g, ' ').trim(),
    ]),
  );
}

const insufficient = (page: Page) =>
  page.locator('ul .result .party-badge').evaluateAll((items) => items.map((b) => b.textContent?.trim()));

test.describe('quiz flow', () => {
  test('with a constituency: its ballot, including a coalition', async ({ page }) => {
    await start(page, 'Huesca');
    await expect(page.locator('main h1')).toContainText('Afirmación de ejemplo 1');
    await expect(page.getByText('Afirmación 1 de 25 · Tema: Tema 1')).toBeVisible();
    await expect(page.locator('[aria-live="polite"]')).toHaveText('Afirmación 1 de 25');

    for (let i = 0; i < 25; i++) await answer(page, i % 2 ? 'De acuerdo' : 'En desacuerdo');

    await expect(page.getByRole('heading', { level: 1, name: 'Tus resultados' })).toBeFocused();
    await expect(page.getByText('Esto no es una recomendación de voto.')).toBeVisible();
    await expect(page.getByText('Candidaturas que se presentan en Huesca.')).toBeVisible();

    const badges = [...(await ranking(page)).map(([b]) => b), ...(await insufficient(page))];
    expect(badges.sort()).toEqual(['CFAX', 'PFB', 'PFC', 'PFD', 'PFE', 'PFF']);
    await expect(page.getByText('Incluye a: Partido A (ficticio) y Partido Regional X (ficticio)')).toBeVisible();
  });

  test('without a constituency: only state-wide parties', async ({ page }) => {
    await start(page, 'Prefiero no indicarla');
    for (let i = 0; i < 25; i++) await answer(page, 'Neutral');

    await expect(page.getByText('Partidos que se presentan en toda España')).toBeVisible();
    const badges = [...(await ranking(page)).map(([b]) => b), ...(await insufficient(page))];
    expect(badges.sort()).toEqual(['PFA', 'PFB', 'PFC', 'PFD', 'PFE', 'PFF']);
  });

  test('with skipped and important statements: percentages match the hand calculation', async ({ page }) => {
    await start(page, 'Madrid');
    await answer(page, 'De acuerdo', { important: true }); // a01
    await answer(page, 'De acuerdo'); // a02
    await answer(page, 'En desacuerdo'); // a03
    await answer(page, 'Neutral'); // a04
    await answer(page, 'En desacuerdo'); // a05
    for (let i = 5; i < 25; i++) await answer(page, 'Saltar');

    expect(await ranking(page)).toEqual([
      ['PFB', '100 %'],
      ['PFE', '90 %'],
      ['PFA', '58 %'],
      ['PFC', '50 %'],
      ['PFD', '42 %'],
    ]);
    expect(await insufficient(page)).toEqual(['PFF']);
    await expect(page.getByText('Calculado sobre 4 de 5 afirmaciones.')).toBeVisible();
    await expect(page.getByText('Posición conocida en 2 de 5 afirmaciones.')).toBeVisible();
  });

  test('going back keeps answers and the important mark; restarting clears them', async ({ page }) => {
    await start(page, 'Madrid');
    await answer(page, 'De acuerdo', { important: true });
    await page.getByRole('button', { name: 'Anterior' }).click();

    await expect(page.getByRole('button', { name: 'De acuerdo', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Importante para mí' })).toHaveAttribute('aria-pressed', 'true');

    for (let i = 0; i < 25; i++) await answer(page, 'Saltar');
    await page.getByRole('button', { name: 'Volver a empezar' }).click();
    await expect(page.getByRole('heading', { level: 1, name: '¿Dónde votas?' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Circunscripción (provincia)' })).toHaveValue('');
  });

  test('nothing is stored and the URL never carries answers', async ({ page, context }) => {
    await start(page, 'Madrid');
    for (let i = 0; i < 25; i++) await answer(page, 'De acuerdo');

    expect(page.url()).toMatch(/\/cuestionario\/$/);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  });
});
