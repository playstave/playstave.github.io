import { describe, expect, it } from 'vitest';
import { layoutScore, MARGIN_X, SYSTEM_HEIGHT, TOP_MARGIN, HEADER_HEIGHT } from './layout';
import { parseMusic } from './score';
import { SCORES } from '../data/scores';

describe('layout', () => {
  for (const width of [320, 480, 760, 1000]) {
    it(`places every measure exactly once, in order, within the line, at width ${width}`, () => {
      for (const s of SCORES) {
        const ms = parseMusic(s.music);
        const L = layoutScore(ms, s.clef, s.key, width);
        const seq = L.systems.flatMap((sys) => Array.from({ length: sys.last - sys.first + 1 }, (_, k) => sys.first + k));
        expect(seq).toEqual(ms.map((_, i) => i));
        for (const sys of L.systems) expect(sys.widths.reduce((a, b) => a + b, 0)).toBeLessThanOrEqual(width - 2 * MARGIN_X + 1 + (sys.widths.length === 1 ? 400 : 0));
        expect(L.pages.flat()).toEqual(L.systems.map((_, i) => i));
        L.pages.forEach((p, pi) => expect((pi === 0 ? TOP_MARGIN + HEADER_HEIGHT : TOP_MARGIN) + p.length * SYSTEM_HEIGHT).toBeLessThanOrEqual(L.pageHeight - TOP_MARGIN + SYSTEM_HEIGHT * (p.length === 1 ? 1 : 0)));
      }
    });
  }
  it('narrower pages need more lines', () => {
    const s = SCORES.find((x) => x.id === 'minuet-g')!;
    const ms = parseMusic(s.music);
    expect(layoutScore(ms, s.clef, s.key, 340).systems.length).toBeGreaterThan(layoutScore(ms, s.clef, s.key, 900).systems.length);
  });
});
