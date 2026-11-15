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
