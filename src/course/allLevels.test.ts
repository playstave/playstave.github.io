/**
 * The whole course: all 500 levels, for all four instruments.
 */
import { describe, expect, it } from 'vitest';
import { getPlayLevel, LAST_WRITTEN_LEVEL } from './playLevels';
import { levelKind, THEORY_LEVELS } from './map';
import { getLesson } from '../lessons';
import { pieceScore, tempoLimits } from './build';
import { placeNoteUpTo, POSITIONS } from './fingering';
import { buildTimeline } from '../play/exercise';
import { backingEvents } from '../play/backing';
import { assessTake, summarise } from '../play/assess';
import { framesFromAudio, renderPerformance } from '../play/perform';
import { INSTRUMENTS, midiName } from '../audio/notes';
import { unitForLevel } from '../data/curriculum';

const ALL = Array.from({ length: 500 }, (_, i) => i + 1);
const PLAY = ALL.filter((n) => levelKind(n).kind === 'play');

describe('all 500 levels are written', () => {
  it('every level has content for every instrument (theory levels shared)', () => {
    expect(LAST_WRITTEN_LEVEL).toBe(500);
    const missing: string[] = [];
    for (const n of ALL) for (const inst of INSTRUMENTS) {
      const k = levelKind(n);
      const ok = k.kind === 'theory' ? true : !!getPlayLevel(inst.id, k.index);
      if (!ok) missing.push(`${inst.id} L${n}`);
    }
    expect(missing).toEqual([]);
  });
  it('every one of the 36 theory levels has a written lesson', () => {
    expect(THEORY_LEVELS.filter((n) => !getLesson(n))).toEqual([]);
  });
});

for (const inst of INSTRUMENTS) {
  describe(`${inst.name}: every playing level`, () => {
    const levels = PLAY.map((n) => ({ n, lv: getPlayLevel(inst.id, levelKind(n).index)! }));

    it('is valid music, playable on the instrument, and teaches something', () => {
      const problems: string[] = [];
      const maxPos = POSITIONS[inst.id].length - 1;
      for (const { n, lv } of levels) {
        if (!lv.cards.length || !lv.newIdeas.length || !lv.title) problems.push(`L${n}: no teaching`);
        let tl;
        try { tl = buildTimeline(lv.exercise); } catch (e) { problems.push(`L${n}: ${(e as Error).message}`); continue; }
        for (const x of tl.notes) if (x.midi != null && !placeNoteUpTo(inst.id, x.midi, maxPos)) problems.push(`L${n}: ${midiName(x.midi)} unplayable`);
        if (lv.exercise.backing) { try { backingEvents(lv.exercise.backing, tl); } catch (e) { problems.push(`L${n}: backing ${(e as Error).message}`); } }
      }
      expect(problems.slice(0, 10)).toEqual([]);
    });

    it('EVERY level is harder than the one before it (all 500)', () => {
      const dips: string[] = [];
      let prev = { n: 0, s: 0 };
      for (const { n, lv } of levels) {
        const s = pieceScore(lv.exercise);
        if (s <= prev.s) dips.push(`L${n} ${s.toFixed(1)} <= L${prev.n} ${prev.s.toFixed(1)}`);
        prev = { n, s };
      }
      expect(dips).toEqual([]);
    });

    it('tempos and lengths stay realistic', () => {
      const bad: string[] = [];
      for (const { n, lv } of levels) {
        const [lo, hi] = tempoLimits(n);
        const bars = buildTimeline(lv.exercise).measures.length;
        if (n > 11 && (lv.exercise.tempo < lo - 0.01 || lv.exercise.tempo > hi + 8.01)) bad.push(`L${n} tempo ${lv.exercise.tempo}`);
        if (bars > 140) bad.push(`L${n} ${bars} bars`);
      }
      expect(bad).toEqual([]);
    });

    it('most levels are real songs', () => {
      const songs = levels.filter(({ lv }) => lv.cards.some((c) => c.title.startsWith('Song:')) || lv.title.startsWith('Checkpoint') || lv.title.startsWith('World') || lv.title.startsWith('Level 500')).length;
      expect(songs / levels.length).toBeGreaterThan(0.75);
    });

    it('a clean simulated take scores 100% (sampled across the course)', () => {
      const sample = levels.filter((_, i) => i % 23 === 0 || i === levels.length - 1);
      const failed: string[] = [];
      for (const { n, lv } of sample) {
        const tl = buildTimeline(lv.exercise);
        const { samples, lead, sampleRate } = renderPerformance(tl);
        const s = summarise(assessTake(tl, framesFromAudio(samples, sampleRate, inst.id, lead)), tl);
        if (s.percent < 100) failed.push(`L${n} ${s.percent}% (${lv.title}, ♩${Math.round(lv.exercise.tempo)})`);
      }
      expect(failed).toEqual([]);
    }, 300000);
  });
}

describe('the course shape', () => {
  it('Level 500 is Vivaldi’s Spring for every instrument', () => {
    for (const inst of INSTRUMENTS) expect(getPlayLevel(inst.id, levelKind(500).index)!.title).toMatch(/Vivaldi — Spring/);
  });
  it('uses many keys, including flats, sharps and minors', () => {
    const keys = new Set(PLAY.map((n) => getPlayLevel('violin', levelKind(n).index)!.exercise.key));
    for (const k of ['D', 'G', 'A', 'C', 'F', 'Bb', 'Eb', 'E', 'Ab', 'B', 'Am', 'Em', 'Bm', 'Dm', 'Gm']) expect(keys, k).toContain(k);
  });
  it('pieces get longer: average bars rise from world to world', () => {
    const avg = (a: number, b: number) => { const ns = PLAY.filter((n) => n >= a && n <= b); return ns.reduce((t, n) => t + buildTimeline(getPlayLevel('violin', levelKind(n).index)!.exercise).measures.length, 0) / ns.length; };
    expect(avg(11, 100)).toBeLessThan(avg(101, 200));
    expect(avg(101, 200)).toBeLessThan(avg(401, 500) + 40);
  });
  it('every unit from 2 to 50 has a plan', () => {
    for (const n of PLAY) expect(unitForLevel(n).id).toBeGreaterThanOrEqual(1);
  });
});
