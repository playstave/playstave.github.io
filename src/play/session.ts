/**
 * One play-along take: count-in, metronome, backing track, listening and
 * live note-by-note marking, all on the AudioContext clock.
 *
 * Privacy: audio is analysed in memory and discarded; nothing is recorded or sent.
 */
import { detectPitch, windowSizeFor } from '../audio/pitch';
import { getInstrument } from '../audio/notes';
import { newContext, openMic, stateForError, type ListenState } from '../audio/input';
import { assessNote, judgeableAt, summarise, type AssessOptions, type Frame, type NoteResult, type Summary } from './assess';
import { backingEvents } from './backing';
import { buildTimeline, type PlayExercise, type Timeline } from './exercise';
import { scheduleBacking, scheduleClick } from './sound';

export type Phase = 'idle' | 'starting' | 'count-in' | 'playing' | 'finished' | 'stopped';

export interface SessionOptions {
  metronome: boolean;
  backing: boolean;
  backingVolume?: number;
  assess?: AssessOptions;
  /** Extra latency correction in seconds (from calibration); added to the automatic estimate. */
  latencyOffset?: number;
  /** DEV ONLY: replace the microphone with a synthetic performer. */
  devPerformer?: (ctx: AudioContext, timeline: Timeline, t0: number) => AudioNode;
  /** DEV ONLY: also feed the backing track into the analyser (simulates speakers without headphones). */
  devBleed?: boolean;
}

export interface SessionCallbacks {
  onPhase: (p: Phase) => void;
  onMicState: (s: ListenState) => void;
  onResult: (r: NoteResult) => void;
  onFinish: (summary: Summary, results: NoteResult[], frames: Frame[]) => void;
  /** Every analysis frame, for a live "what Stave hears" display. */
  onHear?: (hz: number | null, rms: number) => void;
}

const FRAME_MS = 33;
const LEAD = 0.25; // seconds between pressing Play and the first count-in click

export class PlaySession {
  readonly timeline: Timeline;
  phase: Phase = 'idle';
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: AudioNode | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Float32Array | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private scheduled: OscillatorNode[] = [];
  private t0 = 0;
  private latency = 0;
  private frames: Frame[] = [];
  private results = new Map<number, NoteResult>();
  private next = 0;

  constructor(private ex: PlayExercise, private o: SessionOptions, private cb: SessionCallbacks) {
    this.timeline = buildTimeline(ex);
  }

  private setPhase(p: Phase) { this.phase = p; this.cb.onPhase(p); }

  /** Seconds from the first downbeat (negative during the count-in). */
  position(): number {
    return this.ctx ? this.ctx.currentTime - this.t0 : -Infinity;
  }

  /** Count-in length in seconds: one full measure. */
  get countIn() { return this.timeline.measureSec; }

  /** Must be called from a tap/click. */
  async start() {
    if (this.phase === 'starting' || this.phase === 'count-in' || this.phase === 'playing') return;
    this.setPhase('starting');
    this.frames = []; this.results.clear(); this.next = 0;
    try {
      const ctx = newContext();
      this.ctx = ctx;
      if (ctx.state === 'suspended') await ctx.resume();
      const t0 = ctx.currentTime + LEAD + this.countIn;
      this.t0 = t0;
      const dev = import.meta.env.DEV ? this.o.devPerformer : undefined;
      if (dev) {
        this.source = dev(ctx, this.timeline, t0);
      } else {
        const mic = await openMic(ctx);
        this.stream = mic.stream; this.source = mic.source;
        // Re-anchor: asking for the mic can take a moment (permission prompt).
        this.t0 = ctx.currentTime + LEAD + this.countIn;
      }
      this.cb.onMicState('listening');
      const inst = getInstrument(this.ex.instrument)!;
      const size = Math.min(32768, windowSizeFor(inst.minHz, ctx.sampleRate));
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = size;
      this.buf = new Float32Array(size);
      this.source.connect(this.analyser);

      // Latency: the student hears the click `outputLatency` late, and their
      // sound reaches us after the input latency; analysis frames are
      // stamped at the window centre. (Unknown input latency: assume 20 ms.)
      const out = (ctx as AudioContext & { outputLatency?: number }).outputLatency ?? ctx.baseLatency ?? 0;
      this.latency = (dev ? 0 : out + (ctx.baseLatency ?? 0) + 0.02) + (this.o.latencyOffset ?? 0);

      this.schedule(ctx);
      this.setPhase('count-in');
      this.timer = setInterval(this.tick, FRAME_MS);
    } catch (e) {
      this.teardown();
      this.cb.onMicState(stateForError(e));
      this.setPhase('idle');
    }
  }

  private schedule(ctx: AudioContext) {
    const tl = this.timeline;
    const [num, den] = this.ex.time.split('/').map(Number);
    const clickEvery = (4 / den) * tl.beat; // one click per written beat
    const dest = ctx.destination;
    // Count-in: always clicks, one measure, first beat accented.
    for (let k = 0; k < num; k++) scheduleClick(ctx, dest, this.t0 - this.countIn + k * clickEvery, k === 0, 0.8);
    if (this.o.metronome) {
      // One click per beat, following any ritardando / accelerando bar by bar.
      tl.measureStarts.forEach((ms, i) => {
        const every = (4 / den) * tl.measureBeat[i];
        for (let k = 0; k < num; k++) scheduleClick(ctx, dest, this.t0 + ms + k * every, k === 0, 0.45);
      });
    }
    if (this.o.backing && this.ex.backing) {
      const bus = ctx.createGain();
      bus.connect(dest);
      if (import.meta.env.DEV && this.o.devBleed && this.analyser) bus.connect(this.analyser);
      this.scheduled = scheduleBacking(ctx, bus, backingEvents(this.ex.backing, tl), this.t0, this.o.backingVolume ?? 0.6);
    }
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx || !this.analyser || !this.buf) return;
    const pos = ctx.currentTime - this.t0;
    if (this.phase === 'count-in' && pos >= -0.05) this.setPhase('playing');
    this.analyser.getFloatTimeDomainData(this.buf);
    const inst = getInstrument(this.ex.instrument)!;
    const r = detectPitch(this.buf, { sampleRate: ctx.sampleRate, minHz: inst.minHz, maxHz: inst.maxHz });
    const t = pos - this.buf.length / 2 / ctx.sampleRate - this.latency;
    this.frames.push({ t, hz: r.hz, rms: r.rms });
    this.cb.onHear?.(r.hz, r.rms);

    // Judge every note whose time is fully past.
    const notes = this.timeline.notes;
    while (this.next < notes.length && judgeableAt(notes[this.next], this.timeline.beat, this.o.assess) <= t) {
      const n = notes[this.next];
      const res = assessNote(n, this.frames, this.timeline.beat, this.o.assess, notes[this.next - 1], notes[this.next + 1]);
      this.results.set(n.index, res);
      if (!n.rest) this.cb.onResult(res);
      this.next++;
    }
    // Keep listening a little after the last note, so a device delay can still be measured and corrected.
    if (this.next >= notes.length && t >= this.timeline.duration + 0.9) this.finish();
  };

  private finish() {
    const results = this.timeline.notes.map((n) => this.results.get(n.index)!).filter(Boolean);
    this.teardown();
    this.setPhase('finished');
    this.cb.onFinish(summarise(results, this.timeline), results, this.frames);
  }

  private teardown() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.scheduled.forEach((o) => { try { o.stop(); } catch { /* not started */ } });
    this.scheduled = [];
    this.stream?.getTracks().forEach((t) => t.stop());
    try { this.source?.disconnect(); } catch { /* gone */ }
    this.ctx?.close().catch(() => {});
    this.ctx = null; this.stream = null; this.source = null; this.analyser = null; this.buf = null;
  }

  /** Abort the take (no score). */
  stop() {
    if (this.phase === 'idle' || this.phase === 'finished' || this.phase === 'stopped') return;
    this.teardown();
    this.setPhase('stopped');
  }
}
