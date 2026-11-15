import { describe, expect, it } from 'vitest';
import { initialState, reducer, score, thresholds, type Action, type EngineState } from './lessonEngine';
import type { Lesson } from '../lessons/types';

const q = (id: string, answer: string) => ({ kind: 'choice' as const, id, prompt: id, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], answer, explanation: 'x' });
const lesson: Lesson = {
  level: 1, title: 'T', objective: 'o', intro: ['i'],
  steps: [{ title: 's1', body: ['b'] }, { title: 's2', body: ['b'] }],
  practice: [q('p1', 'a'), q('p2', 'b')],
  challenge: [q('c1', 'a'), q('c2', 'a'), q('c3', 'b'), q('c4', 'b'), q('c5', 'a')],
};
const run = (actions: Action[], from: EngineState = initialState) => actions.reduce(reducer(lesson), from);

describe('lesson flow', () => {
  it('walks intro → steps → practice', () => {
    let s = run([{ type: 'begin' }]);
    expect(s.phase).toBe('lesson');
    s = run([{ type: 'next' }], s);
    expect(s.step).toBe(1);
    s = run([{ type: 'back' }, { type: 'next' }, { type: 'next' }], s);
    expect(s.phase).toBe('practice');
  });

  it('practice: wrong answer explains, blocks Next, allows retry; right answer advances', () => {
    let s = run([{ type: 'begin' }, { type: 'next' }, { type: 'next' }, { type: 'answer', value: 'b' }]);
    expect(s.feedback).toEqual({ correct: false, chosen: 'b' });
    expect(run([{ type: 'next' }], s).q).toBe(0); // cannot skip past a wrong answer
    s = run([{ type: 'answer', value: 'a' }], s);
    expect(s.feedback?.correct).toBe(false); // double tap ignored until retry
    s = run([{ type: 'retry' }, { type: 'answer', value: 'a' }], s);
    expect(s.feedback?.correct).toBe(true);
    expect(s.practiceMisses).toBe(1);
    s = run([{ type: 'next' }, { type: 'answer', value: 'b' }, { type: 'next' }], s);
    expect(s.phase).toBe('briefing');
    expect(s.results).toEqual([]); // practice is never scored
  });

  it('challenge: one try per question, no retry, records first answers', () => {
    let s = run([{ type: 'begin' }, { type: 'next' }, { type: 'next' }, { type: 'answer', value: 'a' }, { type: 'next' }, { type: 'answer', value: 'b' }, { type: 'next' }, { type: 'startChallenge' }]);
    expect(s.phase).toBe('challenge');
    s = run([{ type: 'answer', value: 'b' }, { type: 'retry' }, { type: 'answer', value: 'a' }], s);
    expect(s.results).toEqual([{ id: 'c1', correct: false, chosen: 'b' }]);
    for (const v of ['a', 'b', 'b', 'a']) s = run([{ type: 'next' }, { type: 'answer', value: v }], s);
    s = run([{ type: 'next' }], s);
    expect(s.phase).toBe('result');
    expect(score(lesson, s.results)).toMatchObject({ correct: 4, total: 5, percent: 80, passed: true, stars: 2 });
    s = run([{ type: 'retakeChallenge' }], s);
    expect(s).toMatchObject({ phase: 'briefing', results: [] });
  });
});

describe('scoring', () => {
  const r = (n: number, of: number) => Array.from({ length: of }, (_, i) => ({ id: String(i), correct: i < n, chosen: 'a' }));
  it('maps accuracy to stars', () => {
    expect(score(lesson, r(5, 5)).stars).toBe(3);
    expect(score(lesson, r(4, 5)).stars).toBe(2);
    expect(score(lesson, r(3, 5)).stars).toBe(1);
    expect(score(lesson, r(2, 5))).toMatchObject({ passed: false, stars: 0 });
  });
  it('respects a raised pass mark', () => {
    const cp = { ...lesson, passMark: 70, challenge: Array.from({ length: 8 }, (_, i) => q('c' + i, 'a')) };
    expect(score(cp, r(5, 8)).passed).toBe(false);
    expect(score(cp, r(6, 8))).toMatchObject({ passed: true, stars: 1 });
    expect(score(cp, r(7, 8)).stars).toBe(2);
    expect(thresholds(cp)).toEqual({ total: 8, pass: 6, two: 7, three: 8 });
  });
  it('thresholds agree with score for every size', () => {
    for (let total = 3; total <= 12; total++) {
      for (const passMark of [60, 70, 75]) {
        const l = { ...lesson, passMark, challenge: Array.from({ length: total }, (_, i) => q('c' + i, 'a')) };
        const t = thresholds(l);
        for (let n = 0; n <= total; n++) {
          const sc = score(l, r(n, total));
          expect(sc.passed).toBe(n >= t.pass);
          expect(sc.stars >= 2).toBe(n >= t.two);
          expect(sc.stars === 3).toBe(n === t.three);
        }
      }
    }
  });
});
