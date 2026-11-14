// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import { resolve } from 'node:path';

// Content folder: `data/` (real content) unless ORIENTAVOTO_DATA points elsewhere.
// E2E builds use the fictitious fixtures: ORIENTAVOTO_DATA=tests/fixtures/data.
const dataDir = resolve(process.env.ORIENTAVOTO_DATA ?? 'data');

export default defineConfig({
  output: 'static',
  integrations: [preact()],
  vite: {
    resolve: { alias: { '@data': dataDir } },
  },
  // No code blocks on the site; Shiki's inline styles are incompatible with the CSP.
  markdown: { syntaxHighlight: false },
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  security: {
    // Native CSP: Astro adds a <meta http-equiv="content-security-policy"> to every page with
    // hashes of its own inline scripts and styles. `connect-src 'none'` is the technical
    // guarantee that answers are never sent anywhere. `frame-ancestors` cannot go in a <meta>,
    // so public/_headers repeats the policy that does not depend on hashes.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "connect-src 'none'",
        "img-src 'self' data:",
        "object-src 'none'",
        "base-uri 'none'",
        "form-action 'none'",
      ],
    },
  },
});
