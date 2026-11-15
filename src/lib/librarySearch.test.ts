import { describe, expect, it } from 'vitest';
import { SCORES } from '../data/scores';
import { facetCounts, searchScores } from './librarySearch';
import { instrumentsFor } from '../music/score';

const ids = (r: { id: string }[]) => r.map((s) => s.id);

describe('library search', () => {
  it('finds by title, ignoring case and accents', () => {
    expect(ids(searchScores(SCORES, { q: 'frere' }))).toEqual(['frere-jacques']);
    expect(ids(searchScores(SCORES, { q: 'ODE TO' }))).toEqual(['ode-to-joy']);
  });
  it('finds by composer', () => {
    expect(ids(searchScores(SCORES, { q: 'beethoven' })).sort()).toEqual(['fur-elise', 'ode-to-joy']);
    expect(searchScores(SCORES, { q: 'stave original' }).length).toBeGreaterThanOrEqual(10);
  });
  it('requires every word to match', () => {
    expect(ids(searchScores(SCORES, { q: 'beethoven elise' }))).toEqual(['fur-elise']);
    expect(searchScores(SCORES, { q: 'beethoven zzz' })).toEqual([]);
  });
  it('filters by instrument, difficulty and genre together', () => {
    const r = searchScores(SCORES, { instrument: 'Drums' });
    expect(ids(r).sort()).toEqual(['rhythm-study-1', 'rhythm-study-2']);
    for (const s of searchScores(SCORES, { instrument: 'Trumpet', difficulty: 'Beginner' })) {
      expect(s.difficulty).toBe('Beginner');
      expect(instrumentsFor(s)).toContain('Trumpet');
    }
    expect(searchScores(SCORES, { genre: 'Jazz' })).toEqual([]);
    expect(ids(searchScores(SCORES, { genre: 'Classical', difficulty: 'Advanced' }))).toEqual(['fur-elise']);
  });
  it('sorts by title or difficulty', () => {
    const t = searchScores(SCORES, {}).map((s) => s.title);
    expect(t).toEqual([...t].sort((a, b) => a.localeCompare(b)));
    const e = searchScores(SCORES, { sort: 'easiest' });
    expect(e[0].difficulty).toBe('Beginner');
    expect(e[e.length - 1].difficulty).toBe('Expert');
    expect(searchScores(SCORES, { sort: 'hardest' })[0].difficulty).toBe('Expert');
  });
  it('facet counts match actual results', () => {
    const c = facetCounts(SCORES, { q: '' }, 'genre', ['Classical', 'Jazz']);
    expect(c.Classical).toBe(searchScores(SCORES, { genre: 'Classical' }).length);
    expect(c.Jazz).toBe(0);
  });
});
