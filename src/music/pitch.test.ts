import { describe, expect, it } from 'vitest';
import { INTERVALS, midi, parsePitch, transposeKey, transposeKeySig, isValidKey } from './pitch';

describe('pitch', () => {
  it('parses and measures pitches', () => {
    expect(midi(parsePitch('c/4'))).toBe(60);
    expect(midi(parsePitch('a/4'))).toBe(69);
    expect(midi(parsePitch('f#/4'))).toBe(66);
    expect(midi(parsePitch('bb/3'))).toBe(58);
    expect(() => parsePitch('h/4')).toThrow();
  });
  it('transposes with correct spelling', () => {
    expect(transposeKey('c/4', INTERVALS.majorSecondUp)).toBe('d/4');
    expect(transposeKey('bb/4', INTERVALS.majorSecondUp)).toBe('c/5');
    expect(transposeKey('f#/4', INTERVALS.majorSecondUp)).toBe('g#/4');
    expect(transposeKey('e/4', INTERVALS.majorSecondUp)).toBe('f#/4');
    expect(transposeKey('d/5', INTERVALS.majorSixthUp)).toBe('b/5');
    expect(transposeKey('g#/4', INTERVALS.majorSixthUp)).toBe('e#/5');
    expect(transposeKey('c/4', INTERVALS.minorThirdDown)).toBe('a/3');
    expect(transposeKey('b/3', INTERVALS.majorSecondUp)).toBe('c#/4');
    expect(transposeKey('g/4', INTERVALS.octaveDown)).toBe('g/3');
  });
  it('transposes key signatures to standard keys', () => {
    expect(transposeKeySig('C', INTERVALS.majorSecondUp)).toBe('D');
    expect(transposeKeySig('F', INTERVALS.majorSecondUp)).toBe('G');
    expect(transposeKeySig('Am', INTERVALS.majorSecondUp)).toBe('Bm');
    expect(transposeKeySig('G', INTERVALS.majorSixthUp)).toBe('E');
    expect(transposeKeySig('Am', INTERVALS.majorSixthUp)).toBe('F#m');
    expect(transposeKeySig('Dm', INTERVALS.majorSixthUp)).toBe('Bm');
    expect(isValidKey('G#')).toBe(false);
    expect(() => transposeKeySig('F#', INTERVALS.majorSecondUp)).toThrow();
  });
});
