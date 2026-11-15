/**
 * DEV ONLY — a synthetic "instrument" for testing listening features without
 * a microphone. Enable in the browser console with:
 *   localStorage.setItem('stave:dev-test-tone', '1'); location.reload();
 * Production code never imports this module unless import.meta.env.DEV.
 */
import { STRING_HARMONICS, WEAK_FUNDAMENTAL } from './synth';

export interface DevToneSettings {
  hz: number;
  timbre: 'string' | 'weak' | 'sine';
  vibratoCents: number;
  noise: number;
  on: boolean;
}

export const devToneSettings: DevToneSettings = { hz: 440, timbre: 'string', vibratoCents: 0, noise: 0, on: true };

export function devToneEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  try { return localStorage.getItem('stave:dev-test-tone') === '1'; } catch { return false; }
}

let live: { ctx: AudioContext; osc: OscillatorNode; lfoGain: GainNode; noiseGain: GainNode; out: GainNode } | null = null;

function applyTimbre(ctx: AudioContext, osc: OscillatorNode, timbre: DevToneSettings['timbre']) {
  const h = timbre === 'sine' ? [1] : timbre === 'weak' ? WEAK_FUNDAMENTAL : STRING_HARMONICS;
  const imag = new Float32Array([0, ...h]);
  osc.setPeriodicWave(ctx.createPeriodicWave(new Float32Array(imag.length), imag));
}

/** Build the synthetic source graph; the Listener connects its output to the analyser. */
export function createDevSource(ctx: AudioContext): AudioNode {
  const osc = ctx.createOscillator();
  applyTimbre(ctx, osc, devToneSettings.timbre);
  osc.frequency.value = devToneSettings.hz;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 5.5;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = devToneSettings.vibratoCents;
  lfo.connect(lfoGain).connect(osc.detune);
  const len = ctx.sampleRate * 2;
  const noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf; noise.loop = true;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = devToneSettings.noise;
  const out = ctx.createGain();
  out.gain.value = devToneSettings.on ? 0.3 : 0;
  osc.connect(out); noise.connect(noiseGain).connect(out);
  osc.start(); lfo.start(); noise.start();
  live = { ctx, osc, lfoGain, noiseGain, out };
  return out;
}

/** Change the running test tone. */
export function updateDevTone(patch: Partial<DevToneSettings>) {
  Object.assign(devToneSettings, patch);
  if (!live) return;
  const { ctx, osc, lfoGain, noiseGain, out } = live;
  const t = ctx.currentTime;
  osc.frequency.setValueAtTime(devToneSettings.hz, t);
  lfoGain.gain.setValueAtTime(devToneSettings.vibratoCents, t);
  noiseGain.gain.setValueAtTime(devToneSettings.noise, t);
  out.gain.setValueAtTime(devToneSettings.on ? 0.3 : 0, t);
  if (patch.timbre) applyTimbre(ctx, osc, devToneSettings.timbre);
}

/* ---------- DEV ONLY: synthetic performer for play-along testing ---------- */
import type { Timeline } from '../play/exercise';
import { midiToHz } from './notes';

export type DevPerformance = 'perfect' | 'mistakes' | 'silent' | 'delayed';
export const devPerformerSettings: { mode: DevPerformance; bleed: boolean } = { mode: 'perfect', bleed: false };

/**
 * Which notes the "mistakes" performance gets wrong, by position among the
 * playable notes: 2nd = wrong note (+1 semitone), 4th = 35 cents flat,
 * 6th = 0.35 s late, 8th = skipped.
 */
export function devMistakePlan(tl: Timeline) {
  const playable = tl.notes.filter((n) => !n.rest).map((n) => n.index);
  const at = (k: number) => playable[k];
  return { wrong: at(1), flat: at(3), late: at(5), skip: at(7) };
}

export function createDevPerformer(ctx: AudioContext, tl: Timeline, t0: number): AudioNode {
  const out = ctx.createGain();
  if (devPerformerSettings.mode === 'silent') return out;
  const osc = ctx.createOscillator();
  const imag = new Float32Array([0, ...STRING_HARMONICS]);
  osc.setPeriodicWave(ctx.createPeriodicWave(new Float32Array(imag.length), imag));
  const g = ctx.createGain();
  g.gain.value = 0;
  osc.connect(g).connect(out);
  const plan = devPerformerSettings.mode === 'mistakes' ? devMistakePlan(tl) : null;
  // 'delayed': every note 350 ms late, like a computer with a large audio delay.
  const global = devPerformerSettings.mode === 'delayed' ? 0.35 : 0;
  const starts = tl.notes.map((n) => t0 + global + n.start + (plan && n.index === plan.late ? 0.35 : 0));
  for (const n of tl.notes) {
    if (n.rest || n.midi == null || (plan && n.index === plan.skip)) continue;
    let m = n.midi;
    if (plan && n.index === plan.wrong) m += 1;
    let hz = midiToHz(m);
    if (plan && n.index === plan.flat) hz *= 2 ** (-35 / 1200);
    const s = starts[n.index];
    const e = Math.min(t0 + global + n.end, n.index + 1 < starts.length ? starts[n.index + 1] : Infinity) - 0.03;
    osc.frequency.setValueAtTime(hz, s);
    g.gain.setValueAtTime(0, s);
    g.gain.linearRampToValueAtTime(0.3, s + 0.02);
    g.gain.setValueAtTime(0.3, Math.max(s + 0.02, e - 0.02));
    g.gain.linearRampToValueAtTime(0, e);
  }
  osc.start();
  osc.stop(t0 + tl.duration + 1 + global);
  return out;
}
