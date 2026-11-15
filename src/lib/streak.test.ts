import { describe, expect, it } from 'vitest';
import { streakInfo } from './streak';

const today = new Date(2026, 10, 14); // 14 Nov 2026
const d = (day: number, month = 11) => `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

describe('streaks', () => {
  it('starts at zero', () => {
    expect(streakInfo([], today)).toEqual({ current: 0, best: 0, practicedToday: false, restDayUsed: false });
  });
  it('counts consecutive days including today', () => {
    expect(streakInfo([d(12), d(13), d(14)], today)).toMatchObject({ current: 3, best: 3, practicedToday: true });
  });
  it('today not yet practised does not break a streak', () => {
    expect(streakInfo([d(12), d(13)], today)).toMatchObject({ current: 2, practicedToday: false, restDayUsed: false });
  });
  it('one rest day is forgiven', () => {
    expect(streakInfo([d(10), d(11), d(13), d(14)], today).current).toBe(4);
  });
  it('a rest day yesterday keeps the streak alive but flags it', () => {
    expect(streakInfo([d(11), d(12)], today)).toMatchObject({ current: 2, restDayUsed: true });
  });
  it('two missed days in a row end the run, but best is kept', () => {
    const s = streakInfo([d(1), d(2), d(3), d(4), d(5), d(9), d(14)], today);
    expect(s.current).toBe(1);
    expect(s.best).toBe(5);
  });
  it('two missed days before today (no practice today) means no current streak', () => {
    expect(streakInfo([d(10), d(11)], today)).toMatchObject({ current: 0, best: 2, restDayUsed: false });
  });
  it('crosses month boundaries', () => {
    expect(streakInfo([d(30, 10), d(31, 10), d(1), d(2)], new Date(2026, 10, 2)).current).toBe(4);
  });
  it('ignores future-dated entries for best', () => {
    expect(streakInfo([d(20), d(21), d(22)], today).best).toBe(0);
  });
});
