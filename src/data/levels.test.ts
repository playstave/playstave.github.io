import { describe, expect, it } from 'vitest';
import { getLevel, LEVELS } from './levels';
import { WORLDS } from './curriculum';

describe('level model', () => {
  it('has exactly 500 sequential levels', () => {
    expect(LEVELS).toHaveLength(500);
    LEVELS.forEach((l, i) => expect(l.n).toBe(i + 1));
  });

  it('places world boundaries per the curriculum', () => {
    expect(WORLDS.map((w) => [w.firstLevel, w.lastLevel])).toEqual([[1, 100], [101, 200], [201, 300], [301, 400], [401, 450], [451, 500]]);
    expect(getLevel(100)!.world.id).toBe(1);
    expect(getLevel(101)!.world.id).toBe(2);
    expect(getLevel(450)!.world.id).toBe(5);
    expect(getLevel(451)!.world.id).toBe(6);
  });

  it('marks checkpoints every 10, milestones every 50, majors every 100', () => {
    expect(LEVELS.filter((l) => l.isCheckpoint).map((l) => l.n)).toEqual(Array.from({ length: 50 }, (_, i) => (i + 1) * 10));
    expect(LEVELS.filter((l) => l.isMilestone).map((l) => l.n)).toEqual([50, 100, 150, 200, 250, 300, 350, 400, 450, 500]);
    expect(LEVELS.filter((l) => l.isMajor).map((l) => l.n)).toEqual([100, 200, 300, 400, 500]);
  });

  it('every unit has 10 levels and checkpoints close units', () => {
    for (const l of LEVELS) {
      expect(l.indexInUnit).toBeGreaterThanOrEqual(1);
      expect(l.indexInUnit).toBeLessThanOrEqual(10);
      if (l.isCheckpoint) expect(l.n).toBe(l.unit.lastLevel);
    }
  });

  it('difficulty never decreases and ends at Master', () => {
    for (let i = 1; i < LEVELS.length; i++) expect(LEVELS[i].difficultyRank).toBeGreaterThanOrEqual(LEVELS[i - 1].difficultyRank);
    expect(getLevel(1)!.difficulty).toBe('Beginner');
    expect(getLevel(500)!.difficulty).toBe('Master');
  });

  it('getLevel rejects out-of-range input', () => {
    expect(getLevel(0)).toBeUndefined();
    expect(getLevel(501)).toBeUndefined();
    expect(getLevel(2.5)).toBeUndefined();
  });
});
