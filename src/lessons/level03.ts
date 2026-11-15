import type { Lesson } from './types';
import { locate, whichSpace } from './helpers';

export const level03: Lesson = {
  level: 3,
  title: 'Counting the Spaces',
  objective: 'Number the four spaces from space 1 at the bottom to space 4 at the top.',
  intro: [
    'Lines are half the staff. The other half is the four spaces between them, and they are numbered the same way.',
    'By the end of this lesson you will be able to point to any space by its number.',
  ],
  steps: [
    {
      title: 'Spaces count from the bottom too',
      body: [
        'The lowest space is **space 1**. Above it are space 2, space 3, and at the top, **space 4**.',
        'Spaces only exist between lines, so there are just four of them inside the staff.',
      ],
      figure: { kind: 'staff', numbers: 'spaces', alt: 'A staff with its spaces numbered 1 to 4 from the bottom.', caption: 'Space numbers, bottom to top.' },
    },
    {
      title: 'Space n sits above line n',
      body: [
        'Here is a handy rule: **space 1** lies between line 1 and line 2; **space 2** between line 2 and line 3, and so on.',
        'So space n is always directly above line n. If you know your lines, you already know your spaces.',
      ],
      figure: { kind: 'staff', numbers: 'both', highlight: [3], alt: 'A staff with lines and spaces numbered; space 2 highlighted between lines 2 and 3.', caption: 'Space 2 (tinted) is directly above line 2.' },
    },
    {
      title: 'Find the space',
      body: [
        'To name a space quickly, look at the line just below it. Its number is the space number.',
        'The top space, between line 4 and line 5, is space 4.',
      ],
      figure: { kind: 'staff', highlight: [7], numbers: 'lines', alt: 'A staff with the top space highlighted.', caption: 'The line below this space is line 4, so this is space 4.' },
    },
  ],
  practice: [
    locate('l3p1', 1, 'Tap space 1.', 'spaces'),
    whichSpace('l3p2', 5),
    {
      kind: 'choice', id: 'l3p3', prompt: 'Space 2 lies between which two lines?',
      options: [
        { id: '12', text: 'Lines 1 and 2', feedback: 'Between lines 1 and 2 is space 1. Space n lies above line n.' },
        { id: '23', text: 'Lines 2 and 3' },
        { id: '34', text: 'Lines 3 and 4', feedback: 'Between lines 3 and 4 is space 3.' },
      ],
      answer: '23',
      explanation: 'Space 2 sits directly above line 2, so it is between line 2 and line 3.',
    },
    locate('l3p4', 7, 'Tap space 4.'),
  ],
  challenge: [
    whichSpace('l3c1', 7),
    whichSpace('l3c2', 1),
    locate('l3c3', 5, 'Tap space 3.'),
    {
      kind: 'choice', id: 'l3c4', prompt: 'Which space lies between line 3 and line 4?',
      options: [
        { id: '2', text: 'Space 2', feedback: 'Space 2 is between lines 2 and 3, one gap lower.' },
        { id: '3', text: 'Space 3' },
        { id: '4', text: 'Space 4', feedback: 'Space 4 is between lines 4 and 5, one gap higher.' },
      ],
      answer: '3',
      explanation: 'The space directly above line 3 is space 3.',
    },
    locate('l3c5', 3, 'Tap space 2.'),
    {
      kind: 'choice', id: 'l3c6', prompt: 'What is directly below line 4?',
      options: [
        { id: 's3', text: 'Space 3' },
        { id: 's4', text: 'Space 4', feedback: 'Space 4 is above line 4. Below line 4 is the space above line 3.' },
        { id: 'l3', text: 'Line 3', feedback: 'Lines never touch each other — there is always a space between two lines.' },
      ],
      answer: 's3',
      explanation: 'Below line 4 is the gap between line 3 and line 4: space 3.',
    },
  ],
};
