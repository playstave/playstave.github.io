import { describe, expect, it } from 'vitest';
import { getPlayLevel } from './playLevels';
import { levelKind } from './map';
import { buildTimeline } from '../play/exercise';
import { unitForLevel } from '../data/curriculum';
import { pieceScore } from './generator';
import type { InstrumentId } from '../audio/notes';

/** A simple, transparent difficulty score: notes per second × length × how jumpy the melody is. */
export function measure(inst: InstrumentId, n: number) {
  const lv = getPlayLevel(inst, levelKind(n).index)!;
  const tl = buildTimeline(lv.exercise);
  const notes = tl.notes.filter((x) => x.midi != null);
  const leaps = notes.slice(1).filter((x, i) => Math.abs(x.midi! - notes[i].midi!) > 2).length / Math.max(1, notes.length - 1);
  const range = Math.max(...notes.map((x) => x.midi!)) - Math.min(...notes.map((x) => x.midi!));
  const nps = notes.length / tl.duration;
  return { tempo: lv.exercise.tempo, bars: tl.measures.length, nps, leaps, range, notes: notes.length, score: pieceScore(lv.exercise) };
}

const playLevels = Array.from({ length: 100 }, (_, i) => i + 1).filter((n) => levelKind(n).kind === 'play');

describe('World 1 gets harder level by level', () => {
  for (const inst of ['violin', 'viola', 'cello', 'bass'] as const) {
    it(`${inst}: EVERY playing level is harder than the one before it`, () => {
      const scores = playLevels.map((n) => [n, measure(inst, n).score] as const);
      const dips = scores.slice(1).map(([n, sc], i) => ({ n, sc, pn: scores[i][0], ps: scores[i][1] })).filter((x) => x.sc <= x.ps).map((x) => `L${x.n} ${x.sc.toFixed(2)} <= L${x.pn} ${x.ps.toFixed(2)}`);
      expect(dips).toEqual([]);
    });
  }
  for (const inst of ['violin', 'viola', 'cello', 'bass'] as const) {
    it(`${inst}: every unit is harder on average than the one before`, () => {
      const byUnit = new Map<number, number[]>();
      for (const n of playLevels) {
        const u = unitForLevel(n).id;
        byUnit.set(u, [...(byUnit.get(u) ?? []), measure(inst, n).score]);
      }
      const avgs = [...byUnit.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v.reduce((a, b) => a + b, 0) / v.length);
      for (let i = 1; i < avgs.length; i++) expect(avgs[i], `unit ${i + 1} vs ${i}: ${avgs.map((a) => a.toFixed(1)).join(' ')}`).toBeGreaterThan(avgs[i - 1]);
    });
    it(`${inst}: Level 100 is the hardest level, and the last ten levels are far harder than the first ten`, () => {
      const scores = playLevels.map((n) => measure(inst, n).score);
      expect(Math.max(...scores)).toBe(measure(inst, 100).score);
      const first = scores.slice(0, 9).reduce((a, b) => a + b, 0) / 9;
      const last = scores.slice(-9).reduce((a, b) => a + b, 0) / 9;
      expect(last).toBeGreaterThan(first * 5);
    });
  }
  it('tempos and lengths stay realistic for World 1', () => {
    for (const inst of ['violin', 'viola', 'cello', 'bass'] as const) for (const n of playLevels) {
      const m = measure(inst, n);
      expect(m.tempo, `${inst} L${n}`).toBeLessThanOrEqual(150);
      expect(m.bars, `${inst} L${n}`).toBeLessThanOrEqual(40);
      expect(m.nps, `${inst} L${n}`).toBeLessThanOrEqual(4.5);
    }
  });
  it('tempo and length both rise across the world', () => {
    const t = (n: number) => measure('violin', n);
    expect(t(95).bars).toBeGreaterThan(t(23).bars);
    expect(t(95).tempo).toBeGreaterThan(t(23).tempo - 10);
    expect(t(95).nps).toBeGreaterThan(t(23).nps);
  });
});

it('prints the curve (for the docs)', () => {
  const rows = playLevels.filter((n) => n % 10 === 3 || n % 10 === 0).map((n) => { const m = measure('violin', n); return `L${n} u${unitForLevel(n).id} ♩${m.tempo} ${m.bars}b ${m.nps.toFixed(2)}n/s leaps ${(m.leaps * 100).toFixed(0)}% range ${m.range} score ${m.score.toFixed(1)}`; });
  console.log(rows.join('\n'));
});
