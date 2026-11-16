import { describe, expect, it } from 'vitest';
import { THEORY_COUNT, THEORY_LEVELS, levelKind, playLevel, theoryLevel } from './map';
import { FIRST_POSITION, placeNote, placeOnString } from './fingering';
import { getPlayLevel, HAND_WRITTEN as PLAY_LEVEL_COUNT } from './playLevels';
import { buildTimeline } from '../play/exercise';
import { assessTake, summarise } from '../play/assess';
import { framesFromAudio, renderPerformance } from '../play/perform';
import { getInstrument, INSTRUMENTS, midiName } from '../audio/notes';
import { backingEvents } from '../play/backing';

describe('course map', () => {
  it('has 30–40 theory levels at fixed positions (pinned so they never move under saved progress)', () => {
    expect(THEORY_COUNT).toBeGreaterThanOrEqual(30);
    expect(THEORY_COUNT).toBeLessThanOrEqual(40);
    expect(THEORY_LEVELS).toHaveLength(THEORY_COUNT);
    expect(THEORY_LEVELS.slice(0, 10)).toEqual([9, 12, 25, 44, 51, 72, 75, 94, 102, 113]);
  });
  it('follows the placement rules', () => {
    for (const n of THEORY_LEVELS) {
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(500);
      expect(n % 10).not.toBe(0);
      expect(THEORY_LEVELS.includes(n + 1)).toBe(false);
    }
  });
  it('numbers playing and theory levels consistently', () => {
    let plays = 0, theory = 0;
    for (let n = 1; n <= 500; n++) {
      const k = levelKind(n);
      if (k.kind === 'play') { plays++; expect(k.index).toBe(plays); expect(playLevel(plays)).toBe(n); }
      else { theory++; expect(k.index).toBe(theory); expect(theoryLevel(theory)).toBe(n); }
    }
    expect(plays + theory).toBe(500);
    expect(levelKind(1)).toEqual({ kind: 'play', index: 1 });
    expect(levelKind(9)).toEqual({ kind: 'theory', index: 1 });
  });
});

describe('fingering', () => {
  const fs = (id: string) => { const i = getInstrument(id)!; const d = i.strings.find((s) => s.name === 'D')!.midi; return placeNote(i.id, d + 4)!; };
  it('F♯ on the D string uses each instrument’s own finger', () => {
    expect(fs('violin')).toMatchObject({ stringName: 'D', finger: 2 });
    expect(fs('viola')).toMatchObject({ stringName: 'D', finger: 2 });
    expect(fs('cello')).toMatchObject({ stringName: 'D', finger: 3 });
    expect(fs('bass')).toMatchObject({ stringName: 'D', finger: 4 });
  });
  it('prefers open strings (G on bass is the open G string; A on violin is open A)', () => {
    expect(placeNote('bass', 43)).toMatchObject({ stringName: 'G', finger: 0 });
    expect(placeNote('violin', 69)).toMatchObject({ stringName: 'A', finger: 0 });
    expect(placeNote('cello', 55)).toMatchObject({ stringName: 'D', finger: 4 }); // G3 on cello D string
  });
  it('knows notes outside first position', () => {
    expect(placeNote('violin', 50)).toBeNull(); // D3 is below the violin
    expect(placeOnString('bass', 43 + 5, 3)).toBeNull(); // C on the bass G string needs a shift
  });
  it('tables only use fingers 0–4', () => {
    for (const t of Object.values(FIRST_POSITION)) for (const f of Object.values(t)) expect([0, 1, 2, 3, 4]).toContain(f);
  });
});

describe('playing levels', () => {
  for (const inst of INSTRUMENTS) {
    for (let i = 1; i <= PLAY_LEVEL_COUNT; i++) {
      it(`${inst.name} playing level ${i}: teaches, is playable in first position, and a clean take scores 100%`, () => {
        const lv = getPlayLevel(inst.id, i)!;
        expect(lv.cards.length).toBeGreaterThan(0);
        expect(lv.newIdeas.length).toBeGreaterThan(0);
        const tl = buildTimeline(lv.exercise);
        for (const n of tl.notes) if (n.midi != null) expect(placeNote(inst.id, n.midi), `${midiName(n.midi)} on ${inst.name}`).not.toBeNull();
        for (const m of lv.tryNotes) expect(placeNote(inst.id, m)).not.toBeNull();
        if (lv.exercise.backing) expect(() => backingEvents(lv.exercise.backing!, tl)).not.toThrow();
        const { samples, lead, sampleRate } = renderPerformance(tl);
        const s = summarise(assessTake(tl, framesFromAudio(samples, sampleRate, inst.id, lead)), tl);
        expect(s.percent).toBe(100);
      });
    }
  }
  it('pieces get longer as levels get harder (checkpoint is the longest so far)', () => {
    const bars = (i: number) => buildTimeline(getPlayLevel('violin', i)!.exercise).measures.length;
    expect(bars(9)).toBeGreaterThan(bars(1));
  });
  it('returns undefined beyond Level 500', () => {
    expect(getPlayLevel('violin', 10000)).toBeUndefined();
  });
});

import { migrate } from '../lib/rewards';
import { DEFAULT_PROGRESS } from '../state/progress';
import { merge } from '../lib/sync/merge';

describe('moving saved progress to the new course layout', () => {
  const oldLayout = () => ({
    ...structuredClone(DEFAULT_PROGRESS), course: undefined as unknown as number, version: 2 as const,
    currentLevel: 3,
    completedLevels: { 1: { stars: 3, bestScore: 100 }, 2: { stars: 2, bestScore: 80 } },
    awarded: { 'level:1:pass': true, 'level:1:star:1': true, 'level:1:star:2': true, 'level:1:star:3': true, 'level:2:pass': true, 'level:2:star:1': true, 'level:2:star:2': true, 'daily:2026-11-14': true } as Record<string, true>,
    xp: 20 + 15 + 20 + 10 + 15,
    history: [{ level: 2, at: '2026-11-14T10:00:00Z', stars: 2, score: 80, replay: false }, { level: 1, at: '2026-11-14T09:00:00Z', stars: 3, score: 100, replay: false }],
    xpLog: [{ key: 'level:2:pass', amount: 20, reason: 'Completed Level 2', at: '2026-11-14T10:00:00Z' }],
  });
  it('moves results, history and XP keys with each reading lesson', () => {
    const m = migrate(oldLayout() as never, DEFAULT_PROGRESS);
    expect(m.course).toBe(2);
    expect(Object.keys(m.completedLevels).map(Number).sort((a, b) => a - b)).toEqual([9, 12]);
    expect(m.completedLevels[9]).toEqual({ stars: 3, bestScore: 100 });
    expect(m.awarded['level:9:pass']).toBe(true);
    expect(m.awarded['level:1:pass']).toBeUndefined();
    expect(m.awarded['daily:2026-11-14']).toBe(true);
    expect(m.xp).toBe(80); // nothing lost, nothing doubled
    expect(m.history.map((h) => h.level)).toEqual([12, 9]);
    expect(m.xpLog[0]).toMatchObject({ key: 'level:12:pass', reason: 'Completed Level 12' });
    expect(m.currentLevel).toBe(1); // the new playing Level 1 comes first
  });
  it('is applied once only', () => {
    const once = migrate(oldLayout() as never, DEFAULT_PROGRESS);
    const twice = migrate(JSON.parse(JSON.stringify(once)), DEFAULT_PROGRESS);
    expect(twice.completedLevels).toEqual(once.completedLevels);
    expect(twice.awarded).toEqual(once.awarded);
  });
  it('the new Level 1 still pays XP (its key was freed by the move)', () => {
    const m = migrate(oldLayout() as never, DEFAULT_PROGRESS);
    expect(m.awarded['level:1:pass']).toBeUndefined();
  });
  it('two migrated copies merge cleanly', () => {
    const a = migrate(oldLayout() as never, DEFAULT_PROGRESS);
    const b = migrate(oldLayout() as never, DEFAULT_PROGRESS);
    const m = merge(a, b);
    expect(m.xp).toBe(80);
    expect(m.course).toBe(2);
  });
  it('a brand-new student starts on the new layout', () => {
    const m = migrate({} as never, DEFAULT_PROGRESS);
    expect(m.course).toBe(2);
    expect(m.currentLevel).toBe(1);
  });
});
