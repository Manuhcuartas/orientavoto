// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  output: 'static',
  integrations: [preact()],
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
