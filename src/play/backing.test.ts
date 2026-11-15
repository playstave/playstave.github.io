import { describe, expect, it } from 'vitest';
import { backingEvents, chordPitchClasses, voice } from './backing';
import { buildTimeline, type PlayExercise } from './exercise';
import { assessTake, summarise } from './assess';
import { framesFromAudio, renderBacking, renderPerformance } from './perform';

const ex: PlayExercise = {
  id: 'b', title: 'B', instrument: 'violin', clef: 'treble', key: 'D', time: '4/4', tempo: 90,
  music: 'd/4:q e/4:q f#/4:q g/4:q | a/4:h a/4:h | b/4:q a/4:q g/4:q f#/4:q | e/4:h d/4:h',
  backing: { chords: 'D | D | G D | A D', style: 'block' },
};

describe('chords', () => {
  it('parses chord symbols', () => {
    expect(chordPitchClasses('D')).toEqual([2, 6, 9]);
    expect(chordPitchClasses('F#m')).toEqual([6, 9, 1]);
    expect(chordPitchClasses('A7')).toEqual([9, 1, 4, 7]);
    expect(chordPitchClasses('Bb')).toEqual([10, 2, 5]);
    expect(() => chordPitchClasses('H')).toThrow();
  });
  it('voices a bass note plus close upper tones in a low register', () => {
    const v = voice(chordPitchClasses('D'));
    expect(v[0]).toBe(38);
    v.slice(1).forEach((n) => { expect(n).toBeGreaterThanOrEqual(52); expect(n).toBeLessThan(64); });
  });
});

describe('backing events', () => {
  it('follows the bars and splits shared bars', () => {
    const tl = buildTimeline(ex);
    const ev = backingEvents(ex.backing!, tl);
    expect(ev[2].start).toBeCloseTo(2 * tl.measureSec);
    expect(ev[3].start).toBeCloseTo(2.5 * tl.measureSec);
  });
  it('never doubles the note the student should be playing (unison or octave)', () => {
    const tl = buildTimeline(ex);
    for (const e of backingEvents(ex.backing!, tl)) {
      const melody = tl.notes.filter((n) => n.midi != null && n.start < e.start + e.dur - 1e-6 && n.end > e.start + 1e-6).map((n) => n.midi!);
      for (const t of e.midis) for (const m of melody) expect((t - m) % 12 === 0 && Math.abs(t - m) <= 12).toBe(false);
    }
  });
  it('pulse style plays a chord on every beat', () => {
    const tl = buildTimeline(ex);
    const ev = backingEvents({ ...ex.backing!, style: 'pulse' }, tl);
    expect(ev.length).toBeGreaterThanOrEqual(14);
  });
  it('drone sits more than an octave from every melody note', () => {
    const tl = buildTimeline(ex);
    const [d] = backingEvents({ chords: 'D', style: 'drone' }, tl);
    const melody = tl.notes.filter((n) => n.midi != null).map((n) => n.midi!);
    for (const t of d.midis) for (const m of melody) expect(Math.abs(t - m) > 12 || (t - m) % 12 !== 0).toBe(true);
    expect(d.dur).toBeCloseTo(tl.duration);
  });
});

describe('backing-track bleed into the microphone (no headphones)', () => {
  const tl = buildTimeline(ex);
  const events = backingEvents(ex.backing!, tl);
  it('a clean performance stays green with the backing audible', () => {
    const base = renderPerformance(tl);
    const bleed = renderBacking(events, base.samples.length, base.lead, 0.12);
    const withBleed = renderPerformance(tl, { mix: bleed });
    const s = summarise(assessTake(tl, framesFromAudio(withBleed.samples, withBleed.sampleRate, 'violin', withBleed.lead)), tl);
    expect(s.percent).toBeGreaterThanOrEqual(90);
  });
  it('mistakes are still caught with the backing audible', () => {
    const base = renderPerformance(tl);
    const bleed = renderBacking(events, base.samples.length, base.lead, 0.12);
    const take = renderPerformance(tl, { mix: bleed, mistakes: [{ index: 1, semitones: 1 }, { index: 2, cents: -40 }, { index: 7, shift: 0.35 }] });
    const r = assessTake(tl, framesFromAudio(take.samples, take.sampleRate, 'violin', take.lead));
    expect(r[1].verdict).toBe('wrong-note');
    expect(r[2].verdict).toBe('flat');
    expect(r[7].verdict).toBe('late');
  });
  it('the backing alone never earns green notes', () => {
    const silent = renderPerformance(tl, { mistakes: tl.notes.map((n) => ({ index: n.index, skip: true })) });
    const bleed = renderBacking(events, silent.samples.length, silent.lead, 0.25);
    const frames = framesFromAudio(bleed, silent.sampleRate, 'violin', silent.lead);
    const s = summarise(assessTake(tl, frames), tl);
    expect(s.correct).toBe(0);
  });
});
