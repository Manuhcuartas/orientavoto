import { describe, expect, it } from 'vitest';
import { answersFrom, rankEntities, type AnswerValue } from '../../src/lib/affinity';
import { getBallot } from '../../src/lib/ballot';
import { dataset } from '../../src/lib/data';
import { seeded } from './helpers/rng';

// Results screen with a fixed set of answers on the fictitious dataset, worked out
// by hand from data/posiciones/*.json. Same path as the UI: quiz state →
// answersFrom → rankEntities(getBallot(code)) → rounded percentages.
//
// Answers: a01 +1 (important), a02 +1, a03 −1, a04 0, a05 −1; a06–a25 not answered.
// Points per statement = weight × (2 − |answer − stance|); max = weight × 2.
//
//            a01 (×2)  a02  a03  a04  a05   points/max
//   A        −1 → 0     +1→2  0→1  0→2 −1→2   7/12 = 58.33 → 58
//   B        +1 → 4     +1→2 −1→2  0→2 −1→2  12/12 = 100
//   C         0 → 2     +1→2 +1→0  0→2 +1→0   6/12 = 50
//   D        −1 → 0      0→1 −1→2  0→2 +1→0   5/12 = 41.67 → 42
//   E        +1 → 4     sin  0→1  0→2 −1→2   9/10 = 90     (4 of 5)
//   F         sin      −1→0 sin  sin −1→2   2/4, but known on 2 of 5 (40 % < 50 %) → insufficient

const config = dataset.meta;
const values: Record<string, AnswerValue | null> = { a01: 1, a02: 1, a03: -1, a04: 0, a05: -1 };
const important = { a01: true, a02: false };

const rows = (code: string | null, v: Record<string, AnswerValue | null> = values) => {
  const ranking = rankEntities(getBallot(code), answersFrom(v, important), config, seeded(1));
  return {
    ranked: ranking.ranked.map((r) => [r.entity.id, r.percent, `${r.score.considered}/${r.score.answered}`, r.lowCoverage]),
    insufficient: ranking.insufficient.map((r) => r.entity.id),
    lowAnswerCount: ranking.lowAnswerCount,
  };
};

describe('results with a fixed set of answers (worked by hand)', () => {
  it('Madrid (28): percentages, «calculado sobre X de Y» and the insufficient block', () => {
    expect(rows('28')).toEqual({
      ranked: [
        ['partido-b', 100, '5/5', false],
        ['partido-e', 90, '4/5', false],
        ['partido-a', 58, '5/5', false],
        ['partido-c', 50, '5/5', false],
        ['partido-d', 42, '5/5', false],
      ],
      insufficient: ['partido-f'],
      lowAnswerCount: false,
    });
  });

  it('Huesca (22): the A + X coalition uses its own position on a03 (−1 → 2 points instead of 1)', () => {
    const { ranked } = rows('22');
    // 8/12 = 66.67 → 67, where A alone would get 58.
    expect(ranked.find(([id]) => id === 'coalicion-a-x')).toEqual(['coalicion-a-x', 67, '5/5', false]);
    expect(ranked.some(([id]) => id === 'partido-a')).toBe(false);
  });

  it('answering a06 (−1) too: E drops below 75 % coverage and gets the warning', () => {
    // a06: A −1→2, B +1→0, C 0→1, D 0→1, E sin, F sin.
    //   A 9/14 = 64.29 → 64 · B 12/14 = 85.71 → 86 · C 7/14 = 50 · D 6/14 = 42.86 → 43
    //   E 9/10 = 90 with 4 of 6 (67 %) → lowCoverage · F 2 of 6 → insufficient
    expect(rows('28', { ...values, a06: -1 })).toEqual({
      ranked: [
        ['partido-e', 90, '4/6', true],
        ['partido-b', 86, '6/6', false],
        ['partido-a', 64, '6/6', false],
        ['partido-c', 50, '6/6', false],
        ['partido-d', 43, '6/6', false],
      ],
      insufficient: ['partido-f'],
      lowAnswerCount: false,
    });
  });

  it('with fewer than minimoRespuestas answers the results carry the low-reliability flag', () => {
    expect(rows('28', { a01: 1, a02: 1, a03: -1, a04: 0, a05: null }).lowAnswerCount).toBe(true);
  });

  it('without a constituency only the state-wide parties are ranked', () => {
    const { ranked, insufficient } = rows(null);
    expect([...ranked.map(([id]) => id), ...insufficient].sort()).toEqual([
      'partido-a',
      'partido-b',
      'partido-c',
      'partido-d',
      'partido-e',
      'partido-f',
    ]);
  });
});

describe('answersFrom', () => {
  it('combines values and the important flag; a skipped statement keeps its flag', () => {
    expect(answersFrom({ a01: 1, a02: null }, { a02: true, a03: true })).toEqual({
      a01: { value: 1, important: false },
      a02: { value: null, important: true },
    });
  });
});
