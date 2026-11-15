/** Treble-clef reading range used by the note-identification drill (C4–A5). */
export interface StaffNote { key: string; letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'; where: string }

export const TREBLE_RANGE: StaffNote[] = [
  { key: 'c/4', letter: 'C', where: 'on the first ledger line below the staff — this is Middle C' },
  { key: 'd/4', letter: 'D', where: 'in the space just below the bottom line' },
  { key: 'e/4', letter: 'E', where: 'on the bottom line (line 1)' },
  { key: 'f/4', letter: 'F', where: 'in the first space, between lines 1 and 2' },
  { key: 'g/4', letter: 'G', where: 'on line 2 — the line the treble clef curls around' },
  { key: 'a/4', letter: 'A', where: 'in the second space' },
  { key: 'b/4', letter: 'B', where: 'on the middle line (line 3)' },
  { key: 'c/5', letter: 'C', where: 'in the third space' },
  { key: 'd/5', letter: 'D', where: 'on line 4' },
  { key: 'e/5', letter: 'E', where: 'in the top space' },
  { key: 'f/5', letter: 'F', where: 'on the top line (line 5)' },
  { key: 'g/5', letter: 'G', where: 'in the space just above the top line' },
  { key: 'a/5', letter: 'A', where: 'on the first ledger line above the staff' },
];

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
