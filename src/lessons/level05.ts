import type { Lesson } from './types';
import { locate, namePosition } from './helpers';

export const level05: Lesson = {
  level: 5,
  title: 'Naming a Note’s Position',
  objective: 'Describe exactly where any note sits, such as “line 4” or “space 2”.',
  intro: [
    'You can count lines, count spaces, and tell line notes from space notes. Put them together and you can name the exact position of any note.',
    'This is the skill every later lesson builds on, so we will practise it carefully.',
  ],
  steps: [
    {
      title: 'Two questions, in order',
      body: [
        '**1. Line or space?** Look for a line through the middle of the note head.',
        '**2. Which number?** Count lines (or spaces) from the bottom until you reach the note.',
      ],
      figure: { kind: 'staff', notes: [6], numbers: 'lines', alt: 'A note on line 4, with line numbers shown.', caption: 'A line passes through it → line note. Counting up: 1, 2, 3, 4 → line 4.' },
    },
    {
      title: 'Space notes',
      body: [
        'For a space note, look at the line just below it. That line’s number is the space number.',
        'The note below rests above line 2, so it is in **space 2**.',
      ],
      figure: { kind: 'staff', notes: [3], numbers: 'both', alt: 'A note in space 2, with line and space numbers shown.', caption: 'Below the note is line 2 → space 2.' },
    },
    {
      title: 'Check yourself',
      body: [
        'The two classic mistakes are counting from the top, and mixing up a line with the space next to it.',
        'If your answer is the right number but the wrong type ("line 2" for "space 2"), go back to question 1.',
      ],
      figure: { kind: 'staff', notes: [2, 3], noteLabels: true, alt: 'Note 1 on line 2, note 2 in space 2.', caption: 'Note 1 is on line 2. Note 2 is in space 2 — neighbours, but not the same.' },
    },
  ],
  practice: [
    namePosition('l5p1', 6),
    locate('l5p2', 1, 'Tap where a note in space 1 would sit.'),
    namePosition('l5p3', 3),
    namePosition('l5p4', 8),
  ],
  challenge: [
    namePosition('l5c1', 2),
    namePosition('l5c2', 7),
    namePosition('l5c3', 4),
    locate('l5c4', 6, 'Tap where a note on line 4 would sit.'),
    namePosition('l5c5', 1),
    locate('l5c6', 5, 'Tap where a note in space 3 would sit.'),
  ],
};
