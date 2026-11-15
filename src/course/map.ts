/**
 * The 500-level course map: which levels are theory and which are playing.
 *
 * Product decision (owner, 2026-11-15): 30–40 theory levels at RANDOM
 * positions; every other level is a playing level (tutorial → play test).
 * The positions are drawn once from a fixed seed, so they are identical for
 * every student and never move under saved progress. Changing COURSE_SEED or
 * THEORY_COUNT would move them — the tests pin the layout to prevent that.
 */
import { TOTAL_LEVELS } from '../data/curriculum';

export const COURSE_VERSION = 2;
const COURSE_SEED = 0x5ca1ab1e;
export const THEORY_COUNT = 36;

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Theory level numbers, ascending. Rules: random, but never Level 1 or 2 (the
 * first lessons put the instrument in your hands), never a checkpoint (every
 * 10th level is a playing review), and never two theory levels back to back.
 */
export const THEORY_LEVELS: readonly number[] = (() => {
  const r = rng(COURSE_SEED);
  const picked = new Set<number>();
  while (picked.size < THEORY_COUNT) {
    const n = 3 + Math.floor(r() * (TOTAL_LEVELS - 2));
    if (n > TOTAL_LEVELS || n % 10 === 0 || picked.has(n) || picked.has(n - 1) || picked.has(n + 1)) continue;
    picked.add(n);
  }
  return [...picked].sort((a, b) => a - b);
})();

const theoryIndex = new Map(THEORY_LEVELS.map((n, i) => [n, i + 1]));

export type LevelKind = { kind: 'theory'; index: number } | { kind: 'play'; index: number };

/** What level `n` is: the Nth theory lesson, or the Nth playing lesson (both 1-based). */
export function levelKind(n: number): LevelKind {
  const t = theoryIndex.get(n);
  if (t) return { kind: 'theory', index: t };
  let before = 0;
  for (const x of THEORY_LEVELS) { if (x < n) before++; else break; }
  return { kind: 'play', index: n - before };
}

/** Level number of the Nth theory lesson. */
export const theoryLevel = (index: number) => THEORY_LEVELS[index - 1];

/** Level number of the Nth playing lesson. */
export function playLevel(index: number): number {
  let n = index;
  for (const x of THEORY_LEVELS) { if (x <= n) n++; else break; }
  return n;
}
