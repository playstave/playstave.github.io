/**
 * "What Stave heard": explains a take in plain words, from the raw frames.
 * Used when many notes are red, so the student (and we) can tell whether the
 * problem is the microphone, the room, the device's audio delay, or the playing.
 *
 * It also finds a consistent device delay: if most notes were the right pitch
 * but all early or late by about the same amount, that is the device, not the
 * player. The take can then be re-scored with that delay corrected.
 */
import { midiName } from '../audio/notes';
import { assessTake, summarise, type AssessOptions, type Frame, type NoteResult, type Summary } from './assess';
import type { Timeline } from './exercise';

export interface Diagnosis {
  /** Share of frames during the piece where any pitch was heard (0–1). */
  heardShare: number;
  /** Typical input level during the piece (RMS). */
  level: number;
  /** The notes heard most often (sounding pitch names). */
  topHeard: string[];
  /** Consistent timing shift of right-pitch notes in seconds (+ = late), or null. */
  delay: number | null;
  /** Plain-language findings, most important first. */
  findings: string[];
}

/**
 * Device delay, measured directly: slide the heard pitches against the written
 * notes and find the shift (−0.2 s … +0.8 s) where they agree best. Works even
 * when the delay is so large that notes look "wrong" rather than "late".
 */
export function estimateDelay(tl: Timeline, frames: Frame[]): number | null {
  const voiced = frames.filter((f) => f.hz != null).map((f) => ({ t: f.t, m: Math.round(69 + 12 * Math.log2(f.hz! / 440)) }));
  if (voiced.length < 10) return null;
  const expectedAt = (t: number) => { const n = tl.notes.find((x) => t >= x.start && t < x.end); return n && !n.rest ? n.midi : null; };
  const scoreAt = (lag: number) => voiced.reduce((acc, f) => acc + (expectedAt(f.t - lag) === f.m ? 1 : 0), 0);
  let best = 0, bestScore = scoreAt(0);
  const zero = bestScore;
  for (let lag = -0.2; lag <= 0.8001; lag += 0.02) {
    const sc = scoreAt(lag);
    if (sc > bestScore) { bestScore = sc; best = lag; }
  }
  // Only a clear, worthwhile improvement counts as a device delay.
  return Math.abs(best) >= 0.08 && bestScore >= 8 && bestScore - zero >= 0.1 * voiced.length ? Math.round(best * 100) / 100 : null;
}

const median = (xs: number[]) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };

export function diagnose(tl: Timeline, frames: Frame[], results: NoteResult[]): Diagnosis {
  const during = frames.filter((f) => f.t >= 0 && f.t <= tl.duration);
  const voiced = during.filter((f) => f.hz != null);
  const heardShare = during.length ? voiced.length / during.length : 0;
  const level = median(during.map((f) => f.rms));
  const counts = new Map<string, number>();
  for (const f of voiced) { const n = midiName(Math.round(69 + 12 * Math.log2(f.hz! / 440))); counts.set(n, (counts.get(n) ?? 0) + 1); }
  const topHeard = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n]) => n);

  // Timing of notes whose pitch was right (late/early/correct carry timingMs).
  const timed = results.filter((r) => r.timingMs != null && (r.verdict === 'correct' || r.verdict === 'late' || r.verdict === 'early')).map((r) => r.timingMs! / 1000);
  let delay: number | null = estimateDelay(tl, frames);
  if (delay == null && timed.length >= 4) {
    const m = median(timed);
    const spread = median(timed.map((t) => Math.abs(t - m)));
    if (Math.abs(m) >= 0.08 && spread <= 0.12) delay = Math.round(m * 100) / 100;
  }

  const sum = summarise(results, tl);
  const findings: string[] = [];
  if (level < 0.003 || heardShare < 0.05) {
    findings.push('Stave heard almost nothing from the microphone. Check that the right microphone is selected (in Chrome: the icon in the address bar → microphone), that it isn’t muted, and play closer to the computer.');
  } else if (heardShare < 0.3) {
    findings.push('The microphone heard sound, but a clear pitch only some of the time. Play a little louder and closer, keep the bow moving through each note, and turn the backing track off to test.');
  }
  if (delay != null) {
    findings.push(`Your notes were the right pitch but consistently ${delay > 0 ? 'late' : 'early'} by about ${Math.round(Math.abs(delay) * 1000)} ms. That is usually the computer’s audio delay, not your playing — Stave corrected for it.`);
  }
  if (sum.counts['wrong-note'] > sum.total * 0.4 && topHeard.length) {
    findings.push(`Stave mostly heard ${topHeard.slice(0, 3).join(', ')}. If that isn’t what you played, try the Tuner first: play an open string and check it shows the right note.`);
  }
  if (sum.counts.flat + sum.counts.sharp > sum.total * 0.4) {
    findings.push('Many notes were the right note but out of tune by more than 20 cents. Tune your strings with the Tuner, then try again.');
  }
  if (sum.counts.late + sum.counts.early > sum.total * 0.4 && delay == null) {
    findings.push('Many notes started off the beat. Listen to the four count-in clicks, start on the next beat, and try the slower speed.');
  }
  return { heardShare, level, topHeard, delay, findings };
}

/**
 * Re-score a take after removing a consistent device delay. Returns the new
 * results only if they are clearly better (so a real timing problem isn't hidden).
 */
export function rescoreWithDelay(tl: Timeline, frames: Frame[], delay: number, o: AssessOptions = {}): { results: NoteResult[]; summary: Summary } | null {
  const shifted = frames.map((f) => ({ ...f, t: f.t - delay }));
  const before = summarise(assessTake(tl, frames, o), tl);
  const results = assessTake(tl, shifted, o);
  const summary = summarise(results, tl);
  return summary.percent > before.percent ? { results, summary } : null;
}

/** A short, private summary of a take that a student can copy and send for help (no audio). */
export function supportReport(tl: Timeline, results: NoteResult[], d: Diagnosis, extra: Record<string, unknown>): string {
  const sum = summarise(results, tl);
  const reds = results.filter((r) => r.verdict !== 'correct' && !tl.notes[r.index].rest).slice(0, 12)
    .map((r) => `${tl.notes[r.index].key} ${r.verdict}${r.heard ? ` heard ${r.heard}` : ''}${r.cents != null ? ` ${r.cents}c` : ''}${r.timingMs != null ? ` ${r.timingMs}ms` : ''}`);
  return [
    `Stave take report`,
    ...Object.entries(extra).map(([k, v]) => `${k}: ${v}`),
    `green ${sum.correct}/${sum.total} (${sum.percent}%) · ${Object.entries(sum.counts).filter(([, n]) => n).map(([k, n]) => `${k} ${n}`).join(', ')}`,
    `heard a clear note ${Math.round(d.heardShare * 100)}% of the time · level ${d.level.toFixed(4)} · most heard ${d.topHeard.join(' ') || 'nothing'} · delay ${d.delay ?? 'none'}`,
    `first red notes: ${reds.join('; ') || 'none'}`,
  ].join('\n');
}
