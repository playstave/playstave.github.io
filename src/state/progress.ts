/**
 * Student progress model (device storage now; server database in Stage 6).
 * No personal data beyond an optional nickname.
 */
export interface XpEvent { key: string; amount: number; reason: string; at: string }
export interface HistoryEntry { level: number; at: string; stars: number; score: number; replay: boolean }

/** How much the student has played before (asked once, changeable in Settings). */
export type Experience = 'new' | 'some' | 'experienced';
export type StudentInstrument = 'violin' | 'viola' | 'cello' | 'bass';
/** Answers from the welcome questions; drive the personalised experience. */
export interface StudentSetup { instrument: StudentInstrument; experience: Experience; setAt: string }

export interface Collection { id: string; name: string; scoreIds: string[]; createdAt: string }

export interface StudentProgress {
  version: 2;
  displayName: string;
  /** Highest level the student may open (501 when all are complete). */
  currentLevel: number;
  xp: number;
  completedLevels: Record<number, { stars: number; bestScore: number }>;
  /** Local date keys (YYYY-MM-DD) with at least one finished activity. */
  practiceDays: string[];
  noteDrill: { answered: number; correct: number };
  /** Idempotency keys of every XP award ever paid — the guard against duplicate XP. */
  awarded: Record<string, true>;
  xpLog: XpEvent[];
  /** Achievement id → ISO time unlocked. */
  achievements: Record<string, string>;
  history: HistoryEntry[];
  counters: { practiceSets: number; dailyChallenges: number; scoresOpened: number };
  /** Most recent daily challenge result. */
  lastDaily: { day: string; correct: number; total: number } | null;
  /** Library: favourite score ids, user collections, recently opened (newest first), every score ever opened. */
  favorites: string[];
  collections: Collection[];
  recentScores: string[];
  openedScores: string[];
  /** Instrument and experience from the welcome questions (null until answered). */
  student: StudentSetup | null;
}

export const DEFAULT_PROGRESS: StudentProgress = {
  version: 2,
  displayName: '',
  currentLevel: 1,
  xp: 0,
  completedLevels: {},
  practiceDays: [],
  noteDrill: { answered: 0, correct: 0 },
  awarded: {},
  xpLog: [],
  achievements: {},
  history: [],
  counters: { practiceSets: 0, dailyChallenges: 0, scoresOpened: 0 },
  lastDaily: null,
  favorites: [],
  collections: [],
  recentScores: [],
  openedScores: [],
  student: null,
};

export const RECENT_LIMIT = 8;

export const XP_LOG_LIMIT = 100;
export const HISTORY_LIMIT = 200;
