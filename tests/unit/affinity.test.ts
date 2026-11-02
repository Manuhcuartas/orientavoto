import { describe, expect, it } from 'vitest';
import type { Stance } from '../../src/data/schema';
import {
  rankEntities,
  scoreEntity,
  type Answer,
  type AnswerValue,
  type Answers,
  type PositionMap,
  type RankingConfig,
  type Rng,
} from '../../src/lib/affinity';

// All entities and statements are fictitious («partido-a»…, «a01»…).

const config: RankingConfig = { umbralAvisoCobertura: 0.75, umbralCoberturaMinima: 0.5, minimoRespuestas: 5 };

/** Small seeded PRNG (mulberry32) so random cases are reproducible. */
function seeded(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sid = (i: number) => `a${String(i + 1).padStart(2, '0')}`;

/** `answers(1, 0, null)` → a01 agree, a02 neutral, a03 skipped. */
const answers = (...values: (AnswerValue | null)[]): Record<string, Answer> =>
  Object.fromEntries(values.map((value, i) => [sid(i), { value, important: false }]));

/** `positions('a_favor', 'sin_posicion')` → a01 a favor, a02 no stance. */
const positions = (...stances: Stance[]): PositionMap =>
  Object.fromEntries(stances.map((posicion, i) => [sid(i), { posicion }]));

const entity = (id: string, map: PositionMap) => ({ id, positions: map });

const repeat = <T,>(n: number, value: T): T[] => Array.from({ length: n }, () => value);

const ids = (list: { entity: { id: string } }[]) => list.map((x) => x.entity.id).join(',');

/** Distinct results of `run` over several seeds. */
const ordersOverSeeds = (run: (rng: Rng) => string, seeds = 50) =>
  new Set(Array.from({ length: seeds }, (_, seed) => run(seeded(seed + 1))));

describe('scoreEntity', () => {
  it('full agreement → 100', () => {
    expect(scoreEntity(answers(1, -1, 0), positions('a_favor', 'en_contra', 'neutral')).percent).toBe(100);
  });

  it('full opposition → 0', () => {
    expect(scoreEntity(answers(1, -1), positions('en_contra', 'a_favor')).percent).toBe(0);
  });

  it('neutral against a stated position → 50, either way round', () => {
    expect(scoreEntity(answers(0, 0), positions('a_favor', 'en_contra')).percent).toBe(50);
    expect(scoreEntity(answers(1, -1), positions('neutral', 'neutral')).percent).toBe(50);
  });

  it('returns the points, maximum and counts', () => {
    expect(scoreEntity(answers(1, 0, -1, null), positions('a_favor', 'en_contra', 'sin_posicion', 'a_favor'))).toEqual({
      points: 3,
      max: 4,
      answered: 3,
      considered: 2,
      coverage: 2 / 3,
      percent: 75,
    });
  });

  it('a skipped statement does not change the result, even if marked important', () => {
    const base = scoreEntity(answers(1, -1), positions('a_favor', 'neutral', 'en_contra'));
    const withSkipped = { ...answers(1, -1), a03: { value: null, important: true } };
    expect(scoreEntity(withSkipped, positions('a_favor', 'neutral', 'en_contra'))).toEqual(base);
  });

  it('a statement missing from the answers counts as skipped', () => {
    const map = positions('a_favor', 'en_contra');
    expect(scoreEntity({ a01: { value: 1, important: false } }, map)).toEqual(scoreEntity(answers(1, null), map));
  });

  it('all skipped → percent null and coverage 0, never NaN', () => {
    expect(scoreEntity(answers(null, null), positions('a_favor', 'en_contra'))).toMatchObject({
      percent: null,
      coverage: 0,
      answered: 0,
    });
    expect(scoreEntity({}, positions('a_favor')).percent).toBeNull();
  });

  it('no known stance on any answered statement → percent null', () => {
    expect(scoreEntity(answers(1, 0), positions('sin_posicion'))).toMatchObject({
      percent: null,
      answered: 2,
      considered: 0,
      coverage: 0,
    });
  });

  it('an important statement weighs double', () => {
    const map = positions('a_favor', 'en_contra');
    expect(scoreEntity(answers(1, 1), map).percent).toBe(50); // (2 + 0) / 4
    expect(scoreEntity({ ...answers(1, 1), a01: { value: 1, important: true } }, map).percent).toBeCloseTo(66.667, 3); // (4 + 0) / 6
  });
});

describe('rankEntities', () => {
  it('«important» reverses the order of two parties (worked by hand)', () => {
    // User agrees with a01, a02 and a03.
    //   A: a favor, en contra, en contra  → 2 + 0 + 0
    //   B: en contra, a favor, neutral    → 0 + 2 + 1
    // Without «important»: A 2/6 = 33 %, B 3/6 = 50 %  → B, A
    // a01 important:       A 4/8 = 50 %, B 3/8 = 38 %  → A, B
    const a = entity('partido-a', positions('a_favor', 'en_contra', 'en_contra'));
    const b = entity('partido-b', positions('en_contra', 'a_favor', 'neutral'));
    const plain = answers(1, 1, 1);

    const before = rankEntities([a, b], plain, config, seeded(1)).ranked;
    expect(before.map((r) => [r.entity.id, r.percent])).toEqual([
      ['partido-b', 50],
      ['partido-a', 33],
    ]);

    const after = rankEntities([a, b], { ...plain, a01: { value: 1, important: true } }, config, seeded(1)).ranked;
    expect(after.map((r) => [r.entity.id, r.percent])).toEqual([
      ['partido-a', 50],
      ['partido-b', 38],
    ]);
  });

  it('«sin_posicion» is left out only for that party, and coverage is computed over answered statements', () => {
    const user = answers(1, 1, 1, 1, 1, 1, 1, 1); // 8 answered
    const full = entity('partido-a', positions(...repeat(8, 'a_favor' as Stance)));
    const at75 = entity('partido-b', positions(...repeat(6, 'a_favor' as Stance), 'sin_posicion', 'sin_posicion'));
    const below75 = entity('partido-c', positions(...repeat(5, 'en_contra' as Stance))); // a06–a08 missing
    const at50 = entity('partido-d', positions(...repeat(4, 'a_favor' as Stance), ...repeat(4, 'sin_posicion' as Stance)));
    const below50 = entity('partido-e', positions('a_favor', 'a_favor', 'a_favor'));

    const { ranked, insufficient } = rankEntities([full, at75, below75, at50, below50], user, config, seeded(3));
    const byId = Object.fromEntries(ranked.map((r) => [r.entity.id, r]));

    expect(byId['partido-a']).toMatchObject({ percent: 100, lowCoverage: false, score: { considered: 8, coverage: 1 } });
    expect(byId['partido-b']).toMatchObject({ percent: 100, lowCoverage: false, score: { considered: 6, coverage: 0.75 } });
    expect(byId['partido-c']).toMatchObject({ percent: 0, lowCoverage: true, score: { considered: 5, coverage: 0.625 } });
    expect(byId['partido-d']).toMatchObject({ percent: 100, lowCoverage: true, score: { considered: 4, coverage: 0.5 } });
    expect(ids(insufficient)).toBe('partido-e');
    expect(insufficient[0]?.score).toMatchObject({ considered: 3, answered: 8, coverage: 0.375 });
  });

  it('all skipped → every party is insufficient, with percent null', () => {
    const { ranked, insufficient, lowAnswerCount } = rankEntities(
      [entity('partido-a', positions('a_favor')), entity('partido-b', positions('en_contra'))],
      answers(null),
      config,
      seeded(1),
    );
    expect(ranked).toEqual([]);
    expect(insufficient.map((i) => i.score.percent)).toEqual([null, null]);
    expect(lowAnswerCount).toBe(true);
  });

  it('flags fewer answers than minimoRespuestas', () => {
    const party = [entity('partido-a', positions(...repeat(6, 'a_favor' as Stance)))];
    expect(rankEntities(party, answers(1, 1, 1, 1, null, null), config, seeded(1)).lowAnswerCount).toBe(true);
    expect(rankEntities(party, answers(1, 1, 1, 1, 0, null), config, seeded(1)).lowAnswerCount).toBe(false);
  });

  it('ties on the rounded percentage are ordered by the rng, not by input order or hidden decimals', () => {
    // User agrees with a01–a13.
    //   A: 3 a favor, 1 neutral, 6 en contra, 3 sin posición → 7/20 = 35.00 % → 35
    //   B: 4 a favor, 1 neutral, 8 en contra                 → 9/26 = 34.62 % → 35
    //   C: 13 a favor                                         → 100
    const user = answers(...repeat(13, 1 as AnswerValue));
    const a = entity(
      'partido-a',
      positions(...repeat(3, 'a_favor' as Stance), 'neutral', ...repeat(6, 'en_contra' as Stance), ...repeat(3, 'sin_posicion' as Stance)),
    );
    const b = entity('partido-b', positions(...repeat(4, 'a_favor' as Stance), 'neutral', ...repeat(8, 'en_contra' as Stance)));
    const c = entity('partido-c', positions(...repeat(13, 'a_favor' as Stance)));

    const first = rankEntities([a, b, c], user, config, seeded(1));
    expect(first.ranked.map((r) => r.percent)).toEqual([100, 35, 35]);
    expect(first.ranked[0]?.entity.id).toBe('partido-c');

    for (const input of [[a, b, c], [c, b, a]]) {
      const orders = ordersOverSeeds((rng) => ids(rankEntities(input, user, config, rng).ranked));
      expect(orders).toEqual(new Set(['partido-c,partido-a,partido-b', 'partido-c,partido-b,partido-a']));
    }
  });

  it('the insufficient block comes out shuffled', () => {
    const none = (id: string) => entity(id, positions('sin_posicion'));
    const parties = [none('partido-a'), none('partido-b'), none('partido-c')];
    const orders = ordersOverSeeds((rng) => ids(rankEntities(parties, answers(1), config, rng).insufficient));
    expect(orders.size).toBeGreaterThan(1);
  });

  it('is reproducible with the same seed and does not mutate its input', () => {
    const parties = [
      entity('partido-a', positions('a_favor')),
      entity('partido-b', positions('a_favor')),
      entity('partido-c', positions('a_favor')),
    ];
    const copy = [...parties];
    const run = () => ids(rankEntities(parties, answers(1), config, seeded(42)).ranked);
    expect(run()).toBe(run());
    expect(parties).toEqual(copy);
  });
});

describe('properties (seeded random cases)', () => {
  const STANCES: (Stance | undefined)[] = ['a_favor', 'neutral', 'en_contra', 'sin_posicion', undefined];
  const VALUES: (AnswerValue | null | undefined)[] = [1, 0, -1, null, undefined];

  const pick = <T,>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)] as T;

  function randomCase(rng: Rng) {
    const n = 1 + Math.floor(rng() * 30);
    const entries: [string, Answer][] = [];
    const map: Record<string, { posicion: Stance }> = {};
    for (let i = 0; i < n; i++) {
      const value = pick(rng, VALUES);
      if (value !== undefined) entries.push([sid(i), { value, important: rng() < 0.3 }]);
      const posicion = pick(rng, STANCES);
      if (posicion) map[sid(i)] = { posicion };
    }
    return { entries, map };
  }

  it('the percentage is null or between 0 and 100, and does not depend on statement order', () => {
    const rng = seeded(2026);
    for (let k = 0; k < 500; k++) {
      const { entries, map } = randomCase(rng);
      const score = scoreEntity(Object.fromEntries(entries), map);

      if (score.percent !== null) {
        expect(score.percent).toBeGreaterThanOrEqual(0);
        expect(score.percent).toBeLessThanOrEqual(100);
      } else {
        expect(score.max).toBe(0);
      }
      expect(Number.isNaN(score.coverage)).toBe(false);
      expect(score.points).toBeLessThanOrEqual(score.max);
      expect(score.considered).toBeLessThanOrEqual(score.answered);

      const reversed: Answers = Object.fromEntries([...entries].reverse());
      const reversedMap: PositionMap = Object.fromEntries(Object.entries(map).reverse());
      expect(scoreEntity(reversed, reversedMap)).toEqual(score);
    }
  });
});
