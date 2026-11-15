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
