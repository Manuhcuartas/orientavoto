/**
 * Reflection-day pause (PLAN.md, task 4.3). The site is static, so the pause is decided
 * at build time: a build made inside the window renders only a neutral notice on every
 * page (no parties, no island data). `.github/workflows/pausa.yml` forces rebuilds at
 * the start and end of the window so it opens and closes without anyone awake.
 *
 * To cancel the pause (e.g. if the Junta Electoral Central says it is not needed),
 * set `enabled: false`.
 */

export interface PauseWindow {
  enabled: boolean;
  /** Start and end, with explicit offset (peninsular time is UTC+1 in November). */
  start: string;
  end: string;
}

export const PAUSE: PauseWindow = {
  enabled: true,
  start: '2026-11-28T00:00:00+01:00',
  end: '2026-11-29T20:00:00+01:00',
};

/**
 * Builds made up to this long before the start are already paused: GitHub's scheduled
 * runs can be late, so the workflow triggers rebuilds ahead of time. Pausing a little
 * early is the safe side; reopening a little late too.
 */
export const EARLY_MARGIN_MS = 2 * 60 * 60 * 1000;

export function isPaused(now: Date, pause: PauseWindow = PAUSE): boolean {
  if (!pause.enabled) return false;
  const start = Date.parse(pause.start) - EARLY_MARGIN_MS;
  const end = Date.parse(pause.end);
  return now.getTime() >= start && now.getTime() < end;
}

/** Build time; `ORIENTAVOTO_NOW` (ISO date) simulates another moment for tests. */
export function buildTime(env: Readonly<Record<string, string | undefined>> = process.env): Date {
  const simulated = env.ORIENTAVOTO_NOW;
  if (!simulated) return new Date();
  const date = new Date(simulated);
  if (Number.isNaN(date.getTime())) throw new Error(`ORIENTAVOTO_NOW no es una fecha válida: «${simulated}»`);
  return date;
}
