/**
 * Renders a simulated performance of a timeline to audio samples, with
 * deliberate mistakes, and turns audio into pitch frames exactly as the live
 * session does. Used by tests (and mirrored by the DEV test performer).
 */
import { detectPitch, windowSizeFor } from '../audio/pitch';
import { getInstrument, midiToHz } from '../audio/notes';
import { STRING_HARMONICS } from '../audio/synth';
import type { InstrumentId } from '../audio/notes';
import type { Frame } from './assess';
import type { Timeline } from './exercise';

export interface Mistake {
  /** Note index to change. */
  index: number;
  /** Play this many semitones away (wrong note). */
  semitones?: number;
  /** Detune by cents. */
  cents?: number;
  /** Start this many seconds late (+) or early (−); the note still ends on time (or when the next begins). */
  shift?: number;
  /** Don't play the note at all. */
  skip?: boolean;
}

export interface PerformOptions {
  sampleRate?: number;
  mistakes?: Mistake[];
  /** Start every note this many seconds late (e.g. to model latency). */
  globalShift?: number;
  vibratoCents?: number;
  noise?: number;
  /** Silence before the first downbeat, seconds (the count-in). */
  lead?: number;
  harmonics?: number[];
  /** Extra signal mixed in (e.g. backing-track bleed), same length or shorter. */
  mix?: Float32Array;
}

export function renderPerformance(tl: Timeline, o: PerformOptions = {}): { samples: Float32Array; lead: number; sampleRate: number } {
  const sr = o.sampleRate ?? 48000;
  const lead = o.lead ?? 0.5;
  const len = Math.ceil((lead + tl.duration + 1) * sr);
  const out = new Float32Array(len);
  const h = o.harmonics ?? STRING_HARMONICS;
  const total = h.reduce((a, b) => a + b, 0);
  const byIndex = new Map((o.mistakes ?? []).map((m) => [m.index, m]));
  let seed = 12345;
  const rand = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) / 4294967296) * 2 - 1; };

  // Actual start of each note (with mistakes). A string player plays one note
  // at a time: a note ends when the next one actually starts (or at its own end).
  const g = o.globalShift ?? 0;
  const starts = tl.notes.map((n) => lead + n.start + g + (byIndex.get(n.index)?.shift ?? 0));
  for (const n of tl.notes) {
    if (n.rest || n.midi == null) continue;
    const mk = byIndex.get(n.index);
    if (mk?.skip) continue;
    const hz = midiToHz(n.midi + (mk?.semitones ?? 0)) * 2 ** ((mk?.cents ?? 0) / 1200);
    const start = starts[n.index];
    const nextStart = n.index + 1 < starts.length ? starts[n.index + 1] : Infinity;
    const end = Math.min(lead + n.end + g, nextStart) - 0.03; // small gap = bow change
    const s0 = Math.max(0, Math.floor(start * sr));
    const s1 = Math.min(len, Math.floor(end * sr));
    let phase = 0;
    for (let i = s0; i < s1; i++) {
      const t = (i - s0) / sr;
      const env = Math.min(1, t / 0.02) * Math.min(1, (s1 - i) / sr / 0.02); // 20 ms attack/release
      const vib = o.vibratoCents ? 2 ** ((o.vibratoCents * Math.sin(2 * Math.PI * 5.5 * t)) / 1200) : 1;
      phase += (2 * Math.PI * hz * vib) / sr;
      let v = 0;
      for (let k = 0; k < h.length; k++) v += h[k] * Math.sin((k + 1) * phase);
      out[i] += (0.3 * env * v) / total;
    }
  }
  if (o.noise) for (let i = 0; i < len; i++) out[i] += o.noise * rand();
  if (o.mix) for (let i = 0; i < Math.min(len, o.mix.length); i++) out[i] += o.mix[i];
  return { samples: out, lead, sampleRate: sr };
}

/** Slide an analysis window over the audio every `hopSec`, like the live session. */
export function framesFromAudio(samples: Float32Array, sampleRate: number, instrument: InstrumentId, lead: number, hopSec = 1 / 30): Frame[] {
  const inst = getInstrument(instrument)!;
  const w = windowSizeFor(inst.minHz, sampleRate);
  const hop = Math.round(hopSec * sampleRate);
  const frames: Frame[] = [];
  for (let end = w; end <= samples.length; end += hop) {
    const r = detectPitch(samples.subarray(end - w, end), { sampleRate, minHz: inst.minHz, maxHz: inst.maxHz });
    // Time-stamp at the window centre, relative to the first downbeat.
    frames.push({ t: (end - w / 2) / sampleRate - lead, hz: r.hz, rms: r.rms });
  }
  return frames;
}

/** Piano-like rendering of backing events (decaying harmonics), for bleed tests. */
/** `cutHz`: drop partials below this frequency, like small laptop/phone speakers that can't play deep notes. */
export function renderBacking(events: { start: number; dur: number; midis: number[] }[], length: number, lead: number, level = 0.15, sampleRate = 48000, cutHz = 0): Float32Array {
  const out = new Float32Array(length);
  const h = [1, 0.5, 0.3, 0.2, 0.12, 0.08];
  for (const e of events) {
    for (const m of e.midis) {
      const hz = midiToHz(m);
      const s0 = Math.floor((lead + e.start) * sampleRate);
      const s1 = Math.min(length, Math.floor((lead + e.start + e.dur) * sampleRate));
      for (let i = s0; i < s1; i++) {
        const t = (i - s0) / sampleRate;
        const env = Math.exp(-t * 2.5) * Math.min(1, t / 0.005) * Math.min(1, (s1 - i) / sampleRate / 0.02);
        let v = 0;
        for (let k = 0; k < h.length; k++) if (hz * (k + 1) >= cutHz) v += h[k] * Math.sin(2 * Math.PI * hz * (k + 1) * t);
        out[i] += (level * env * v) / 2.2;
      }
    }
  }
  return out;
}
