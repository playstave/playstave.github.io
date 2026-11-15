/**
 * Pitch spelling and transposition. Pitches keep their letter name so that
 * transposed parts are spelled correctly (a major second above B♭ is C, a
 * major sixth above D is B, etc.), never just shifted by semitones.
 */
export const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'] as const;
const NATURAL = [0, 2, 4, 5, 7, 9, 11];

export interface Pitch { letter: number; acc: number; octave: number }
export interface Interval { steps: number; semis: number }

export const INTERVALS = {
  majorSecondUp: { steps: 1, semis: 2 },
  majorSixthUp: { steps: 5, semis: 9 },
  minorThirdDown: { steps: -2, semis: -3 },
  octaveDown: { steps: -7, semis: -12 },
  octaveUp: { steps: 7, semis: 12 },
  unison: { steps: 0, semis: 0 },
} satisfies Record<string, Interval>;

const ACC_TEXT: Record<number, string> = { [-2]: 'bb', [-1]: 'b', 0: '', 1: '#', 2: '##' };

/** Parse a VexFlow-style key such as "f#/4" or "bb/3". */
export function parsePitch(key: string): Pitch {
  const m = /^([a-g])(##|#|bb|b|n)?\/(-?\d)$/.exec(key);
  if (!m) throw new Error(`Bad pitch "${key}"`);
  const acc = m[2] === '##' ? 2 : m[2] === '#' ? 1 : m[2] === 'bb' ? -2 : m[2] === 'b' ? -1 : 0;
  return { letter: LETTERS.indexOf(m[1] as (typeof LETTERS)[number]), acc, octave: Number(m[3]) };
}

export const pitchToKey = (p: Pitch) => `${LETTERS[p.letter]}${ACC_TEXT[p.acc]}/${p.octave}`;

/** MIDI number (C4 = 60). */
export const midi = (p: Pitch) => (p.octave + 1) * 12 + NATURAL[p.letter] + p.acc;

export function transpose(p: Pitch, i: Interval): Pitch {
  const idx = p.letter + i.steps;
  const letter = ((idx % 7) + 7) % 7;
  const octave = p.octave + Math.floor(idx / 7);
  const target = midi(p) + i.semis;
  const natural = (octave + 1) * 12 + NATURAL[letter];
  const acc = target - natural;
  if (acc < -2 || acc > 2) throw new Error(`Cannot spell ${pitchToKey(p)} transposed by ${JSON.stringify(i)}`);
  return { letter, acc, octave };
}

export const transposeKey = (key: string, i: Interval) => pitchToKey(transpose(parsePitch(key), i));

/** Key signatures VexFlow can draw, by number of sharps (+) or flats (−). */
const MAJOR: Record<string, number> = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
const MINOR: Record<string, number> = { A: 0, E: 1, B: 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, 'A#': 7, D: -1, G: -2, C: -3, F: -4, Bb: -5, Eb: -6, Ab: -7 };

export function isValidKey(k: string): boolean {
  const minor = k.endsWith('m');
  const tonic = minor ? k.slice(0, -1) : k;
  return (minor ? MINOR : MAJOR)[tonic] !== undefined;
}

export function keyAccidentals(k: string): number {
  const minor = k.endsWith('m');
  const tonic = minor ? k.slice(0, -1) : k;
  const v = (minor ? MINOR : MAJOR)[tonic];
  if (v === undefined) throw new Error(`Unknown key ${k}`);
  return v;
}

/** Transpose a key signature name, e.g. ("F", major second up) → "G"; ("Am", major sixth up) → "F#m". */
export function transposeKeySig(k: string, i: Interval): string {
  const minor = k.endsWith('m');
  const tonic = minor ? k.slice(0, -1) : k;
  const p = parsePitch(`${tonic[0].toLowerCase()}${tonic.slice(1)}/4`);
  const t = transpose(p, i);
  const name = LETTERS[t.letter].toUpperCase() + ACC_TEXT[t.acc];
  const out = name + (minor ? 'm' : '');
  if (!isValidKey(out)) throw new Error(`Transposed key ${out} is not a standard key signature`);
  return out;
}
