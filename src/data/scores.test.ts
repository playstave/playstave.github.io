import { describe, expect, it } from 'vitest';
import { SCORES } from './scores';
import { instrumentsFor, parseMusic, partsFor, validateScore, canDownload } from '../music/score';

describe('catalogue', () => {
  it('has at least 25 scores with unique ids and titles', () => {
    expect(SCORES.length).toBeGreaterThanOrEqual(25);
    expect(new Set(SCORES.map((s) => s.id)).size).toBe(SCORES.length);
    expect(new Set(SCORES.map((s) => s.title)).size).toBe(SCORES.length);
  });

  it.each(SCORES.map((s) => [s.id, s] as const))('%s is notationally valid (every bar adds up)', (_id, s) => {
    expect(validateScore(s)).toEqual([]);
  });

  it('every score has complete licensing and provenance', () => {
    for (const s of SCORES) {
      expect(['public-domain', 'cc0']).toContain(s.licence.kind);
      expect(s.licence.work.length).toBeGreaterThan(20);
      expect(s.licence.edition).toMatch(/CC0/);
      expect(s.source.length).toBeGreaterThan(10);
      expect(s.description.length).toBeGreaterThan(30);
      expect(canDownload(s)).toBe(true);
    }
  });

  it('every score is playable on at least one instrument', () => {
    for (const s of SCORES) expect(instrumentsFor(s).length, s.id).toBeGreaterThan(0);
  });

  it('percussion scores are only for drums, and drums only get percussion scores', () => {
    for (const s of SCORES) {
      const ins = instrumentsFor(s);
      if (s.clef === 'percussion') expect(ins).toEqual(['Drums']);
      else expect(ins).not.toContain('Drums');
    }
  });

  it('covers every listed instrument family except none', () => {
    const all = new Set(SCORES.flatMap(instrumentsFor));
    for (const ins of ['Piano', 'Guitar', 'Violin', 'Viola', 'Cello', 'Flute', 'Clarinet', 'Saxophone', 'Trumpet', 'Trombone', 'Drums', 'Voice']) expect(all.has(ins as never), ins).toBe(true);
  });
});

describe('parts', () => {
  const ode = SCORES.find((s) => s.id === 'ode-to-joy')!;
  const parts = partsFor(ode);
  it('B♭ part is a major second higher, in A major', () => {
    const bb = parts.find((p) => p.id === 'bb')!;
    expect(bb.key).toBe('A');
    expect(bb.measures[0][0].key).toBe('c#/5');
    expect(bb.instruments).toEqual(expect.arrayContaining(['Trumpet', 'Clarinet']));
  });
  it('E♭ alto sax part is a major sixth higher, in E major', () => {
    const eb = parts.find((p) => p.id === 'eb')!;
    expect(eb.key).toBe('E');
    expect(eb.measures[0][0].key).toBe('g#/5');
  });
  it('bass part is an octave lower in bass clef', () => {
    const bass = parts.find((p) => p.id === 'bass')!;
    expect(bass.clef).toBe('bass');
    expect(bass.measures[0][0].key).toBe('b/3');
    expect(bass.instruments).toContain('Cello');
  });
  it('rhythms are unchanged by transposition', () => {
    const src = parseMusic(ode.music);
    for (const p of parts) expect(p.measures.map((m) => m.map((n) => n.duration + n.dotted))).toEqual(src.map((m) => m.map((n) => n.duration + n.dotted)));
  });
  it('instruments are excluded when the part leaves their range', () => {
    const seven = SCORES.find((s) => s.id === 'seven-eight')!;
    expect(instrumentsFor(seven)).not.toContain('Voice'); // reaches A5
  });
});
