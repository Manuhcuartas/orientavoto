import { expect, test, type Page } from '@playwright/test';
import { openQuiz } from './helpers';

// Neutrality guarantees that can be checked automatically (docs/NEUTRALIDAD.md).

async function results(page: Page, province: string) {
  await openQuiz(page);
  await page.getByRole('combobox', { name: 'Circunscripción (provincia)' }).selectOption({ label: province });
  await page.getByRole('button', { name: 'Continuar' }).click();
  const heading = page.locator('main h1');
  for (let i = 0; i < 25; i++) {
    const before = await heading.textContent();
    await page.getByRole('button', { name: ['De acuerdo', 'Neutral', 'En desacuerdo'][i % 3] ?? 'Neutral', exact: true }).click();
    await expect(heading).not.toHaveText(before ?? '');
  }
}

test('no party is rendered in the prerendered HTML of any page', async ({ request }) => {
  for (const path of ['/', '/cuestionario/', '/partidos/', '/metodologia/', '/privacidad/']) {
    const html = await (await request.get(path)).text();
    // Island props carry data, not a rendered list: drop them before looking for party names.
    const markup = html.replace(/\sprops="[^"]*"/g, '');
    expect(markup, path).not.toMatch(/Partido [A-F] \(ficticio\)|Partido Regional [XY]|Coalición de ejemplo/);
  }
});

test('the first place has exactly the same styles as the others (only the bar length differs)', async ({ page }) => {
  await results(page, 'Huesca');
  const rows = await page.locator('ol .result').evaluateAll((items) =>
    items.map((li) => {
      // Height is left out: rows differ only by content («Incluye a…», coverage warning).
      const pick = (el: Element | null) => {
        if (!el) return 'missing';
        const s = getComputedStyle(el);
        return [s.fontSize, s.fontWeight, s.fontFamily, s.color, s.backgroundColor, s.borderTopWidth, s.borderTopColor, s.paddingTop].join(',');
      };
      return [
        li.className,
        pick(li),
        pick(li.querySelector('.party-badge')),
        pick(li.querySelector('.result__name')),
        pick(li.querySelector('.result__percent')),
        pick(li.querySelector('.result__bar')),
        getComputedStyle(li.querySelector('.result__bar') as Element).height,
        getComputedStyle(li.querySelector('.result__bar-fill') as Element).backgroundColor,
      ].join('|');
    }),
  );
  expect(rows.length).toBeGreaterThan(1);
  expect(new Set(rows).size).toBe(1);
});

test('the party colour appears only as the small mark next to the acronym', async ({ page }) => {
  await results(page, 'Madrid');
  const colouredElements = await page.locator('main *').evaluateAll((els) =>
    els
      .filter((el) => {
        const bg = getComputedStyle(el).backgroundColor;
        // Monochrome tokens are greys (r = g = b) or transparent.
        const m = /rgba?\((\d+), (\d+), (\d+)/.exec(bg);
        return m && !(m[1] === m[2] && m[2] === m[3]);
      })
      .map((el) => el.className),
  );
  expect(new Set(colouredElements)).toEqual(new Set(['party-badge__mark']));
});
