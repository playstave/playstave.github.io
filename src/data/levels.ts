/**
 * The 500 levels, derived from the curriculum structure.
 * A Level here is the roadmap's view of a level: where it sits, how hard it is,
 * and whether it is a checkpoint or milestone. Lesson content is separate and
 * is authored per level (Levels 1–10 first).
 */
import { TOTAL_LEVELS, WORLDS, type Unit, type World } from './curriculum';

export const DIFFICULTY_TIERS = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert', 'Master'] as const;
export type Difficulty = (typeof DIFFICULTY_TIERS)[number];

export interface Level {
  n: number;
  world: World;
  unit: Unit;
  /** 1–10 position inside its unit. */
  indexInUnit: number;
  difficulty: Difficulty;
  /** 0-based index into DIFFICULTY_TIERS, for pips. */
  difficultyRank: number;
  /** Every 10th level closes a unit with a checkpoint review. */
  isCheckpoint: boolean;
  /** Every 50th level is a milestone celebration. */
  isMilestone: boolean;
  /** Levels 100, 200, 300, 400 and 500 award major achievements. */
  isMajor: boolean;
}

/** Difficulty rises gradually: tiers are narrower toward the end of the course. */
function difficultyFor(n: number): number {
  if (n <= 50) return 0;
  if (n <= 150) return 1;
  if (n <= 300) return 2;
  if (n <= 400) return 3;
  if (n <= 450) return 4;
  return 5;
}

function build(): Level[] {
  const out: Level[] = [];
  for (const world of WORLDS) {
    for (const unit of world.units) {
      for (let n = unit.firstLevel; n <= unit.lastLevel; n++) {
        const d = difficultyFor(n);
        out.push({
          n,
          world,
          unit,
          indexInUnit: n - unit.firstLevel + 1,
          difficulty: DIFFICULTY_TIERS[d],
          difficultyRank: d,
          isCheckpoint: n % 10 === 0,
          isMilestone: n % 50 === 0,
          isMajor: n % 100 === 0,
        });
      }
    }
  }
  return out;
}

export const LEVELS: readonly Level[] = build();

export function getLevel(n: number): Level | undefined {
  return Number.isInteger(n) && n >= 1 && n <= TOTAL_LEVELS ? LEVELS[n - 1] : undefined;
}
