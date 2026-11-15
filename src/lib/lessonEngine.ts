/**
 * Lesson flow as a pure state machine:
 *   intro → lesson steps → guided practice → challenge briefing → challenge → result
 *
 * Practice: unlimited tries per question, each wrong try is explained, nothing is scored.
 * Challenge: one try per question (with explanation), scored on first answers.
 */
import type { Answer, Lesson, Question } from '../lessons/types';

export const DEFAULT_PASS_MARK = 60;

export type Phase = 'intro' | 'lesson' | 'practice' | 'briefing' | 'challenge' | 'result';

export interface Feedback { correct: boolean; chosen: Answer }

export interface EngineState {
  phase: Phase;
  step: number;
  q: number;
  feedback: Feedback | null;
  /** Wrong tries on the current practice question (for UI hints). */
  practiceMisses: number;
  /** First-try correctness for each challenge question, in order. */
  results: { id: string; correct: boolean; chosen: Answer }[];
}

export type Action =
  | { type: 'begin' }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'answer'; value: Answer }
  | { type: 'retry' }
  | { type: 'startChallenge' }
  | { type: 'retakeChallenge' }
  | { type: 'reviewLesson' }
  | { type: 'restart' };

export const initialState: EngineState = { phase: 'intro', step: 0, q: 0, feedback: null, practiceMisses: 0, results: [] };

export function isCorrect(q: Question, value: Answer): boolean {
  return q.answer === value;
}

export function currentQuestion(lesson: Lesson, s: EngineState): Question | undefined {
  if (s.phase === 'practice') return lesson.practice[s.q];
  if (s.phase === 'challenge') return lesson.challenge[s.q];
  return undefined;
}

export function reducer(lesson: Lesson) {
  return function reduce(s: EngineState, a: Action): EngineState {
    switch (a.type) {
      case 'begin':
        return s.phase === 'intro' ? { ...s, phase: 'lesson', step: 0 } : s;

      case 'back':
        if (s.phase === 'lesson' && s.step > 0) return { ...s, step: s.step - 1 };
        if (s.phase === 'lesson' && s.step === 0) return { ...s, phase: 'intro' };
        return s;

      case 'answer': {
        if (s.phase !== 'practice' && s.phase !== 'challenge') return s;
        if (s.feedback) return s; // already answered; ignore double taps
        const q = currentQuestion(lesson, s)!;
        const correct = isCorrect(q, a.value);
        if (s.phase === 'practice') {
          return { ...s, feedback: { correct, chosen: a.value }, practiceMisses: s.practiceMisses + (correct ? 0 : 1) };
        }
        return { ...s, feedback: { correct, chosen: a.value }, results: [...s.results, { id: q.id, correct, chosen: a.value }] };
      }

      case 'retry':
        // Only practice allows another try at the same question.
        return s.phase === 'practice' && s.feedback && !s.feedback.correct ? { ...s, feedback: null } : s;

      case 'next': {
        if (s.phase === 'lesson') {
          return s.step < lesson.steps.length - 1 ? { ...s, step: s.step + 1 } : { ...s, phase: 'practice', q: 0, feedback: null, practiceMisses: 0 };
        }
        if (s.phase === 'practice') {
          if (!s.feedback?.correct) return s; // must get it right before moving on
          return s.q < lesson.practice.length - 1
            ? { ...s, q: s.q + 1, feedback: null, practiceMisses: 0 }
            : { ...s, phase: 'briefing', q: 0, feedback: null };
        }
        if (s.phase === 'challenge') {
          if (!s.feedback) return s;
          return s.q < lesson.challenge.length - 1 ? { ...s, q: s.q + 1, feedback: null } : { ...s, phase: 'result', feedback: null };
        }
        return s;
      }

      case 'startChallenge':
        return s.phase === 'briefing' ? { ...s, phase: 'challenge', q: 0, feedback: null, results: [] } : s;

      case 'retakeChallenge':
        return s.phase === 'result' ? { ...s, phase: 'briefing', q: 0, feedback: null, results: [] } : s;

      case 'reviewLesson':
        return { ...initialState, phase: 'lesson' };

      case 'restart':
        return initialState;
    }
  };
}

export interface Score { correct: number; total: number; percent: number; passed: boolean; stars: 0 | 1 | 2 | 3 }

/**
 * Stars from the challenge's first-try accuracy:
 *   below the pass mark → not passed (0)
 *   pass mark – 79%     → ★
 *   80% – 99%           → ★★
 *   100%                → ★★★
 * Checkpoint lessons raise the pass mark; the ★★/★★★ bars stay the same.
 */
export function score(lesson: Lesson, results: EngineState['results']): Score {
  const total = lesson.challenge.length;
  const correct = results.filter((r) => r.correct).length;
  // Decide on the exact ratio; round only for display.
  const raw = total ? (correct / total) * 100 : 0;
  const percent = Math.round(raw);
  const passMark = lesson.passMark ?? DEFAULT_PASS_MARK;
  const passed = raw >= passMark;
  const stars = !passed ? 0 : correct === total ? 3 : raw >= 80 ? 2 : 1;
  return { correct, total, percent, passed, stars };
}

/** The minimum number of correct answers needed for each outcome, for the briefing screen. */
export function thresholds(lesson: Lesson) {
  const total = lesson.challenge.length;
  const need = (pct: number) => Math.ceil((pct / 100) * total);
  const pass = need(lesson.passMark ?? DEFAULT_PASS_MARK);
  return { total, pass, two: Math.max(pass, need(80)), three: total };
}
