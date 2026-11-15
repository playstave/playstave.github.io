import { describe, expect, it } from 'vitest';
import { getPlayLevel } from '../course/playLevels';
import { levelKind } from '../course/map';
import { buildTimeline } from './exercise';
import { backingEvents } from './backing';
import { assessTake, summarise } from './assess';
import { framesFromAudio, renderBacking, renderPerformance } from './perform';
import { INSTRUMENTS } from '../audio/notes';

/**
 * Nobody playing — only the backing track coming out of the speakers into the
 * microphone. Small speakers can't reproduce deep notes, so only their
 * overtones arrive: the worst case for mistaking the backing for the student.
 */
describe('backing track through speakers, nobody playing', () => {
  const levels = [6, 14, 33, 47, 58, 66, 77, 88, 97, 100];
  for (const inst of INSTRUMENTS) {
    for (const cut of [0, 180, 300]) {
      it(`${inst.name}, speakers cut below ${cut} Hz: no note turns green`, () => {
        const greens: string[] = [];
        for (const n of levels) {
          const lv = getPlayLevel(inst.id, levelKind(n).index)!;
          if (!lv.exercise.backing) continue;
          const tl = buildTimeline(lv.exercise);
          const silent = renderPerformance(tl, { mistakes: tl.notes.map((x) => ({ index: x.index, skip: true })) });
          const bleed = renderBacking(backingEvents(lv.exercise.backing, tl), silent.samples.length, silent.lead, 0.3, 48000, cut);
          const s = summarise(assessTake(tl, framesFromAudio(bleed, 48000, inst.id, silent.lead)), tl);
          if (s.correct) greens.push(`L${n}: ${s.correct}/${s.total}`);
        }
        expect(greens).toEqual([]);
      });
    }
  }
});
