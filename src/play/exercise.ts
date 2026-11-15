/**
 * Play-along exercises: music the student plays while the app listens.
 *
 * Music uses the library's compact text format (see music/score.ts), written
 * at WRITTEN pitch for the exercise's instrument. For the double bass the
 * sounding pitch is an octave lower than written; `soundingShift` handles it.
 */
import { midi as pitchMidi, parsePitch } from '../music/pitch';
import { measureBeats, parseMusic, sumBeats, type Clef, type Measure } from '../music/score';
import type { InstrumentId } from '../audio/notes';

export interface Backing {
  /** Chord symbols, measures separated by "|", chords within a measure share it equally. e.g. "D | A7 | D G | A D" */
  chords: string;
  /** block = sustained chords, pulse = a chord on every beat, drone = the tonic held throughout. */
  style: 'block' | 'pulse' | 'drone';
}

export interface PlayExercise {
  id: string;
  title: string;
  instrument: InstrumentId;
  clef: Clef;
  key: string;
  time: string;
  /** Quarter-note beats per minute. */
  tempo: number;
  music: string;
  backing?: Backing;
  /** Short instruction shown before playing. */
  hint?: string;
}

/** Semitones from written to sounding pitch (double bass sounds an octave lower). */
export const soundingShift = (inst: InstrumentId) => (inst === 'bass' ? -12 : 0);

export interface TimedNote {
  /** Index among all notes and rests, in order. */
  index: number;
  measure: number;
  /** Position within its measure. */
  pos: number;
  rest: boolean;
  /** Sounding MIDI number (null for rests). */
  midi: number | null;
  /** Written key, e.g. "d/4" (for display and messages). */
  key: string;
  /** Seconds from the first downbeat (after the count-in). */
  start: number;
  end: number;
  beats: number;
}

export interface Timeline {
  measures: Measure[];
  notes: TimedNote[];
  /** Seconds per quarter-note beat. */
  beat: number;
  /** Seconds per measure. */
  measureSec: number;
  duration: number;
}

export function buildTimeline(ex: PlayExercise): Timeline {
  const measures = parseMusic(ex.music);
  const beat = 60 / ex.tempo;
  const perMeasure = measureBeats(ex.time);
  const shift = soundingShift(ex.instrument);
  const notes: TimedNote[] = [];
  let t = 0;
  let index = 0;
  measures.forEach((m, mi) => {
    if (Math.abs(sumBeats(m) - perMeasure) > 1e-6) throw new Error(`${ex.id}: measure ${mi + 1} has ${sumBeats(m)} beats, expected ${perMeasure}`);
    m.forEach((n, pos) => {
      const dur = n.beats * beat;
      notes.push({
        index: index++, measure: mi, pos, rest: n.rest, key: n.key, beats: n.beats,
        midi: n.rest ? null : pitchMidi(parsePitch(n.key)) + shift,
        start: t, end: t + dur,
      });
      t += dur;
    });
  });
  return { measures, notes, beat, measureSec: perMeasure * beat, duration: t };
}
