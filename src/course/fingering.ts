/**
 * Where to put your fingers, for each string instrument, in first position.
 *
 * Distances are in semitones above the open string. The finger used for each
 * distance differs by instrument — that difference is exactly what each
 * instrument's lessons teach:
 *   violin/viola  1 = a half or whole step ("low 1"/"1"), 2 = a minor or major third ("low 2"/"high 2"), 3 = a fourth, or an augmented fourth ("high 3"), 4 = a fifth (same note as the next open string)
 *   cello         each finger a half step apart: 1 = whole step, 2 = minor third, 3 = major third, 4 = fourth; an augmented fourth needs a forward extension (4th finger, extended)
 *   double bass   1 = whole step, 2 = minor third, 4 = major third (bassists don't use 3 alone in the lower positions); a fourth is the next open string
 */
import { getInstrument, midiName, type InstrumentId } from '../audio/notes';

export interface Placement {
  /** Index of the string, lowest = 0. */
  string: number;
  stringName: string;
  /** Semitones above the open string (0 = open). */
  offset: number;
  /** 0 = open string. */
  finger: 0 | 1 | 2 | 3 | 4;
}

/** Semitone offset → finger, in first position (no shifting). */
export const FIRST_POSITION: Record<InstrumentId, Record<number, 0 | 1 | 2 | 3 | 4>> = {
  violin: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4 },
  viola: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4 },
  cello: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 3, 5: 4, 6: 4 },
  bass: { 0: 0, 1: 1, 2: 1, 3: 2, 4: 4 },
};

/**
 * Best first-position placement for a SOUNDING pitch: prefer an open string,
 * otherwise the lowest finger. Returns null if the note can't be played in first position.
 */
export function placeNote(inst: InstrumentId, soundingMidi: number): Placement | null {
  const { strings } = getInstrument(inst)!;
  const table = FIRST_POSITION[inst];
  const options: Placement[] = [];
  strings.forEach((s, i) => {
    const offset = soundingMidi - s.midi;
    const finger = table[offset];
    if (finger !== undefined) options.push({ string: i, stringName: s.name, offset, finger });
  });
  if (!options.length) return null;
  // Open string first; then a 4th finger only if there is no other way (violin/viola 4 = next open string).
  options.sort((a, b) => (a.finger === 0 ? -1 : b.finger === 0 ? 1 : 0) || (a.finger === 4 ? 1 : 0) - (b.finger === 4 ? 1 : 0) || a.finger - b.finger);
  return options[0];
}

/** Placement of a note on a given string (for exercises that stay on one string). */
export function placeOnString(inst: InstrumentId, soundingMidi: number, string: number): Placement | null {
  const s = getInstrument(inst)!.strings[string];
  const offset = soundingMidi - s.midi;
  const finger = FIRST_POSITION[inst][offset];
  return finger === undefined ? null : { string, stringName: s.name, offset, finger };
}

/** "D string, 1st finger" — for tutorials and tips. */
export function describePlacement(p: Placement, inst?: InstrumentId): string {
  if (p.finger === 0) return `open ${p.stringName} string`;
  const f = ['', '1st', '2nd', '3rd', '4th'][p.finger];
  const shade = inst === 'cello' && p.offset === 6 ? ' (extended)'
    : (inst === 'violin' || inst === 'viola') ? (p.offset === 1 ? ' (low 1)' : p.offset === 3 ? ' (low 2)' : p.offset === 4 ? ' (high 2)' : p.offset === 6 ? ' (high 3)' : '')
    : '';
  return `${p.stringName} string, ${f} finger${shade}`;
}

export const noteLabel = (soundingMidi: number) => midiName(soundingMidi);

const SHARP_DISPLAY = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
/** Note name for lessons, spelled with sharps (every key so far — C, G, D, A — uses sharps). */
export const sharpName = (midi: number) => SHARP_DISPLAY[((midi % 12) + 12) % 12];
export const sharpNameOct = (midi: number) => `${sharpName(midi)}${Math.floor(midi / 12) - 1}`;

/* ---------- Positions (World 2 onwards) ---------- */

/**
 * Hand positions beyond first. A position is where the 1st finger sits,
 * in semitones above the open string; the other fingers fall within the
 * instrument's hand frame from there.
 *   violin/viola: frame of a fourth (1st→4th finger = 5 semitones)
 *   cello:        frame of a minor third (one finger per half step; 4th finger = 1st + 3)
 *   double bass:  frame of a whole step (1st, 2nd, 4th fingers = +0, +1, +2)
 *   thumb position (cello, bass): the thumb lies across the strings and the hand spans a fourth
 */
export interface PositionDef { name: string; base: number; thumb?: boolean }

export const POSITIONS: Record<InstrumentId, PositionDef[]> = {
  violin: [{ name: '1st', base: 2 }, { name: '2nd', base: 3 }, { name: '3rd', base: 5 }, { name: '4th', base: 7 }, { name: '5th', base: 8 }, { name: '6th', base: 10 }, { name: '7th', base: 12 }, { name: '8th', base: 13 }, { name: '9th', base: 15 }, { name: '10th', base: 17 }, { name: '11th', base: 19 }, { name: '12th', base: 20 }],
  viola: [{ name: '1st', base: 2 }, { name: '2nd', base: 3 }, { name: '3rd', base: 5 }, { name: '4th', base: 7 }, { name: '5th', base: 8 }, { name: '6th', base: 10 }, { name: '7th', base: 12 }, { name: '8th', base: 13 }, { name: '9th', base: 15 }, { name: '10th', base: 17 }, { name: '11th', base: 19 }, { name: '12th', base: 20 }],
  cello: [{ name: '1st', base: 2 }, { name: '2nd', base: 3 }, { name: '3rd', base: 4 }, { name: '4th', base: 5 }, { name: '5th', base: 7 }, { name: '6th', base: 9 }, { name: '7th', base: 10 }, { name: 'thumb', base: 12, thumb: true }, { name: 'high thumb', base: 17, thumb: true }],
  bass: [{ name: 'half', base: 1 }, { name: '1st', base: 2 }, { name: '2nd', base: 3 }, { name: '3rd', base: 5 }, { name: '4th', base: 7 }, { name: '5th', base: 9 }, { name: '6th', base: 10 }, { name: 'thumb', base: 12, thumb: true }, { name: 'high thumb', base: 17, thumb: true }],
};

/** Finger for a note `rel` semitones above the position's 1st finger, or null if out of the hand frame. */
function fingerInFrame(inst: InstrumentId, rel: number, thumb: boolean): 0 | 1 | 2 | 3 | 4 | null {
  if (thumb) {
    // Thumb position: thumb (shown as 0 on the diagram key "T"), then fingers 1–3 across a fourth.
    if (rel === 0) return 0;
    if (rel >= 1 && rel <= 2) return 1;
    if (rel >= 3 && rel <= 4) return 2;
    if (rel === 5) return 3;
    return null;
  }
  if (inst === 'violin' || inst === 'viola') return rel === 0 ? 1 : rel <= 2 ? 2 : rel <= 4 ? 3 : rel === 5 ? 4 : null;
  if (inst === 'cello') return rel === 0 ? 1 : rel === 1 ? 2 : rel === 2 ? 3 : rel === 3 ? 4 : null;
  return rel === 0 ? 1 : rel === 1 ? 2 : rel === 2 ? 4 : null; // double bass
}

export interface PositionedPlacement extends Placement { position: string; thumb?: boolean }

/**
 * Where to play a note using positions up to index `maxPos` of POSITIONS[inst]
 * (0 = first position only). Prefers first position (and open strings), then the
 * lowest position that reaches the note.
 */
export function placeNoteUpTo(inst: InstrumentId, soundingMidi: number, maxPos: number): PositionedPlacement | null {
  const first = placeNote(inst, soundingMidi);
  if (first) return { ...first, position: first.finger === 0 ? 'open' : POSITIONS[inst].find((p) => p.name === '1st' || p.name === 'half')?.name ?? '1st' };
  const { strings } = getInstrument(inst)!;
  const positions = POSITIONS[inst].slice(0, maxPos + 1);
  for (const pos of positions) {
    // Higher strings first in a given position (less shifting, brighter tone is usually wanted up high).
    for (let s = strings.length - 1; s >= 0; s--) {
      const offset = soundingMidi - strings[s].midi;
      const rel = offset - pos.base;
      if (offset < 0 || rel < 0) continue;
      const finger = fingerInFrame(inst, rel, !!pos.thumb);
      if (finger != null) return { string: s, stringName: strings[s].name, offset, finger, position: pos.name, thumb: pos.thumb };
    }
  }
  return null;
}

/** "A string, 3rd position, 2nd finger" (or thumb). */
export function describePositioned(p: PositionedPlacement, inst: InstrumentId): string {
  if (p.position === 'open' || p.position === '1st' || p.position === 'half') {
    const base = describePlacement(p, inst);
    return p.position === 'half' && p.finger !== 0 ? `${base} (half position)` : base;
  }
  if (p.thumb && p.finger === 0) return `${p.stringName} string, thumb (${p.position} position)`;
  return `${p.stringName} string, ${p.position} position, ${['', '1st', '2nd', '3rd', '4th'][p.finger]} finger`;
}
