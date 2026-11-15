/**
 * Achievement definitions. Unlock conditions live in src/lib/achievements.ts
 * and are evaluated against real progress after every activity.
 */
export type BadgeGlyph =
  | 'note' | 'star' | 'ten' | 'fifty' | 'hundred' | 'book'
  | 'rhythm' | 'clef' | 'eye' | 'crown' | 'flame' | 'key' | 'sun' | 'staff';

export interface Achievement {
  id: string;
  title: string;
  criteria: string;
  glyph: BadgeGlyph;
  tier: 'bronze' | 'silver' | 'gold';
  category: 'Journey' | 'Skill' | 'Habit' | 'Library';
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', title: 'First Lesson', criteria: 'Complete Level 1.', glyph: 'note', tier: 'bronze', category: 'Journey' },
  { id: 'ten-levels', title: 'Ten Levels', criteria: 'Complete 10 levels.', glyph: 'ten', tier: 'bronze', category: 'Journey' },
  { id: 'fifty-levels', title: 'Fifty Levels', criteria: 'Complete 50 levels.', glyph: 'fifty', tier: 'silver', category: 'Journey' },
  { id: 'hundred-levels', title: 'Hundred Levels', criteria: 'Complete World 1 (Level 100).', glyph: 'hundred', tier: 'gold', category: 'Journey' },
  { id: 'grandmaster', title: 'Grandmaster Musician', criteria: 'Complete Level 500.', glyph: 'crown', tier: 'gold', category: 'Journey' },

  { id: 'first-perfect', title: 'First Perfect Score', criteria: 'Earn three stars on any level.', glyph: 'star', tier: 'bronze', category: 'Skill' },
  { id: 'staff-star', title: 'Bright Beginnings', criteria: 'Earn three stars on every level of Unit 1, First Sounds (Levels 1–10).', glyph: 'staff', tier: 'silver', category: 'Skill' },
  { id: 'clef-expert', title: 'Theory Expert', criteria: 'Earn three stars on every theory level in World 1 (Levels 9, 12, 25, 44, 51, 72, 75 and 94).', glyph: 'clef', tier: 'silver', category: 'Skill' },
  { id: 'rhythm-master', title: 'Rhythm Master', criteria: 'Earn three stars on every level of the rhythm units in World 1: Counting in Time, Eighth Notes and Dotted Rhythms (Levels 11–20, 31–40, 51–60).', glyph: 'rhythm', tier: 'silver', category: 'Skill' },
  { id: 'key-keeper', title: 'Key Keeper', criteria: 'Earn three stars on every level of the key units in World 1: D major, G major and A major (Levels 21–30, 41–50, 61–70).', glyph: 'key', tier: 'silver', category: 'Skill' },
  { id: 'sight-reader', title: 'Checkpoint Champion', criteria: 'Earn three stars on every checkpoint in World 1 (Levels 10, 20, 30 … 100).', glyph: 'eye', tier: 'gold', category: 'Skill' },

  { id: 'first-daily', title: 'Daily Start', criteria: 'Complete your first daily challenge.', glyph: 'sun', tier: 'bronze', category: 'Habit' },
  { id: 'week-streak', title: 'Seven-Day Rhythm', criteria: 'Reach a 7-day practice streak.', glyph: 'flame', tier: 'bronze', category: 'Habit' },
  { id: 'ten-sets', title: 'Steady Reader', criteria: 'Finish 10 note-reading practice sets on the Practice page.', glyph: 'note', tier: 'silver', category: 'Habit' },
  { id: 'month-streak', title: 'Thirty-Day Rhythm', criteria: 'Reach a 30-day practice streak.', glyph: 'flame', tier: 'gold', category: 'Habit' },

  { id: 'sheet-explorer', title: 'Sheet Music Explorer', criteria: 'Open 25 different scores from the library.', glyph: 'book', tier: 'silver', category: 'Library' },
];

export const getAchievement = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
