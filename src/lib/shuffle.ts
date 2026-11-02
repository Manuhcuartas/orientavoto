/**
 * Random order for every list of parties not ordered by affinity (neutrality
 * rule). Runs in the client on every visit; the rng is injectable for tests.
 */

/** Returns a number in [0, 1), like `Math.random`. */
export type Rng = () => number;

const UINT32_RANGE = 2 ** 32;

/** Rng backed by `crypto.getRandomValues` (browser and Node ≥ 19). */
export const cryptoRng: Rng = () => {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) / UINT32_RANGE;
};

/** Fisher–Yates on a copy: never mutates `items`. */
export function shuffle<T>(items: readonly T[], rng: Rng = cryptoRng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.floor(rng() * (i + 1)));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}
