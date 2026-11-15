import { describe, expect, it } from 'vitest';
import { migrate, recordActivity } from './rewards';
import { DEFAULT_PROGRESS, type StudentProgress } from '../state/progress';
import { XP } from './xp';

const day = (d: number, h = 10) => new Date(2026, 10, d, h);
const fresh = (): StudentProgress => structuredClone(DEFAULT_PROGRESS);
const play = (s: StudentProgress, level: number, stars: number, d = 14) => recordActivity(s, { kind: 'lesson', level, stars, score: 60 + stars * 10 }, day(d));

describe('lesson XP', () => {
  it('first pass pays the lesson plus one award per star', () => {
    const o = play(fresh(), 1, 2);
    expect(o.awards.map((a) => a.key)).toEqual(['level:1:pass', 'level:1:star:1', 'level:1:star:2']);
    expect(o.xpGained).toBe(XP.lessonPass + 2 * XP.perStar);
    expect(o.state.xp).toBe(30);
  });

  it('checkpoints pay more', () => {
    let s = fresh();
    for (let n = 1; n <= 9; n++) s = play(s, n, 1).state;
    const o = play(s, 10, 1);
    expect(o.awards.find((a) => a.key === 'level:10:pass')!.amount).toBe(XP.checkpointPass);
  });

  it('replaying with the same or fewer stars pays nothing', () => {
    const s = play(fresh(), 1, 3).state;
    expect(play(s, 1, 3).xpGained).toBe(0);
    expect(play(s, 1, 1).xpGained).toBe(0);
    expect(play(s, 1, 1).state.xp).toBe(s.xp);
  });

  it('replaying with more stars pays only the new stars', () => {
    const s = play(fresh(), 1, 1).state;
    const o = play(s, 1, 3);
    expect(o.awards.map((a) => a.key)).toEqual(['level:1:star:2', 'level:1:star:3']);
    expect(o.state.xp).toBe(s.xp + 2 * XP.perStar);
    expect(play(o.state, 1, 3).xpGained).toBe(0);
  });

  it('records history for passes and replays', () => {
    let s = play(fresh(), 1, 1).state;
    s = play(s, 1, 2).state;
    expect(s.history.map((h) => [h.level, h.stars, h.replay])).toEqual([[1, 2, true], [1, 1, false]]);
  });

  it('locked levels earn nothing (throws)', () => {
    expect(() => play(fresh(), 2, 3)).toThrow(/locked/);
  });

  it('milestones pay once, at 50 and 100', () => {
    let s = fresh();
    let m50: number | undefined; let m100: number | undefined;
    for (let n = 1; n <= 100; n++) { const o = play(s, n, 1); s = o.state; if (n === 50) m50 = o.milestone; if (n === 100) m100 = o.milestone; }
    expect(m50).toBe(50);
    expect(m100).toBe(100);
    expect(s.awarded['milestone:50'] && s.awarded['milestone:100']).toBe(true);
    expect(play(s, 50, 3).milestone).toBeUndefined();
  });
});

describe('practice and daily XP', () => {
  it('first practice set each day pays; more sets that day do not', () => {
    let o = recordActivity(fresh(), { kind: 'practiceSet' }, day(14, 9));
    expect(o.xpGained).toBe(XP.practiceSet);
    o = recordActivity(o.state, { kind: 'practiceSet' }, day(14, 18));
    expect(o.xpGained).toBe(0);
    expect(o.state.counters.practiceSets).toBe(2);
    o = recordActivity(o.state, { kind: 'practiceSet' }, day(15));
    expect(o.awards.map((a) => a.key)).toContain('practice:2026-11-15');
  });

  it('daily challenge pays once per day', () => {
    let o = recordActivity(fresh(), { kind: 'daily', correct: 3, total: 5 }, day(14));
    expect(o.awards.map((a) => a.key)).toEqual(['daily:2026-11-14']);
    o = recordActivity(o.state, { kind: 'daily', correct: 5, total: 5 }, day(14, 20));
    expect(o.xpGained).toBe(0);
  });
});

describe('streak rewards', () => {
  it('pays 3- and 7-day streak bonuses once each, including across a rest day', () => {
    let s = fresh();
    const gained: string[] = [];
    for (const d of [1, 2, 3, 5, 6, 7, 8]) { const o = recordActivity(s, { kind: 'practiceSet' }, day(d)); s = o.state; gained.push(...o.awards.map((a) => a.key).filter((k) => k.startsWith('streak'))); }
    expect(gained).toEqual(['streak:3', 'streak:7']);
    expect(s.achievements['week-streak']).toBeTruthy();
  });

  it('a broken streak never takes XP away', () => {
    let s = fresh();
    for (const d of [1, 2, 3]) s = recordActivity(s, { kind: 'practiceSet' }, day(d)).state;
    const xp = s.xp;
    const o = recordActivity(s, { kind: 'practiceSet' }, day(10));
    expect(o.streak).toMatchObject({ after: 1, best: 3 });
    expect(o.state.xp).toBe(xp + XP.practiceSet);
  });
});

describe('achievements from real progress', () => {
  it('first lesson, first perfect, staff star, ten levels', () => {
    let s = fresh();
    let o = play(s, 1, 2); s = o.state;
    expect(o.unlocked).toEqual(['first-lesson']);
    o = play(s, 2, 3); s = o.state;
    expect(o.unlocked).toEqual(['first-perfect']);
    for (let n = 3; n <= 9; n++) s = play(s, n, 3).state;
    o = play(s, 10, 3); s = o.state;
    expect(o.unlocked).toEqual(['ten-levels']); // level 1 still has 2★, so no Staff Star yet
    o = play(s, 1, 3);
    expect(o.unlocked).toEqual(['staff-star']);
  });

  it('daily and practice-set badges', () => {
    let o = recordActivity(fresh(), { kind: 'daily', correct: 2, total: 5 }, day(14));
    expect(o.unlocked).toContain('first-daily');
    let s = o.state;
    for (let i = 0; i < 9; i++) s = recordActivity(s, { kind: 'practiceSet' }, day(14, 12)).state;
    o = recordActivity(s, { kind: 'practiceSet' }, day(14, 13));
    expect(o.unlocked).toEqual(['ten-sets']);
  });

  it('badges are unlocked once and never repeated', () => {
    const s = play(fresh(), 1, 3).state;
    expect(play(s, 1, 3).unlocked).toEqual([]);
  });
});

describe('library activity', () => {
  it('opening scores tracks recent and distinct opens, pays no XP and is not a practice day', () => {
    let s = fresh();
    for (const id of ['a', 'b', 'a', 'c']) s = recordActivity(s, { kind: 'openScore', scoreId: id }, day(14)).state;
    expect(s.recentScores).toEqual(['c', 'a', 'b']);
    expect(s.openedScores).toEqual(['a', 'b', 'c']);
    expect(s.counters.scoresOpened).toBe(3);
    expect(s.xp).toBe(0);
    expect(s.practiceDays).toEqual([]);
  });
  it('recent list is capped, Sheet Music Explorer unlocks at 25 distinct scores', () => {
    let s = fresh();
    let last;
    for (let i = 0; i < 25; i++) { last = recordActivity(s, { kind: 'openScore', scoreId: `s${i}` }, day(14)); s = last.state; }
    expect(s.recentScores).toHaveLength(8);
    expect(last!.unlocked).toEqual(['sheet-explorer']);
    expect(recordActivity(s, { kind: 'openScore', scoreId: 's0' }, day(14)).unlocked).toEqual([]);
  });
});

describe('migration', () => {
  it('credits version-1 progress retroactively, exactly once', () => {
    const v1 = { displayName: 'A', currentLevel: 3, xp: 0, completedLevels: { 1: { stars: 3, bestScore: 100 }, 2: { stars: 1, bestScore: 67 } }, practiceDays: [], noteDrill: { answered: 0, correct: 0 } };
    const m = migrate(v1 as never, DEFAULT_PROGRESS, day(14));
    expect(m.xp).toBe(20 + 15 + 20 + 5);
    expect(m.achievements['first-lesson'] && m.achievements['first-perfect']).toBeTruthy();
    expect(migrate(m as never, DEFAULT_PROGRESS, day(15)).xp).toBe(m.xp);
  });
});
