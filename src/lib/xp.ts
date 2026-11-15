/**
 * XP rules. Every award carries a unique key; an award whose key has been paid
 * before is never paid again. That one rule is what makes replays fair.
 */
import type { StudentProgress, XpEvent } from '../state/progress';
import { XP_LOG_LIMIT } from '../state/progress';

export interface Award { key: string; amount: number; reason: string }

export const XP = {
  lessonPass: 20,
  checkpointPass: 40,
  perStar: 5,
  milestone50: 50,
  milestone100: 100,
  dailyChallenge: 15,
  practiceSet: 5,
  streak: { 3: 10, 7: 25, 14: 50, 30: 100 } as Record<number, number>,
} as const;

/** Candidate awards for passing a level with a given best star count. */
export function lessonAwards(level: number, bestStars: number): Award[] {
  const out: Award[] = [];
  const checkpoint = level % 10 === 0;
  out.push({ key: `level:${level}:pass`, amount: checkpoint ? XP.checkpointPass : XP.lessonPass, reason: checkpoint ? `Passed checkpoint Level ${level}` : `Completed Level ${level}` });
  for (let k = 1; k <= bestStars; k++) out.push({ key: `level:${level}:star:${k}`, amount: XP.perStar, reason: `Star ${k} on Level ${level}` });
  if (level % 50 === 0) out.push({ key: `milestone:${level}`, amount: level % 100 === 0 ? XP.milestone100 : XP.milestone50, reason: `Milestone: Level ${level}` });
  return out;
}

export function streakAwards(current: number): Award[] {
  return Object.entries(XP.streak)
    .filter(([days]) => current >= Number(days))
    .map(([days, amount]) => ({ key: `streak:${days}`, amount, reason: `${days}-day streak` }));
}

export const dailyAward = (day: string): Award => ({ key: `daily:${day}`, amount: XP.dailyChallenge, reason: 'Daily challenge' });
export const practiceSetAward = (day: string): Award => ({ key: `practice:${day}`, amount: XP.practiceSet, reason: 'First practice set today' });

/**
 * The XP an award key is worth, derived from the key alone. Lets XP be
 * recomputed exactly from the set of keys (used when merging progress from
 * two devices), so a merge can never double-count or lose XP.
 */
export function amountForKey(key: string): number {
  const [kind, a, b] = key.split(':');
  if (kind === 'level' && b === 'pass') return Number(a) % 10 === 0 ? XP.checkpointPass : XP.lessonPass;
  if (kind === 'level' && b === 'star') return XP.perStar;
  if (kind === 'milestone') return Number(a) % 100 === 0 ? XP.milestone100 : XP.milestone50;
  if (kind === 'daily') return XP.dailyChallenge;
  if (kind === 'practice') return XP.practiceSet;
  if (kind === 'streak') return XP.streak[Number(a)] ?? 0;
  return 0;
}

export const xpFromKeys = (awarded: Record<string, true>) => Object.keys(awarded).reduce((t, k) => t + amountForKey(k), 0);

/** Pay only awards never paid before. Returns the new state and what was actually paid. */
export function payAwards(s: StudentProgress, candidates: Award[], at: string): { state: StudentProgress; paid: Award[] } {
  const paid = candidates.filter((a, i) => !s.awarded[a.key] && candidates.findIndex((b) => b.key === a.key) === i);
  if (!paid.length) return { state: s, paid };
  const awarded = { ...s.awarded };
  for (const a of paid) awarded[a.key] = true;
  const events: XpEvent[] = paid.map((a) => ({ ...a, at }));
  return {
    state: { ...s, awarded, xp: s.xp + paid.reduce((t, a) => t + a.amount, 0), xpLog: [...events.reverse(), ...s.xpLog].slice(0, XP_LOG_LIMIT) },
    paid,
  };
}
