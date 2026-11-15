/**
 * Merging two copies of a student's progress (this device and the account).
 * Rules — chosen so that a merge never loses anything a student earned:
 *   levels: union, keeping the best stars and score; currentLevel = furthest
 *   XP: recomputed from the union of award keys (never summed twice)
 *   badges: union, earliest unlock date; practice days: union
 *   counters: the larger value; history: union by (time, level), newest first
 *   library: favourites/opened union, collections merged by id, recent by recency
 *   instrument/experience: the most recently chosen answer wins
 */
import { HISTORY_LIMIT, RECENT_LIMIT, XP_LOG_LIMIT, type Collection, type StudentProgress } from '../../state/progress';
import { xpFromKeys } from '../xp';

const unionOrdered = <T,>(a: T[], b: T[]) => [...a, ...b.filter((x) => !a.includes(x))];

export function mergeProgress(local: StudentProgress, remote: StudentProgress): StudentProgress {
  const completed: StudentProgress['completedLevels'] = { ...remote.completedLevels };
  for (const [n, r] of Object.entries(local.completedLevels)) {
    const o = completed[Number(n)];
    completed[Number(n)] = o ? { stars: Math.max(o.stars, r.stars), bestScore: Math.max(o.bestScore, r.bestScore) } : r;
  }
  const awarded = { ...remote.awarded, ...local.awarded };

  const achievements = { ...remote.achievements };
  for (const [id, at] of Object.entries(local.achievements)) achievements[id] = achievements[id] && achievements[id] < at ? achievements[id] : at;

  const seenH = new Set<string>();
  const history = [...local.history, ...remote.history]
    .filter((h) => { const k = `${h.at}|${h.level}`; if (seenH.has(k)) return false; seenH.add(k); return true; })
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, HISTORY_LIMIT);

  const seenX = new Set<string>();
  const xpLog = [...local.xpLog, ...remote.xpLog]
    .filter((e) => (seenX.has(e.key) ? false : (seenX.add(e.key), true)))
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, XP_LOG_LIMIT);

  const cols = new Map<string, Collection>();
  for (const c of [...remote.collections, ...local.collections]) {
    const o = cols.get(c.id);
    cols.set(c.id, o ? { ...c, scoreIds: unionOrdered(c.scoreIds, o.scoreIds) } : c);
  }

  const lastDaily = !local.lastDaily ? remote.lastDaily : !remote.lastDaily ? local.lastDaily
    : local.lastDaily.day >= remote.lastDaily.day ? local.lastDaily : remote.lastDaily;

  return {
    ...local,
    version: 2,
    displayName: local.displayName || remote.displayName,
    currentLevel: Math.max(local.currentLevel, remote.currentLevel),
    completedLevels: completed,
    awarded,
    xp: xpFromKeys(awarded),
    xpLog,
    achievements,
    practiceDays: unionOrdered(local.practiceDays, remote.practiceDays).sort(),
    history,
    noteDrill: {
      answered: Math.max(local.noteDrill.answered, remote.noteDrill.answered),
      correct: Math.max(local.noteDrill.correct, remote.noteDrill.correct),
    },
    counters: {
      practiceSets: Math.max(local.counters.practiceSets, remote.counters.practiceSets),
      dailyChallenges: Math.max(local.counters.dailyChallenges, remote.counters.dailyChallenges),
      scoresOpened: 0, // recomputed below
    },
    lastDaily,
    favorites: unionOrdered(local.favorites, remote.favorites),
    collections: [...cols.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    recentScores: unionOrdered(local.recentScores, remote.recentScores).slice(0, RECENT_LIMIT),
    openedScores: unionOrdered(local.openedScores, remote.openedScores),
    course: Math.max(local.course ?? 2, remote.course ?? 2),
    student: !local.student ? remote.student ?? null : !remote.student ? local.student
      : local.student.setAt >= remote.student.setAt ? local.student : remote.student,
  };
}

/** Finalise counters that are derived from other fields. */
export function normalise(p: StudentProgress): StudentProgress {
  return { ...p, counters: { ...p.counters, scoresOpened: p.openedScores.length } };
}

export const merge = (local: StudentProgress, remote: StudentProgress) => normalise(mergeProgress(local, remote));
