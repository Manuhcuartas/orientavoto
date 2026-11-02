import { expect, test } from '@playwright/test';

// Party list: client-only island, shuffled per visit, identical cards.

const badges = (page: import('@playwright/test').Page) => page.locator('.party-card .party-badge').allTextContents();

test.describe('party list', () => {
  test('the HTML has no party order; the island lists every party', async ({ page, request }) => {
    const html = await (await request.get('/partidos/')).text();
    expect(html).not.toContain('party-card');
    expect(html).toContain('<noscript>');

    await page.goto('/partidos/');
    await expect(page.locator('.party-card')).toHaveCount(8);
    expect((await badges(page)).sort()).toEqual(['PFA', 'PFB', 'PFC', 'PFD', 'PFE', 'PFF', 'PRFX', 'PRFY']);
  });

  test('order changes between visits (at least 2 orders in 5 loads)', async ({ page }) => {
    const orders = new Set<string>();
    for (let i = 0; i < 5; i++) {
      await page.goto('/partidos/');
      await expect(page.locator('.party-card')).toHaveCount(8);
      orders.add((await badges(page)).join(','));
    }
    expect(orders.size).toBeGreaterThanOrEqual(2);
  });

  test('where each party runs, alone and in coalition', async ({ page }) => {
    await page.goto('/partidos/');
    const card = (siglas: string) => page.locator('.party-card', { has: page.locator('.party-badge', { hasText: siglas }) });
    await expect(card('PFD')).toContainText('Se presenta en solitario en todas las circunscripciones salvo Ceuta y Melilla.');
    await expect(card('PFC')).toContainText('Se presenta en solitario en las 52 circunscripciones.');
    await expect(card('PRFX')).toContainText('No se presenta en solitario.');
    await expect(card('PRFX')).toContainText('En coalición como «Coalición de ejemplo A + X (ficticia)» (CFAX) en Huesca, Teruel y Zaragoza.');
    await expect(card('PRFX')).toContainText('Ámbito autonómico');
  });

  test('filtering by constituency keeps parties that run there alone or in coalition', async ({ page }) => {
    await page.goto('/partidos/');
    await page.getByRole('combobox', { name: 'Filtrar por circunscripción' }).selectOption({ label: 'Huesca' });
    await expect(page.getByText('7 partidos se presentan en Huesca, solos o en coalición.')).toBeVisible();
    expect((await badges(page)).sort()).toEqual(['PFA', 'PFB', 'PFC', 'PFD', 'PFE', 'PFF', 'PRFX']);

    await page.getByRole('combobox', { name: 'Filtrar por circunscripción' }).selectOption({ label: 'Ceuta' });
    expect(await badges(page)).not.toContain('PFD');
  });

  test('every card has the same structure and style', async ({ page }) => {
    await page.goto('/partidos/');
    const styles = await page.locator('.party-card').evaluateAll((cards) =>
      cards.map((c) => {
        const s = getComputedStyle(c);
        const badge = getComputedStyle(c.querySelector('.party-badge') as Element);
        return [c.className, s.borderColor, s.padding, s.backgroundColor, badge.fontSize, badge.fontWeight].join('|');
      }),
    );
    expect(new Set(styles).size).toBe(1);
  });
});
