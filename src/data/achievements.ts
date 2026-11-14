/**
 * Achievement definitions. Unlock logic is wired up in Stage 4 (gamification);
 * for now every badge is shown in its locked state with its real criteria.
 */
export type BadgeGlyph =
  | 'note' | 'star' | 'ten' | 'fifty' | 'hundred' | 'book'
  | 'rhythm' | 'clef' | 'eye' | 'crown' | 'flame' | 'key';

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
  { id: 'first-perfect', title: 'First Perfect Score', criteria: 'Earn three stars on any level.', glyph: 'star', tier: 'bronze', category: 'Skill' },
  { id: 'ten-levels', title: 'Ten Levels', criteria: 'Complete 10 levels.', glyph: 'ten', tier: 'bronze', category: 'Journey' },
  { id: 'week-streak', title: 'Seven-Day Rhythm', criteria: 'Practise on seven days in a row.', glyph: 'flame', tier: 'bronze', category: 'Habit' },
  { id: 'clef-expert', title: 'Clef Expert', criteria: 'Earn three stars on every treble and bass clef level in World 1.', glyph: 'clef', tier: 'silver', category: 'Skill' },
  { id: 'fifty-levels', title: 'Fifty Levels', criteria: 'Complete 50 levels.', glyph: 'fifty', tier: 'silver', category: 'Journey' },
  { id: 'sheet-explorer', title: 'Sheet Music Explorer', criteria: 'Open 25 different scores from the library.', glyph: 'book', tier: 'silver', category: 'Library' },
  { id: 'rhythm-master', title: 'Rhythm Master', criteria: 'Earn three stars on every rhythm level up to Level 200.', glyph: 'rhythm', tier: 'silver', category: 'Skill' },
  { id: 'key-keeper', title: 'Key Keeper', criteria: 'Identify all 15 major key signatures without a mistake.', glyph: 'key', tier: 'silver', category: 'Skill' },
  { id: 'hundred-levels', title: 'Hundred Levels', criteria: 'Complete World 1 (Level 100).', glyph: 'hundred', tier: 'gold', category: 'Journey' },
  { id: 'sight-reader', title: 'Sight-Reading Specialist', criteria: 'Earn three stars on every sight-reading level in World 4.', glyph: 'eye', tier: 'gold', category: 'Skill' },
  { id: 'grandmaster', title: 'Grandmaster Musician', criteria: 'Complete Level 500.', glyph: 'crown', tier: 'gold', category: 'Journey' },
];
