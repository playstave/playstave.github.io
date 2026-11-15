/**
 * Achievement conditions, evaluated against real progress. A badge is unlocked
 * the first time its condition holds and is never taken away.
 */
import { ACHIEVEMENTS } from '../data/achievements';
import type { StudentProgress } from '../state/progress';
import { streakInfo } from './streak';

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const UNIT1 = range(1, 10);
const CLEF_LEVELS = range(21, 60);
const RHYTHM_LEVELS = [...range(61, 100), ...range(181, 200)];
const KEY_LEVELS = range(111, 130);
const SIGHT_LEVELS = range(381, 390);

export interface Measure { current: number; target: number }

/** Progress toward each badge, so the page can show "7 of 10" rather than just "locked". */
export function measure(id: string, s: StudentProgress, today = new Date()): Measure {
  const done = Object.keys(s.completedLevels).length;
  const perfect = (levels: number[]) => levels.filter((n) => s.completedLevels[n]?.stars === 3).length;
  switch (id) {
    case 'first-lesson': return { current: s.completedLevels[1] ? 1 : 0, target: 1 };
    case 'ten-levels': return { current: Math.min(done, 10), target: 10 };
    case 'fifty-levels': return { current: Math.min(done, 50), target: 50 };
    case 'hundred-levels': return { current: s.completedLevels[100] ? 1 : 0, target: 1 };
    case 'grandmaster': return { current: s.completedLevels[500] ? 1 : 0, target: 1 };
    case 'first-perfect': return { current: Object.values(s.completedLevels).some((l) => l.stars === 3) ? 1 : 0, target: 1 };
    case 'staff-star': return { current: perfect(UNIT1), target: UNIT1.length };
    case 'clef-expert': return { current: perfect(CLEF_LEVELS), target: CLEF_LEVELS.length };
    case 'rhythm-master': return { current: perfect(RHYTHM_LEVELS), target: RHYTHM_LEVELS.length };
    case 'key-keeper': return { current: perfect(KEY_LEVELS), target: KEY_LEVELS.length };
    case 'sight-reader': return { current: perfect(SIGHT_LEVELS), target: SIGHT_LEVELS.length };
    case 'first-daily': return { current: Math.min(s.counters.dailyChallenges, 1), target: 1 };
    case 'week-streak': return { current: Math.min(streakInfo(s.practiceDays, today).best, 7), target: 7 };
    case 'month-streak': return { current: Math.min(streakInfo(s.practiceDays, today).best, 30), target: 30 };
    case 'ten-sets': return { current: Math.min(s.counters.practiceSets, 10), target: 10 };
    case 'sheet-explorer': return { current: Math.min(s.counters.scoresOpened, 25), target: 25 };
    default: return { current: 0, target: 1 };
  }
}

export const isMet = (id: string, s: StudentProgress, today?: Date) => { const m = measure(id, s, today); return m.current >= m.target; };

/** Unlock every newly met badge. Returns the new state and the ids unlocked now. */
export function unlockAchievements(s: StudentProgress, at: string, today?: Date): { state: StudentProgress; unlocked: string[] } {
  const unlocked = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && isMet(a.id, s, today)).map((a) => a.id);
  if (!unlocked.length) return { state: s, unlocked };
  const achievements = { ...s.achievements };
  for (const id of unlocked) achievements[id] = at;
  return { state: { ...s, achievements }, unlocked };
}
