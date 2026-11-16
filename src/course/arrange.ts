/**
 * Arranges a song (written in scale degrees) for an instrument, a key and a
 * "variation" — the way method books bring a tune back harder: new key, higher
 * position, eighth/sixteenth-note variations, dotted or syncopated rhythms,
 * slurs, bowings and dynamics.
 *
 * Every arrangement is checked: each note must be playable on the instrument
 * (within the allowed positions), and notes are spelled correctly for the key
 * (B♭ not A♯ in F major; G♯ in A major).
 */
import { getInstrument, type InstrumentId } from '../audio/notes';
import { soundingShift } from '../play/exercise';
import type { Mark } from '../music/score';
import { placeNoteUpTo } from './fingering';
import type { Song } from './songs';

export type SongKey = 'C' | 'G' | 'D' | 'A' | 'E' | 'B' | 'F' | 'Bb' | 'Eb' | 'Ab' | 'Am' | 'Em' | 'Bm' | 'F#m' | 'C#m' | 'Dm' | 'Gm' | 'Cm' | 'Fm';

export type Variation =
  | 'eighths' | 'sixteenths' | 'dotted' | 'sync' | 'neighbor' | 'passing' | 'twice'
  | 'slurs' | 'staccato' | 'accents' | 'dynamics' | 'echo' | 'cresc' | 'fermata' | 'rit' | 'pizz' | 'trills' | 'bowings';

const LETTERS = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];

interface KeyInfo { letter: number; pc: number; mode: 'major' | 'minor' }
export function keyInfo(k: SongKey): KeyInfo {
  const minor = k.endsWith('m');
  const name = minor ? k.slice(0, -1) : k;
  const letter = LETTERS.indexOf(name[0].toLowerCase());
  const acc = name.length > 1 ? (name[1] === 'b' ? -1 : 1) : 0;
  return { letter, pc: (NATURAL[letter] + acc + 12) % 12, mode: minor ? 'minor' : 'major' };
}

export interface DegreeNote { deg: number; oct: number; alt: number; dur: string; rest: boolean; marks: Mark[] }

const BEATS: Record<string, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25 };
export const beatsOf = (dur: string) => BEATS[dur.replace('d', '')] * (dur.endsWith('d') ? 1.5 : 1);

export function parseDegrees(music: string): DegreeNote[][] {
  return music.split('|').map((bar) => bar.trim().split(/\s+/).map((tok) => {
    const m = /^(r|([#b]?)([1-7])([',]*)):(w|h|q|8|16)(d?)$/.exec(tok);
    if (!m) throw new Error(`Bad song token "${tok}"`);
    const dur = m[5] + m[6];
    if (m[1] === 'r') return { deg: 0, oct: 0, alt: 0, dur, rest: true, marks: [] };
    const oct = [...m[4]].reduce((t, c) => t + (c === "'" ? 1 : -1), 0);
    return { deg: Number(m[3]), oct, alt: m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, dur, rest: false, marks: [] };
  }));
}

/* ---------- variations (on degrees) ---------- */

const split = (n: DegreeNote, durs: string[]): DegreeNote[] => durs.map((d, i) => ({ ...n, dur: d, marks: i === 0 ? n.marks : [] }));

function vary(bars: DegreeNote[][], v: Variation, beatsPerBar: number): DegreeNote[][] {
  const last = bars.length - 1;
  switch (v) {
    case 'eighths': return bars.map((b, bi) => bi === last ? b : b.flatMap((n) => (n.rest ? [n] : n.dur === 'q' ? split(n, ['8', '8']) : n.dur === 'h' ? split(n, ['8', '8', '8', '8']) : [n])));
    case 'sixteenths': return bars.map((b, bi) => bi === last ? b : b.flatMap((n) => (n.rest ? [n]
      : n.dur === 'q' ? split(n, ['16', '16', '16', '16']) : n.dur === '8' ? split(n, ['16', '16'])
      : n.dur === 'h' ? split(n, Array(8).fill('16')) : n.dur === 'qd' ? split(n, Array(6).fill('16')) : [n])));
    case 'dotted': return bars.map((b, bi) => {
      if (bi === last) return b;
      const out: DegreeNote[] = [];
      for (let i = 0; i < b.length; i++) {
        const a = b[i], c = b[i + 1];
        if (c && !a.rest && !c.rest && a.dur === 'q' && c.dur === 'q') { out.push({ ...a, dur: 'qd' }, { ...c, dur: '8' }); i++; } else out.push(a);
      }
      return out;
    });
    case 'sync': return bars.map((b, bi) => {
      if (bi === last) return b;
      const out: DegreeNote[] = [];
      for (let i = 0; i < b.length; i++) {
        const a = b[i], c = b[i + 1];
        if (c && !a.rest && !c.rest && a.dur === 'q' && c.dur === 'q') { out.push({ ...a, dur: '8' }, { ...c, dur: 'q', marks: [...c.marks, 'ac'] }, { ...c, dur: '8', marks: [] }); i++; } else out.push(a);
      }
      return out;
    });
    case 'neighbor': return bars.map((b, bi) => bi === last ? b : b.flatMap((n) => (!n.rest && n.dur === 'q' ? [{ ...n, dur: '8' }, { ...n, deg: n.deg === 7 ? 1 : n.deg + 1, oct: n.deg === 7 ? n.oct + 1 : n.oct, alt: 0, dur: '8', marks: [] }] : [n])));
    case 'passing': return bars.map((b, bi) => {
      if (bi === last) return b;
      return b.flatMap((n, i) => {
        const nx = b[i + 1];
        if (!nx || n.rest || nx.rest || n.dur !== 'q') return [n];
        const a = n.deg + 7 * n.oct, c = nx.deg + 7 * nx.oct;
        if (Math.abs(a - c) !== 2) return [n];
        const mid = (a + c) / 2;
        const deg = ((mid - 1) % 7 + 7) % 7 + 1;
        return [{ ...n, dur: '8' }, { ...n, deg, oct: Math.floor((mid - 1) / 7), alt: 0, dur: '8', marks: [] }];
      });
    });
    case 'twice': return [...bars.slice(0, -1), ...bars];
    default: return bars; // markings are applied after pitches are fixed
  }
  void beatsPerBar;
}

function markUp(bars: DegreeNote[][], v: Variation): void {
  const notes = bars.flat().filter((n) => !n.rest);
  const add = (n: DegreeNote, m: Mark) => { if (!n.marks.includes(m)) n.marks.push(m); };
  switch (v) {
    case 'slurs': {
      // Slur pairs of short notes (two notes in one bow).
      for (const b of bars) for (let i = 0; i + 1 < b.length; i += 2) {
        const a = b[i], c = b[i + 1];
        if (!a.rest && !c.rest && beatsOf(a.dur) <= 1 && beatsOf(c.dur) <= 1) { add(a, 'sl('); add(c, 'sl)'); }
      }
      break;
    }
    case 'staccato': for (const n of notes) if (beatsOf(n.dur) <= 1 && !n.marks.includes('sl(') && !n.marks.includes('sl)')) add(n, 'st'); break;
    case 'accents': for (const b of bars) { const n = b.find((x) => !x.rest); if (n) add(n, 'ac'); } break;
    case 'bowings': { let down = true; for (const b of bars) { const n = b.find((x) => !x.rest); if (n) { add(n, down ? 'n' : 'v'); down = !down; } } break; }
    case 'dynamics': bars.forEach((b, i) => { if (i % 4 === 0) { const n = b.find((x) => !x.rest); if (n) add(n, (i / 4) % 2 === 0 ? 'f' : 'p'); } }); break;
    case 'echo': bars.forEach((b, i) => { if (i % 2 === 0) { const n = b.find((x) => !x.rest); if (n) add(n, (i / 2) % 2 === 0 ? 'f' : 'p'); } }); break;
    case 'cresc': { const first = notes[0]; if (first) add(first, 'p'); const mid = notes[Math.floor(notes.length / 3)]; if (mid) add(mid, 'cr'); const top = notes[Math.floor((notes.length * 2) / 3)]; if (top) add(top, 'f'); break; }
    case 'fermata': { const lastN = notes[notes.length - 1]; if (lastN) add(lastN, 'fer'); break; }
    case 'rit': { const b = bars[Math.max(0, bars.length - 2)]; const n = b.find((x) => !x.rest); if (n) add(n, 'rit'); break; }
    case 'pizz': for (const n of notes) if (n.dur === 'q' && n.deg % 2 === 1) add(n, 'pz'); break;
    case 'trills': for (const n of notes) if (n.dur === 'qd' || n.dur === 'h') { add(n, 'tr'); break; } break;
  }
}

/* ---------- pitches, register, spelling ---------- */

export interface Arranged {
  /** [sounding MIDI or null for a rest, duration, markings][] per bar */
  bars: [number | null, string, Mark[]][][];
  /** Library music text at WRITTEN pitch (double bass an octave up). */
  music: string;
  key: string;
  time: string;
  /** Per-bar tempo multipliers when the arrangement slows down at the end. */
  barTempo?: number[];
}

function midiOf(k: KeyInfo, tonicMidi: number, n: DegreeNote): number {
  const scale = k.mode === 'major' ? MAJOR : MINOR;
  return tonicMidi + 12 * n.oct + scale[n.deg - 1] + n.alt;
}

function spell(k: KeyInfo, n: DegreeNote, midi: number): string {
  const letter = (k.letter + n.deg - 1) % 7;
  const natural = NATURAL[letter];
  let acc = ((midi - natural) % 12 + 12) % 12;
  if (acc > 6) acc -= 12;
  const accText = acc === 0 ? '' : acc === 1 ? '#' : acc === -1 ? 'b' : acc === 2 ? '##' : acc === -2 ? 'bb' : '';
  const octave = Math.round((midi - acc - natural) / 12) - 1;
  return `${LETTERS[letter]}${accText}/${octave}`;
}

/** Comfortable "home" register per instrument (sounding MIDI of a middle tonic). */
const CENTRE: Record<InstrumentId, number> = { violin: 66, viola: 59, cello: 50, bass: 40 };

export interface ArrangeOptions {
  variations?: Variation[];
  /** Highest position index allowed (0 = first position). */
  maxPos?: number;
  /** Prefer the highest playable register (for position and high-register lessons). */
  high?: boolean;
}

export function arrange(song: Song, key: SongKey, inst: InstrumentId, o: ArrangeOptions = {}): Arranged | null {
  const k = keyInfo(key);
  if ((k.mode === 'minor') !== (song.mode === 'minor')) return null;
  const beatsPerBar = song.time === '6/8' ? 3 : Number(song.time.split('/')[0]) * (4 / Number(song.time.split('/')[1]));
  let bars = parseDegrees(song.music);
  for (const v of o.variations ?? []) bars = vary(bars, v, beatsPerBar);
  for (const v of o.variations ?? []) markUp(bars, v);
  const maxPos = o.maxPos ?? 0;
  const lowest = getInstrument(inst)!.strings[0].midi;

  // Try every octave for the tonic; keep those where every note is playable.
  const options: { tonic: number; positioned: number; dist: number }[] = [];
  for (let oct = 0; oct <= 8; oct++) {
    const tonic = k.pc + 12 * oct;
    let ok = true, positioned = 0;
    for (const b of bars) for (const n of b) {
      if (n.rest) continue;
      const m = midiOf(k, tonic, n);
      const p = m >= lowest ? placeNoteUpTo(inst, m, maxPos) : null;
      if (!p) { ok = false; break; }
      if (p.position !== 'open' && p.position !== '1st' && p.position !== 'half') positioned++;
    }
    if (ok) options.push({ tonic, positioned, dist: Math.abs(tonic + 4 - CENTRE[inst]) });
  }
  if (!options.length) return null;
  options.sort((a, b) => (o.high ? b.tonic - a.tonic : a.positioned - b.positioned || a.dist - b.dist));
  const tonic = options[0].tonic;

  const shift = soundingShift(inst);
  const out: [number | null, string, Mark[]][][] = bars.map((b) => b.map((n) => (n.rest ? [null, n.dur, n.marks] : [midiOf(k, tonic, n), n.dur, n.marks])));
  const music = bars.map((b, bi) => b.map((n, ni) => {
    const marks = n.marks.length ? `,${n.marks.join(',')}` : '';
    if (n.rest) return `r:${n.dur}${marks}`;
    const m = out[bi][ni][0]! - shift;
    return `${spell(k, n, m)}:${n.dur}${marks}`;
  }).join(' ')).join(' | ');
  const barTempo = (o.variations ?? []).includes('rit') ? bars.map((_, i) => (i === bars.length - 2 ? 0.88 : i === bars.length - 1 ? 0.75 : 1)) : undefined;
  return { bars: out, music, key, time: song.time, barTempo };
}
