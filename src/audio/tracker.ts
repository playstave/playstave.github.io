/**
 * Turns a stream of per-frame pitch results into a steady reading for display.
 * - A note is shown only after a few consecutive frames agree (no flicker from
 *   bow noise or the attack of a note).
 * - The shown frequency is a trimmed mean of recent frames, in cents (vibrato
 *   averages out to its centre, which is how players and teachers judge intonation).
 * - After a short silence the reading clears.
 */
import { hzToMidi } from './notes';

export interface TrackerOptions {
  /** Frames that must agree (within `agreeCents`) before a reading appears. */
  confirmFrames?: number;
  agreeCents?: number;
  /** How many recent frames feed the average (~one vibrato cycle). */
  medianFrames?: number;
  /** Clear the reading after this long without a pitch (ms). */
  holdMs?: number;
}

export interface Reading { hz: number; clarity: number }

export class PitchTracker {
  private recent: Reading[] = [];
  private lastPitchAt = -Infinity;
  private shown: Reading | null = null;
  private readonly o: Required<TrackerOptions>;

  constructor(o: TrackerOptions = {}) {
    this.o = { confirmFrames: 3, agreeCents: 60, medianFrames: 7, holdMs: 350, ...o };
  }

  reset() { this.recent = []; this.shown = null; this.lastPitchAt = -Infinity; }

  /** Feed one frame's result (`hz` null when silent/unpitched) at time `now` (ms). Returns the reading to show. */
  push(hz: number | null, clarity: number, now: number): Reading | null {
    if (hz == null) {
      if (now - this.lastPitchAt > this.o.holdMs) { this.recent = []; this.shown = null; }
      return this.shown;
    }
    this.lastPitchAt = now;
    const last = this.recent[this.recent.length - 1];
    // A jump of more than `agreeCents` starts a new note.
    if (last && Math.abs(hzToMidi(hz) - hzToMidi(last.hz)) * 100 > this.o.agreeCents) this.recent = [];
    this.recent.push({ hz, clarity });
    if (this.recent.length > this.o.medianFrames) this.recent.shift();
    // Until a new note is confirmed, keep showing the last steady one (a one-frame glitch changes nothing).
    if (this.recent.length < this.o.confirmFrames) return this.shown;
    // Trimmed mean in the log (cents) domain: drops the extremes, then averages,
    // which finds the centre of vibrato better than a median over part of a cycle.
    const logs = this.recent.map((r) => Math.log2(r.hz)).sort((a, b) => a - b);
    const trimmed = logs.length >= 5 ? logs.slice(1, -1) : logs;
    const centre = 2 ** (trimmed.reduce((t, v) => t + v, 0) / trimmed.length);
    const clar = this.recent.reduce((t, r) => t + r.clarity, 0) / this.recent.length;
    this.shown = { hz: centre, clarity: clar };
    return this.shown;
  }
}
