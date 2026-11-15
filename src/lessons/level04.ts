import type { Lesson } from './types';
import { lineOrSpace } from './helpers';

export const level04: Lesson = {
  level: 4,
  title: 'Line Notes and Space Notes',
  objective: 'Tell at a glance whether a note sits on a line or in a space.',
  intro: [
    'Now that you can find every line and space, it is time to put notes on them.',
    'Every note on the staff is either a line note or a space note. Telling them apart is the first thing your eye does when reading music.',
  ],
  steps: [
    {
      title: 'Line notes',
      body: [
        'A **line note** has a staff line running straight through the middle of its head, cutting it in half.',
        'The line is hidden behind the note, so look for the line entering on one side and leaving on the other.',
      ],
      figure: { kind: 'staff', notes: [2, 4, 6], alt: 'Three line notes on lines 2, 3 and 4.', caption: 'Line notes: each head is cut through the middle by a line.' },
    },
    {
      title: 'Space notes',
      body: [
        'A **space note** fills the gap between two lines. Its head touches the line above and the line below, but no line passes through it.',
        'A note head is exactly one space tall, which is why space notes fit so neatly.',
      ],
      figure: { kind: 'staff', notes: [1, 3, 5, 7], alt: 'Four space notes, one in each space.', caption: 'Space notes sit between lines, touching both.' },
    },
    {
      title: 'Side by side',
      body: [
        'Compare the two notes below. The first is cut by a line; the second is held between two lines.',
        'Ask one question every time: **is a line going through the middle?** Yes means line note; no means space note.',
      ],
      figure: { kind: 'staff', notes: [4, 5], noteLabels: true, alt: 'Note 1 on line 3, note 2 in space 3.', caption: 'Note 1 is a line note. Note 2 is a space note.' },
      tip: 'Hollow note heads like these (whole notes) make it easy to see the line through the middle.',
    },
  ],
  practice: [
    lineOrSpace('l4p1', 4, 'note'),
    lineOrSpace('l4p2', 5, 'note'),
    lineOrSpace('l4p3', 0, 'note'),
    lineOrSpace('l4p4', 7, 'note'),
  ],
  challenge: [
    lineOrSpace('l4c1', 8, 'note'),
    lineOrSpace('l4c2', 1, 'note'),
    lineOrSpace('l4c3', 6, 'note'),
    lineOrSpace('l4c4', 3, 'note'),
    {
      kind: 'choice', id: 'l4c5', prompt: 'A note head with a staff line running through its middle is called…',
      options: [
        { id: 'line', text: 'A line note' },
        { id: 'space', text: 'A space note', feedback: 'A space note sits between lines; no line crosses it.' },
        { id: 'ledger', text: 'A crossed-out note', feedback: 'Nothing is crossed out — the line through the head is simply the staff line it sits on.' },
      ],
      answer: 'line',
      explanation: 'When a staff line passes through the middle of the head, the note sits on that line: a line note.',
    },
    {
      kind: 'choice', id: 'l4c6', prompt: 'How many of these notes are line notes?',
      figure: { kind: 'staff', notes: [2, 3, 4, 7], noteLabels: true, alt: 'Four numbered notes on the staff.' },
      options: [
        { id: '1', text: '1', feedback: 'Check each note for a line through its middle. Notes 1 and 3 both have one.' },
        { id: '2', text: '2' },
        { id: '3', text: '3', feedback: 'Notes 2 and 4 sit between lines with nothing crossing them — they are space notes.' },
        { id: '4', text: '4', feedback: 'Notes 2 and 4 are space notes: they sit between lines.' },
      ],
      answer: '2',
      explanation: 'Notes 1 (line 2) and 3 (line 3) are line notes. Notes 2 (space 2) and 4 (space 4) are space notes.',
    },
  ],
};
