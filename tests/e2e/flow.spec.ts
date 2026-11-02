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

test.describe('breakdown', () => {
  async function openBreakdown(page: Page, province: string) {
    await start(page, province);
    for (let i = 0; i < 25; i++) await answer(page, i === 2 ? 'Saltar' : 'De acuerdo', { important: i === 0 });
    await page.getByRole('button', { name: 'Ver el desglose por afirmación' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Desglose por afirmación' })).toBeFocused();
  }

  test('shows the answer, every party with stance, justification and safe source links', async ({ page }) => {
    await openBreakdown(page, 'Huesca');
    const items = page.locator('details.breakdown__item');
    await expect(items).toHaveCount(25);

    const first = items.nth(0);
    await first.locator('summary').click();
    await expect(first.getByText('Tu respuesta: De acuerdo · ★ Importante para ti')).toBeVisible();
    await expect(first.locator('.breakdown__entity')).toHaveCount(6);
    await expect(first.locator('.breakdown__stance').first()).toHaveText(/^(✓|=|✗|\?)(A favor|Neutral|En contra|Sin posición conocida)$/);

    await expect(items.nth(2).locator('summary')).toContainText('Tu respuesta: Saltada');

    // a03 is overridden by the coalition; a01 is inherited from partido-a.
    await items.nth(2).locator('summary').click();
    const coalitionOn = (item: number) => items.nth(item).locator('.breakdown__entity', { hasText: 'CFAX' });
    await expect(coalitionOn(2)).toContainText('Posición propia de la coalición.');
    await expect(coalitionOn(0)).toContainText('Posición heredada de Partido A (ficticio).');

    for (let i = 0; i < 25; i++) await items.nth(i).evaluate((d) => ((d as HTMLDetailsElement).open = true));
    const links = await page.locator('.sources a').evaluateAll((as) =>
      as.map((a) => ({ href: a.getAttribute('href'), rel: a.getAttribute('rel'), target: a.getAttribute('target'), sr: a.querySelector('.visually-hidden')?.textContent })),
    );
    expect(links.length).toBeGreaterThan(100);
    for (const link of links) {
      expect(link.href).toMatch(/^https:\/\//);
      expect(link.rel).toBe('noopener noreferrer');
      expect(link.target).toBe('_blank');
      expect(link.sr).toContain('(se abre en otra pestaña)');
    }
  });

  test('party order is shuffled per visit (at least 2 orders in 5 loads)', async ({ page }) => {
    const orders = new Set<string>();
    for (let visit = 0; visit < 5; visit++) {
      await openBreakdown(page, 'Madrid');
      const first = page.locator('details.breakdown__item').first();
      await first.locator('summary').click();
      const order = await first.locator('.party-badge').allTextContents();
      // Same order in every statement within the visit.
      const last = page.locator('details.breakdown__item').last();
      await last.locator('summary').click();
      expect(await last.locator('.party-badge').allTextContents()).toEqual(order);
      orders.add(order.join(','));
    }
    expect(orders.size).toBeGreaterThanOrEqual(2);
  });

  test('no horizontal scroll at 320 px with every statement open', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await openBreakdown(page, 'Huesca');
    await page.locator('details.breakdown__item').evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)));
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  });
});
