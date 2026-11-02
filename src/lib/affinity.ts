/**
 * Affinity between the user's answers and each entity (party or coalition).
 * Pure, no DOM. Implements «Metodología de cálculo» in PLAN.md:
 *
 * - User answer and entity stance are −1 / 0 / +1. Points = weight × (2 − |u − p|),
 *   maximum = weight × 2, affinity = 100 × Σpoints / Σmaximum.
 * - Weight is 2 for statements marked important, 1 otherwise.
 * - Skipped statements are left out for every entity; «neutral» does count.
 * - A statement where the entity has no known stance is left out only for that entity.
 * - Ranking orders by the rounded percentage that is displayed; ties are random.
 */
import type { Meta, Stance } from '../data/schema';

/** −1 disagree, 0 neutral, +1 agree. */
export type AnswerValue = -1 | 0 | 1;

export interface Answer {
  /** `null` = skipped (the important flag is kept in case the user goes back). */
  value: AnswerValue | null;
  important: boolean;
}

/** User answers by statement id. A missing statement counts as skipped. */
export type Answers = Readonly<Partial<Record<string, Answer>>>;

/** Entity stances by statement id. A missing statement counts as `sin_posicion`. */
export type PositionMap = Readonly<Partial<Record<string, { readonly posicion: Stance }>>>;

/** Returns a number in [0, 1), like `Math.random`. Injected so tests are deterministic. */
export type Rng = () => number;

export type RankingConfig = Pick<Meta, 'umbralAvisoCobertura' | 'umbralCoberturaMinima' | 'minimoRespuestas'>;

export const IMPORTANT_WEIGHT = 2;

const STANCE_VALUE: Record<Exclude<Stance, 'sin_posicion'>, AnswerValue> = {
  a_favor: 1,
  neutral: 0,
  en_contra: -1,
};

export interface Score {
  points: number;
  max: number;
  /** Statements the user answered (not skipped). The same for every entity. */
  answered: number;
  /** Answered statements where the entity has a known stance: «calculado sobre `considered` de `answered`». */
  considered: number;
  /** `considered / answered`; 0 when nothing was answered. */
  coverage: number;
  /** Unrounded 0–100, or `null` when no statement can be compared. Never NaN. */
  percent: number | null;
}

export function scoreEntity(answers: Answers, positions: PositionMap): Score {
  let points = 0;
  let max = 0;
  let answered = 0;
  let considered = 0;

  for (const [statement, answer] of Object.entries(answers)) {
    if (!answer || answer.value === null) continue;
    answered++;

    const stance = positions[statement]?.posicion;
    if (stance === undefined || stance === 'sin_posicion') continue;
    considered++;

    const weight = answer.important ? IMPORTANT_WEIGHT : 1;
    points += weight * (2 - Math.abs(answer.value - STANCE_VALUE[stance]));
    max += weight * 2;
  }

  return {
    points,
    max,
    answered,
    considered,
    coverage: answered === 0 ? 0 : considered / answered,
    percent: max === 0 ? null : (100 * points) / max,
  };
}

export interface RankedEntity<T> {
  entity: T;
  score: Score;
  /** Rounded percentage: the one displayed and the one used for ordering. */
  percent: number;
  /** Coverage below `umbralAvisoCobertura`: show a warning. */
  lowCoverage: boolean;
}

export interface InsufficientEntity<T> {
  entity: T;
  score: Score;
}

export interface Ranking<T> {
  /** Highest rounded percentage first; equal percentages in random order. */
  ranked: RankedEntity<T>[];
  /** Coverage below `umbralCoberturaMinima` (or nothing comparable), in random order. */
  insufficient: InsufficientEntity<T>[];
  /** Fewer answers than `minimoRespuestas`: show a low-reliability warning. */
  lowAnswerCount: boolean;
}

export function rankEntities<T extends { readonly positions: PositionMap }>(
  entities: readonly T[],
  answers: Answers,
  config: RankingConfig,
  rng: Rng,
): Ranking<T> {
  const ranked: RankedEntity<T>[] = [];
  const insufficient: InsufficientEntity<T>[] = [];

  // Shuffle first and then sort stably: ties keep the random order and the
  // result does not depend on the input order.
  for (const entity of shuffled(entities, rng)) {
    const score = scoreEntity(answers, entity.positions);
    if (score.percent === null || score.coverage < config.umbralCoberturaMinima) {
      insufficient.push({ entity, score });
    } else {
      ranked.push({
        entity,
        score,
        percent: Math.round(score.percent),
        lowCoverage: score.coverage < config.umbralAvisoCobertura,
      });
    }
  }
  ranked.sort((a, b) => b.percent - a.percent);

  return { ranked, insufficient, lowAnswerCount: countAnswered(answers) < config.minimoRespuestas };
}

function countAnswered(answers: Answers): number {
  return Object.values(answers).filter((a) => a && a.value !== null).length;
}

// TODO(1.2): replace with `shuffle` from `src/lib/shuffle.ts` once it exists.
/** Fisher–Yates on a copy. */
function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}
