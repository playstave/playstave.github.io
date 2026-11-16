/**
 * Helpers for theory lessons 11–36: engraved figures and question builders
 * whose answers are COMPUTED from the notes shown, so a picture can never
 * disagree with its answer key.
 */
import type { NotationNote } from '../components/Notation';
import type { ChoiceOption, ChoiceQuestion, NotationFigure } from './types';

const TOKEN = /^(\*?)([a-g](?:##|#|bb|b|n)?\/\d|b\/4|r):(w|h|q|8|16)(d?)(r?)$/;

/** "c/4:q *f#/4:8 r:q" → notes for <Notation>. `r` alone is a rest. */
export function parseFigureMusic(music: string): NotationNote[] {
  return music.trim().split(/\s+/).filter(Boolean).map((t) => {
    const m = TOKEN.exec(t);
    if (!m) throw new Error(`Bad figure token "${t}"`);
    const [, hi, key, dur, dot, restFlag] = m;
    const rest = key === 'r' || restFlag === 'r';
    return { key: key === 'r' ? 'b/4' : key, duration: dur + (rest ? 'r' : dot), highlight: !!hi };
  });
}

export function fig(music: string, alt: string, o: Omit<NotationFigure, 'kind' | 'music' | 'alt'> = {}): NotationFigure {
  parseFigureMusic(music); // validate early
  return { kind: 'notation', music, alt, ...o };
}

function hash(s: string) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/**
 * Multiple choice. `right` is [text, explanation]; each wrong option carries
 * its own feedback. The right answer's position varies (by id), not always first.
 */
export function mc(id: string, prompt: string, right: [string, string], wrong: [string, string][], figure?: ChoiceQuestion['figure']): ChoiceQuestion {
  const opts: ChoiceOption[] = wrong.map(([text, feedback], i) => ({ id: `w${i + 1}`, text, feedback }));
  const at = hash(id) % (opts.length + 1);
  opts.splice(at, 0, { id: 'ok', text: right[0] });
  return { kind: 'choice', id, prompt, figure, options: opts, answer: 'ok', explanation: right[1] };
}

// ---- pitch facts ----
const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const ACC_TEXT: Record<string, string> = { '': '', '#': '♯', b: '♭', '##': '𝄪', bb: '𝄫', n: '♮' };
export function parseKey(key: string) {
  const [name, oct] = key.split('/');
  return { letter: name[0], acc: name.slice(1), octave: Number(oct) };
}
export const prettyName = (key: string) => { const { letter, acc } = parseKey(key); return letter.toUpperCase() + (acc === 'n' ? '' : ACC_TEXT[acc]); };
/** Diatonic step number (C0 = 0). */
export const stepOf = (key: string) => { const { letter, octave } = parseKey(key); return octave * 7 + LETTERS.indexOf(letter); };
const SEMIS = [0, 2, 4, 5, 7, 9, 11];
const ACC_SEMI: Record<string, number> = { '': 0, n: 0, '#': 1, '##': 2, b: -1, bb: -2 };
export const midiOf = (key: string) => { const { letter, acc, octave } = parseKey(key); return 12 * (octave + 1) + SEMIS[LETTERS.indexOf(letter)] + ACC_SEMI[acc]; };
export const keyFromStep = (step: number, acc = '') => `${LETTERS[((step % 7) + 7) % 7]}${acc}/${Math.floor(step / 7)}`;

const CLEF_NAME = { treble: 'treble', alto: 'alto', bass: 'bass' } as const;
/** Reference note for each clef: the note on its middle line, and its "anchor". */
const CLEF_MIDDLE: Record<keyof typeof CLEF_NAME, string> = { treble: 'b/4', alto: 'c/4', bass: 'd/3' };
const LINES_BOTTOM: Record<keyof typeof CLEF_NAME, string> = { treble: 'e/4', alto: 'f/3', bass: 'g/2' };

/** Where a note sits on a clef's staff, as words ("line 2", "space 3", "1 ledger line below"). */
export function placeOn(clef: keyof typeof CLEF_NAME, key: string): string {
  const p = stepOf(key) - stepOf(LINES_BOTTOM[clef]); // 0 = line 1 … 8 = line 5
  if (p >= 0 && p <= 8) return p % 2 === 0 ? `line ${p / 2 + 1}` : `space ${(p + 1) / 2}`;
  if (p === -1) return 'the space just below the staff';
  if (p === 9) return 'the space just above the staff';
  const lines = (n: number) => `${n} ledger line${n > 1 ? 's' : ''}`;
  if (p < 0) { const n = Math.floor(-p / 2); return p % 2 === 0 ? `the ${['', '1st', '2nd', '3rd', '4th'][n]} ledger line below` : `just under ${lines(n)} below the staff`; }
  const n = Math.floor((p - 8) / 2); return p % 2 === 0 ? `the ${['', '1st', '2nd', '3rd', '4th'][n]} ledger line above` : `just above ${lines(n)} above the staff`;
}

/** "Name this note" on any clef. Distractors: its neighbours, and the same spot read in another clef. */
export function nameNote(id: string, clef: keyof typeof CLEF_NAME, key: string, prompt = 'What is this note called?'): ChoiceQuestion {
  const s = stepOf(key); const { acc } = parseKey(key);
  const name = (st: number) => prettyName(keyFromStep(st, acc));
  const right = name(s);
  const other = clef === 'treble' ? 'bass' : 'treble';
  const otherSame = name(s - stepOf(LINES_BOTTOM[clef]) + stepOf(LINES_BOTTOM[other]));
  const cands: [string, string][] = [];
  const add = (t: string, f: string) => { if (t !== right && !cands.some(([x]) => x === t)) cands.push([t, f]); };
  add(otherSame, `${otherSame} is what this spot would be in the ${other} clef. Read it in the ${clef} clef: its middle line is ${prettyName(CLEF_MIDDLE[clef])}.`);
  add(name(s + 1), `${name(s + 1)} is one step higher — the next ${placeOn(clef, keyFromStep(s + 1))}. Count from a note you know.`);
  add(name(s - 1), `${name(s - 1)} is one step lower. Check whether the note is on a line or in a space, then count.`);
  add(name(s + 2), `${name(s + 2)} is a skip higher. Count line, space, line… from a landmark note.`);
  return mc(id, prompt, [right, `In the ${clef} clef this note is on ${placeOn(clef, key)}, which is ${right}${acc && acc !== 'n' ? ` (the ${ACC_TEXT[acc]} sign raises or lowers it)` : ''}. The middle line of the ${clef} clef is ${prettyName(CLEF_MIDDLE[clef])}.`], cands.slice(0, 3),
    fig(`*${key}:w`, `A ${clef} clef staff with one whole note on ${placeOn(clef, key)}.`, { clef, width: 200 }));
}

const ORD = ['unison', '2nd', '3rd', '4th', '5th', '6th', '7th', 'octave'];
export const intervalNumber = (a: string, b: string) => Math.abs(stepOf(b) - stepOf(a)) + 1;
export const intervalName = (n: number) => ORD[n - 1] ?? `${n}th`;

/** "What interval is this?" counted from letter names (including both notes). */
export function intervalQ(id: string, a: string, b: string, clef: 'treble' | 'alto' | 'bass' = 'treble'): ChoiceQuestion {
  const n = intervalNumber(a, b);
  const wrong: [string, string][] = [];
  for (const d of [-1, 1, n > 2 ? -2 : 2]) {
    const m = n + d; if (m < 1 || m > 8 || m === n || wrong.some(([t]) => t === intervalName(m))) continue;
    wrong.push([intervalName(m), m === n - 1 ? 'Remember to count BOTH notes: the bottom note is “1”.' : `Count the letters from ${prettyName(a)} up to ${prettyName(b)}, including both.`]);
  }
  const letters = Array.from({ length: n }, (_, i) => prettyName(keyFromStep(Math.min(stepOf(a), stepOf(b)) + i))).join('–');
  return mc(id, 'What interval is this (by number)?', [intervalName(n), `Count every letter name from the lower note to the upper one, including both: ${letters}. That is ${n} letters, a ${intervalName(n)}.`], wrong,
    fig(`${a}:h ${b}:h`, `Two notes: ${prettyName(a)} then ${prettyName(b)}.`, { clef, width: 220 }));
}

export const SHARP_ORDER = ['F', 'C', 'G', 'D', 'A', 'E', 'B'];
export const FLAT_ORDER = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
/** Major keys by number of sharps (positive) or flats (negative). */
export const KEY_SIGS: Record<string, number> = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, 'F#': 6, 'C#': 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7 };
export const RELATIVE_MINOR: Record<string, string> = { C: 'A', G: 'E', D: 'B', A: 'F#', E: 'C#', B: 'G#', F: 'D', Bb: 'G', Eb: 'C', Ab: 'F', Db: 'Bb' };
export const pretty = (k: string) => k.replace('#', '♯').replace(/^([A-G])b/, '$1♭');
export function accidentalsIn(major: string): string[] {
  const n = KEY_SIGS[major];
  return n >= 0 ? SHARP_ORDER.slice(0, n).map((x) => `${x}♯`) : FLAT_ORDER.slice(0, -n).map((x) => `${x}♭`);
}

/** "Which major key has this key signature?" */
export function keySigQ(id: string, major: string, clef: 'treble' | 'alto' | 'bass' = 'treble'): ChoiceQuestion {
  const n = KEY_SIGS[major];
  const sameType = Object.keys(KEY_SIGS).filter((k) => Math.sign(KEY_SIGS[k]) === Math.sign(n) && Math.abs(KEY_SIGS[k] - n) <= 2 && k !== major);
  const wrong: [string, string][] = sameType.slice(0, 2).map((k) => [`${pretty(k)} major`, `${pretty(k)} major has ${Math.abs(KEY_SIGS[k])} ${KEY_SIGS[k] > 0 ? 'sharp' : 'flat'}${Math.abs(KEY_SIGS[k]) === 1 ? '' : 's'}. Count the signs in this key signature again.`]);
  const minor = RELATIVE_MINOR[major];
  if (minor) wrong.push([`${pretty(minor)} major`, `${pretty(minor)} is the relative MINOR of this key — it shares the key signature, but ${pretty(minor)} major is a different key.`]);
  const accs = accidentalsIn(major);
  const rule = n > 0 ? `For sharp keys, go one step above the last sharp (${accs[accs.length - 1]}): ${pretty(major)}.` : n === -1 ? 'One flat (B♭) is always F major.' : `For flat keys, the second-to-last flat names the key: ${accs[accs.length - 2]} → ${pretty(major)} major.`;
  return mc(id, 'Which major key has this key signature?', [`${pretty(major)} major`, `${accs.length} ${n > 0 ? 'sharp' : 'flat'}${accs.length === 1 ? '' : 's'}: ${accs.join(', ')}. ${rule}`], wrong,
    fig('', `A ${clef} clef with a key signature of ${accs.join(', ')}.`, { clef, keySig: major, width: 200 }));
}

/** Beats in 4/4 for each written duration (quarter = 1 beat). */
export const BEATS: Record<string, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25, wd: 6, hd: 3, qd: 1.5, '8d': 0.75 };
export const beatsOf = (music: string) => parseFigureMusic(music).reduce((t, n) => t + BEATS[n.duration!.replace('r', '')], 0);

/** Count label where each note starts ("1", "1&", "2e", "2a"…), quarter-note beats. */
export function countLabels(music: string): string[] {
  let t = 0;
  return parseFigureMusic(music).map((n) => {
    const beat = Math.floor(t + 1e-9); const frac = Math.round((t - beat) * 4) / 4;
    t += BEATS[n.duration!.replace('r', '')];
    return `${beat + 1}${{ 0: '', 0.25: 'e', 0.5: '&', 0.75: 'a' }[frac] ?? '?'}`;
  });
}
