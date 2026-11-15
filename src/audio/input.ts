/**
 * Live audio input → pitch readings.
 *
 * Privacy: audio is analysed in memory, frame by frame, on this device. It is
 * never recorded, stored or sent anywhere.
 *
 * Browser processing that changes pitch or level (echo cancellation, noise
 * suppression, automatic gain) is switched off, because it can smear or mute
 * a sustained bowed note.
 */
import { detectPitch, windowSizeFor } from './pitch';
import { PitchTracker, type Reading } from './tracker';

export type ListenState = 'idle' | 'starting' | 'listening' | 'denied' | 'unsupported' | 'no-device' | 'error';

export interface ListenFrame {
  /** Steady reading for display (null = nothing to show). */
  reading: Reading | null;
  /** Raw per-frame pitch (null when silent/unpitched) — for scoring later. */
  rawHz: number | null;
  clarity: number;
  /** Input level, 0–1 (RMS). */
  level: number;
  time: number;
}

export interface ListenOptions {
  minHz: number;
  maxHz: number;
  onFrame: (f: ListenFrame) => void;
  /**
   * DEV ONLY: build a synthetic source instead of the microphone (for testing
   * without an instrument). Ignored in production builds.
   */
  devSource?: (ctx: AudioContext) => AudioNode;
}

export function micSupported(): boolean {
  return typeof window !== 'undefined' && !!window.isSecureContext && !!navigator.mediaDevices?.getUserMedia &&
    typeof (window.AudioContext ?? (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext) === 'function';
}

function newContext(): AudioContext {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return new Ctor({ latencyHint: 'interactive' });
}

/** Analyse frames this often (ms). ~30 readings per second. */
const FRAME_MS = 33;

export class Listener {
  state: ListenState = 'idle';
  error = '';
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: AudioNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private paused = false;
  private buf: Float32Array | null = null;
  private tracker = new PitchTracker();
  private range: { minHz: number; maxHz: number };

  constructor(private o: ListenOptions, private onState: (s: ListenState, error: string) => void) {
    this.range = { minHz: o.minHz, maxHz: o.maxHz };
  }

  private set(s: ListenState, error = '') {
    this.state = s;
    this.error = error;
    this.onState(s, error);
  }

  /** Must be called from a user gesture (tap/click) so browsers allow audio. */
  async start(): Promise<void> {
    if (this.state === 'listening' || this.state === 'starting') return;
    const useDev = import.meta.env.DEV && this.o.devSource;
    if (!useDev && !micSupported()) {
      this.set('unsupported', window.isSecureContext === false ? 'insecure' : 'api');
      return;
    }
    this.set('starting');
    try {
      this.ctx = newContext();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      if (import.meta.env.DEV && this.o.devSource) {
        this.source = this.o.devSource(this.ctx);
      } else {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
        });
        this.source = this.ctx.createMediaStreamSource(this.stream);
      }
      this.analyser = this.ctx.createAnalyser();
      this.setupAnalyser();
      this.source.connect(this.analyser);
      this.tracker.reset();
      this.set('listening');
      // A timer, not requestAnimationFrame: analysis must keep its pace even when
      // the browser skips painting (the mic is released when the page is hidden).
      this.timer = setInterval(this.tick, FRAME_MS);
    } catch (e) {
      const name = (e as DOMException)?.name;
      this.teardown();
      if (name === 'NotAllowedError' || name === 'SecurityError') this.set('denied');
      else if (name === 'NotFoundError' || name === 'OverconstrainedError') this.set('no-device');
      else this.set('error', (e as Error)?.message ?? String(e));
    }
  }

  private setupAnalyser() {
    if (!this.analyser || !this.ctx) return;
    const size = Math.min(32768, windowSizeFor(this.range.minHz, this.ctx.sampleRate));
    this.analyser.fftSize = size;
    this.buf = new Float32Array(size);
  }

  /** Change the detection range (e.g. switching instrument) without restarting the mic. */
  setRange(minHz: number, maxHz: number) {
    this.range = { minHz, maxHz };
    this.tracker.reset();
    this.setupAnalyser();
  }

  /** Temporarily ignore input (e.g. while the app itself plays a reference tone). */
  setPaused(p: boolean) {
    this.paused = p;
    if (p) this.tracker.reset();
  }

  private tick = () => {
    if (!this.analyser || !this.buf || !this.ctx) return;
    const now = performance.now();
    this.analyser.getFloatTimeDomainData(this.buf);
    if (this.paused) { this.o.onFrame({ reading: null, rawHz: null, clarity: 0, level: 0, time: now }); return; }
    const r = detectPitch(this.buf, { sampleRate: this.ctx.sampleRate, minHz: this.range.minHz, maxHz: this.range.maxHz });
    const reading = this.tracker.push(r.hz, r.clarity, now);
    this.o.onFrame({ reading, rawHz: r.hz, clarity: r.clarity, level: r.rms, time: now });
  };

  private teardown() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    try { this.source?.disconnect(); } catch { /* already gone */ }
    this.ctx?.close().catch(() => {});
    this.stream = null; this.source = null; this.analyser = null; this.ctx = null; this.buf = null;
  }

  stop() {
    this.teardown();
    if (this.state !== 'idle') this.set('idle');
  }
}

/**
 * Play a reference pitch through the speakers (a soft, string-like tone with
 * a gentle fade in and out). Returns a promise that resolves when it ends.
 */
export async function playReferenceTone(hz: number, seconds = 2): Promise<void> {
  if (typeof window === 'undefined') return;
  const ctx = newContext();
  if (ctx.state === 'suspended') await ctx.resume();
  const harmonics = [0, 1, 0.5, 0.3, 0.18, 0.1, 0.06];
  const wave = ctx.createPeriodicWave(new Float32Array(harmonics.length), new Float32Array(harmonics));
  const osc = ctx.createOscillator();
  osc.setPeriodicWave(wave);
  osc.frequency.value = hz;
  const gain = ctx.createGain();
  const t = ctx.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
  gain.gain.setValueAtTime(0.18, t + seconds - 0.3);
  gain.gain.linearRampToValueAtTime(0, t + seconds);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + seconds + 0.05);
  await new Promise<void>((res) => { osc.onended = () => res(); });
  await ctx.close().catch(() => {});
}
