import { describe, expect, it } from 'vitest';
import { DAILY_SIZE, dailyQuestions } from './daily';

describe('daily challenge', () => {
  it('is empty until a lesson is completed', () => {
    expect(dailyQuestions('2026-11-14', {})).toEqual([]);
  });
  it('picks 5 distinct questions only from completed levels', () => {
    const q = dailyQuestions('2026-11-14', { 1: { stars: 3 }, 2: { stars: 1 } });
    expect(q).toHaveLength(DAILY_SIZE);
    expect(new Set(q.map((x) => x.question.id)).size).toBe(DAILY_SIZE);
    for (const x of q) expect([1, 2]).toContain(x.level);
  });
  it('is the same all day and different on another day', () => {
    const c = { 1: { stars: 2 }, 2: { stars: 2 }, 3: { stars: 2 }, 4: { stars: 2 } };
    const a = dailyQuestions('2026-11-14', c).map((x) => x.question.id);
    expect(dailyQuestions('2026-11-14', c).map((x) => x.question.id)).toEqual(a);
    expect(dailyQuestions('2026-11-15', c).map((x) => x.question.id)).not.toEqual(a);
  });
  it('favours weaker levels', () => {
    let weak = 0; let strong = 0;
    for (let d = 1; d <= 28; d++) {
      for (const x of dailyQuestions(`2026-11-${String(d).padStart(2, '0')}`, { 1: { stars: 3 }, 2: { stars: 1 } })) x.level === 2 ? weak++ : strong++;
    }
    expect(weak).toBeGreaterThan(strong);
  });
  it('ignores completed levels without lesson content', () => {
    expect(dailyQuestions('2026-11-14', { 11: { stars: 1 } })).toEqual([]);
  });
});
