import { describe, expect, it } from 'vitest';
import { buildTimeline, type PlayExercise } from './exercise';
import { assessNote, assessTake, explain, starsFor, summarise, type Frame } from './assess';
import { framesFromAudio, renderPerformance, type PerformOptions } from './perform';

const violin: PlayExercise = {
  id: 't-violin', title: 'Test', instrument: 'violin', clef: 'treble', key: 'D', time: '4/4', tempo: 90,
  music: 'd/4:q e/4:q f#/4:q g/4:q | a/4:h a/4:h | b/4:q a/4:q g/4:q f#/4:q | e/4:q r:q d/4:h',
};

function take(ex: PlayExercise, o: PerformOptions = {}) {
  const tl = buildTimeline(ex);
  const { samples, lead, sampleRate } = renderPerformance(tl, o);
  const frames = framesFromAudio(samples, sampleRate, ex.instrument, lead);
  const results = assessTake(tl, frames);
  return { tl, results, summary: summarise(results, tl) };
}

describe('timeline', () => {
  it('times notes from the tempo', () => {
    const tl = buildTimeline(violin);
    expect(tl.beat).toBeCloseTo(60 / 90);
    expect(tl.notes).toHaveLength(13);
    expect(tl.notes[4]).toMatchObject({ key: 'a/4', midi: 69, measure: 1, pos: 0 });
    expect(tl.notes[4].start).toBeCloseTo(4 * (60 / 90));
    expect(tl.duration).toBeCloseTo(16 * (60 / 90));
  });
  it('rejects a measure with the wrong number of beats', () => {
    expect(() => buildTimeline({ ...violin, music: 'd/4:q e/4:q' })).toThrow(/measure 1/);
  });
  it('sounds double bass an octave below written', () => {
    const tl = buildTimeline({ ...violin, instrument: 'bass', clef: 'bass', music: 'd/3:w' });
    expect(tl.notes[0].midi).toBe(38); // written D3 sounds D2
  });
});

describe('assessment of simulated performances', () => {
  it('marks a clean performance all green (3 stars)', () => {
    const { results, summary } = take(violin);
    const red = results.filter((r) => r.verdict !== 'correct');
    expect(red, JSON.stringify(red)).toHaveLength(0);
    expect(summary.percent).toBe(100);
    expect(summary.stars).toBe(3);
  });
  it('stays green with vibrato and a little background noise', () => {
    const { summary, results } = take(violin, { vibratoCents: 20, noise: 0.01 });
    expect(summary.percent, JSON.stringify(results.filter((r) => r.verdict !== 'correct'))).toBe(100);
  });
  it('accepts notes 15 cents out (inside the friendly ±20 window)', () => {
    const { results } = take(violin, { mistakes: [{ index: 2, cents: 15 }, { index: 3, cents: -15 }] });
    expect(results[2].verdict).toBe('correct');
    expect(results[3].verdict).toBe('correct');
  });
  it('marks each kind of mistake on the right note, and only there', () => {
    const { results, summary } = take(violin, {
      mistakes: [
        { index: 1, semitones: 1 },   // F instead of E
        { index: 2, cents: -35 },     // flat F#
        { index: 6, cents: 40 },      // sharp B
        { index: 8, shift: 0.3 },     // late G
        { index: 10, skip: true },    // missed E
      ],
    });
    const v = results.map((r) => r.verdict);
    expect(v[1]).toBe('wrong-note');
    expect(results[1].heard).toBe('F4');
    expect(v[2]).toBe('flat');
    expect(v[6]).toBe('sharp');
    expect(v[8]).toBe('late');
    expect(v[10]).toBe('missed');
    const others = v.filter((_, i) => ![1, 2, 6, 8, 10].includes(i));
    expect(others.every((x) => x === 'correct'), JSON.stringify(results)).toBe(true);
    expect(summary.correct).toBe(summary.total - 5);
  });
  it('a skipped note followed straight away by the next note is "missed", not a wrong note', () => {
    const { results } = take(violin, { mistakes: [{ index: 9, skip: true }] });
    expect(results[9].verdict).toBe('missed');
    expect(results[10].verdict).toBe('correct');
  });
  it('catches an early entry', () => {
    const { results } = take(violin, { mistakes: [{ index: 6, shift: -0.3 }] });
    expect(results[6].verdict).toBe('early');
  });
  it('tolerates small, consistent lateness (latency up to ~100 ms)', () => {
    const { summary } = take(violin, { globalShift: 0.1 });
    expect(summary.percent).toBe(100);
  });
  it('detects a late re-articulation on a repeated note (A A)', () => {
    const { results } = take(violin, { mistakes: [{ index: 5, shift: 0.35 }] });
    expect(results[5].verdict).toBe('late');
    expect(results[4].verdict).toBe('correct');
  });
  it('marks silence as all missed (0 stars)', () => {
    const tl = buildTimeline(violin);
    const frames: Frame[] = [];
    for (let t = -0.5; t < tl.duration + 0.5; t += 1 / 30) frames.push({ t, hz: null, rms: 0 });
    const s = summarise(assessTake(tl, frames), tl);
    expect(s.counts.missed).toBe(s.total);
    expect(s.stars).toBe(0);
  });
  it('works for cello and double bass registers', () => {
    const cello = { ...violin, id: 'c', instrument: 'cello' as const, clef: 'bass' as const, music: 'd/3:q e/3:q f#/3:q g/3:q | a/3:h d/3:h' };
    expect(take(cello).summary.percent).toBe(100);
    const bass = { ...violin, id: 'b', instrument: 'bass' as const, clef: 'bass' as const, tempo: 72, music: 'd/3:h a/3:h | d/3:w' };
    const b = take(bass);
    expect(b.summary.percent, JSON.stringify(b.results)).toBe(100);
    const bWrong = take(bass, { mistakes: [{ index: 1, semitones: -2 }] });
    expect(bWrong.results[1].verdict).toBe('wrong-note');
    expect(bWrong.results[1].heard).toBe('G3'); // written a3 played 2 semitones low → written G3 (sounds G2)
  });
  it('handles fast eighth notes on violin', () => {
    const fast = { ...violin, id: 'f', tempo: 120, music: 'd/4:8 e/4:8 f#/4:8 g/4:8 a/4:8 b/4:8 c#/5:8 d/5:8 | d/5:8 c#/5:8 b/4:8 a/4:8 g/4:8 f#/4:8 e/4:8 d/4:8' };
    const { summary, results } = take(fast);
    expect(summary.percent, JSON.stringify(results.filter((r) => r.verdict !== 'correct'))).toBe(100);
    const wrong = take(fast, { mistakes: [{ index: 6, semitones: -1 }] });
    expect(wrong.results[6].verdict).toBe('wrong-note');
  });
});

describe('scoring', () => {
  it('uses friendly star thresholds', () => {
    expect([100, 85, 84, 70, 69, 50, 49].map(starsFor)).toEqual([3, 3, 2, 2, 1, 1, 0]);
  });
  it('separates pitch and rhythm accuracy', () => {
    const tl = buildTimeline(violin);
    const results = tl.notes.map((n) => ({ index: n.index, verdict: n.index === 0 ? 'late' as const : n.index === 1 ? 'flat' as const : 'correct' as const }));
    const s = summarise(results, tl);
    expect(s.total).toBe(12);
    expect(s.pitchPercent).toBe(92);
    expect(s.rhythmPercent).toBe(92);
  });
  it('explains red notes kindly', () => {
    expect(explain({ index: 0, verdict: 'wrong-note', heard: 'F4' }, 'E4')).toBe('Heard F4 instead of E4');
    expect(explain({ index: 0, verdict: 'flat', cents: -32 }, 'F♯4')).toMatch(/flat/);
  });
  it('rests are never marked red', () => {
    const tl = buildTimeline(violin);
    const rest = tl.notes.find((n) => n.rest)!;
    expect(assessNote(rest, [], tl.beat).verdict).toBe('correct');
  });
});

import { DEMO_EXERCISES } from './exercises';
import { getInstrument } from '../audio/notes';
import { backingEvents } from './backing';

describe('demo exercises', () => {
  it('cover all four instruments', () => {
    expect(new Set(DEMO_EXERCISES.map((e) => e.instrument))).toEqual(new Set(['violin', 'viola', 'cello', 'bass']));
  });
  for (const ex of DEMO_EXERCISES) {
    it(`${ex.id}: valid, in range, and a clean simulated take scores 100%`, () => {
      const tl = buildTimeline(ex);
      const inst = getInstrument(ex.instrument)!;
      const lowest = inst.strings[0].midi;
      for (const n of tl.notes) if (n.midi != null) {
        expect(n.midi, n.key).toBeGreaterThanOrEqual(lowest);
        expect(n.midi, n.key).toBeLessThanOrEqual(lowest + 31);
      }
      if (ex.backing) expect(() => backingEvents(ex.backing!, tl)).not.toThrow();
      const { summary, results } = take(ex);
      expect(summary.percent, JSON.stringify(results.filter((r) => r.verdict !== 'correct'))).toBe(100);
    });
  }
});
