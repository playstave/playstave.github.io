/**
 * How close is "in tune"? The product owner's decision (2026-11-15): be
 * encouraging, not harsh — a note within ±20 cents counts as in tune by
 * default. Stricter settings are optional for advanced players.
 * Every listening feature (tuner, play tests, play-along) reads from here.
 */
export const DEFAULT_IN_TUNE_CENTS = 20;
export const TOLERANCE_CHOICES = [20, 10, 5] as const;
export type Tolerance = (typeof TOLERANCE_CHOICES)[number];

export type TuneVerdict = 'in-tune' | 'flat' | 'sharp';

export function verdict(cents: number, tolerance: number = DEFAULT_IN_TUNE_CENTS): TuneVerdict {
  if (Math.abs(cents) <= tolerance) return 'in-tune';
  return cents < 0 ? 'flat' : 'sharp';
}
