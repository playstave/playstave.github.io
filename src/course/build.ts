/**
 * Builds a playing level from a unit "idea": usually a real song (arranged for
 * the student's instrument, key, position and variation), sometimes a drill
 * (scale, arpeggio, thirds…). Every level teaches one thing first.
 *
 * Difficulty: every level has a fixed difficulty TARGET that rises from Level 1
 * to Level 500. Each level's tempo is set so its piece lands between its own
 * target and the next level's — so every level is harder than the one before,
 * by construction, and any level can be built on its own (no waiting for the
 * levels before it).
 */
import { getInstrument, type InstrumentId } from '../audio/notes';
import { buildTimeline, type Backing, type PlayExercise } from '../play/exercise';
import { arrange, type SongKey, type Variation } from './arrange';
import { describePositioned, placeNoteUpTo, POSITIONS, sharpName } from './fingering';
import { keyAccidentals } from '../music/pitch';
import { getSong, type Song } from './songs';
import type { PlayLevel, TutorialCard } from './playLevels';

/** Position reach, in plain terms; mapped to each instrument's own positions. */
export type Reach = 1 | 3 | 5 | 7 | 99;
export function maxPosFor(inst: InstrumentId, r: Reach): number {
  const t: Record<InstrumentId, Record<Reach, number>> = {
    violin: { 1: 0, 3: 2, 5: 4, 7: 6, 99: 11 },
    viola: { 1: 0, 3: 2, 5: 4, 7: 6, 99: 11 },
    cello: { 1: 0, 3: 3, 5: 4, 7: 6, 99: 8 },
    bass: { 1: 1, 3: 3, 5: 4, 7: 6, 99: 8 },
  };
  return t[inst][r];
}

export type Drill = 'scale' | 'scale2' | 'scale3' | 'arpeggio' | 'arpeggio2' | 'thirds' | 'chromatic' | 'broken' | 'harmonics';

export interface Idea {
  /** Short title, e.g. "Song: Ode to Joy" (filled in from the song if omitted). */
  title?: string;
  /** What's new in this level — one or two sentences. */
  teach: string;
  song?: string;
  drill?: Drill;
  key: SongKey;
  vars?: Variation[];
  reach?: Reach;
  /** Prefer the highest playable register (position lessons). */
  high?: boolean;
  /** Extra tip shown on the "Today's piece" card. */
  tip?: string;
}

export interface UnitPlan { unit: number; backing: Backing['style']; ideas: Idea[]; checkpoint: Idea }

/* ---------- drills as songs (so they share the arranger) ---------- */

function drillSong(d: Drill, minor: boolean): Song {
  const up = (n: number) => Array.from({ length: n }, (_, i) => i);
  const deg = (i: number) => { const d0 = ((i % 7) + 7) % 7 + 1; const oct = Math.floor(i / 7); return `${d0}${oct > 0 ? "'".repeat(oct) : oct < 0 ? ','.repeat(-oct) : ''}`; };
  const bars = (notes: string[], per: number, dur: string) => { const out: string[] = []; for (let i = 0; i < notes.length; i += per) out.push(notes.slice(i, i + per).map((n) => `${n}:${dur}`).join(' ')); return out; };
  let notes: string[];
  let dur = 'q';
  switch (d) {
    case 'scale': notes = [...up(8), ...up(7).reverse()].map(deg); break; // 1..8..1 (15) + final
    case 'scale2': notes = [...up(15), ...up(14).reverse()].map(deg); dur = '8'; break;
    case 'scale3': notes = [...up(22), ...up(21).reverse()].map(deg); dur = '16'; break;
    case 'arpeggio': notes = [0, 2, 4, 7, 4, 2, 0, 2, 4, 7, 9, 7, 4, 2, 0].map(deg); break;
    case 'arpeggio2': notes = [0, 2, 4, 7, 9, 11, 14, 11, 9, 7, 4, 2, 0, 2, 4].map(deg); dur = '8'; break;
    case 'thirds': notes = [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7, 6, 4, 5].map(deg); dur = '8'; break;
    case 'broken': notes = [0, 4, 7, 4, 2, 5, 9, 5, 4, 7, 11, 7, 0, 4, 7].map(deg); dur = '8'; break;
    case 'harmonics': notes = [0, 7, 0, 7, 4, 11, 4, 11, 0, 7, 4, 7, 0, 4, 7].map(deg); break;
    case 'chromatic': {
      const seq = ['1', '#1', '2', '#2', '3', '4', '#4', '5', '#5', '6', 'b7', '7', "1'", '7', 'b7', '6', 'b6', '5', 'b5', '4', '3', 'b3', '2', 'b2', '1', '2', '3', '4', '5', '1'];
      notes = seq.slice(0, 31); dur = '8'; break;
    }
  }
  const per = dur === 'q' ? 4 : dur === '8' ? 8 : 16;
  // Pad to whole bars, ending on a long home note.
  const body = bars(notes, per, dur);
  const lastBar = body[body.length - 1].split(' ').length;
  if (lastBar < per) body[body.length - 1] += ' ' + Array.from({ length: per - lastBar }, () => `1:${dur}`).join(' ');
  return { id: `drill-${d}`, title: d, by: 'Stave', source: 'Exercise written for Stave (CC0).', time: '4/4', mode: minor ? 'minor' : 'major', music: [...body, '1:w'].join(' | ') };
}

const DRILL_TITLES: Record<Drill, string> = {
  scale: 'Scale', scale2: 'Two-octave scale', scale3: 'Three-octave scale', arpeggio: 'Arpeggio', arpeggio2: 'Two-octave arpeggio',
  thirds: 'Scale in thirds', chromatic: 'Chromatic scale', broken: 'Broken chords', harmonics: 'Harmonics study',
};

const VAR_WORDS: Partial<Record<Variation, string>> = {
  eighths: 'in eighth notes', sixteenths: 'in sixteenth notes', dotted: 'with dotted rhythms', sync: 'with syncopation', neighbor: 'with neighbour notes',
  passing: 'with passing notes', twice: 'twice through', slurs: 'with slurs', staccato: 'staccato', accents: 'with accents', dynamics: 'with dynamics',
  echo: 'with echo dynamics', cresc: 'with a crescendo', fermata: 'with a fermata', rit: 'with a ritardando', pizz: 'with left-hand pizzicato', trills: 'with a trill', bowings: 'with bowings',
};

/* ---------- difficulty targets ---------- */

/**
 * Difficulty score of a piece, used for the course rule "every level harder
 * than the one before":
 *   notes per second × √bars × (1 + ½·share of leaps) × (1 + range/36)   — speed, length, jumps, span
 *   × (1 + 0.1 × average position above first)                          — playing high is harder
 *   × (1 + 0.05 × sharps/flats in the key)                              — harder keys
 *   × (1 + 0.03 × kinds of marking: slurs, staccato, dynamics, trills…) — more to control
 */
export function pieceScore(ex: PlayExercise): number {
  const tl = buildTimeline(ex);
  const notes = tl.notes.filter((x) => x.midi != null);
  const leaps = notes.slice(1).filter((x, i) => Math.abs(x.midi! - notes[i].midi!) > 2).length / Math.max(1, notes.length - 1);
  const range = Math.max(...notes.map((x) => x.midi!)) - Math.min(...notes.map((x) => x.midi!));
  const base = (notes.length / tl.duration) * Math.sqrt(tl.measures.length) * (1 + 0.5 * leaps) * (1 + range / 36);
  const positions = POSITIONS[ex.instrument];
  const rank = (m: number) => { const p = placeNoteUpTo(ex.instrument, m, positions.length - 1); if (!p || ['open', '1st', 'half'].includes(p.position)) return 0; return positions.findIndex((q) => q.name === p.position); };
  const avgRank = notes.reduce((t, x) => t + rank(x.midi!), 0) / Math.max(1, notes.length);
  let acc = 0;
  try { acc = Math.abs(keyAccidentals(ex.key)); } catch { acc = 0; }
  const kinds = new Set((ex.music.match(/,([a-z()]+)/g) ?? []).map((x) => x.replace(/^,/, '').replace(/[()]/g, '')));
  return base * (1 + 0.1 * avgRank) * (1 + 0.05 * acc) * (1 + 0.03 * kinds.size);
}

/** Target, as a multiple of the student's Level 11 score: smooth, always rising. */
const ANCHORS: [number, number][] = [[11, 1], [13, 1.08], [50, 2.6], [100, 5.5], [200, 8.5], [300, 10.5], [400, 12.5], [450, 13.6], [500, 15]];
/**
 * Low instruments need longer notes to be heard (see MIN_NOTE_SEC), so after
 * Level 300 their target rises a little more gently — it still rises every level.
 */
export function targetFor(n: number, inst: InstrumentId): number {
  const low = inst === 'cello' || inst === 'bass';
  const ease = low ? 1 - 0.15 * Math.max(0, Math.min(1, (n - 300) / 200)) : 1;
  return targetRatio(n) * ease;
}

export function targetRatio(n: number): number {
  for (let i = 1; i < ANCHORS.length; i++) {
    const [a, ra] = ANCHORS[i - 1], [b, rb] = ANCHORS[i];
    if (n <= b) return ra * (rb / ra) ** ((n - a) / (b - a)); // geometric between anchors
  }
  return ANCHORS[ANCHORS.length - 1][1];
}

/**
 * Shortest note each instrument can be reliably heard at (seconds). Low notes
 * take longer to recognise, so the double bass needs longer notes than the violin.
 */
export const MIN_NOTE_SEC: Record<InstrumentId, number> = { violin: 0.075, viola: 0.095, cello: 0.11, bass: 0.13 };

/** Fastest tempo at which every note of the piece is still long enough to hear. */
export function hearableTempo(ex: PlayExercise): number {
  const tl = buildTimeline({ ...ex, tempo: 60 }); // at 60 bpm, seconds = beats
  const shortest = Math.min(...tl.notes.filter((n) => n.midi != null).map((n) => n.end - n.start));
  return (60 * shortest) / MIN_NOTE_SEC[ex.instrument];
}

/** Sensible tempo limits per world (quarter-note beats per minute). */
export const tempoLimits = (n: number): [number, number] => (n <= 100 ? [40, 150] : n <= 200 ? [40, 160] : n <= 400 ? [40, 168] : [40, 176]);

/* ---------- building a level ---------- */

export interface BuildContext {
  inst: InstrumentId; plan: UnitPlan; level: number; indexInUnit: number; playIndex: number;
  unitTitle: string; unitOutcome: string; unitTopics: string[];
  /** Score of this instrument's Level 11 (the last hand-written level). */
  base: number;
  /** True for the first generated position in its unit (gets the unit introduction card). */
  unitIntro: boolean;
}

export function buildLevel(c: BuildContext): PlayLevel | undefined {
  const { inst, plan } = c;
  const isCheckpoint = c.indexInUnit === 10;
  const idea = isCheckpoint ? plan.checkpoint : plan.ideas[c.indexInUnit - 1];
  if (!idea) return undefined;
  let drill = idea.drill;
  let song = idea.song ? getSong(idea.song)! : drillSong(drill ?? 'scale', idea.key.endsWith('m'));
  const maxPos = maxPosFor(inst, idea.reach ?? 1);
  let vars = [...(idea.vars ?? [])];
  let arr = arrange(song, idea.key, inst, { variations: vars, maxPos, high: idea.high });
  // If a note can't be reached, allow the next positions up (the fingering card will say so).
  for (const r of [3, 5, 7, 99] as Reach[]) { if (arr) break; arr = arrange(song, idea.key, inst, { variations: vars, maxPos: maxPosFor(inst, r), high: idea.high }); }
  // Some drills don't fit every instrument (no double bass plays three octaves from D): use the next size down.
  const smaller: Partial<Record<Drill, Drill>> = { scale3: 'scale2', scale2: 'scale', arpeggio2: 'arpeggio' };
  while (!arr && drill && smaller[drill]) {
    drill = smaller[drill]!;
    song = drillSong(drill, idea.key.endsWith('m'));
    arr = arrange(song, idea.key, inst, { variations: vars, maxPos: maxPosFor(inst, 99), high: idea.high });
  }
  if (!arr) return undefined;
  const instr = getInstrument(inst)!;
  const lo = c.base * targetFor(c.level, inst);
  const hi = c.base * targetFor(c.level + 1, inst);
  const target = lo + (hi - lo) * 0.5;
  const [tMin, tMax] = tempoLimits(c.level);

  const exerciseFor = (music: string, tempo: number, barTempo?: number[]): PlayExercise => ({
    id: `${inst}-p${c.playIndex}`, title: idea.title ?? song.title, instrument: inst, clef: instr.clef,
    key: arr!.key, time: arr!.time, tempo, music, barTempo,
    backing: { chords: harmonise(arr!), style: plan.backing },
    hint: idea.tip ?? idea.teach,
  });
  // Land the piece inside this level's difficulty band by choosing the tempo
  // (difficulty rises in proportion to tempo). Too fast? Play it through twice
  // (longer), or add eighth notes, and try again.
  // Longer first ("play it through again"), then busier rhythms — never an absurd tempo.
  const ladder: Variation[] = ['twice', 'eighths', 'twice', 'sixteenths', 'twice'];
  const tooLong = (music: string) => buildTimeline(exerciseFor(music, 80, arr!.barTempo)).measures.length > 136;
  let tempo = 80;
  const cap = (music: string) => Math.min(tMax, hearableTempo(exerciseFor(music, 80, arr!.barTempo)));
  for (let k = 0; k <= ladder.length; k++) {
    const s80 = pieceScore(exerciseFor(arr.music, 80, arr.barTempo));
    tempo = (80 * target) / s80;
    if (tempo <= cap(arr.music)) break;
    if (k === ladder.length) {
      // Still too fast: make it harder by range instead (higher positions), then by length.
      const higher = arrange(song, idea.key, inst, { variations: vars, maxPos: maxPosFor(inst, 99), high: true });
      if (higher && higher.music !== arr.music) { arr = higher; k = ladder.length - 1; ladder.push('twice'); continue; }
      if (buildTimeline(exerciseFor(arr.music, 80, arr.barTempo)).measures.length < 70) {
        const longer = arrange(song, idea.key, inst, { variations: [...vars, 'twice'], maxPos: maxPosFor(inst, 99), high: true });
        if (longer) { vars = [...vars, 'twice']; arr = longer; ladder.push('twice'); continue; }
      }
      break;
    }
    let add = ladder[k];
    if ((add === 'eighths' && (vars.includes('eighths') || vars.includes('sixteenths'))) || (add === 'sixteenths' && vars.includes('sixteenths'))) add = 'twice';
    // Busier rhythms only help if the notes stay long enough to hear on this instrument.
    if (add === 'sixteenths' && inst !== 'violin' && inst !== 'viola') add = 'twice';
    const next = arrange(song, idea.key, inst, { variations: [...vars, add], maxPos: maxPosFor(inst, 99), high: idea.high });
    if (!next || tooLong(next.music)) continue; // skip a step that would make the piece far too long
    vars = [...vars, add];
    arr = next;
  }
  // Last resort, so the level is still harder than the one before: up to 8 bpm past the usual
  // limit, never so fast that notes become too short to hear.
  const hardCap = Math.min(tMax + 8, hearableTempo(exerciseFor(arr.music, 80, arr.barTempo)));
  const needed = (80 * lo * 1.002) / pieceScore(exerciseFor(arr.music, 80, arr.barTempo));
  tempo = Math.max(tMin, Math.min(Math.max(cap(arr.music), Math.min(needed, hardCap)), Math.round(tempo * 100) / 100));
  const exercise = exerciseFor(arr.music, tempo, arr.barTempo);

  // ---- teaching cards ----
  const used = [...new Set(arr.bars.flat().map(([m]) => m).filter((m): m is number => m != null))].sort((a, b) => a - b);
  const positioned = used.map((m) => ({ m, p: placeNoteUpTo(inst, m, 8)! })).filter((x) => x.p && !['open', '1st', 'half'].includes(x.p.position));
  const cards: TutorialCard[] = [];
  if (c.unitIntro && !isCheckpoint) cards.push({ title: `Unit ${plan.unit}: ${c.unitTitle}`, body: [c.unitOutcome, `In this unit: ${c.unitTopics.join(', ')}.`] });
  const varText = [...new Set(idea.vars ?? [])].map((v) => VAR_WORDS[v]).filter(Boolean).join(', ');
  const title = isCheckpoint ? (idea.title ?? `Checkpoint: ${c.unitTitle}`) : idea.title ?? (idea.song ? `${song.title}${varText ? ` — ${varText}` : ''}` : `${DRILL_TITLES[drill ?? 'scale']} in ${keyName(idea.key)}`);
  cards.push({
    title: isCheckpoint ? title : idea.song ? `Song: ${song.title}` : title,
    body: [idea.teach, ...(idea.song ? [`${song.by}. ${song.source}${song.simplified ? '' : ''}`] : [])],
    show: { kind: 'fingerboard', notes: used, highlight: positioned.map((x) => x.m) },
    listen: undefined,
  });
  if (positioned.length) {
    cards.push({ title: 'Where to play the high notes', body: [positioned.slice(0, 4).map((x) => `${sharpName(x.m)}: ${describePositioned(x.p, inst)}`).join('; ') + '.', 'Shift with a light thumb and a relaxed hand; slide on the finger you are already using, then place the new one.'] });
  }
  const bars = buildTimeline(exercise).measures.length;
  cards.push({
    title: isCheckpoint ? 'Your checkpoint piece' : 'Today’s piece',
    body: [`${bars} bars in ${keyName(arr.key as SongKey)}, ${arr.time} time, at about ${Math.round(tempo)} beats per minute.${vars.includes('twice') && !(idea.vars ?? []).includes('twice') ? ' Play it through twice.' : ''}`,
      idea.tip ?? 'Look through the music first: find the highest and lowest notes and any tricky rhythms before you start.'],
  });
  const newIdeas = [isCheckpoint ? 'Checkpoint review' : idea.song ? song.title : DRILL_TITLES[drill ?? 'scale'], ...(idea.vars ?? []).map((v) => VAR_WORDS[v]!).filter(Boolean).slice(0, 2), ...(positioned.length ? ['Higher positions'] : [])];
  return { index: c.playIndex, title, objective: idea.teach, newIdeas, cards, tryNotes: [], exercise };
}

const KEY_NAMES: Record<string, string> = { C: 'C major', G: 'G major', D: 'D major', A: 'A major', E: 'E major', B: 'B major', F: 'F major', Bb: 'B♭ major', Eb: 'E♭ major', Ab: 'A♭ major', Am: 'A minor', Em: 'E minor', Bm: 'B minor', 'F#m': 'F♯ minor', 'C#m': 'C♯ minor', Dm: 'D minor', Gm: 'G minor', Cm: 'C minor', Fm: 'F minor' };
export const keyName = (k: SongKey) => KEY_NAMES[k] ?? k;

/** I / IV / V (i / iv / V in minor) under each bar, chosen to contain the bar's first note. */
export function harmonise(arr: { bars: [number | null, string, unknown][][]; key: string }): string {
  const k = arr.key as SongKey;
  const minor = k.endsWith('m');
  const root = k.replace('m', '');
  const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11, Bb: 10, Eb: 3, Ab: 8, 'F#': 6, 'C#': 1 };
  const t = PC[root];
  const nameOf = (pc: number, suffix: string) => (['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'][((pc % 12) + 12) % 12]) + suffix;
  const chords = minor
    ? [{ pcs: [0, 3, 7], name: nameOf(t, 'm') }, { pcs: [5, 8, 0], name: nameOf(t + 5, 'm') }, { pcs: [7, 11, 2], name: nameOf(t + 7, '') }]
    : [{ pcs: [0, 4, 7], name: nameOf(t, '') }, { pcs: [5, 9, 0], name: nameOf(t + 5, '') }, { pcs: [7, 11, 2], name: nameOf(t + 7, '') }];
  return arr.bars.map((bar, i) => {
    if (i === arr.bars.length - 1) return chords[0].name;
    const first = bar.find(([m]) => m != null)?.[0];
    if (first == null) return chords[0].name;
    const pc = ((first - t) % 12 + 12) % 12;
    return (chords.find((ch) => ch.pcs.includes(pc)) ?? chords[0]).name;
  }).join(' | ');
}
