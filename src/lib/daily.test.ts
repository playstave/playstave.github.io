import { describe, expect, it } from 'vitest';
import { DAILY_SIZE, dailyQuestions } from './daily';
import { theoryLevel } from '../course/map';

// The reading lessons now sit at the first theory positions of the course.
const T1 = theoryLevel(1), T2 = theoryLevel(2);

describe('daily challenge', () => {
  it('is empty until a lesson is completed', () => {
    expect(dailyQuestions('2026-11-14', {})).toEqual([]);
  });
  it('picks 5 distinct questions only from completed levels', () => {
    const q = dailyQuestions('2026-11-14', { [T1]: { stars: 3 }, [T2]: { stars: 1 } });
    expect(q).toHaveLength(DAILY_SIZE);
    expect(new Set(q.map((x) => x.question.id)).size).toBe(DAILY_SIZE);
    for (const x of q) expect([T1, T2]).toContain(x.level);
  });
  it('is the same all day and different on another day', () => {
    const c = { [T1]: { stars: 2 }, [T2]: { stars: 2 }, [theoryLevel(3)]: { stars: 2 }, [theoryLevel(4)]: { stars: 2 } };
    const a = dailyQuestions('2026-11-14', c).map((x) => x.question.id);
    expect(dailyQuestions('2026-11-14', c).map((x) => x.question.id)).toEqual(a);
    expect(dailyQuestions('2026-11-15', c).map((x) => x.question.id)).not.toEqual(a);
  });
  it('favours weaker levels', () => {
    let weak = 0; let strong = 0;
    for (let d = 1; d <= 28; d++) {
      for (const x of dailyQuestions(`2026-11-${String(d).padStart(2, '0')}`, { [T1]: { stars: 3 }, [T2]: { stars: 1 } })) x.level === T2 ? weak++ : strong++;
    }
    expect(weak).toBeGreaterThan(strong);
  });
  it('ignores completed levels without lesson content', () => {
    expect(dailyQuestions('2026-11-14', { 1: { stars: 1 }, 11: { stars: 1 } })).toEqual([]); // playing levels have no quiz questions
  });
});
