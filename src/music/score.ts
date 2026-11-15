/**
 * Score model for the library.
 *
 * Scores are stored as compact text, one token per note:  pitch:duration
 *   pitch     c/4, f#/4, bb/3  (percussion may add a notehead: g/5/x2) — or r for a rest
 *   duration  w h q 8 16, with a trailing d for dotted (hd, qd, 8d)
 * Measures are separated by "|". Pitches are written as sounding pitch; the
 * key signature is applied at render time, so an F♯ in G major is written f#
 * and drawn without an accidental.
 */
import { INTERVALS, isValidKey, midi, parsePitch, pitchToKey, transpose, transposeKeySig, type Interval } from './pitch';

export type Instrument = 'Piano' | 'Guitar' | 'Violin' | 'Viola' | 'Cello' | 'Flute' | 'Clarinet' | 'Saxophone' | 'Trumpet' | 'Trombone' | 'Drums' | 'Voice' | 'Other';
export const INSTRUMENTS: Instrument[] = ['Piano', 'Guitar', 'Violin', 'Viola', 'Cello', 'Flute', 'Clarinet', 'Saxophone', 'Trumpet', 'Trombone', 'Drums', 'Voice', 'Other'];
export type Difficulty = 'Beginner' | 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';
export const DIFFICULTIES: Difficulty[] = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
export type Genre = 'Classical' | 'Traditional' | 'Folk' | 'Religious' | 'Educational' | 'Contemporary' | 'Jazz' | 'Seasonal';
export const GENRES: Genre[] = ['Classical', 'Traditional', 'Folk', 'Religious', 'Seasonal', 'Educational', 'Contemporary', 'Jazz'];
export type Clef = 'treble' | 'bass' | 'alto' | 'percussion';

export interface Licence {
  kind: 'public-domain' | 'cc0';
  /** Status of the composition itself. */
  work: string;
  /** Status of this engraving/edition. */
  edition: string;
  /** Whether printing and downloading are permitted. */
  downloadable: boolean;
}

export interface ScoreSource {
  id: string;
  title: string;
  composer: string;
  /** Short provenance note: where the melody comes from and how it was prepared. */
  source: string;
  genre: Genre;
  difficulty: Difficulty;
  description: string;
  clef: Clef;
  key: string;
  time: string;
  tempo?: string;
  /** Length of an anacrusis (pickup) in quarter notes; the last measure is shortened by the same amount. */
  pickup?: number;
  music: string;
  licence: Licence;
  /** For melodies written for a specific family (bass-clef originals, percussion, viola). */
  concertInstruments?: Instrument[];
}

export interface Note { key: string; duration: string; rest: boolean; dotted: boolean; beats: number; notehead?: string }
export type Measure = Note[];

const BEATS: Record<string, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25 };

export function parseToken(tok: string): Note {
  const m = /^(r|[a-g](?:##|#|bb|b|n)?\/-?\d(?:\/x2)?):(w|h|q|8|16)(d?)$/.exec(tok);
  if (!m) throw new Error(`Bad token "${tok}"`);
  const [, p, d, dot] = m;
  const rest = p === 'r';
  const segs = p.split('/');
  const key = rest ? 'r' : segs.slice(0, 2).join('/');
  return { key, duration: d, rest, dotted: dot === 'd', beats: BEATS[d] * (dot ? 1.5 : 1), notehead: segs[2] };
}

export function parseMusic(music: string): Measure[] {
  return music.split('|').map((m) => m.trim()).filter(Boolean).map((m) => m.split(/\s+/).map(parseToken));
}

export const measureBeats = (time: string) => { const [n, d] = time.split('/').map(Number); return n * (4 / d); };
export const sumBeats = (m: Measure) => m.reduce((t, n) => t + n.beats, 0);

/** Returns a list of problems; empty means the score is notationally sound. */
export function validateScore(s: ScoreSource): string[] {
  const errs: string[] = [];
  let measures: Measure[] = [];
  try { measures = parseMusic(s.music); } catch (e) { return [(e as Error).message]; }
  if (!isValidKey(s.key)) errs.push(`invalid key ${s.key}`);
  const full = measureBeats(s.time);
  measures.forEach((m, i) => {
    const expected = s.pickup && i === 0 ? s.pickup : s.pickup && i === measures.length - 1 ? full - s.pickup : full;
    const got = sumBeats(m);
    if (Math.abs(got - expected) > 1e-9) errs.push(`measure ${i + 1}: ${got} beats, expected ${expected}`);
  });
  if (measures.length < 4) errs.push('too short');
  return errs;
}

/* ---------- Parts: transposed / re-clefed versions for different instruments ---------- */

export interface Part { id: string; label: string; clef: Clef; key: string; interval: Interval; instruments: Instrument[]; measures: Measure[] }

/** Comfortable written ranges (MIDI) for each instrument. */
const RANGES: Partial<Record<Instrument, [number, number]>> = {
  Piano: [21, 108],
  Violin: [55, 88],      // G3–E6
  Flute: [60, 93],       // C4–A6
  Voice: [60, 77],       // C4–F5 (comfortable treble voice)
  Guitar: [52, 84],      // written E3–C6
  Other: [58, 89],       // oboe / recorder-type treble instruments, B♭3–F6
  Trumpet: [54, 81],     // written F♯3–A5
  Clarinet: [52, 86],    // written E3–D6
  Saxophone: [58, 89],   // alto sax written B♭3–F6
  Cello: [36, 69],       // C2–A4
  Trombone: [40, 65],    // E2–F4
  Viola: [48, 76],       // C3–E5
};

const range = (ms: Measure[]) => {
  const ps = ms.flat().filter((n) => !n.rest).map((n) => midi(parsePitch(n.key)));
  return [Math.min(...ps), Math.max(...ps)] as const;
};
const fits = (ms: Measure[], ins: Instrument) => { const r = RANGES[ins]; if (!r) return false; const [lo, hi] = range(ms); return lo >= r[0] && hi <= r[1]; };

const shift = (ms: Measure[], i: Interval): Measure[] =>
  i.steps === 0 && i.semis === 0 ? ms : ms.map((m) => m.map((n) => (n.rest ? n : { ...n, key: pitchToKey(transpose(parsePitch(n.key), i)) })));

/** Every playable part of a score, each listing only instruments whose range it fits. */
export function partsFor(s: ScoreSource): Part[] {
  const base = parseMusic(s.music);
  if (s.clef === 'percussion') {
    return [{ id: 'concert', label: 'Drum kit', clef: 'percussion', key: 'C', interval: INTERVALS.unison, instruments: ['Drums'], measures: base }];
  }
  const parts: Part[] = [];
  const add = (id: string, label: string, clef: Clef, interval: Interval, candidates: Instrument[]) => {
    let measures: Measure[]; let key: string;
    try { measures = shift(base, interval); key = transposeKeySig(s.key, interval); } catch { return; }
    const instruments = candidates.filter((ins) => fits(measures, ins));
    if (instruments.length) parts.push({ id, label, clef, key, interval, instruments, measures });
  };
  const trebleConcert: Instrument[] = ['Piano', 'Violin', 'Flute', 'Voice', 'Guitar', 'Other'];
  if (s.clef === 'treble') {
    add('concert', 'Concert pitch (C instruments)', 'treble', INTERVALS.unison, s.concertInstruments ?? trebleConcert);
    add('bb', 'B♭ instruments (trumpet, clarinet)', 'treble', INTERVALS.majorSecondUp, ['Trumpet', 'Clarinet']);
    const eb6 = shift(base, INTERVALS.majorSixthUp);
    add('eb', 'E♭ alto saxophone', 'treble', fits(eb6, 'Saxophone') ? INTERVALS.majorSixthUp : INTERVALS.minorThirdDown, ['Saxophone']);
    add('bass', 'Bass clef (an octave lower)', 'bass', INTERVALS.octaveDown, ['Cello', 'Trombone', 'Piano']);
    add('alto', 'Alto clef (viola)', 'alto', INTERVALS.unison, ['Viola']);
  } else if (s.clef === 'bass') {
    add('concert', 'Bass clef', 'bass', INTERVALS.unison, s.concertInstruments ?? ['Cello', 'Trombone', 'Piano']);
    add('treble', 'Treble clef (an octave higher)', 'treble', INTERVALS.octaveUp, ['Violin', 'Flute', 'Piano']);
    add('alto', 'Alto clef (an octave higher, viola)', 'alto', INTERVALS.octaveUp, ['Viola']);
  } else if (s.clef === 'alto') {
    add('concert', 'Alto clef', 'alto', INTERVALS.unison, s.concertInstruments ?? ['Viola']);
    add('treble', 'Treble clef', 'treble', INTERVALS.unison, ['Violin', 'Flute']);
    add('bass', 'Bass clef (an octave lower)', 'bass', INTERVALS.octaveDown, ['Cello']);
  }
  return parts;
}

export function instrumentsFor(s: ScoreSource): Instrument[] {
  const set = new Set(partsFor(s).flatMap((p) => p.instruments));
  return INSTRUMENTS.filter((i) => set.has(i));
}

export const canDownload = (s: ScoreSource) => s.licence.downloadable;
