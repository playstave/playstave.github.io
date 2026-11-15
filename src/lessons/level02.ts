import type { Lesson } from './types';
import { locate, whichLine } from './helpers';

export const level02: Lesson = {
  level: 2,
  title: 'Counting the Lines',
  objective: 'Number the five lines from line 1 at the bottom to line 5 at the top.',
  intro: [
    'To talk about a note, musicians need to say exactly where it is. That starts with numbering the lines.',
    'There is one rule to remember, and it is the opposite of reading a page: we count from the bottom.',
  ],
  steps: [
    {
      title: 'Count from the bottom',
      body: [
        'The lowest line is **line 1**. Count upwards: line 2, line 3, line 4, and the top line is **line 5**.',
        'Think of floors in a building: the ground floor is at the bottom, and the numbers rise as you go up.',
      ],
      figure: { kind: 'staff', numbers: 'lines', alt: 'A staff with its lines numbered 1 to 5 from the bottom.', caption: 'Line numbers always start at the bottom.' },
    },
    {
      title: 'The middle line',
      body: [
        '**Line 3** is the middle line, with two lines below it and two above. It is the quickest landmark to find.',
        'When you are unsure, find line 3 first and count one line up or down from there.',
      ],
      figure: { kind: 'staff', highlight: [4], numbers: 'lines', alt: 'A staff with the middle line, line 3, highlighted.', caption: 'Line 3 sits exactly in the middle.' },
    },
    {
      title: 'A common mistake',
      body: [
        'Because we read words from the top of a page, it is tempting to call the top line "line 1". It is line 5.',
        'If you ever get an answer that is "upside down" — line 2 instead of line 4 — you counted from the top.',
      ],
      figure: { kind: 'staff', highlight: [6], numbers: 'lines', alt: 'A staff with line 4 highlighted.', caption: 'This is line 4 — the second line from the top.' },
    },
  ],
  practice: [
    locate('l2p1', 0, 'Tap line 1.', 'lines'),
    whichLine('l2p2', 8),
    locate('l2p3', 4, 'Tap the middle line.'),
    whichLine('l2p4', 2),
  ],
  challenge: [
    whichLine('l2c1', 6),
    locate('l2c2', 8, 'Tap line 5.'),
    locate('l2c3', 2, 'Tap line 2.'),
    whichLine('l2c4', 0),
    {
      kind: 'choice', id: 'l2c5', prompt: 'How many lines are above line 3?',
      figure: { kind: 'staff', highlight: [4], alt: 'A staff with line 3 highlighted.' },
      options: [
        { id: '1', text: '1', feedback: 'Count every line higher than the highlighted one: line 4 and line 5.' },
        { id: '2', text: '2' },
        { id: '3', text: '3', feedback: 'Line 3 itself doesn’t count. Above it are only line 4 and line 5.' },
      ],
      answer: '2',
      explanation: 'Line 3 is the middle line: lines 4 and 5 are above it, lines 1 and 2 below.',
    },
    locate('l2c6', 6, 'Tap line 4.'),
  ],
};
