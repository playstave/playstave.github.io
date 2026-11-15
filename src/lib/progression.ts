/**
 * Sequential progression rules. Pure functions only, so they can be unit-tested
 * and reused unchanged once progress moves to a server.
 *
 * Invariant: `currentLevel` is the single highest level the student may open.
 * Levels below it are completed; levels above it are locked. When all 500 are
 * complete, currentLevel is 501.
 */
import { TOTAL_LEVELS } from '../data/curriculum';

export type LevelStatus = 'completed' | 'current' | 'locked';

export interface ProgressionState {
  currentLevel: number;
  completedLevels: Record<number, { stars: number; bestScore: number }>;
}

export function levelStatus(n: number, s: ProgressionState): LevelStatus {
  if (n < s.currentLevel) return 'completed';
  if (n === s.currentLevel) return 'current';
  return 'locked';
}

export function canOpen(n: number, s: ProgressionState): boolean {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_LEVELS && n <= s.currentLevel;
}

export function isCourseComplete(s: ProgressionState): boolean {
  return s.currentLevel > TOTAL_LEVELS;
}

/** The level a student should play next (clamped to 500 when the course is finished). */
export function nextLevel(s: ProgressionState): number {
  return Math.min(s.currentLevel, TOTAL_LEVELS);
}

export interface CompletionResult<T extends ProgressionState> {
  state: T;
  /** True when this completion opened a new level. */
  unlockedNext: boolean;
  /** True when this is a replay of an already-completed level. */
  replay: boolean;
  /** True when the star record improved. */
  improved: boolean;
}

/**
 * Record a passed attempt at level `n` with `stars` (1–3) and `score` (0–100).
 * - Locked levels are rejected (throws) — a level can never be skipped.
 * - Replays keep the best star count and best score; they never unlock anything.
 */
export function completeLevel<T extends ProgressionState>(s: T, n: number, stars: number, score: number): CompletionResult<T> {
  if (!canOpen(n, s)) throw new Error(`Level ${n} is locked (current level is ${s.currentLevel})`);
  if (!Number.isInteger(stars) || stars < 1 || stars > 3) throw new RangeError('stars must be 1, 2 or 3');
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  const prev = s.completedLevels[n];
  const replay = n < s.currentLevel;
  const best = { stars: Math.max(prev?.stars ?? 0, stars), bestScore: Math.max(prev?.bestScore ?? 0, safeScore) };
  const improved = !prev || best.stars > prev.stars || best.bestScore > prev.bestScore;
  const unlockedNext = n === s.currentLevel;

  return {
    state: {
      ...s,
      completedLevels: { ...s.completedLevels, [n]: best },
      currentLevel: unlockedNext ? s.currentLevel + 1 : s.currentLevel,
    },
    unlockedNext,
    replay,
    improved,
  };
}
