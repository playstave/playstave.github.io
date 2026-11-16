/**
 * Builds a playing level from a unit "idea": a tutorial card that teaches one
 * new thing, plus an original practice piece that uses it.
 *
 * Pieces are composed by rule, not at random each time: the same level always
 * gives the same piece (a fixed seed per level), and every note is checked to
 * be playable in first position on the student's instrument. Melodies move
 * mostly by step, phrases end on long notes, and every piece ends on the
 * home note (tonic). Each instrument gets its own register and fingering.
 */
import { getInstrument, type InstrumentId } from '../audio/notes';
import { soundingShift, type Backing, type PlayExercise } from '../play/exercise';
import { describePlacement, placeNote, sharpName } from './fingering';
import type { PlayLevel, TutorialCard } from './playLevels';

export type Key = 'D' | 'G' | 'A' | 'C';
export type Cell = 'q' | 'h' | 'w' | 'hd' | 'rest' | 'e2' | 'e4' | 'dq';
export type Pattern = 'melody' | 'scale' | 'thirds' | 'arpeggio' | 'repeat';

export interface Idea {
  title: string;
  /** One or two short paragraphs. */
  text: string[];
  tip?: string;
  key?: Key;
  time?: '4/4' | '3/4';
  /** Rhythm cells to use (defaults to the unit's). */
  cells?: Cell[];
  pattern?: Pattern;
  /** Scale degrees (0 = tonic, 7 = octave, −1 = leading note below…) to feature and try. */
  focus?: number[];
  /** Extra semitones of range below / above the tonic for this idea. */
  low?: number;
  high?: number;
  tempo?: number;
  bars?: number;
  /** Show a notation example instead of the fingerboard. */
  demo?: Cell[];
  /** Bias for skips (0–1; default 0.25). */
  skips?: number;
}

export interface UnitSpec {
  unit: number;
  key: Key;
  time: '4/4' | '3/4';
  cells: Cell[];
  tempo: [number, number];
  bars: [number, number];
  low: number;
  high: number;
  backing: Backing['style'];
  /** Ideas for unit positions 1–9 (theory or hand-written positions are simply skipped). */
  ideas: Idea[];
  checkpoint: { title: string; text: string[] };
}

/* ---------- music helpers ---------- */

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const TONIC_PC: Record<Key, number> = { C: 0, D: 2, G: 7, A: 9 };
/** Home note per instrument and key (sounding MIDI), chosen so first position covers the scale. */
const TONIC: Record<InstrumentId, Record<Key, number>> = {
  violin: { D: 62, G: 55, A: 69, C: 60 },
  viola: { D: 62, G: 55, A: 57, C: 48 },
  cello: { D: 50, G: 43, A: 45, C: 36 },
  bass: { D: 38, G: 31, A: 33, C: 36 },
};
const CELL_BEATS: Record<Cell, number> = { q: 1, h: 2, w: 4, hd: 3, rest: 1, e2: 1, e4: 2, dq: 2 };
const CELL_DURS: Record<Cell, string[]> = { q: ['q'], h: ['h'], w: ['w'], hd: ['hd'], rest: ['q'], e2: ['8', '8'], e4: ['8', '8', '8', '8'], dq: ['qd', '8'] };
const SHARP_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

const degreeMidi = (tonic: number, deg: number) => tonic + Math.floor(deg / 7) * 12 + MAJOR[((deg % 7) + 7) % 7];
const written = (inst: InstrumentId, sounding: number) => {
  const m = sounding - soundingShift(inst);
  return `${SHARP_NAMES[((m % 12) + 12) % 12]}/${Math.floor(m / 12) - 1}`;
};
export const noteName = (m: number) => sharpName(m);

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Playable scale notes for this instrument, key and range (sounding MIDI, ascending). */
export function notePool(inst: InstrumentId, key: Key, low: number, high: number): number[] {
  const tonic = TONIC[inst][key];
  const pool: number[] = [];
  for (let deg = -7; deg <= 14; deg++) {
    const m = degreeMidi(tonic, deg);
    if (m < tonic - low || m > tonic + high) continue;
    if (placeNote(inst, m)) pool.push(m);
  }
  // First position can't reach the top of some scales (e.g. double bass): reach down instead.
  if (pool.length < 7) {
    for (let deg = -1; deg >= -7 && pool.length < 8; deg--) {
      const m = degreeMidi(tonic, deg);
      if (!pool.includes(m) && placeNote(inst, m)) pool.unshift(m);
    }
  }
  return pool;
}

/* ---------- difficulty across the course ---------- */

/**
 * How hard a level is, as a smooth function of its level number — so every
 * unit is harder than the one before, not just different. Each unit's idea
 * decides WHAT is new; this curve decides how fast, how long and how busy.
 */
export interface Difficulty {
  /** 0 at Level 1 … 1 at Level 100 (World 1). */
  g: number;
  /** Quarter-note beats per minute before instrument adjustments. */
  tempo: number;
  bars: number;
  /** Chance of a skip instead of a step. */
  skips: number;
  /** Relative weight of long notes (h, w, hd) when filling bars; falls as levels rise. */
  longWeight: number;
  /** Rhythms already learned by this level (they keep coming back). */
  learned: Cell[];
}

export function difficultyFor(level: number, indexInUnit: number): Difficulty {
  const g = Math.max(0, Math.min(1, (level - 1) / 99));
  const within = (indexInUnit - 1) / 9;
  const learned: Cell[] = ['q', 'h'];
  if (level > 15) learned.push('rest');
  if (level > 30) learned.push('e2');
  if (level > 36) learned.push('e4');
  if (level > 50) learned.push('dq');
  return {
    g,
    tempo: Math.round(66 + 44 * g + 6 * within),
    bars: Math.round(4 + 9 * g + 2 * within),
    skips: 0.12 + 0.33 * g,
    longWeight: Math.max(0.15, 1 - 1.1 * g),
    learned,
  };
}

/**
 * Difficulty score of a piece: notes per second × √bars × (1 + ½ × share of leaps)
 * × (1 + range/36). Transparent on purpose — the course rule is that every
 * level must score higher than the level before it.
 */
export { pieceScore } from './build';
import { pieceScore } from './build';

/** Each level must score at least this much more than the one before: small steps at first, bigger later. */
export const stepFor = (g: number) => 0.06 + 0.16 * g;
/** Limits that grow with the level, so early pieces never become absurdly long or fast. */
export const maxTempo = (g: number) => Math.round(84 + 50 * g);
const maxBars = (g: number) => Math.round(8 + 16 * g);

/**
 * Make a hand-written exercise harder than `beat` if it isn't already:
 * a little faster first, then "play it twice" (the main part repeated before the final bar).
 */
export function ensureHarder(ex: PlayExercise, beat: number, g: number): PlayExercise {
  const target = beat + stepFor(g);
  let out = ex;
  for (let k = 0; k < 80 && pieceScore(out) < target; k++) {
    if (out.tempo < maxTempo(g) && k % 3 !== 2) out = { ...out, tempo: out.tempo + 4 };
    else {
      const bars = out.music.split('|').map((b) => b.trim());
      const body = bars.slice(0, -1);
      if (bars.length >= 40) break;
      out = { ...out, music: [...body, ...ex.music.split('|').map((b) => b.trim()).slice(0, -1), bars[bars.length - 1]].join(' | ') };
    }
  }
  return out;
}

/* ---------- composing ---------- */

interface Piece { bars: [number | null, string][][]; notesUsed: number[] }

const LONG: Cell[] = ['h', 'w', 'hd'];

function fillRhythm(r: () => number, cells: Cell[], beats: number, last: boolean, longWeight = 1): Cell[] {
  // Last bar: a long home note (dotted half in 3/4; whole note, or two halves, in 4/4).
  if (last) return beats === 3 ? ['hd'] : r() < 0.5 ? ['w'] : ['h', 'h'];
  const out: Cell[] = [];
  let left = beats;
  let guard = 0;
  while (left > 0 && guard++ < 50) {
    const fits = cells.filter((c) => CELL_BEATS[c] <= left && !(c === 'rest' && out.length === 0));
    // Weighted choice: long notes become rarer as levels get harder.
    const weights = fits.map((x) => (LONG.includes(x) ? longWeight : 1));
    let pick = r() * weights.reduce((a, b) => a + b, 0);
    let c: Cell = fits.length ? fits[fits.length - 1] : 'q';
    for (let i = 0; i < fits.length; i++) { pick -= weights[i]; if (pick <= 0) { c = fits[i]; break; } }
    out.push(c);
    left -= CELL_BEATS[c];
  }
  return out;
}

function compose(inst: InstrumentId, idea: Idea, spec: UnitSpec, bars: number, seed: number, d: Difficulty): Piece {
  const r = rng(seed);
  const key = idea.key ?? spec.key;
  const time = idea.time ?? spec.time;
  const beats = time === '3/4' ? 3 : 4;
  const pattern0 = idea.pattern ?? 'melody';
  // Rhythms learned earlier keep coming back.
  const base = idea.cells ?? spec.cells;
  // (Drills like scales and arpeggios use them too, minus rests, so a scale at Level 70 is busier than one at Level 25.)
  const extra = pattern0 === 'melody' ? d.learned : d.learned.filter((c) => c !== 'rest');
  const cells = [...new Set([...base, ...extra])].filter((c) => CELL_BEATS[c] <= beats && !(beats === 3 && c === 'w'));
  const pool = notePool(inst, key, idea.low ?? spec.low, idea.high ?? spec.high);
  const tonicPc = TONIC_PC[key];
  const home = pool.reduce((b, m) => ((m - tonicPc) % 12 === 0 && Math.abs(m - TONIC[inst][key]) < Math.abs(b - TONIC[inst][key]) ? m : b), pool[0]);
  const homeIdx = pool.indexOf(home);
  const pattern = idea.pattern ?? 'melody';

  // Pitch sequence generator.
  let idx = homeIdx;
  let dir = 1;
  const seq: number[] = [];
  const nextPitch = (): number => {
    if (pattern === 'scale') {
      const top = Math.min(pool.length - 1, homeIdx + 7);
      const bottom = Math.max(0, top - 7);
      if (idx >= top) dir = -1; else if (idx <= bottom) dir = 1;
      const p = pool[idx]; idx += dir; return p;
    }
    if (pattern === 'thirds') {
      // up a third, back a step: 1-3, 2-4, 3-5 …
      const k = seq.length;
      const base = homeIdx + Math.floor(k / 2) % 6;
      return pool[Math.min(pool.length - 1, k % 2 ? base + 2 : base)];
    }
    if (pattern === 'arpeggio') {
      const chord = pool.filter((m) => [0, 4, 7].includes(((m - tonicPc) % 12 + 12) % 12));
      const k = seq.length % (chord.length * 2 - 2 || 1);
      return chord[k < chord.length ? k : chord.length * 2 - 2 - k] ?? home;
    }
    if (pattern === 'repeat' && r() < 0.5 && seq.length) return seq[seq.length - 1];
    const skip = idea.skips ?? d.skips;
    const roll = r();
    const move = roll < 0.15 ? 0 : roll < 0.15 + skip ? 2 : 1;
    if (idx + move * dir >= pool.length || idx + move * dir < 0 || r() < 0.25) dir = -dir;
    idx = Math.max(0, Math.min(pool.length - 1, idx + move * dir));
    return pool[idx];
  };

  const out: [number | null, string][][] = [];
  for (let b = 0; b < bars; b++) {
    const last = b === bars - 1;
    const phraseEnd = !last && b % 4 === 3;
    const rhythm = fillRhythm(r, cells, beats, last, d.longWeight);
    const bar: [number | null, string][] = [];
    rhythm.forEach((c, ci) => {
      const finalCell = ci === rhythm.length - 1;
      CELL_DURS[c].forEach((d, di) => {
        if (c === 'rest') { bar.push([null, 'q']); return; }
        let p = nextPitch();
        if (last && finalCell) p = home;
        else if (phraseEnd && finalCell && di === CELL_DURS[c].length - 1) {
          // half-cadence: end the phrase on the 5th or the 3rd above home
          const target = pool.find((m) => m > home && [4, 7].includes(((m - tonicPc) % 12 + 12) % 12)) ?? home;
          p = target; idx = pool.indexOf(target);
        }
        seq.push(p);
        bar.push([p, d]);
      });
    });
    out.push(bar);
  }
  // Feature the idea's focus notes at least twice (replacing neighbours).
  for (const deg of idea.focus ?? []) {
    const fm = pool.find((m) => ((m - tonicPc) % 12 + 12) % 12 === ((MAJOR[((deg % 7) + 7) % 7]) % 12)) ;
    if (fm == null) continue;
    let count = out.flat().filter(([m]) => m === fm).length;
    for (let b = 0; b < out.length - 1 && count < 2; b++) {
      for (const n of out[b]) {
        if (count >= 2) break;
        if (n[0] != null && n[0] !== fm && Math.abs(pool.indexOf(n[0]) - pool.indexOf(fm)) === 1) { n[0] = fm; count++; }
      }
    }
  }
  const notesUsed = [...new Set(out.flat().map(([m]) => m).filter((m): m is number => m != null))].sort((a, b) => a - b);
  return { bars: out, notesUsed };
}

/** I, IV or V under each bar, chosen to contain the bar's first note; the last bar is I. */
function harmonise(key: Key, bars: [number | null, string][][]): string {
  const t = TONIC_PC[key];
  const names: Record<Key, [string, string, string]> = { C: ['C', 'F', 'G'], D: ['D', 'G', 'A'], G: ['G', 'C', 'D'], A: ['A', 'D', 'E'] };
  const chords = [[0, 4, 7], [5, 9, 0], [7, 11, 2]];
  return bars.map((bar, i) => {
    if (i === bars.length - 1) return names[key][0];
    const first = bar.find(([m]) => m != null)?.[0];
    if (first == null) return names[key][0];
    const pc = ((first - t) % 12 + 12) % 12;
    const k = chords.findIndex((c) => c.includes(pc));
    return names[key][k < 0 ? 0 : k];
  }).join(' | ');
}

function music(inst: InstrumentId, bars: [number | null, string][][]): string {
  return bars.map((bar) => bar.map(([m, d]) => `${m == null ? 'r' : written(inst, m)}:${d}`).join(' ')).join(' | ');
}

/* ---------- level assembly ---------- */

export interface GenContext { inst: InstrumentId; spec: UnitSpec; level: number; indexInUnit: number; playIndex: number; unitTitle: string; unitOutcome: string; unitTopics: string[]; /** Score of the previous playing level: this one must beat it by STEP. */ beat?: number }

export function generateLevel(c: GenContext): PlayLevel {
  const { inst, spec } = c;
  const isCheckpoint = c.indexInUnit === 10;
  const idea: Idea = isCheckpoint
    ? { title: spec.checkpoint.title, text: spec.checkpoint.text, cells: spec.cells }
    : spec.ideas[c.indexInUnit - 1];
  const d = difficultyFor(c.level, c.indexInUnit);
  // Ideas may ask for a longer piece or a brighter tempo; both sit on top of the course curve.
  const key = idea.key ?? spec.key;
  const time = idea.time ?? spec.time;
  const hasEighths = (idea.cells ?? spec.cells).some((x) => x === 'e2' || x === 'e4' || x === 'dq') || d.learned.includes('e2');
  // Ideas may ask for a longer piece or a brighter tempo; both sit on top of the course curve.
  let bars = isCheckpoint ? d.bars + 4 : Math.max(d.bars, idea.bars ?? 0);
  let baseTempo = d.tempo + (idea.tempo ? 8 : 0);
  const tempoFor = (t: number) => {
    // Eighth notes double the note speed, so the beat is a little slower when they appear.
    const q = hasEighths ? Math.round(t * 0.88) : t;
    return inst === 'bass' ? Math.round(q * (hasEighths ? 0.82 : 0.9)) : q;
  };
  let seed = spec.unit * 1000 + c.indexInUnit * 7 + 1;
  let piece = compose(inst, idea, spec, bars, seed, d);
  let tempo = tempoFor(baseTempo);
  const exerciseFor = (p: Piece, t: number): PlayExercise => ({
    id: `${inst}-p${c.playIndex}`, title: idea.title, instrument: inst, clef: getInstrument(inst)!.clef,
    key, time, tempo: t, music: music(inst, p.bars), backing: { chords: harmonise(key, p.bars), style: spec.backing }, hint: idea.tip ?? idea.text[0],
  });
  // The course rule: harder than the previous level by at least STEP. Lengthen and speed up (within the limits) until it is.
  if (c.beat != null) {
    const target = c.beat + stepFor(d.g);
    // Try a handful of pieces at each setting and keep the gentlest one that is still harder
    // than the last level — a steady climb, never a lurch. If none is hard enough, lengthen or speed up.
    let found = false;
    for (let k = 0; k < 90 && !found; k++) {
      let best: { p: Piece; s: number } | null = null;
      // After many tries, make the rhythm busier too: fewer long notes, more skips,
      // and (once learned) eighth notes even in drills.
      const busy = k > 24;
      const dk: Difficulty = busy ? { ...d, longWeight: 0.05, skips: Math.min(0.6, d.skips + 0.15) } : d;
      const ik: Idea = busy && d.learned.includes('e2') ? { ...idea, cells: [...new Set([...(idea.cells ?? spec.cells), 'e2' as Cell, ...(d.learned.includes('e4') ? ['e4' as Cell] : [])])] } : idea;
      for (let v = 0; v < 8; v++) {
        const p = compose(inst, ik, spec, bars, seed + v * 101, dk);
        const sc = pieceScore(exerciseFor(p, tempoFor(baseTempo)));
        if (sc >= target && (!best || sc < best.s)) best = { p, s: sc };
      }
      if (best) { piece = best.p; tempo = tempoFor(baseTempo); found = true; break; }
      if (k % 2 === 0 && bars < maxBars(d.g)) bars++;
      else if (baseTempo < maxTempo(d.g)) baseTempo += 2;
      else if (bars < maxBars(d.g) + 16) bars++; // last resort: a longer piece…
      else if (baseTempo < maxTempo(d.g) + 14) baseTempo += 2; // …or a little faster
      else break;
    }
    if (!found) {
      // Guaranteed last step: notes per second rise with tempo, so raise the tempo just enough.
      piece = compose(inst, idea, spec, bars, seed, d);
      tempo = tempoFor(baseTempo);
      for (let k = 0; k < 60 && pieceScore(exerciseFor(piece, tempo)) < target; k++) tempo += 1;
    }
  }
  const tonicPc = TONIC_PC[key];
  const focusNotes = (idea.focus ?? [])
    .map((deg) => piece.notesUsed.find((m) => ((m - tonicPc) % 12 + 12) % 12 === MAJOR[((deg % 7) + 7) % 7]))
    .filter((m): m is number => m != null);
  const instName = getInstrument(inst)!.name.toLowerCase();

  const cards: TutorialCard[] = [];
  if (c.indexInUnit === firstIdeaPosition(spec) && !isCheckpoint) {
    cards.push({ title: `Unit ${spec.unit}: ${c.unitTitle}`, body: [c.unitOutcome, `In this unit: ${c.unitTopics.join(', ')}.`] });
  }
  const fingering = focusNotes.map((m) => `${noteName(m)} is the ${describePlacement(placeNote(inst, m)!, inst)}`);
  cards.push({
    title: idea.title,
    body: [...idea.text, ...(fingering.length ? [`On your ${instName}: ${fingering.join('; ')}.`] : [])],
    show: idea.demo
      ? { kind: 'notation', notes: idea.demo.flatMap((cell) => CELL_DURS[cell].map((d) => (cell === 'rest' ? { key: 'r', duration: 'qr' } : { key: written(inst, focusNotes[0] ?? piece.notesUsed[0]), duration: d }))), time, key }
      : { kind: 'fingerboard', notes: piece.notesUsed, highlight: focusNotes },
    listen: focusNotes.length ? focusNotes : undefined,
  });
  cards.push({
    title: isCheckpoint ? 'Your checkpoint piece' : 'Today’s piece',
    body: [`${bars} bars in ${key} major, ${time} time, at ${tempo} beats per minute. It uses ${piece.notesUsed.map(noteName).filter((v, i, a) => a.indexOf(v) === i).join(', ')}.`,
      idea.tip ?? 'Look through the music first: find the highest and lowest notes and any tricky rhythms before you start.'],
  });

  const exercise = exerciseFor(piece, tempo);
  const newIdeas = isCheckpoint ? ['Checkpoint review', `${bars}-bar piece`] : [idea.title, ...(focusNotes.length ? focusNotes.map((m) => `${noteName(m)} (${describePlacement(placeNote(inst, m)!, inst)})`) : [])];
  return {
    index: c.playIndex, title: isCheckpoint ? spec.checkpoint.title : idea.title,
    objective: isCheckpoint ? `Play a ${bars}-bar piece that reviews ${c.unitTitle}.` : idea.text[0],
    newIdeas, cards, tryNotes: focusNotes, exercise,
  };
}

/** The first unit position that is generated (positions before it may be theory or hand-written). */
let firstPositionCache = new WeakMap<UnitSpec, number>();
export function setFirstIdeaPosition(spec: UnitSpec, pos: number) { firstPositionCache.set(spec, pos); }
function firstIdeaPosition(spec: UnitSpec): number { return firstPositionCache.get(spec) ?? 1; }
export function _resetFirstPositions() { firstPositionCache = new WeakMap(); }
