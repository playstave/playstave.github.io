/**
 * Student progress model (device storage now; server database in Stage 6).
 * No personal data beyond an optional nickname.
 */
export interface XpEvent { key: string; amount: number; reason: string; at: string }
export interface HistoryEntry { level: number; at: string; stars: number; score: number; replay: boolean }

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
};

export const XP_LOG_LIMIT = 100;
export const HISTORY_LIMIT = 200;
