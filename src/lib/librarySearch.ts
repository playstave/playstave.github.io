/** Library search and filtering. Pure, so it is unit-tested. */
import { DIFFICULTIES, instrumentsFor, type Difficulty, type Genre, type Instrument, type ScoreSource } from '../music/score';

export interface Query { q?: string; instrument?: Instrument | ''; difficulty?: Difficulty | ''; genre?: Genre | ''; sort?: 'title' | 'easiest' | 'hardest' }

/** Lower-case and strip accents, so "frere" finds "Frère". */
export const normalize = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const haystack = new WeakMap<ScoreSource, string>();
function textOf(s: ScoreSource): string {
  let t = haystack.get(s);
  if (!t) {
    t = normalize([s.title, s.composer, s.genre, s.difficulty, s.description, s.key, s.time, ...instrumentsFor(s)].join(' '));
    haystack.set(s, t);
  }
  return t;
}

export function searchScores(all: ScoreSource[], q: Query): ScoreSource[] {
  const terms = normalize(q.q ?? '').split(/\s+/).filter(Boolean);
  const out = all.filter((s) =>
    (!q.instrument || instrumentsFor(s).includes(q.instrument)) &&
    (!q.difficulty || s.difficulty === q.difficulty) &&
    (!q.genre || s.genre === q.genre) &&
    terms.every((t) => textOf(s).includes(t)),
  );
  const rank = (s: ScoreSource) => DIFFICULTIES.indexOf(s.difficulty);
  const byTitle = (a: ScoreSource, b: ScoreSource) => a.title.localeCompare(b.title);
  if (q.sort === 'easiest') out.sort((a, b) => rank(a) - rank(b) || byTitle(a, b));
  else if (q.sort === 'hardest') out.sort((a, b) => rank(b) - rank(a) || byTitle(a, b));
  else out.sort(byTitle);
  return out;
}

/** How many results each option of one facet would give, holding the others fixed. */
export function facetCounts<K extends 'instrument' | 'difficulty' | 'genre'>(all: ScoreSource[], q: Query, facet: K, options: readonly string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const o of options) counts[o] = searchScores(all, { ...q, [facet]: o }).length;
  return counts;
}
