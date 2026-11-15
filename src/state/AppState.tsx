import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearAll, readJSON, writeJSON } from '../lib/storage';
import { currentStreak, dayKey } from '../lib/dates';
import { completeLevel as applyCompletion, type CompletionResult } from '../lib/progression';

export type ThemePref = 'system' | 'light' | 'dark';
export type MotionPref = 'system' | 'reduced' | 'full';
export type NotationScale = 1 | 1.25 | 1.5;

export interface Preferences {
  theme: ThemePref;
  motion: MotionPref;
  notationScale: NotationScale;
}

/**
 * Student progress as stored on this device.
 * Stage 1: device-only (localStorage). Stage 6 moves this to an account-backed
 * database; the shape is kept deliberately small and free of personal data.
 */
export interface StudentProgress {
  displayName: string;
  /** Highest level the student may open (1 = nothing completed yet). */
  currentLevel: number;
  xp: number;
  completedLevels: Record<number, { stars: number; bestScore: number }>;
  /** Local date keys (YYYY-MM-DD) on which the student finished a practice set. */
  practiceDays: string[];
  /** Lifetime note-identification answers, used for the practice summary. */
  noteDrill: { answered: number; correct: number };
}

const DEFAULT_PREFS: Preferences = { theme: 'system', motion: 'system', notationScale: 1 };
const DEFAULT_PROGRESS: StudentProgress = {
  displayName: '',
  currentLevel: 1,
  xp: 0,
  completedLevels: {},
  practiceDays: [],
  noteDrill: { answered: 0, correct: 0 },
};

interface AppStateValue {
  prefs: Preferences;
  setPrefs: (patch: Partial<Preferences>) => void;
  progress: StudentProgress;
  setDisplayName: (name: string) => void;
  recordNoteAnswer: (correct: boolean) => void;
  markPracticedToday: () => void;
  /** Record a passed level. Throws if the level is locked. XP is added in the gamification stage. */
  completeLevel: (n: number, stars: number, score: number) => CompletionResult<StudentProgress>;
  /** Clear level progress only (keeps name, practice history and settings). */
  resetJourney: () => void;
  resetDevice: () => void;
  derived: {
    totalStars: number;
    levelsCompleted: number;
    streak: number;
    practicedToday: boolean;
  };
}

const AppStateContext = createContext<AppStateValue | null>(null);

function sanitizeName(raw: string): string {
  // Display names are shown only to the student on this device. Keep them
  // short and plain; we never ask for a real name.
  return raw.replace(/[^\p{L}\p{N} _.'-]/gu, '').trim().slice(0, 24);
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(() => ({ ...DEFAULT_PREFS, ...readJSON('prefs', {}) }));
  const [progress, setProgress] = useState<StudentProgress>(() => ({ ...DEFAULT_PROGRESS, ...readJSON('progress', {}) }));

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

  const setPrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefsState((p) => ({ ...p, ...patch }));
  }, []);

  const setDisplayName = useCallback((name: string) => {
    setProgress((p) => ({ ...p, displayName: sanitizeName(name) }));
  }, []);

  const recordNoteAnswer = useCallback((correct: boolean) => {
    setProgress((p) => ({
      ...p,
      noteDrill: { answered: p.noteDrill.answered + 1, correct: p.noteDrill.correct + (correct ? 1 : 0) },
    }));
  }, []);

  const markPracticedToday = useCallback(() => {
    const today = dayKey();
    setProgress((p) => (p.practiceDays.includes(today) ? p : { ...p, practiceDays: [...p.practiceDays, today] }));
  }, []);

  // Computed from a ref so the result is returned synchronously and StrictMode
  // double-invocation of state updaters can never apply a completion twice.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const completeLevel = useCallback((n: number, stars: number, score: number) => {
    const result = applyCompletion(progressRef.current, n, stars, score);
    progressRef.current = result.state;
    setProgress(result.state);
    return result;
  }, []);

  const resetJourney = useCallback(() => {
    setProgress((p) => ({ ...p, currentLevel: 1, completedLevels: {} }));
  }, []);

  const resetDevice = useCallback(() => {
    clearAll();
    setPrefsState(DEFAULT_PREFS);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  const derived = useMemo(() => {
    const done = Object.values(progress.completedLevels);
    const days = new Set(progress.practiceDays);
    return {
      totalStars: done.reduce((s, l) => s + l.stars, 0),
      levelsCompleted: done.length,
      streak: currentStreak(days),
      practicedToday: days.has(dayKey()),
    };
  }, [progress]);

  const value = useMemo<AppStateValue>(
    () => ({ prefs, setPrefs, progress, setDisplayName, recordNoteAnswer, markPracticedToday, completeLevel, resetJourney, resetDevice, derived }),
    [prefs, setPrefs, progress, setDisplayName, recordNoteAnswer, markPracticedToday, completeLevel, resetJourney, resetDevice, derived],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used inside <AppStateProvider>');
  return ctx;
}
