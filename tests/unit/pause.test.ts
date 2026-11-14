import { describe, expect, it } from 'vitest';
import { buildTime, EARLY_MARGIN_MS, isPaused, PAUSE, type PauseWindow } from '../../src/lib/pause';

const at = (iso: string) => new Date(iso);

describe('reflection-day pause', () => {
  it('covers 00:00 on 28-N to 20:00 on 29-N, peninsular time (UTC+1)', () => {
    expect(PAUSE.start).toBe('2026-11-28T00:00:00+01:00');
    expect(PAUSE.end).toBe('2026-11-29T20:00:00+01:00');
    expect(Date.parse(PAUSE.start)).toBe(Date.UTC(2026, 10, 27, 23, 0));
    expect(Date.parse(PAUSE.end)).toBe(Date.UTC(2026, 10, 29, 19, 0));
  });

  it.each([
    ['campaign, 27-N at noon', '2026-11-27T12:00:00+01:00', false],
    ['27-N 21:59, before the early margin', '2026-11-27T21:59:00+01:00', false],
    ['27-N 22:00, start of the 2 h early margin', '2026-11-27T22:00:00+01:00', true],
    ['reflection day', '2026-11-28T12:00:00+01:00', true],
    ['election day morning', '2026-11-29T10:00:00+01:00', true],
    ['29-N 19:59', '2026-11-29T19:59:00+01:00', true],
    ['29-N 20:00, polls closed', '2026-11-29T20:00:00+01:00', false],
    ['the day after', '2026-11-30T09:00:00+01:00', false],
  ])('%s → paused: %s', (_, iso, paused) => {
    expect(isPaused(at(iso))).toBe(paused);
  });

  it('the early margin is two hours', () => {
    expect(EARLY_MARGIN_MS).toBe(2 * 60 * 60 * 1000);
  });

  it('can be cancelled', () => {
    const off: PauseWindow = { ...PAUSE, enabled: false };
    expect(isPaused(at('2026-11-28T12:00:00+01:00'), off)).toBe(false);
  });

  it('build time can be simulated with ORIENTAVOTO_NOW', () => {
    expect(buildTime({ ORIENTAVOTO_NOW: '2026-11-28T12:00:00+01:00' }).toISOString()).toBe('2026-11-28T11:00:00.000Z');
    expect(() => buildTime({ ORIENTAVOTO_NOW: 'mañana' })).toThrow('ORIENTAVOTO_NOW no es una fecha válida');
    expect(Math.abs(buildTime({}).getTime() - Date.now())).toBeLessThan(1000);
  });
});
