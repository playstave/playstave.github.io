import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearAll, readJSON, writeJSON } from '../lib/storage';
import { migrate, recordActivity, type Activity, type Outcome } from '../lib/rewards';
import { streakInfo } from '../lib/streak';
import { getAchievement } from '../data/achievements';
import { DEFAULT_PROGRESS, type StudentProgress } from './progress';

export type { StudentProgress } from './progress';
export type ThemePref = 'system' | 'light' | 'dark';
export type MotionPref = 'system' | 'reduced' | 'full';
export type NotationScale = 1 | 1.25 | 1.5;

export interface Preferences {
  theme: ThemePref;
  motion: MotionPref;
  notationScale: NotationScale;
}

/** A finished lesson, shown by the celebration overlay. */
export interface Celebration { level: number; stars: number; score: number; outcome: Outcome }

export interface Toast { id: number; title: string; body?: string; kind: 'badge' | 'xp' | 'streak'; link?: string }

const DEFAULT_PREFS: Preferences = { theme: 'system', motion: 'system', notationScale: 1 };

interface AppStateValue {
  prefs: Preferences;
  setPrefs: (patch: Partial<Preferences>) => void;
  progress: StudentProgress;
  setDisplayName: (name: string) => void;
  recordNoteAnswer: (correct: boolean) => void;
  /** Record a passed level: progression, XP, streak, achievements. Throws if the level is locked. */
  completeLevel: (n: number, stars: number, score: number) => Outcome;
  /** A finished 5-note practice set. */
  recordPracticeSet: () => Outcome;
  /** A finished daily challenge. */
  completeDaily: (correct: number, total: number) => Outcome;
  celebration: Celebration | null;
  dismissCelebration: () => void;
  toasts: Toast[];
  dismissToast: (id: number) => void;
  /** Library */
  openScore: (id: string) => void;
  toggleFavorite: (id: string) => void;
  createCollection: (name: string) => { ok: true; id: string } | { ok: false; error: string };
  renameCollection: (id: string, name: string) => { ok: boolean; error?: string };
  deleteCollection: (id: string) => void;
  setInCollection: (collectionId: string, scoreId: string, included: boolean) => void;
  /** Replace progress wholesale (used by account sync after merging with the server copy). */
  replaceProgress: (p: StudentProgress) => void;
  /** Developer tool: start the journey over (keeps nickname and settings). */
  resetJourney: () => void;
  resetDevice: () => void;
  derived: {
    totalStars: number;
    levelsCompleted: number;
    streak: number;
    bestStreak: number;
    restDayUsed: boolean;
    practicedToday: boolean;
  };
}

const AppStateContext = createContext<AppStateValue | null>(null);

function sanitizeName(raw: string): string {
  // Display names are shown only to the student on this device. Keep them
  // short and plain; we never ask for a real name.
  return raw.replace(/[^\p{L}\p{N} _.'-]/gu, '').trim().slice(0, 24);
}

let toastSeq = 1;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(() => ({ ...DEFAULT_PREFS, ...readJSON('prefs', {}) }));
  const [progress, setProgress] = useState<StudentProgress>(() => migrate(readJSON('progress', {}), DEFAULT_PROGRESS));
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => { writeJSON('prefs', prefs); }, [prefs]);
  useEffect(() => { writeJSON('progress', progress); }, [progress]);

  // Reflect preferences onto <html> so CSS tokens can respond.
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
    if (prefs.motion === 'system') root.removeAttribute('data-motion');
    else root.setAttribute('data-motion', prefs.motion);
    root.style.setProperty('--notation-scale', String(prefs.notationScale));
  }, [prefs]);

  const setPrefs = useCallback((patch: Partial<Preferences>) => setPrefsState((p) => ({ ...p, ...patch })), []);
  const setDisplayName = useCallback((name: string) => setProgress((p) => ({ ...p, displayName: sanitizeName(name) })), []);
  const recordNoteAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({ ...p, noteDrill: { answered: p.noteDrill.answered + 1, correct: p.noteDrill.correct + (correct ? 1 : 0) } }));
  }, []);

  const pushToasts = useCallback((items: Omit<Toast, 'id'>[]) => {
    if (items.length) setToasts((t) => [...t, ...items.map((x) => ({ ...x, id: toastSeq++ }))].slice(-4));
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // Activities are computed from a ref so the outcome is returned synchronously,
  // and StrictMode's double-invoked updaters can never apply an activity twice.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const apply = useCallback((a: Activity): Outcome => {
    const outcome = recordActivity(progressRef.current, a);
    progressRef.current = outcome.state;
    setProgress(outcome.state);
    return outcome;
  }, []);

  const toastsFor = (o: Outcome): Omit<Toast, 'id'>[] => [
    ...o.unlocked.map((id) => ({ kind: 'badge' as const, title: `Badge earned: ${getAchievement(id)?.title ?? id}`, body: getAchievement(id)?.criteria, link: '/achievements' })),
    ...o.awards.filter((a) => a.key.startsWith('streak:')).map((a) => ({ kind: 'streak' as const, title: `${a.reason}! +${a.amount} XP` })),
    ...(o.xpGained && !o.awards.some((a) => a.key.startsWith('streak:')) ? [{ kind: 'xp' as const, title: `+${o.xpGained} XP`, body: o.awards.map((a) => a.reason).join(' · ') }] : []),
  ];

  const completeLevel = useCallback((n: number, stars: number, score: number) => {
    const outcome = apply({ kind: 'lesson', level: n, stars, score });
    // The celebration overlay presents XP, badges and milestones for lessons.
    setCelebration({ level: n, stars, score, outcome });
    return outcome;
  }, [apply]);

  const recordPracticeSet = useCallback(() => {
    const o = apply({ kind: 'practiceSet' });
    pushToasts(toastsFor(o));
    return o;
  }, [apply, pushToasts]);

  const completeDaily = useCallback((correct: number, total: number) => {
    const o = apply({ kind: 'daily', correct, total });
    pushToasts(toastsFor(o));
    return o;
  }, [apply, pushToasts]);

  const openScore = useCallback((id: string) => {
    const o = apply({ kind: 'openScore', scoreId: id });
    pushToasts(o.unlocked.map((u) => ({ kind: 'badge' as const, title: `Badge earned: ${getAchievement(u)?.title ?? u}`, body: getAchievement(u)?.criteria, link: '/achievements' })));
  }, [apply, pushToasts]);

  const update = useCallback((fn: (p: StudentProgress) => StudentProgress) => {
    const next = fn(progressRef.current);
    progressRef.current = next;
    setProgress(next);
  }, []);

  const toggleFavorite = useCallback((id: string) => update((p) => ({
    ...p, favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [id, ...p.favorites],
  })), [update]);

  const checkName = (name: string, exceptId?: string): string | null => {
    const n = name.trim();
    if (!n) return 'Give the collection a name.';
    if (n.length > 40) return 'Use 40 characters or fewer.';
    if (progressRef.current.collections.some((c) => c.id !== exceptId && c.name.toLowerCase() === n.toLowerCase())) return 'You already have a collection with that name.';
    return null;
  };

  const createCollection = useCallback((name: string) => {
    const error = checkName(name);
    if (error) return { ok: false as const, error };
    if (progressRef.current.collections.length >= 50) return { ok: false as const, error: 'You can have up to 50 collections.' };
    const id = `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    update((p) => ({ ...p, collections: [...p.collections, { id, name: name.trim(), scoreIds: [], createdAt: new Date().toISOString() }] }));
    return { ok: true as const, id };
  }, [update]);

  const renameCollection = useCallback((id: string, name: string) => {
    const error = checkName(name, id);
    if (error) return { ok: false, error };
    update((p) => ({ ...p, collections: p.collections.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)) }));
    return { ok: true };
  }, [update]);

  const deleteCollection = useCallback((id: string) => update((p) => ({ ...p, collections: p.collections.filter((c) => c.id !== id) })), [update]);

  const setInCollection = useCallback((cid: string, sid: string, included: boolean) => update((p) => ({
    ...p,
    collections: p.collections.map((c) => c.id !== cid ? c : {
      ...c, scoreIds: included ? (c.scoreIds.includes(sid) ? c.scoreIds : [...c.scoreIds, sid]) : c.scoreIds.filter((x) => x !== sid),
    }),
  })), [update]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  const replaceProgress = useCallback((p: StudentProgress) => {
    progressRef.current = p;
    setProgress(p);
  }, []);

  const resetJourney = useCallback(() => {
    const next = { ...structuredClone(DEFAULT_PROGRESS), displayName: progressRef.current.displayName };
    progressRef.current = next;
    setProgress(next);
    setCelebration(null);
  }, []);

  const resetDevice = useCallback(() => {
    clearAll();
    setPrefsState(DEFAULT_PREFS);
    const next = structuredClone(DEFAULT_PROGRESS);
    progressRef.current = next;
    setProgress(next);
    setCelebration(null);
    setToasts([]);
  }, []);

  const derived = useMemo(() => {
    const done = Object.values(progress.completedLevels);
    const s = streakInfo(progress.practiceDays);
    return {
      totalStars: done.reduce((t, l) => t + l.stars, 0),
      levelsCompleted: done.length,
      streak: s.current,
      bestStreak: s.best,
      restDayUsed: s.restDayUsed,
      practicedToday: s.practicedToday,
    };
  }, [progress]);

  const value = useMemo<AppStateValue>(
    () => ({ prefs, setPrefs, progress, setDisplayName, recordNoteAnswer, completeLevel, recordPracticeSet, completeDaily, celebration, dismissCelebration, toasts, dismissToast, openScore, toggleFavorite, createCollection, renameCollection, deleteCollection, setInCollection, replaceProgress, resetJourney, resetDevice, derived }),
    [prefs, setPrefs, progress, setDisplayName, recordNoteAnswer, completeLevel, recordPracticeSet, completeDaily, celebration, dismissCelebration, toasts, dismissToast, openScore, toggleFavorite, createCollection, renameCollection, deleteCollection, setInCollection, replaceProgress, resetJourney, resetDevice, derived],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
