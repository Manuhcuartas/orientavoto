import { expect, test, type Page } from '@playwright/test';
import { openQuiz } from './helpers';

// Privacy guarantees, checked on the production build:
// no network requests after the initial load, no cookies or storage, no CSP violations.

type Answer = 'De acuerdo' | 'Neutral' | 'En desacuerdo' | 'Saltar';

/** Collects CSP violations (event + console) from the start of every page. */
async function watchCsp(page: Page) {
  const violations: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  page.on('console', (msg) => {
    if (/Content Security Policy|Refused to/i.test(msg.text())) violations.push(msg.text());
  });
  return async () => [...violations, ...(await page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []))];
}

async function answer(page: Page, choice: Answer, important = false) {
  const heading = page.locator('main h1');
  const before = await heading.textContent();
  if (important) await page.getByRole('button', { name: 'Importante para mí' }).click();
  await page.getByRole('button', { name: choice, exact: true }).click();
  await expect(heading).not.toHaveText(before ?? '');
}

test('the full flow makes no network requests after the initial load and stores nothing', async ({ page, context }) => {
  const cspViolations = await watchCsp(page);
  await openQuiz(page);
  await page.waitForLoadState('networkidle');

  const requests: string[] = [];
  page.on('request', (r) => requests.push(`${r.method()} ${r.url()}`));

  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: 'Huesca' });
  await page.getByRole('button', { name: 'Continuar' }).click();
  const cycle: Answer[] = ['De acuerdo', 'Neutral', 'En desacuerdo', 'Saltar'];
  for (let i = 0; i < 25; i++) await answer(page, cycle[i % cycle.length] ?? 'Saltar', i === 0);
  await page.getByRole('button', { name: 'Ver el desglose por afirmación' }).click();
  await page.locator('details.breakdown__item').first().locator('summary').click();
  await page.getByRole('button', { name: 'Volver a los resultados' }).first().click();
  await page.getByRole('button', { name: 'Volver a empezar' }).click();

  expect(requests).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).toBe('');
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  expect(await page.evaluate(async () => (await indexedDB.databases()).length)).toBe(0);
  expect(await cspViolations()).toEqual([]);
});

test('the CSP blocks any attempt to send data', async ({ page }) => {
  await openQuiz(page);
  const blocked = await page.evaluate(async () => {
    try {
      await fetch('/cualquier-cosa', { method: 'POST', body: 'x' });
      return false;
    } catch {
      return true;
    }
  });
  expect(blocked).toBe(true);
});

for (const path of ['/', '/cuestionario/', '/partidos/', '/metodologia/', '/privacidad/']) {
  test(`${path} has a CSP with connect-src 'none' and no violations`, async ({ page, request }) => {
    const cspViolations = await watchCsp(page);
    const html = await (await request.get(path)).text();
    const meta = /<meta http-equiv="content-security-policy" content="([^"]+)"/i.exec(html)?.[1] ?? '';
    for (const directive of ["default-src 'self'", "connect-src 'none'", "object-src 'none'", "base-uri 'none'", "form-action 'none'"]) {
      expect(meta).toContain(directive);
    }
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(await cspViolations()).toEqual([]);
  });
}

test('privacy page is a draft marked for legal review, without JS', async ({ page, request }) => {
  expect(await (await request.get('/privacidad/')).text()).not.toMatch(/<script/i);
  await page.goto('/privacidad/');
  await expect(page.getByText('[REVISIÓN LEGAL PENDIENTE]')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacidad' })).toBeVisible();
});
