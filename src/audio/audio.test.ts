import { describe, expect, it } from 'vitest';
import { detectPitch, windowSizeFor } from './pitch';
import { centsFrom, getInstrument, hzToMidi, INSTRUMENTS, midiName, midiToHz, nearestString, readNote } from './notes';
import { PitchTracker } from './tracker';
import { STRING_HARMONICS, synth, VOICE_HARMONICS, WEAK_FUNDAMENTAL } from './synth';
import { fft } from './fft';

const SR = 48000;

function detect(hz: number, inst = INSTRUMENTS[0], extra: Partial<Parameters<typeof synth>[0]> = {}) {
  const w = windowSizeFor(inst.minHz, SR);
  const frame = synth({ hz, length: w, harmonics: STRING_HARMONICS, ...extra });
  return detectPitch(frame, { sampleRate: SR, minHz: inst.minHz, maxHz: inst.maxHz });
}

describe('fft', () => {
  it('round-trips a signal', () => {
    const re = new Float64Array([1, 2, 3, 4, 0, -1, 5, 2]);
    const orig = Array.from(re);
    const im = new Float64Array(8);
    fft(re, im); fft(re, im, true);
    re.forEach((v, i) => expect(v / 8).toBeCloseTo(orig[i], 9));
  });
  it('rejects non power-of-two sizes', () => {
    expect(() => fft(new Float64Array(6), new Float64Array(6))).toThrow();
  });
});

describe('note maths', () => {
  it('maps A4 and middle C', () => {
    expect(hzToMidi(440)).toBe(69);
    expect(midiName(60)).toBe('C4');
    expect(midiToHz(69, 442)).toBe(442);
    expect(readNote(261.6256).name).toBe('C4');
  });
  it('measures cents sharp and flat', () => {
    expect(readNote(440 * 2 ** (10 / 1200)).cents).toBeCloseTo(10, 6);
    expect(readNote(440 * 2 ** (-30 / 1200)).cents).toBeCloseTo(-30, 6);
    expect(centsFrom(440, 69, 442)).toBeCloseTo(-7.85, 1);
  });
  it('defines standard tunings for all four instruments', () => {
    const names = (id: string) => getInstrument(id)!.strings.map((s) => midiName(s.midi)).join(' ');
    expect(names('violin')).toBe('G3 D4 A4 E5');
    expect(names('viola')).toBe('C3 G3 D4 A4');
    expect(names('cello')).toBe('C2 G2 D3 A3');
    expect(names('bass')).toBe('E1 A1 D2 G2');
  });
  it('finds the nearest open string', () => {
    expect(nearestString(getInstrument('violin')!, 445).name).toBe('A');
    expect(nearestString(getInstrument('bass')!, 40).name).toBe('E');
  });
});

describe('pitch detection — open strings of every instrument', () => {
  for (const inst of INSTRUMENTS) {
    for (const s of inst.strings) {
      it(`${inst.name} ${s.name} string (${midiToHz(s.midi).toFixed(1)} Hz) within 2 cents`, () => {
        const target = midiToHz(s.midi);
        const r = detect(target, inst);
        expect(r.hz).not.toBeNull();
        expect(Math.abs(centsFrom(r.hz!, s.midi))).toBeLessThan(2);
        expect(r.clarity).toBeGreaterThan(0.9);
      });
    }
  }
});

describe('pitch detection — hard cases', () => {
  it('measures a slightly sharp note accurately (A at 445 Hz)', () => {
    const r = detect(445);
    expect(Math.abs(centsFrom(r.hz!, 69) - 1200 * Math.log2(445 / 440))).toBeLessThan(1.5);
  });
  it('is not fooled into the octave above by a weak fundamental (cello C, bass E)', () => {
    for (const id of ['cello', 'bass'] as const) {
      const inst = getInstrument(id)!;
      const midi = inst.strings[0].midi;
      const r = detect(midiToHz(midi), inst, { harmonics: WEAK_FUNDAMENTAL });
      expect(r.hz).not.toBeNull();
      expect(Math.abs(centsFrom(r.hz!, midi))).toBeLessThan(5);
    }
  });
  it('follows high violin notes (E6, A7 range top)', () => {
    for (const midi of [88, 93, 100]) {
      const r = detect(midiToHz(midi), INSTRUMENTS[0]);
      expect(Math.abs(centsFrom(r.hz!, midi))).toBeLessThan(3);
    }
  });
  it('tracks every chromatic note across the violin range without octave errors', () => {
    for (let midi = 55; midi <= 96; midi++) {
      const r = detect(midiToHz(midi), INSTRUMENTS[0]);
      expect(r.hz, midiName(midi)).not.toBeNull();
      expect(Math.abs(centsFrom(r.hz!, midi)), midiName(midi)).toBeLessThan(5);
    }
  });
  it('tracks every chromatic note across the double bass range', () => {
    const bass = getInstrument('bass')!;
    for (let midi = 28; midi <= 67; midi++) {
      const r = detect(midiToHz(midi), bass);
      expect(r.hz, midiName(midi)).not.toBeNull();
      expect(Math.abs(centsFrom(r.hz!, midi)), midiName(midi)).toBeLessThan(5);
    }
  });
  it('handles a voice-like sound', () => {
    const r = detect(midiToHz(64), INSTRUMENTS[1], { harmonics: VOICE_HARMONICS });
    expect(Math.abs(centsFrom(r.hz!, 64))).toBeLessThan(3);
  });
  it('still finds the pitch with background noise', () => {
    const r = detect(midiToHz(62), INSTRUMENTS[0], { noise: 0.03 });
    expect(r.hz).not.toBeNull();
    expect(Math.abs(centsFrom(r.hz!, 62))).toBeLessThan(5);
  });
  it('reports silence as no pitch', () => {
    const r = detectPitch(new Float32Array(2048), { sampleRate: SR, minHz: 170, maxHz: 3600 });
    expect(r.hz).toBeNull();
  });
  it('reports pure noise as no pitch', () => {
    let pitched = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const frame = synth({ hz: 1, length: 2048, harmonics: [0], noise: 0.2, seed });
      if (detectPitch(frame, { sampleRate: SR, minHz: 170, maxHz: 3600 }).hz != null) pitched++;
    }
    expect(pitched).toBeLessThanOrEqual(1);
  });
  it('reads the centre of a note played with vibrato (median over frames)', () => {
    const tracker = new PitchTracker();
    const w = 2048;
    let reading = null;
    for (let f = 0; f < 15; f++) {
      const frame = synth({ hz: 440, length: w, harmonics: STRING_HARMONICS, vibratoCents: 25, vibratoHz: 6, offset: f * 1600 });
      const r = detectPitch(frame, { sampleRate: SR, minHz: 170, maxHz: 3600 });
      reading = tracker.push(r.hz, r.clarity, f * 33);
    }
    expect(reading).not.toBeNull();
    expect(Math.abs(centsFrom(reading!.hz, 69))).toBeLessThan(10);
  });
  it('is fast enough for real time (bass window, many frames)', () => {
    const bass = getInstrument('bass')!;
    const w = windowSizeFor(bass.minHz, SR);
    const frame = synth({ hz: 55, length: w, harmonics: STRING_HARMONICS });
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) detectPitch(frame, { sampleRate: SR, minHz: bass.minHz, maxHz: bass.maxHz });
    const per = (performance.now() - t0) / 50;
    expect(per).toBeLessThan(8);
  });
});

describe('window sizing', () => {
  it('gives low instruments longer windows', () => {
    expect(windowSizeFor(170, SR)).toBe(1024);
    expect(windowSizeFor(36, SR)).toBe(4096);
  });
});

describe('PitchTracker', () => {
  it('waits for agreement before showing a note, then clears after silence', () => {
    const t = new PitchTracker({ confirmFrames: 3, holdMs: 300 });
    expect(t.push(440, 0.95, 0)).toBeNull();
    expect(t.push(441, 0.95, 30)).toBeNull();
    expect(t.push(440, 0.95, 60)?.hz).toBeCloseTo(440, 0);
    expect(t.push(null, 0, 200)).not.toBeNull(); // brief gap holds
    expect(t.push(null, 0, 500)).toBeNull(); // long gap clears
  });
  it('ignores a one-frame glitch to another note', () => {
    const t = new PitchTracker();
    [440, 440, 440, 440].forEach((hz, i) => t.push(hz, 0.95, i * 30));
    const r = t.push(880, 0.9, 150);
    expect(r?.hz).toBeCloseTo(440, 0);
  });
});
