import { describe, expect, it } from 'vitest';
import { LESSONS } from './index';
import { classifyMove, namePosition, whichLine, whichSpace } from './helpers';
import { motion, posName } from './staff';
import type { Figure, Question } from './types';
import { getLevel } from '../data/levels';

const lessons = Object.values(LESSONS);
const figuresOf = (q: Question): Figure[] => (q.kind === 'choice' && q.figure ? [q.figure] : []);

describe('lesson catalogue', () => {
  it('has Levels 1–10, each matching its roadmap unit', () => {
    expect(lessons.map((l) => l.level).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const l of lessons) expect(getLevel(l.level)!.unit.title).toBe('The Staff');
  });

  it('every lesson has its own title and objective', () => {
    expect(new Set(lessons.map((l) => l.title)).size).toBe(lessons.length);
    expect(new Set(lessons.map((l) => l.objective)).size).toBe(lessons.length);
  });

  it('every lesson has all four parts', () => {
    for (const l of lessons) {
      expect(l.intro.length, `L${l.level} intro`).toBeGreaterThan(0);
      expect(l.steps.length, `L${l.level} steps`).toBeGreaterThanOrEqual(2);
      expect(l.practice.length, `L${l.level} practice`).toBeGreaterThanOrEqual(3);
      expect(l.challenge.length, `L${l.level} challenge`).toBeGreaterThanOrEqual(5);
      for (const s of l.steps) expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it('question ids are unique across the course', () => {
    const ids = lessons.flatMap((l) => [...l.practice, ...l.challenge].map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no lesson asks the same question twice', () => {
    for (const l of lessons) {
      const sigs = [...l.practice, ...l.challenge].map(({ id: _id, ...rest }) => JSON.stringify(rest));
      expect(new Set(sigs).size, `L${l.level}`).toBe(sigs.length);
    }
  });
});

describe('every question', () => {
  const all = lessons.flatMap((l) => [...l.practice, ...l.challenge].map((q) => ({ l, q })));

  it('has a valid answer and an explanation', () => {
    for (const { q } of all) {
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
      if (q.kind === 'choice') {
        const ids = q.options.map((o) => o.id);
        expect(new Set(ids).size, q.id).toBe(ids.length);
        expect(ids.length, q.id).toBeGreaterThanOrEqual(2);
        expect(ids, q.id).toContain(q.answer);
      } else {
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThanOrEqual(8);
      }
    }
  });

  it('explains every wrong option specifically', () => {
    for (const { q } of all) {
      if (q.kind !== 'choice') continue;
      for (const o of q.options) if (o.id !== q.answer) expect(o.feedback, `${q.id}/${o.id}`).toBeTruthy();
    }
  });

  it('draws only positions on or just around the staff, with consistent arcs', () => {
    const figs = [...all.flatMap(({ q }) => figuresOf(q)), ...lessons.flatMap((l) => l.steps.flatMap((s) => (s.figure ? [s.figure] : [])))];
    for (const f of figs) {
      for (const p of [...(f.notes ?? []), ...(f.highlight ?? [])]) { expect(p).toBeGreaterThanOrEqual(-1); expect(p).toBeLessThanOrEqual(9); }
      for (const a of f.arcs ?? []) {
        const notes = f.notes!;
        expect(a.from + 1).toBeLessThan(notes.length);
        expect(a.label, f.alt).toBe(motion(notes[a.from], notes[a.from + 1]));
      }
      expect(f.alt.length).toBeGreaterThan(5);
    }
  });
});

describe('question builders', () => {
  it('whichLine / whichSpace answer matches the highlighted position', () => {
    for (const p of [0, 2, 4, 6, 8]) expect(whichLine('x', p).answer).toBe(`line${p / 2 + 1}`);
    for (const p of [1, 3, 5, 7]) expect(whichSpace('x', p).answer).toBe(`space${(p + 1) / 2}`);
  });

  it('namePosition gives 4 distinct options including the answer', () => {
    for (let p = 0; p <= 8; p++) {
      const q = namePosition('x', p);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options.map((o) => o.text)).size).toBe(4);
      expect(q.options.find((o) => o.id === q.answer)!.text.toLowerCase()).toBe(posName(p));
    }
  });

  it('classifyMove answers by actual distance and direction', () => {
    expect(classifyMove('x', 2, 3, ['step', 'skip']).answer).toBe('step');
    expect(classifyMove('x', 2, 4, ['step', 'skip']).answer).toBe('skip');
    expect(classifyMove('x', 0, 6, ['step', 'skip', 'leap']).answer).toBe('leap');
    expect(classifyMove('x', 6, 5, ['step'], true).answer).toBe('step-down');
    expect(classifyMove('x', 3, 5, ['skip'], true).answer).toBe('skip-up');
  });
});
