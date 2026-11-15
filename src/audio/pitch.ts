/**
 * Monophonic pitch detection — the McLeod Pitch Method (normalised square
 * difference function + "key maximum" peak picking + parabolic interpolation).
 * It copes well with bowed-string and voice spectra, where upper harmonics
 * can be louder than the fundamental, and gives a clarity score (0–1) we use
 * to ignore noise. Pure and synchronous: runs the same in tests and the browser.
 */
import { fft } from './fft';

export interface PitchOptions {
  sampleRate: number;
  /** Lowest frequency to look for (Hz). */
  minHz: number;
  /** Highest frequency to look for (Hz). */
  maxHz: number;
  /** Below this RMS level the frame counts as silence. */
  silenceRms?: number;
  /** Below this clarity the frame counts as unpitched (noise, bow scratch). */
  minClarity?: number;
  /** Key maxima within this fraction of the highest are candidates (McLeod's k). */
  peakThreshold?: number;
}

export interface PitchResult {
  /** Detected fundamental in Hz, or null when silent / unpitched. */
  hz: number | null;
  /** 0–1: how periodic the frame is. */
  clarity: number;
  /** Root-mean-square level of the frame. */
  rms: number;
}

/** Window length (power of two) that holds at least ~2.5 periods of `minHz`. */
export function windowSizeFor(minHz: number, sampleRate: number): number {
  const want = (sampleRate / minHz) * 2.5;
  let n = 1024;
  while (n < want && n < 16384) n <<= 1;
  return n;
}

// Scratch buffers reused between calls of the same size (no allocation per frame).
const scratch = new Map<number, { re: Float64Array; im: Float64Array; nsdf: Float64Array }>();
function buffers(w: number) {
  let b = scratch.get(w);
  if (!b) {
    b = { re: new Float64Array(w * 2), im: new Float64Array(w * 2), nsdf: new Float64Array(w) };
    scratch.set(w, b);
  }
  return b;
}

export function detectPitch(frame: Float32Array | Float64Array, o: PitchOptions): PitchResult {
  const w = frame.length;
  const silenceRms = o.silenceRms ?? 0.004;
  const minClarity = o.minClarity ?? 0.8;
  const k = o.peakThreshold ?? 0.9;

  let mean = 0;
  for (let i = 0; i < w; i++) mean += frame[i];
  mean /= w;
  let energy = 0;
  for (let i = 0; i < w; i++) { const v = frame[i] - mean; energy += v * v; }
  const rms = Math.sqrt(energy / w);
  if (rms < silenceRms) return { hz: null, clarity: 0, rms };

  // Autocorrelation r(τ) via FFT of the zero-padded, DC-removed frame.
  const { re, im, nsdf } = buffers(w);
  re.fill(0); im.fill(0);
  for (let i = 0; i < w; i++) re[i] = frame[i] - mean;
  fft(re, im);
  for (let i = 0; i < re.length; i++) { re[i] = re[i] * re[i] + im[i] * im[i]; im[i] = 0; }
  fft(re, im, true);
  const scale = 1 / re.length;

  // m(τ) = Σ x_j² + x_{j+τ}², updated incrementally; NSDF n(τ) = 2 r(τ) / m(τ).
  const tauMin = Math.max(2, Math.floor(o.sampleRate / o.maxHz));
  const tauMax = Math.min(w - 2, Math.ceil(o.sampleRate / o.minHz));
  // NSDF is computed a little past tauMax (up to half the window) so short
  // periods can be refined using a later multiple of the period.
  const tauLimit = Math.max(tauMax + 1, Math.min(w - 2, w >> 1));
  let m = 2 * energy;
  nsdf[0] = 1;
  for (let tau = 1; tau <= tauLimit; tau++) {
    const a = frame[tau - 1] - mean;
    const b = frame[w - tau] - mean;
    m -= a * a + b * b;
    nsdf[tau] = m > 1e-12 ? (2 * re[tau] * scale) / m : 0;
  }

  // Key maxima: the highest point of each positive lobe after the first
  // negative-going zero crossing.
  const peaks: number[] = [];
  let tau = 1;
  while (tau <= tauMax && nsdf[tau] > 0) tau++; // skip the τ≈0 lobe
  while (tau <= tauMax) {
    while (tau <= tauMax && nsdf[tau] <= 0) tau++;
    let best = -1;
    while (tau <= tauMax && nsdf[tau] > 0) {
      if (best < 0 || nsdf[tau] > nsdf[best]) best = tau;
      tau++;
    }
    if (best >= tauMin && best > 0 && best < w - 1) peaks.push(best);
  }
  if (!peaks.length) return { hz: null, clarity: 0, rms };

  let highest = 0;
  for (const p of peaks) highest = Math.max(highest, nsdf[p]);
  const chosen = peaks.find((p) => nsdf[p] >= k * highest)!;

  const { pos: period0, val: clarityRaw } = interpolate(nsdf, chosen);
  const clarity = Math.min(1, clarityRaw);
  if (clarity < minClarity) return { hz: null, clarity, rms };

  // Refine short periods: the peak at n × period has the same sub-sample
  // error, so dividing by n shrinks it n times (needed for accurate cents on
  // high violin notes, where one period is only ~20–40 samples).
  let period = period0;
  const maxMult = Math.min(16, Math.floor((tauLimit - 1) / period0));
  for (let mult = maxMult; mult >= 2; mult--) {
    const guess = Math.round(period0 * mult);
    let best = guess;
    for (let t = guess - 2; t <= guess + 2; t++) if (t > 0 && t < tauLimit && nsdf[t] > nsdf[best]) best = t;
    if (best <= 0 || best >= tauLimit || nsdf[best] < 0.85 * clarity) continue;
    const refined = interpolate(nsdf, best).pos / mult;
    if (Math.abs(refined - period0) < 1) { period = refined; break; }
  }
  const hz = o.sampleRate / period;
  if (hz < o.minHz * 0.97 || hz > o.maxHz * 1.03) return { hz: null, clarity, rms };
  return { hz, clarity, rms };
}

/** Parabolic interpolation of a peak at integer index `i`. */
function interpolate(y: Float64Array, i: number): { pos: number; val: number } {
  const y0 = y[i - 1], y1 = y[i], y2 = y[i + 1];
  const denom = y0 - 2 * y1 + y2;
  const shift = denom !== 0 ? Math.max(-1, Math.min(1, (0.5 * (y0 - y2)) / denom)) : 0;
  return { pos: i + shift, val: y1 - 0.25 * (y0 - y2) * shift };
}
