import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// Automatic accessibility check (axe) on every page and every quiz step, WCAG 2.1 A/AA.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
  expect(summary).toEqual([]);
}

async function answer(page: Page, name: string, important = false) {
  const heading = page.locator('main h1');
  const before = await heading.textContent();
  if (important) await page.getByRole('button', { name: 'Importante para mí' }).click();
  await page.getByRole('button', { name, exact: true }).click();
  await expect(heading).not.toHaveText(before ?? '');
}

for (const path of ['/', '/partidos/', '/metodologia/', '/privacidad/']) {
  test(`page ${path}`, async ({ page }) => {
    await page.goto(path);
    if (path === '/partidos/') await expect(page.locator('.party-card')).toHaveCount(8);
    await expectNoViolations(page);
  });
}

test('every quiz step', async ({ page }) => {
  await page.goto('/cuestionario/');
  await expect(page.getByRole('combobox', { name: 'Circunscripción (provincia)' })).toBeVisible();
  await expectNoViolations(page); // province step

  await page.getByRole('button', { name: 'Continuar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expectNoViolations(page); // province step with the error

  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: 'Huesca' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('button', { name: 'Importante para mí' }).click();
  await page.locator('details.statement__more summary').click();
  await expectNoViolations(page); // statement with explanation open and «important» on

  await answer(page, 'De acuerdo');
  await page.getByRole('button', { name: 'Anterior' }).click();
  await expectNoViolations(page); // coming back: chosen answer marked

  for (let i = 0; i < 25; i++) await answer(page, ['De acuerdo', 'Neutral', 'En desacuerdo', 'Saltar'][i % 4] ?? 'Saltar');
  await expectNoViolations(page); // results (with low-coverage warning and insufficient block)

  await page.getByRole('button', { name: 'Ver el desglose por afirmación' }).click();
  await page.locator('details.breakdown__item').evaluateAll((ds) => ds.forEach((d) => ((d as HTMLDetailsElement).open = true)));
  await expectNoViolations(page); // breakdown, every statement open
});

test('results with everything skipped', async ({ page }) => {
  await page.goto('/cuestionario/');
  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: 'Prefiero no indicarla' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (let i = 0; i < 25; i++) await answer(page, 'Saltar');
  await expectNoViolations(page);
});
