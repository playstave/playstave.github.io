/**
 * Sounds the app makes during a play-along: metronome clicks and a soft,
 * piano-like backing voice. Synthesised with Web Audio (no samples, no
 * recordings), scheduled on the audio clock so they stay exactly in time.
 */
import { midiToHz } from '../audio/notes';
import type { BackingEvent } from './backing';

export function scheduleClick(ctx: AudioContext, dest: AudioNode, when: number, accent: boolean, volume = 0.5) {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = accent ? 1760 : 1320;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(0.25 * volume, when + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
  osc.connect(g).connect(dest);
  osc.start(when);
  osc.stop(when + 0.06);
}

let pianoWave: { ctx: BaseAudioContext; wave: PeriodicWave } | null = null;
function wave(ctx: BaseAudioContext) {
  if (pianoWave?.ctx === ctx) return pianoWave.wave;
  const h = [0, 1, 0.5, 0.3, 0.2, 0.12, 0.08];
  pianoWave = { ctx, wave: ctx.createPeriodicWave(new Float32Array(h.length), new Float32Array(h)) };
  return pianoWave.wave;
}

/** Schedule backing chords starting at audio time `t0` (seconds). Returns the nodes so they can be stopped. */
export function scheduleBacking(ctx: AudioContext, dest: AudioNode, events: BackingEvent[], t0: number, volume = 0.6): OscillatorNode[] {
  const nodes: OscillatorNode[] = [];
  for (const e of events) {
    const when = t0 + e.start;
    for (const m of e.midis) {
      const osc = ctx.createOscillator();
      osc.setPeriodicWave(wave(ctx));
      osc.frequency.value = midiToHz(m);
      const g = ctx.createGain();
      const peak = (0.12 * volume) / Math.sqrt(e.midis.length);
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(peak, when + 0.008);
      // Piano-like: decays while held, then releases.
      g.gain.setTargetAtTime(peak * 0.35, when + 0.01, Math.min(0.6, e.dur / 2));
      g.gain.setTargetAtTime(0, when + Math.max(0.02, e.dur - 0.05), 0.04);
      osc.connect(g).connect(dest);
      osc.start(when);
      osc.stop(when + e.dur + 0.3);
      nodes.push(osc);
    }
  }
  return nodes;
}
