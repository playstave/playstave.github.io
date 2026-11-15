/**
 * Frequencies, notes and cents — plus the four orchestral string instruments
 * the app teaches. All pitches here are SOUNDING pitches (the double bass is
 * written an octave higher than it sounds; notation code handles that).
 */
export const NOTE_NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'] as const;

/** Exact (fractional) MIDI number for a frequency. */
export function hzToMidi(hz: number, a4 = 440): number {
  return 69 + 12 * Math.log2(hz / a4);
}

export function midiToHz(midi: number, a4 = 440): number {
  return a4 * 2 ** ((midi - 69) / 12);
}

/** "A4", "C♯5", … (scientific pitch notation; middle C = C4). */
export function midiName(midi: number): string {
  const m = Math.round(midi);
  return `${NOTE_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
}

export interface NoteReading {
  /** Nearest equal-tempered MIDI note. */
  midi: number;
  name: string;
  /** Deviation from that note: negative = flat, positive = sharp. */
  cents: number;
}

export function readNote(hz: number, a4 = 440): NoteReading {
  const exact = hzToMidi(hz, a4);
  const midi = Math.round(exact);
  return { midi, name: midiName(midi), cents: (exact - midi) * 100 };
}

/** Cents from `hz` to the target note `midi` (can exceed ±50). */
export function centsFrom(hz: number, midi: number, a4 = 440): number {
  return (hzToMidi(hz, a4) - midi) * 100;
}

export type InstrumentId = 'violin' | 'viola' | 'cello' | 'bass';

export interface StringDef { name: string; midi: number }

export interface Instrument {
  id: InstrumentId;
  name: string;
  /** Open strings, lowest first (sounding pitch). */
  strings: StringDef[];
  /** Detection range in Hz (sounding), with headroom below the lowest string. */
  minHz: number;
  maxHz: number;
  clef: 'treble' | 'alto' | 'bass';
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'violin', name: 'Violin', clef: 'treble', minHz: 170, maxHz: 3600,
    strings: [{ name: 'G', midi: 55 }, { name: 'D', midi: 62 }, { name: 'A', midi: 69 }, { name: 'E', midi: 76 }] },
  { id: 'viola', name: 'Viola', clef: 'alto', minHz: 115, maxHz: 1800,
    strings: [{ name: 'C', midi: 48 }, { name: 'G', midi: 55 }, { name: 'D', midi: 62 }, { name: 'A', midi: 69 }] },
  { id: 'cello', name: 'Cello', clef: 'bass', minHz: 58, maxHz: 1100,
    strings: [{ name: 'C', midi: 36 }, { name: 'G', midi: 43 }, { name: 'D', midi: 50 }, { name: 'A', midi: 57 }] },
  { id: 'bass', name: 'Double bass', clef: 'bass', minHz: 36, maxHz: 500,
    strings: [{ name: 'E', midi: 28 }, { name: 'A', midi: 33 }, { name: 'D', midi: 38 }, { name: 'G', midi: 43 }] },
];

export function getInstrument(id: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.id === id);
}

/** Open string nearest to `hz` (by cents), for the tuner's automatic string choice. */
export function nearestString(inst: Instrument, hz: number, a4 = 440): StringDef {
  const m = hzToMidi(hz, a4);
  return inst.strings.reduce((best, s) => (Math.abs(s.midi - m) < Math.abs(best.midi - m) ? s : best));
}
