/**
 * Streak rules — designed to encourage, not punish.
 *
 * - A streak counts practice days.
 * - One rest day between practice days is allowed: missing a single day never
 *   breaks a streak. Missing two days in a row ends it.
 * - Today never counts against you: until today is over, a streak that was
 *   alive yesterday (or the day before, with a rest day) is still alive.
 * - Your best streak is kept forever, so a reset never erases what you built.
 */
import { addDays, dayKey } from './dates';

export const REST_DAYS_ALLOWED = 1;

export interface StreakInfo {
  /** Practice days in the current run (0 if the run has ended). */
  current: number;
  best: number;
  practicedToday: boolean;
  /** True when the student must practise today to keep the streak (yesterday was a rest day). */
  restDayUsed: boolean;
}

function parse(k: string): Date {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86_400_000);

export function streakInfo(days: Iterable<string>, today: Date = new Date()): StreakInfo {
  const set = new Set(days);
  const todayKey = dayKey(today);
  const practicedToday = set.has(todayKey);

  // Current run: walk back from today (today itself is never a miss).
  let current = 0;
  let misses = 0;
  let restDayUsed = false;
  let cursor = practicedToday ? today : addDays(today, -1);
  for (let i = 0; i < 4000; i++) {
    if (set.has(dayKey(cursor))) { current++; misses = 0; }
    else {
      misses++;
      if (misses > REST_DAYS_ALLOWED) break;
      if (current === 0 && !practicedToday) restDayUsed = true;
    }
    cursor = addDays(cursor, -1);
  }
  if (current === 0) restDayUsed = false;

  // Best run across all history, same rule.
  const sorted = [...set].filter((k) => k <= todayKey).sort();
  let best = 0;
  let run = 0;
  for (let i = 0; i < sorted.length; i++) {
    const gap = i === 0 ? 1 : daysBetween(parse(sorted[i - 1]), parse(sorted[i]));
    run = gap <= 1 + REST_DAYS_ALLOWED ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current), practicedToday, restDayUsed };
}
