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

test.describe('keyboard only', () => {
  /** Presses Tab until the focused element's text or label matches, failing after 40 presses. */
  async function tabTo(page: Page, name: string | RegExp, { backwards = false } = {}) {
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press(backwards ? 'Shift+Tab' : 'Tab');
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return (el?.getAttribute('aria-label') ?? el?.innerText ?? '').trim();
      });
      if (typeof name === 'string' ? label === name || label.endsWith(name) : name.test(label)) return;
    }
    throw new Error(`Could not reach «${name}» with Tab`);
  }

  async function expectVisibleFocus(page: Page) {
    const { outline, element } = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { outline: `${s.outlineStyle} ${s.outlineWidth}`, element: `${el.tagName} «${el.innerText.slice(0, 40)}»` };
    });
    expect(outline, `focus outline on ${element}`).toBe('solid 3px');
  }

  test('the whole quiz can be completed with the keyboard, with visible focus', async ({ page }) => {
    await page.goto('/cuestionario/');
    await expect(page.getByRole('combobox', { name: 'Circunscripción (provincia)' })).toBeVisible();

    await tabTo(page, /Elige una opción/);
    await expectVisibleFocus(page);
    // Type-to-select works on every platform (ArrowDown on a closed <select> opens it on macOS).
    await page.keyboard.type('Madrid');
    await expect(page.getByRole('combobox', { name: 'Circunscripción (provincia)' })).toHaveValue('28');
    await tabTo(page, 'Continuar');
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');

    await expect(page.locator('main h1')).toBeFocused();
    await tabTo(page, 'Más información');
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');
    await expect(page.locator('details.statement__more')).toHaveAttribute('open', '');

    await tabTo(page, 'Importante para mí');
    await page.keyboard.press('Space');
    await expect(page.getByRole('button', { name: 'Importante para mí' })).toHaveAttribute('aria-pressed', 'true');

    for (let i = 0; i < 25; i++) {
      await tabTo(page, i % 2 ? 'De acuerdo' : 'Saltar');
      await expectVisibleFocus(page);
      await page.keyboard.press('Enter');
      // The quiz moves focus to the next step's heading; wait for it before tabbing on.
      await expect(page.locator('main h1')).toHaveText(i < 24 ? new RegExp(`ejemplo ${i + 2} `) : 'Tus resultados');
      await expect(page.locator('main h1')).toBeFocused();
    }

    await expect(page.getByRole('heading', { level: 1, name: 'Tus resultados' })).toBeFocused();
    await tabTo(page, 'Ver el desglose por afirmación');
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');

    await expect(page.getByRole('heading', { level: 1, name: 'Desglose por afirmación' })).toBeFocused();
    await tabTo(page, /^▸?\s*1\. Afirmación de ejemplo 1/);
    await expectVisibleFocus(page);
    await page.keyboard.press('Enter');
    await expect(page.locator('details.breakdown__item').first()).toHaveAttribute('open', '');

    await tabTo(page, /Programa electoral de ejemplo|Declaración pública de ejemplo|Votación de ejemplo|ejemplo \(ficticia\)/);
    await expectVisibleFocus(page);
  });

  test('the skip link moves focus to the main content', async ({ page }) => {
    await page.goto('/metodologia/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
    await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#contenido$/);
    // <main tabindex="-1"> receives focus, so screen readers continue from the content too.
    await expect(page.locator('main')).toBeFocused();
  });
});

test('200 % zoom (640×400): the answer bar does not cover the statement', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 400 });
  await page.goto('/cuestionario/');
  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: 'Madrid' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  for (let i = 0; i < 3; i++) await answer(page, 'De acuerdo'); // a04, the longest statement

  const layout = await page.evaluate(() => {
    const bar = document.querySelector('.answer-bar') as HTMLElement;
    const h1 = document.querySelector('main h1') as HTMLElement;
    return {
      position: getComputedStyle(bar).position,
      statementEnd: h1.getBoundingClientRect().bottom + scrollY,
      barStart: bar.getBoundingClientRect().top + scrollY,
      padding: document.body.style.paddingBottom,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  expect(layout.position).toBe('static');
  expect(layout.barStart).toBeGreaterThan(layout.statementEnd);
  expect(layout.padding).toBe('');
  expect(layout.scrollWidth).toBe(640);
});

test('reflow at 320 px: no horizontal scroll on any page', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const path of ['/', '/cuestionario/', '/partidos/', '/metodologia/', '/privacidad/']) {
    await page.goto(path);
    if (path === '/partidos/') await expect(page.locator('.party-card')).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), path).toBe(320);
  }
});
