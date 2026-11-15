import { describe, expect, it } from 'vitest';
import { canOpen, completeLevel, isCourseComplete, levelStatus, nextLevel, type ProgressionState } from './progression';

const fresh = (): ProgressionState => ({ currentLevel: 1, completedLevels: {} });

describe('sequential unlocking', () => {
  it('only Level 1 is open for a new student', () => {
    const s = fresh();
    expect(canOpen(1, s)).toBe(true);
    expect(canOpen(2, s)).toBe(false);
    expect(canOpen(500, s)).toBe(false);
    expect(levelStatus(1, s)).toBe('current');
    expect(levelStatus(2, s)).toBe('locked');
  });

  it('completing Level 1 unlocks Level 2 and nothing else', () => {
    const r = completeLevel(fresh(), 1, 2, 80);
    expect(r.unlockedNext).toBe(true);
    expect(r.state.currentLevel).toBe(2);
    expect(levelStatus(1, r.state)).toBe('completed');
    expect(levelStatus(2, r.state)).toBe('current');
    expect(canOpen(3, r.state)).toBe(false);
  });

  it('refuses to complete a locked level (no skipping)', () => {
    expect(() => completeLevel(fresh(), 2, 3, 100)).toThrow(/locked/);
    expect(() => completeLevel(fresh(), 50, 3, 100)).toThrow(/locked/);
  });

  it('rejects invalid level numbers', () => {
    const s = fresh();
    for (const n of [0, -1, 1.5, 501, Number.NaN]) expect(canOpen(n, s)).toBe(false);
  });

  it('can walk all 500 levels in order and finish the course', () => {
    let s = fresh();
    for (let n = 1; n <= 500; n++) s = completeLevel(s, n, 1, 60).state;
    expect(s.currentLevel).toBe(501);
    expect(isCourseComplete(s)).toBe(true);
    expect(nextLevel(s)).toBe(500);
    expect(Object.keys(s.completedLevels)).toHaveLength(500);
    expect(canOpen(500, s)).toBe(true); // still replayable
  });
});

describe('replaying', () => {
  it('replay keeps the best result and never unlocks', () => {
    let s = completeLevel(fresh(), 1, 3, 95).state;
    const r = completeLevel(s, 1, 1, 50);
    expect(r.replay).toBe(true);
    expect(r.unlockedNext).toBe(false);
    expect(r.improved).toBe(false);
    expect(r.state.currentLevel).toBe(2);
    expect(r.state.completedLevels[1]).toEqual({ stars: 3, bestScore: 95 });
    s = completeLevel(completeLevel(fresh(), 1, 1, 60).state, 1, 2, 70).state;
    expect(s.completedLevels[1]).toEqual({ stars: 2, bestScore: 70 });
  });

  it('validates stars and clamps score', () => {
    expect(() => completeLevel(fresh(), 1, 0, 50)).toThrow(RangeError);
    expect(() => completeLevel(fresh(), 1, 4, 50)).toThrow(RangeError);
    expect(completeLevel(fresh(), 1, 1, 140).state.completedLevels[1].bestScore).toBe(100);
  });
});
