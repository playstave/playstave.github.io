/**
 * Backing tracks generated from chord symbols — no recordings, so every track
 * is ours to use. Pure: produces a list of timed chord events; the session
 * turns them into sound.
 *
 * Bleed protection: when the backing comes out of a speaker, the microphone
 * hears it too. A chord tone that matches the note the student should be
 * playing (same pitch, or an octave either side) could fool the assessment
 * into marking a note green that wasn't played, so such tones are left out
 * while that note sounds. Headphones are still recommended.
 */
import type { Backing, Timeline } from './exercise';

export interface BackingEvent { start: number; dur: number; midis: number[] }

const ROOTS: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const QUALITIES: Record<string, number[]> = {
  '': [0, 4, 7], m: [0, 3, 7], '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dim: [0, 3, 6], sus4: [0, 5, 7], '5': [0, 7],
};

/** Parse "F#m7" → pitch classes (root first). */
export function chordPitchClasses(symbol: string): number[] {
  const m = /^([A-G])(#|b)?(maj7|m7|m|7|dim|sus4|5)?$/.exec(symbol.trim());
  if (!m) throw new Error(`Unknown chord "${symbol}"`);
  const root = (ROOTS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
  return QUALITIES[m[3] ?? ''].map((i) => (root + i) % 12);
}

/** Close-position voicing: bass note in C2–B2, upper tones in E3–D♯4. */
export function voice(pcs: number[]): number[] {
  const bass = 36 + pcs[0];
  const upper = pcs.map((pc) => { let n = 52 + ((pc - 52 % 12 + 12) % 12); if (n >= 64) n -= 12; return n; });
  return [bass, ...upper.sort((a, b) => a - b)];
}

/** Melody notes sounding during [start, end). */
function melodyDuring(tl: Timeline, start: number, end: number): number[] {
  return tl.notes.filter((n) => n.midi != null && n.start < end - 1e-6 && n.end > start + 1e-6).map((n) => n.midi!);
}

const clashes = (tone: number, melody: number[]) => melody.some((m) => (tone - m) % 12 === 0 && Math.abs(tone - m) <= 12);

export function backingEvents(b: Backing, tl: Timeline): BackingEvent[] {
  const out: BackingEvent[] = [];
  const bars = b.chords.split('|').map((x) => x.trim().split(/\s+/).filter(Boolean));
  if (b.style === 'drone') {
    const first = bars[0]?.[0];
    if (!first) return out;
    const pcs = chordPitchClasses(first);
    const melody = tl.notes.filter((n) => n.midi != null).map((n) => n.midi!);
    const lowest = Math.min(...melody);
    const highest = Math.max(...melody);
    // Root and fifth, more than an octave away from every melody note.
    let root = lowest - 13 - ((lowest - 13 - pcs[0]) % 12 + 12) % 12;
    if (root < 28) root = highest + 13 + ((pcs[0] - (highest + 13)) % 12 + 12) % 12;
    out.push({ start: 0, dur: tl.duration, midis: [root, root + 7] });
    return out;
  }
  bars.forEach((chords, bi) => {
    if (!chords.length) return;
    const barStart = bi * tl.measureSec;
    if (barStart >= tl.duration - 1e-6) return;
    const each = tl.measureSec / chords.length;
    chords.forEach((sym, ci) => {
      const cStart = barStart + ci * each;
      const tones = voice(chordPitchClasses(sym));
      const slices = b.style === 'pulse' ? Math.max(1, Math.round(each / tl.beat)) : 1;
      const sliceDur = each / slices;
      for (let k = 0; k < slices; k++) {
        const s = cStart + k * sliceDur;
        const melody = melodyDuring(tl, s, s + sliceDur);
        const midis = tones.filter((t) => !clashes(t, melody));
        if (midis.length) out.push({ start: s, dur: b.style === 'pulse' ? Math.min(sliceDur, tl.beat * 0.9) : sliceDur, midis });
      }
    });
  });
  return out;
}
