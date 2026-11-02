/**
 * Performance budget per page of dist/ (run after `npm run build`):
 *   - JS:        ≤ 50 KB gzip (every script the page loads, following imports between chunks)
 *   - HTML + CSS: ≤ 40 KB gzip (the page itself, inline scripts and data included, plus its stylesheets)
 * Exits with code 1 if any page is over budget.
 *
 * Usage: npm run size
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const BUDGET_JS = 50 * 1024;
const BUDGET_HTML_CSS = 40 * 1024;

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(dist)) {
  console.error('✖ No existe dist/. Ejecuta antes `npm run build`.');
  process.exit(1);
}

const gz = (file: string) => gzipSync(readFileSync(file)).length;
const kb = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`;

/** dist/ path for a root-relative URL used in the HTML (`/_astro/x.js`). */
const fromUrl = (url: string) => join(dist, url.replace(/^\//, '').split(/[?#]/)[0] ?? '');

/** A JS file plus every chunk it imports, statically or dynamically. */
function jsClosure(entry: string, seen = new Set<string>()): Set<string> {
  if (seen.has(entry) || !existsSync(entry)) return seen;
  seen.add(entry);
  const code = readFileSync(entry, 'utf8');
  for (const [, spec] of code.matchAll(/(?:import|export)\s*(?:[^'"]*?from\s*)?\(?\s*["']([^"']+\.js)["']/g)) {
    if (spec) jsClosure(spec.startsWith('/') ? fromUrl(spec) : resolve(dirname(entry), spec), seen);
  }
  return seen;
}

const pages = readdirSync(dist, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.html'))
  .sort();

let failed = false;
console.log(`${'Página'.padEnd(28)} ${'JS'.padStart(10)} ${'HTML+CSS'.padStart(10)}`);

for (const page of pages) {
  const file = join(dist, page);
  const html = readFileSync(file, 'utf8');

  const scriptUrls = [
    ...html.matchAll(/<script[^>]*\ssrc="([^"]+)"/g),
    ...html.matchAll(/\s(?:component-url|renderer-url|before-hydration-url)="([^"]+)"/g),
    ...html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g),
  ].map((m) => m[1] ?? '');
  const js = new Set<string>();
  for (const url of scriptUrls) for (const f of jsClosure(fromUrl(url))) js.add(f);
  const jsBytes = [...js].reduce((sum, f) => sum + gz(f), 0);

  const cssUrls = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)].map((m) => m[1] ?? '');
  const htmlCssBytes = gz(file) + cssUrls.reduce((sum, url) => sum + gz(fromUrl(url)), 0);

  const overJs = jsBytes > BUDGET_JS;
  const overHtml = htmlCssBytes > BUDGET_HTML_CSS;
  failed ||= overJs || overHtml;
  const route = `/${relative(dist, file).replace(/index\.html$/, '')}`;
  console.log(
    `${route.padEnd(28)} ${kb(jsBytes).padStart(10)}${overJs ? ' ✖' : '  '} ${kb(htmlCssBytes).padStart(10)}${overHtml ? ' ✖' : ''}`,
  );
}

console.log(
  failed
    ? `✖ Alguna página supera el presupuesto (JS ≤ ${kb(BUDGET_JS)}, HTML+CSS ≤ ${kb(BUDGET_HTML_CSS)}, gzip)`
    : `✔ Todas las páginas dentro del presupuesto (JS ≤ ${kb(BUDGET_JS)}, HTML+CSS ≤ ${kb(BUDGET_HTML_CSS)}, gzip)`,
);
if (failed) process.exitCode = 1;
