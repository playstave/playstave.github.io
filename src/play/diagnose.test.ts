import { describe, expect, it } from 'vitest';
import { buildTimeline, type PlayExercise } from './exercise';
import { assessTake, summarise } from './assess';
import { diagnose, estimateDelay, rescoreWithDelay } from './diagnose';
import { framesFromAudio, renderPerformance, type PerformOptions } from './perform';
import { getExercise } from './exercises';


function take(e: PlayExercise, o: PerformOptions = {}) {
  const tl = buildTimeline(e);
  const p = renderPerformance(tl, { lead: 0.5, ...o });
  // listen a second past the end, as the live session now does
  const frames = framesFromAudio(p.samples, p.sampleRate, e.instrument, p.lead);
  const results = assessTake(tl, frames);
  return { tl, frames, results, summary: summarise(results, tl) };
}

for (const instrument of ['violin', 'viola', 'cello', 'bass'] as const) {
const ex = getExercise(`${instrument}-first-steps`)!;
describe(`What Stave heard — ${instrument}`, () => {
  it('a clean take needs no diagnosis or delay correction', () => {
    const t = take(ex);
    const d = diagnose(t.tl, t.frames, t.results);
    expect(d.delay).toBeNull();
    expect(d.findings).toEqual([]);
  });

  for (const delay of [0.25, 0.4, 0.6]) {
    it(`finds a consistent ${delay * 1000} ms device delay and re-scores the take to all green`, () => {
      const t = take(ex, { globalShift: delay });
      expect(t.summary.percent).toBeLessThan(100); // looked worse before correction
      const est = estimateDelay(t.tl, t.frames)!;
      expect(Math.abs(est - delay)).toBeLessThanOrEqual(0.04);
      const fixed = rescoreWithDelay(t.tl, t.frames, est)!;
      expect(fixed.summary.percent).toBe(100);
      expect(diagnose(t.tl, t.frames, t.results).findings.join(' ')).toMatch(/audio delay/);
    });
  }

  it('does not "correct" a delay when the notes are simply wrong', () => {
    const t = take(ex, { mistakes: t0(ex).map((i) => ({ index: i, semitones: 3 })) });
    expect(estimateDelay(t.tl, t.frames)).toBeNull();
    expect(diagnose(t.tl, t.frames, t.results).findings.join(' ')).toMatch(/mostly heard/);
  });

  it('explains silence (nothing reaching the microphone)', () => {
    const t = take(ex, { mistakes: t0(ex).map((i) => ({ index: i, skip: true })) });
    expect(t.summary.correct).toBe(0);
    expect(diagnose(t.tl, t.frames, t.results).findings[0]).toMatch(/heard almost nothing/);
  });

  it('explains out-of-tune playing', () => {
    const t = take(ex, { mistakes: t0(ex).map((i) => ({ index: i, cents: -35 })) });
    expect(diagnose(t.tl, t.frames, t.results).findings.join(' ')).toMatch(/Tuner/);
  });
});

}

function t0(e: PlayExercise) { return buildTimeline(e).notes.filter((n) => !n.rest).map((n) => n.index); }
