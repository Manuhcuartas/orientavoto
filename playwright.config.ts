import { defineConfig, devices } from '@playwright/test';

// E2E against the production build (`astro build` + `astro preview`), never the dev server.
const PORT = 4400;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'dot',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'es-ES',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true } },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    // `exec` so the preview server is the process Playwright stops. `--ignore-lock` keeps it in the
    // foreground: Astro otherwise backgrounds `preview` when it detects an AI agent, leaving an orphan.
    command: `npm run build && exec ./node_modules/.bin/astro preview --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}`,
    // Always a fresh build: reusing a server left on the port would test stale code.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'ignore',
  },
});
