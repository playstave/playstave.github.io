import type { Lesson } from './types';
import { levelKind } from '../course/map';
import { level01 } from './level01';
import { level02 } from './level02';
import { level03 } from './level03';
import { level04 } from './level04';
import { level05 } from './level05';
import { level06 } from './level06';
import { level07 } from './level07';
import { level08 } from './level08';
import { level09 } from './level09';
import { level10 } from './level10';

/** Authored theory lessons, keyed by theory-lesson number (1 = first theory level). */
export const LESSONS: Record<number, Lesson> = Object.fromEntries(
  [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10].map((l) => [l.level, l]),
);

/**
 * The theory lesson at course Level `level`, if any. Theory lessons sit at
 * fixed random positions in the course (see course/map.ts); lesson N (its own
 * `level` field, 1–10) is the Nth theory level.
 */
export function getLesson(level: number): Lesson | undefined {
  const k = levelKind(level);
  return k.kind === 'theory' ? LESSONS[k.index] : undefined;
}
