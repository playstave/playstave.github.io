import { describe, expect, it } from 'vitest';
import { getPlayLevel, LAST_WRITTEN_LEVEL } from './playLevels';
import { levelKind } from './map';
import { getLesson } from '../lessons';
import { placeNote } from './fingering';
import { buildTimeline } from '../play/exercise';
import { assessTake, summarise } from '../play/assess';
import { framesFromAudio, renderPerformance } from '../play/perform';
import { backingEvents } from '../play/backing';
import { INSTRUMENTS, midiName } from '../audio/notes';

const levels = Array.from({ length: 100 }, (_, i) => i + 1);

describe('World 1 is complete (Levels 1–100)', () => {
  it('every level has content for every instrument', () => {
    expect(LAST_WRITTEN_LEVEL).toBe(100);
    const missing: string[] = [];
    for (const n of levels) {
      const k = levelKind(n);
      for (const inst of INSTRUMENTS) {
        const ok = k.kind === 'theory' ? !!getLesson(n) : !!getPlayLevel(inst.id, k.index);
        if (!ok) missing.push(`${inst.id} L${n}`);
      }
    }
    expect(missing).toEqual([]);
  });

  for (const inst of INSTRUMENTS) {
    describe(inst.name, () => {
      for (const n of levels) {
        const k = levelKind(n);
        if (k.kind !== 'play') continue;
        it(`Level ${n}: teaches, playable in first position, and a clean take scores 100%`, () => {
          const lv = getPlayLevel(inst.id, k.index)!;
          expect(lv.cards.length).toBeGreaterThan(0);
          expect(lv.newIdeas.length).toBeGreaterThan(0);
          expect(lv.title.length).toBeGreaterThanOrEqual(2);
          const tl = buildTimeline(lv.exercise); // also validates bar lengths
          for (const x of tl.notes) if (x.midi != null) expect(placeNote(inst.id, x.midi), `${midiName(x.midi)} at L${n}`).not.toBeNull();
          expect(tl.notes[tl.notes.length - 1].rest).toBe(false);
          if (lv.exercise.backing) expect(() => backingEvents(lv.exercise.backing!, tl)).not.toThrow();
          const { samples, lead, sampleRate } = renderPerformance(tl);
          const s = summarise(assessTake(tl, framesFromAudio(samples, sampleRate, inst.id, lead)), tl);
          expect(s.percent, `L${n} ${inst.id} ${lv.exercise.music}`).toBe(100);
        });
      }
    });
  }

  it('the same level gives the same piece every time (fixed, not random per visit)', () => {
    expect(getPlayLevel('violin', levelKind(37).index)!.exercise.music).toBe(getPlayLevel('violin', levelKind(37).index)!.exercise.music);
  });

  it('pieces get longer as World 1 goes on, and Level 100 is the longest', () => {
    const bars = (n: number) => buildTimeline(getPlayLevel('violin', levelKind(n).index)!.exercise).measures.length;
    expect(bars(100)).toBeGreaterThan(bars(30));
    expect(bars(30)).toBeGreaterThan(bars(13));
    for (const n of levels) if (levelKind(n).kind === 'play') expect(bars(n)).toBeLessThanOrEqual(bars(100));
  });

  it('every level teaches something different (no two levels share a title within an instrument)', () => {
    const titles = levels.filter((n) => levelKind(n).kind === 'play').map((n) => getPlayLevel('cello', levelKind(n).index)!.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
