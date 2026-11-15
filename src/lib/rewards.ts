/**
 * One entry point for everything a student does that can earn rewards.
 * Applies the activity, records the practice day, pays XP (never twice for the
 * same thing), pays streak bonuses, and unlocks achievements — in that order.
 */
import type { StudentProgress } from '../state/progress';
import { HISTORY_LIMIT, RECENT_LIMIT } from '../state/progress';
import { completeLevel, type CompletionResult } from './progression';
import { dailyAward, lessonAwards, payAwards, practiceSetAward, streakAwards, xpFromKeys, type Award } from './xp';
import { theoryLevel } from '../course/map';
import { unlockAchievements } from './achievements';
import { streakInfo } from './streak';
import { dayKey } from './dates';

export type Activity =
  | { kind: 'lesson'; level: number; stars: number; score: number }
  | { kind: 'practiceSet' }
  | { kind: 'daily'; correct: number; total: number }
  | { kind: 'openScore'; scoreId: string };

export interface Outcome {
  state: StudentProgress;
  /** XP actually paid by this activity (empty on a no-improvement replay). */
  awards: Award[];
  xpGained: number;
  unlocked: string[];
  completion?: CompletionResult<StudentProgress>;
  streak: { before: number; after: number; best: number };
  /** Set when this activity first reached a 50-level milestone. */
  milestone?: number;
}

export function recordActivity(input: StudentProgress, a: Activity, now: Date = new Date()): Outcome {
  const at = now.toISOString();
  const today = dayKey(now);
  const before = streakInfo(input.practiceDays, now).current;
  let s = input;
  let completion: CompletionResult<StudentProgress> | undefined;
  const candidates: Award[] = [];

  if (a.kind === 'lesson') {
    completion = completeLevel(s, a.level, a.stars, a.score); // throws for locked levels
    s = completion.state;
    s = { ...s, history: [{ level: a.level, at, stars: a.stars, score: a.score, replay: completion.replay }, ...s.history].slice(0, HISTORY_LIMIT) };
    candidates.push(...lessonAwards(a.level, s.completedLevels[a.level].stars));
  } else if (a.kind === 'practiceSet') {
    s = { ...s, counters: { ...s.counters, practiceSets: s.counters.practiceSets + 1 } };
    candidates.push(practiceSetAward(today));
  } else if (a.kind === 'daily') {
    s = { ...s, counters: { ...s.counters, dailyChallenges: s.counters.dailyChallenges + 1 }, lastDaily: { day: today, correct: a.correct, total: a.total } };
    candidates.push(dailyAward(today));
  } else {
    // Opening a score: library bookkeeping and badges only — no XP, not a practice day.
    const opened = s.openedScores.includes(a.scoreId) ? s.openedScores : [...s.openedScores, a.scoreId];
    s = {
      ...s,
      openedScores: opened,
      recentScores: [a.scoreId, ...s.recentScores.filter((id) => id !== a.scoreId)].slice(0, RECENT_LIMIT),
      counters: { ...s.counters, scoresOpened: opened.length },
    };
    const ach = unlockAchievements(s, at, now);
    const info0 = streakInfo(s.practiceDays, now);
    return { state: ach.state, awards: [], xpGained: 0, unlocked: ach.unlocked, streak: { before, after: info0.current, best: info0.best } };
  }

  if (!s.practiceDays.includes(today)) s = { ...s, practiceDays: [...s.practiceDays, today] };
  const info = streakInfo(s.practiceDays, now);
  candidates.push(...streakAwards(info.current));

  const paidResult = payAwards(s, candidates, at);
  s = paidResult.state;
  const ach = unlockAchievements(s, at, now);
  s = ach.state;

  const milestone = paidResult.paid.find((p) => p.key.startsWith('milestone:'));
  return {
    state: s,
    awards: paidResult.paid,
    xpGained: paidResult.paid.reduce((t, p) => t + p.amount, 0),
    unlocked: ach.unlocked,
    completion,
    streak: { before, after: info.current, best: info.best },
    milestone: milestone ? Number(milestone.key.split(':')[1]) : undefined,
  };
}

/**
 * Course layout 1 → 2. In layout 1, Levels 1–10 were the ten reading lessons;
 * in layout 2 those lessons sit at the first ten theory positions. Results,
 * history and XP award keys move with each lesson, so nothing earned is lost
 * and nothing is paid twice. The student continues from the first level they
 * haven't completed in the new layout.
 */
export function moveToCourse2(s: StudentProgress): StudentProgress {
  const to = (n: number) => (n >= 1 && n <= 10 ? theoryLevel(n) : n);
  const completedLevels: StudentProgress['completedLevels'] = {};
  for (const [n, r] of Object.entries(s.completedLevels)) if (Number(n) <= 10) completedLevels[to(Number(n))] = r;
  const awarded: Record<string, true> = {};
  for (const key of Object.keys(s.awarded)) {
    const m = /^level:(\d+):(.*)$/.exec(key);
    awarded[m ? `level:${to(Number(m[1]))}:${m[2]}` : key] = true;
  }
  const rename = (text: string) => text.replace(/Level (\d+)/g, (_, d) => `Level ${to(Number(d))}`);
  const xpLog = s.xpLog.map((e) => {
    const m = /^level:(\d+):(.*)$/.exec(e.key);
    return m ? { ...e, key: `level:${to(Number(m[1]))}:${m[2]}`, reason: rename(e.reason) } : e;
  });
  let currentLevel = 1;
  while (completedLevels[currentLevel]) currentLevel++;
  return {
    ...s, course: 2, completedLevels, awarded, xpLog, currentLevel,
    history: s.history.filter((h) => h.level <= 10).map((h) => ({ ...h, level: to(h.level) })),
    xp: xpFromKeys(awarded),
  };
}

/**
 * Bring stored progress up to the current shape. Version-1 progress (before XP
 * existed) is credited retroactively under the same rules, so early students
 * aren't penalised; the award keys keep this from ever paying twice.
 */
export function migrate(raw: Partial<StudentProgress> & Record<string, unknown>, defaults: StudentProgress, now: Date = new Date()): StudentProgress {
  let s: StudentProgress = {
    ...defaults,
    ...raw,
    counters: { ...defaults.counters, ...(raw.counters ?? {}) },
    favorites: raw.favorites ?? [],
    collections: raw.collections ?? [],
    recentScores: raw.recentScores ?? [],
    openedScores: raw.openedScores ?? [],
    student: raw.student ?? null,
    course: (raw.course as number | undefined) ?? 1,
    noteDrill: { ...defaults.noteDrill, ...(raw.noteDrill ?? {}) },
    awarded: raw.awarded ?? {},
    xpLog: raw.xpLog ?? [],
    achievements: raw.achievements ?? {},
    history: raw.history ?? [],
    version: 2,
  } as StudentProgress;
  if ((raw.course ?? 1) < 2) s = moveToCourse2(s);
  if (raw.version !== 2) {
    const at = now.toISOString();
    const candidates = Object.entries(s.completedLevels).flatMap(([n, r]) => lessonAwards(Number(n), r.stars));
    s = { ...payAwards({ ...s, xp: 0 }, candidates, at).state };
  }
  return unlockAchievements(s, now.toISOString(), now).state;
}
