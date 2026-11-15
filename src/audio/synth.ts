/**
 * Synthetic test signals that imitate bowed strings and voice closely enough
 * to exercise the pitch detector: a harmonic series (optionally with a weak
 * fundamental, as on low cello/bass strings), vibrato, and added noise.
 * Used by unit tests; the browser's dev test-tone source mirrors these.
 */
export interface SynthOptions {
  hz: number;
  sampleRate?: number;
  length: number;
  /** Relative amplitude of harmonics 1..n (1 = fundamental). */
  harmonics?: number[];
  /** Vibrato depth in cents (peak) and rate in Hz. */
  vibratoCents?: number;
  vibratoHz?: number;
  /** White-noise amplitude relative to a full-scale signal. */
  noise?: number;
  amplitude?: number;
  /** Start phase offset in samples (so frames differ). */
  offset?: number;
  seed?: number;
}

/** Bowed-string-like spectrum: sawtooth-ish rolloff. */
export const STRING_HARMONICS = [1, 0.6, 0.45, 0.35, 0.28, 0.2, 0.16, 0.12, 0.09, 0.07];
/** Low string where the 2nd and 3rd harmonics dominate the fundamental. */
export const WEAK_FUNDAMENTAL = [0.25, 1, 0.8, 0.5, 0.35, 0.25, 0.15, 0.1];
/** Voice-like: strong low harmonics, quick rolloff. */
export const VOICE_HARMONICS = [1, 0.5, 0.25, 0.12, 0.06];

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) / 4294967296) * 2 - 1; };
}

export function synth(o: SynthOptions): Float32Array {
  const sr = o.sampleRate ?? 48000;
  const h = o.harmonics ?? [1];
  const out = new Float32Array(o.length);
  const rand = rng(o.seed ?? 7);
  const amp = o.amplitude ?? 0.3;
  const total = h.reduce((t, v) => t + v, 0);
  let phase = 0;
  const start = o.offset ?? 0;
  for (let i = 0; i < o.length; i++) {
    const t = (i + start) / sr;
    const vib = o.vibratoCents ? 2 ** ((o.vibratoCents * Math.sin(2 * Math.PI * (o.vibratoHz ?? 5.5) * t)) / 1200) : 1;
    phase += (2 * Math.PI * o.hz * vib) / sr;
    let v = 0;
    for (let k = 0; k < h.length; k++) v += h[k] * Math.sin((k + 1) * phase);
    out[i] = (amp * v) / total + (o.noise ?? 0) * rand();
  }
  return out;
}
