import type { Pos } from './types';

/** Positions on the staff itself: line 1 (0) … line 5 (8). */
export const STAFF_POSITIONS: Pos[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export const isLine = (p: Pos) => p % 2 === 0;
export const lineNumber = (p: Pos) => p / 2 + 1;
export const spaceNumber = (p: Pos) => (p + 1) / 2;
export const linePos = (n: number): Pos => (n - 1) * 2;
export const spacePos = (n: number): Pos => n * 2 - 1;

/** "line 3", "space 2", or a description for positions just outside the staff. */
export function posName(p: Pos): string {
  if (p === -1) return 'the space below the staff';
  if (p === 9) return 'the space above the staff';
  return isLine(p) ? `line ${lineNumber(p)}` : `space ${spaceNumber(p)}`;
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Interval between two positions as a staff movement. */
export function motion(a: Pos, b: Pos): 'repeat' | 'step' | 'skip' | 'leap' {
  const d = Math.abs(b - a);
  return d === 0 ? 'repeat' : d === 1 ? 'step' : d === 2 ? 'skip' : 'leap';
}
