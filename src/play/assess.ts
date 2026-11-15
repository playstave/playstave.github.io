/**
 * Note-by-note assessment of a play-along take.
 *
 * Input: pitch frames from the microphone, time-stamped in seconds from the
 * first downbeat (already corrected for audio latency), and the exercise
 * timeline. Each written note gets one verdict:
 *   correct    right note, in tune (±tolerance cents), started on time
 *   flat/sharp right note, but out of tune
 *   early/late right note, in tune, but started outside the timing window
 *   wrong-note a different note was played
 *   missed     nothing was heard
 * Green = correct; everything else is red, with the reason shown.
 *
 * Deliberately forgiving (product decision: "don't make it too harsh"):
 * ±20 cents by default, a generous timing window, and when the start of a
 * repeated note cannot be told apart from the one before it, it is not marked late.
 */
import { DEFAULT_IN_TUNE_CENTS } from '../audio/tolerance';
import { midiName } from '../audio/notes';
import { midi as writtenMidi, parsePitch } from '../music/pitch';
import type { Timeline, TimedNote } from './exercise';

export interface Frame {
  /** Seconds from the first downbeat. */
  t: number;
  hz: number | null;
  rms: number;
}

export type Verdict = 'correct' | 'flat' | 'sharp' | 'early' | 'late' | 'wrong-note' | 'missed';

export interface NoteResult {
  index: number;
  verdict: Verdict;
  /** Intonation of the right note, in cents (when heard). */
  cents?: number;
  /** Start time error in ms (+ = late), when an onset was found. */
  timingMs?: number;
  /** For wrong notes: what was heard instead, e.g. "C♯5". */
  heard?: string;
}

export interface AssessOptions {
  centsTolerance?: number;
  /** Seconds either side of the written start that count as on time. */
  timingTolerance?: number;
}

/** Default timing window: 30% of a beat, kept between 0.12 s and 0.25 s. */
export const defaultTimingTolerance = (beatSec: number) => Math.min(0.25, Math.max(0.12, 0.3 * beatSec));

const toCents = (hz: number, midi: number) => (69 + 12 * Math.log2(hz / 440) - midi) * 100;
/** Frames within this many cents of the written note count as "that note" (then judged for intonation). */
const SAME_NOTE = 60;

function trimmedMean(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const cut = s.length >= 6 ? Math.floor(s.length * 0.15) : 0;
  const k = s.slice(cut, s.length - cut);
  return k.reduce((a, b) => a + b, 0) / k.length;
}

/**
 * Assess one note. `frames` may contain the whole take; only those near the
 * note are used. `prev` is the note before (to recognise repeated pitches).
 */
export function assessNote(note: TimedNote, frames: Frame[], beatSec: number, o: AssessOptions = {}, prev?: TimedNote, next?: TimedNote): NoteResult {
  if (note.rest || note.midi == null) return { index: note.index, verdict: 'correct' };
  const tol = o.centsTolerance ?? DEFAULT_IN_TUNE_CENTS;
  const tTol = o.timingTolerance ?? defaultTimingTolerance(beatSec);
  const midi = note.midi;
  const dur = note.end - note.start;

  // --- Pitch: look at the body of the note (skip the attack, stop before the next note).
  const bodyFrom = note.start + Math.min(0.06, dur * 0.2);
  const bodyTo = note.end - Math.min(0.04, dur * 0.15);
  const coreTo = Math.max(bodyTo, bodyFrom + 0.03);
  // A late start pushes the note past its written end; that extra stretch only
  // counts if it holds THIS note (otherwise it is simply the next note).
  const extTo = coreTo + Math.min(tTol, dur * 0.5);
  const core = frames.filter((f) => f.t >= bodyFrom && f.t <= coreTo && f.hz != null);
  const coreCents = core.map((f) => toCents(f.hz!, midi));
  const coreMatch = coreCents.filter((c) => Math.abs(c) <= SAME_NOTE);
  const extMatch = frames.filter((f) => f.t > coreTo && f.t <= extTo && f.hz != null)
    .map((f) => toCents(f.hz!, midi)).filter((c) => Math.abs(c) <= SAME_NOTE);
  let matching: number[];
  if (core.length === 0) {
    if (extMatch.length < 2) return { index: note.index, verdict: 'missed' };
    // Nothing during the note itself, only after it. If the next note is the
    // same pitch, that sound is the NEXT note — this one was skipped.
    const first = frames.find((f) => f.t > coreTo && f.t <= extTo && f.hz != null && Math.abs(toCents(f.hz, midi)) <= SAME_NOTE)!;
    if (next && !next.rest && next.midi === midi && first.t >= next.start - tTol) return { index: note.index, verdict: 'missed' };
    // Otherwise it really is this note, started very late.
    const late = Math.round((first.t - note.start) * 1000);
    return { index: note.index, verdict: 'late', timingMs: late, cents: Math.round(trimmedMean(extMatch) * 10) / 10 };
  } else if (coreMatch.length >= Math.max(1, core.length * 0.4)) {
    matching = [...coreMatch, ...extMatch];
  } else if (coreMatch.length + extMatch.length >= Math.max(2, core.length * 0.4)) {
    matching = [...coreMatch, ...extMatch]; // the previous note ran on; this one started late
  } else {
    // Mostly another note: report the most common one heard.
    const counts = new Map<number, number>();
    for (const c of coreCents) { const m = Math.round(midi + c / 100); counts.set(m, (counts.get(m) ?? 0) + 1); }
    const heardMidi = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    // Name it at WRITTEN pitch, like the music on the page (the double bass sounds an octave lower).
    const toWritten = writtenMidi(parsePitch(note.key)) - midi;
    return { index: note.index, verdict: 'wrong-note', heard: midiName(heardMidi + toWritten) };
  }
  const centre = trimmedMean(matching);

  // --- Timing: when did this note begin?
  // An onset before the middle of the previous note belongs to that note (e.g. repeated eighths).
  const prevMid = prev && !prev.rest ? prev.start + (prev.end - prev.start) * 0.5 : -Infinity;
  const searchFrom = Math.max(note.start - Math.max(0.5, tTol * 2), prevMid);
  // Look for the start up to the end of the written note, so even a very late start is found and marked late.
  const searchTo = Math.max(note.start + Math.max(0.5, tTol * 2), note.end);
  const near = frames.filter((f) => f.t >= searchFrom - 0.15 && f.t <= searchTo);
  const isMatch = (f: Frame) => f.hz != null && Math.abs(toCents(f.hz, midi)) <= SAME_NOTE;
  const repeated = !!prev && !prev.rest && prev.midi === midi && Math.abs(prev.end - note.start) < 1e-6;
  let onset: number | null = null;
  let bestDist = Infinity;
  for (let i = 1; i < near.length; i++) {
    const f = near[i];
    if (f.t < searchFrom || !isMatch(f)) continue;
    const p = near[i - 1];
    const pitchStart = !isMatch(p);
    // Only for a repeated pitch (A then A): the new note shows as a rise in
    // level after the dip of the bow change. (For a new pitch, the pitch change
    // itself marks the start; a level rise there is just that note's attack.)
    let levelStart = false;
    if (repeated) {
      const lookback = near.slice(Math.max(0, i - 4), i);
      const minRms = Math.min(...lookback.map((x) => x.rms));
      levelStart = minRms > 0 && f.rms >= minRms * 1.3;
    }
    if (pitchStart || levelStart) {
      // A loud but pitch-less stretch just before (scratchy bow attack, or a
      // backing chord starting at the same moment) is part of this note's
      // start: walk back over it, up to 0.3 s. Errs in the student's favour.
      let t = f.t;
      if (pitchStart) {
        for (let j = i - 1; j >= 0 && near[j].hz == null && near[j].rms >= 0.3 * f.rms && f.t - near[j].t <= 0.3; j--) t = near[j].t;
      }
      const d = Math.abs(t - note.start);
      if (d < bestDist) { bestDist = d; onset = t; }
    }
  }
  let timingMs: number | undefined;
  let timing: 'ok' | 'early' | 'late' = 'ok';
  if (onset != null) {
    const err = onset - note.start;
    timingMs = Math.round(err * 1000);
    if (err > tTol) timing = 'late';
    else if (err < -tTol) timing = 'early';
  } else if (!repeated) {
    // Sound of the right pitch is there, but it began before the search window
    // (held over from earlier) — treat as on time rather than guess.
    timing = 'ok';
  }

  const base = { index: note.index, cents: Math.round(centre * 10) / 10, timingMs };
  if (Math.abs(centre) > tol) return { ...base, verdict: centre < 0 ? 'flat' : 'sharp' };
  if (timing !== 'ok') return { ...base, verdict: timing };
  return { ...base, verdict: 'correct' };
}

/** Time after which a note can be judged (its end plus room for a late start). */
export const judgeableAt = (note: TimedNote, beatSec: number, o: AssessOptions = {}) =>
  note.end + Math.min(o.timingTolerance ?? defaultTimingTolerance(beatSec), (note.end - note.start) * 0.5) + 0.08;

export interface Summary {
  total: number;
  correct: number;
  /** 0–100, share of notes marked green. */
  percent: number;
  pitchPercent: number;
  rhythmPercent: number;
  stars: 0 | 1 | 2 | 3;
  counts: Record<Verdict, number>;
}

/** Stars: friendly thresholds — 3 at 85%+, 2 at 70%+, 1 at 50%+. */
export function starsFor(percent: number): 0 | 1 | 2 | 3 {
  return percent >= 85 ? 3 : percent >= 70 ? 2 : percent >= 50 ? 1 : 0;
}

export function summarise(results: NoteResult[], timeline: Timeline): Summary {
  const playable = new Set(timeline.notes.filter((n) => !n.rest).map((n) => n.index));
  const rs = results.filter((r) => playable.has(r.index));
  const counts = { correct: 0, flat: 0, sharp: 0, early: 0, late: 0, 'wrong-note': 0, missed: 0 } as Record<Verdict, number>;
  rs.forEach((r) => counts[r.verdict]++);
  const total = playable.size;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const pitchOk = counts.correct + counts.early + counts.late;
  const rhythmOk = counts.correct + counts.flat + counts.sharp;
  const percent = pct(counts.correct);
  return { total, correct: counts.correct, percent, pitchPercent: pct(pitchOk), rhythmPercent: pct(rhythmOk), stars: starsFor(percent), counts };
}

/** Assess every note of a finished take. */
export function assessTake(timeline: Timeline, frames: Frame[], o: AssessOptions = {}): NoteResult[] {
  return timeline.notes.map((n, i) => assessNote(n, frames, timeline.beat, o, timeline.notes[i - 1], timeline.notes[i + 1]));
}

/** Short, kind explanation for a red note. */
export function explain(r: NoteResult, writtenName: string): string {
  switch (r.verdict) {
    case 'correct': return 'Well played';
    case 'flat': return `${writtenName} was a little flat (${r.cents} cents) — aim slightly higher`;
    case 'sharp': return `${writtenName} was a little sharp (+${r.cents} cents) — aim slightly lower`;
    case 'early': return `${writtenName} came in early (${Math.abs(r.timingMs ?? 0)} ms) — wait for the beat`;
    case 'late': return `${writtenName} came in late (${r.timingMs} ms) — get ready a little sooner`;
    case 'wrong-note': return `Heard ${r.heard} instead of ${writtenName}`;
    case 'missed': return `${writtenName} wasn’t heard — keep the bow moving through the whole note`;
  }
}
