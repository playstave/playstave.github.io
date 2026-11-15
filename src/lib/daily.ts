/**
 * The daily challenge: a short mixed review drawn from levels the student has
 * already completed — spaced practice of what they have actually learned.
 * Questions are chosen deterministically from the date, so the challenge is the
 * same all day (and after a refresh) and changes tomorrow.
 */
import { getLesson } from '../lessons';
import type { Question } from '../lessons/types';

export const DAILY_SIZE = 5;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed;
  return () => { t = (t + 0x6d2b79f5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
}

export interface DailyQuestion { level: number; question: Question }

/** Levels with lesson content that the student has completed. Weaker levels (fewer stars) are favoured. */
export function dailyQuestions(day: string, completed: Record<number, { stars: number }>): DailyQuestion[] {
  const levels = Object.keys(completed).map(Number).filter((n) => getLesson(n));
  if (!levels.length) return [];
  const pool: DailyQuestion[] = [];
  for (const n of levels) {
    const weight = 4 - (completed[n]?.stars ?? 0); // 1★ levels appear three times as often as 3★ levels
    const lesson = getLesson(n)!;
    for (const q of [...lesson.practice, ...lesson.challenge]) for (let w = 0; w < weight; w++) pool.push({ level: n, question: q });
  }
  const rand = rng(hash(day));
  const picked: DailyQuestion[] = [];
  const seen = new Set<string>();
  for (let guard = 0; picked.length < DAILY_SIZE && guard < 10_000; guard++) {
    const c = pool[Math.floor(rand() * pool.length)];
    if (seen.has(c.question.id)) continue;
    seen.add(c.question.id);
    picked.push(c);
  }
  return picked;
}
