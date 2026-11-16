import { describe, expect, it } from 'vitest';
import { SONGS } from './songs';
import { arrange, beatsOf, parseDegrees, type SongKey } from './arrange';
import { buildTimeline } from '../play/exercise';
import { INSTRUMENTS } from '../audio/notes';

const barBeats = (time: string) => (time === '6/8' ? 3 : Number(time.split('/')[0]) * (4 / Number(time.split('/')[1])));

describe('song library', () => {
  for (const s of SONGS) {
    it(`${s.title}: every bar has the right number of beats, and it has a source`, () => {
      const bars = parseDegrees(s.music);
      bars.forEach((b, i) => expect(b.reduce((t, n) => t + beatsOf(n.dur), 0), `${s.id} bar ${i + 1}`).toBeCloseTo(barBeats(s.time)));
      expect(s.source.length).toBeGreaterThan(10);
      expect(bars.length).toBeGreaterThanOrEqual(4);
    });
  }
  it('spells notes correctly for the key', () => {
    const tw = SONGS.find((s) => s.id === 'twinkle')!;
    const f = arrange(tw, 'F', 'violin')!.music;
    expect(f).toContain('bb/'); // B♭ in F major, never A♯
    expect(f).not.toContain('a#');
    const a = arrange(SONGS.find((s) => s.id === 'mary')!, 'A', 'violin')!.music;
    expect(a).toMatch(/c#\//);
    const gs = arrange(SONGS.find((s) => s.id === 'greensleeves')!, 'Am', 'violin')!.music;
    expect(gs).toMatch(/g#\//); // raised leading note in A minor
  });
  it('arranges every major song in D for every instrument in first position', () => {
    for (const s of SONGS.filter((x) => x.mode === 'major' && !['canon', 'spring', 'canon-bass'].includes(x.id))) {
      for (const inst of INSTRUMENTS) {
        const r = arrange(s, 'D', inst.id, { maxPos: inst.id === 'bass' ? 3 : 0 });
        expect(r, `${s.id} on ${inst.id}`).not.toBeNull();
        expect(() => buildTimeline({ id: 'x', title: 'x', instrument: inst.id, clef: inst.clef, key: r!.key, time: r!.time, tempo: 80, music: r!.music })).not.toThrow();
      }
    }
  });
  it('variations keep every bar the right length', () => {
    const vs = ['eighths', 'sixteenths', 'dotted', 'sync', 'neighbor', 'passing', 'twice', 'slurs', 'staccato', 'dynamics', 'rit'] as const;
    for (const s of SONGS) for (const v of vs) {
      const key: SongKey = s.mode === 'minor' ? 'Am' : 'G';
      const r = arrange(s, key, 'violin', { variations: [v], maxPos: 6 });
      if (!r) continue;
      expect(() => buildTimeline({ id: 'x', title: 'x', instrument: 'violin', clef: 'treble', key: r.key, time: r.time, tempo: 80, music: r.music, barTempo: r.barTempo })).not.toThrow();
    }
  });
});
