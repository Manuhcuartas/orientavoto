import { expect, test, type Page } from '@playwright/test';
import { scoreEntity } from '../../src/lib/affinity';

// Static information pages: no JS, correct heading hierarchy.

async function headingLevels(page: Page) {
  return page.locator('main :is(h1, h2, h3, h4, h5, h6)').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
}

function expectValidHierarchy(levels: number[]) {
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  for (let i = 1; i < levels.length; i++) expect(levels[i] ?? 0).toBeLessThanOrEqual((levels[i - 1] ?? 0) + 1);
}

test.describe('methodology', () => {
  test('sends no JS and has a valid heading hierarchy', async ({ page, request }) => {
    const html = await (await request.get('/metodologia/')).text();
    expect(html).not.toMatch(/<script/i);

    await page.goto('/metodologia/');
    expectValidHierarchy(await headingLevels(page));
  });

  test('the points table follows the formula', async ({ page }) => {
    await page.goto('/metodologia/');
    const cells = await page.locator('table').first().locator('tbody tr').evaluateAll((rows) =>
      rows.map((r) => [...r.querySelectorAll('td')].map((td) => td.textContent?.trim())),
    );
    expect(cells).toEqual([
      ['2', '1', '0'],
      ['1', '2', '1'],
      ['0', '1', '2'],
    ]);
  });

  test('the worked example matches affinity.ts', async ({ page }) => {
    const answers = {
      e1: { value: 1, important: true },
      e2: { value: 0, important: false },
      e3: { value: -1, important: false },
      e4: { value: null, important: false },
    } as const;
    const one = scoreEntity(answers, {
      e1: { posicion: 'a_favor' },
      e2: { posicion: 'en_contra' },
      e3: { posicion: 'en_contra' },
      e4: { posicion: 'a_favor' },
    });
    const two = scoreEntity(answers, { e1: { posicion: 'en_contra' }, e2: { posicion: 'neutral' }, e4: { posicion: 'a_favor' } });

    await page.goto('/metodologia/');
    const text = (await page.locator('main').textContent()) ?? '';
    expect(text).toContain(
      `Candidatura de ejemplo 1: ${one.points} de ${one.max} puntos = ${Math.round(one.percent ?? 0)}\u00a0% (calculado sobre 3 de 3 afirmaciones).`,
    );
    expect(text).toContain(
      `Candidatura de ejemplo 2: ${two.points} de ${two.max} puntos = ${Math.round(two.percent ?? 0)}\u00a0% (calculado sobre 2 de 3 afirmaciones).`,
    );
    // Hand check of the same numbers: 7/8 → 88 %, 2/6 → 33 %.
    expect([one.points, one.max, two.points, two.max]).toEqual([7, 8, 2, 6]);
  });

  test('thresholds come from data/meta.json', async ({ page }) => {
    await page.goto('/metodologia/');
    await expect(page.getByText('menos del 75\u00a0% de las afirmaciones que respondiste')).toBeVisible();
    await expect(page.getByText('Si es menos del 50\u00a0%')).toBeVisible();
    await expect(page.getByText('Si respondes menos de 5 afirmaciones')).toBeVisible();
  });
});

test('home sends no JS and has a valid heading hierarchy', async ({ page, request }) => {
  expect(await (await request.get('/')).text()).not.toMatch(/<script/i);
  await page.goto('/');
  expectValidHierarchy(await headingLevels(page));
});

test('unknown URLs get a 404 page, not the home page', async ({ page }) => {
  const response = await page.goto('/no-existe/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Página no encontrada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
});
