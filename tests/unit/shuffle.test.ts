import { describe, expect, it } from 'vitest';
import { cryptoRng, shuffle } from '../../src/lib/shuffle';
import { seeded } from './helpers/rng';

const sorted = (list: readonly string[]) => [...list].sort();

describe('shuffle', () => {
  const items = ['partido-a', 'partido-b', 'partido-c', 'partido-d', 'partido-e', 'partido-f'] as const;

  it('returns a permutation of the input', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const out = shuffle(items, seeded(seed));
      expect(out).toHaveLength(items.length);
      expect(sorted(out)).toEqual(sorted(items));
    }
  });

  it('does not mutate the input', () => {
    const input = [...items];
    shuffle(input, seeded(1));
    expect(input).toEqual(items);
  });

  it('is reproducible with a seeded rng', () => {
    expect(shuffle(items, seeded(7))).toEqual(shuffle(items, seeded(7)));
    expect(shuffle(items, seeded(7))).not.toEqual(shuffle(items, seeded(8)));
  });

  it('handles empty and single-element lists', () => {
    expect(shuffle([], seeded(1))).toEqual([]);
    expect(shuffle(['partido-a'], seeded(1))).toEqual(['partido-a']);
  });

  it('does not go out of bounds when the rng returns its extremes', () => {
    expect(sorted(shuffle(items, () => 0))).toEqual(sorted(items));
    expect(sorted(shuffle(items, () => 0.9999999999))).toEqual(sorted(items));
  });

  it('every order of 3 items is roughly equally likely', () => {
    const rng = seeded(2026);
    const runs = 60_000;
    const counts = new Map<string, number>();
    for (let i = 0; i < runs; i++) {
      const key = shuffle(['a', 'b', 'c'], rng).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    for (const count of counts.values()) expect(Math.abs(count - runs / 6)).toBeLessThan(runs * 0.01);
  });

  it('uses crypto.getRandomValues by default', () => {
    for (let i = 0; i < 1000; i++) {
      const x = cryptoRng();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(sorted(shuffle(items))).toEqual(sorted(items));
  });
});
