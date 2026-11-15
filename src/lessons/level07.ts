import type { Lesson } from './types';
import { classifyMove } from './helpers';

export const level07: Lesson = {
  level: 7,
  title: 'Steps',
  objective: 'Recognise a step: a move to the very next line or space, up or down.',
  intro: [
    'Melodies are made of movement from one note to the next. The smallest possible move on the staff is called a step.',
    'Most tunes you know — from nursery rhymes to national anthems — are built mainly from steps.',
  ],
  steps: [
    {
      title: 'What a step is',
      body: [
        'A **step** moves from a note to its nearest neighbour: from a line to the space right next to it, or from a space to the line right next to it.',
        'Nothing is skipped over. It is the smallest move the staff can show.',
      ],
      figure: { kind: 'staff', notes: [2, 3], noteLabels: true, arcs: [{ from: 0, label: 'step' }], alt: 'Note 1 on line 2, note 2 in space 2, joined by an arc labelled step.', caption: 'Line 2 to space 2: a step up.' },
    },
    {
      title: 'Line ↔ space, every time',
      body: [
        'Because lines and spaces alternate, a step **always** changes type: line to space, or space to line.',
        'That gives you a quick test. Two line notes, or two space notes, can never be a step.',
      ],
      figure: { kind: 'staff', notes: [5, 4], noteLabels: true, arcs: [{ from: 0, label: 'step' }], alt: 'Note 1 in space 3, note 2 on line 3, labelled step.', caption: 'Space 3 down to line 3: a step down.' },
    },
    {
      title: 'Steps in a row',
      body: [
        'A run of steps in one direction moves smoothly up or down the staff, like walking up a staircase one stair at a time.',
      ],
      figure: { kind: 'staff', notes: [0, 1, 2, 3], arcs: [{ from: 0, label: 'step' }, { from: 1, label: 'step' }, { from: 2, label: 'step' }], alt: 'Four notes climbing by steps from line 1 to space 2.', caption: 'Four notes climbing by step.' },
    },
  ],
  practice: [
    {
      ...classifyMove('l7p1', 2, 3, ['step', 'skip']),
      prompt: 'Is this a step?',
      options: [{ id: 'step', text: 'Yes, a step' }, { id: 'skip', text: 'No', feedback: 'Note 1 is on line 2 and note 2 is in the very next space, space 2. Nothing is skipped, so it is a step.' }],
    },
    {
      kind: 'choice', id: 'l7p2', prompt: 'Is this a step?',
      figure: { kind: 'staff', notes: [2, 4], noteLabels: true, alt: 'Note 1 on line 2, note 2 on line 3.' },
      options: [
        { id: 'yes', text: 'Yes', feedback: 'Both notes are line notes. A step always goes from a line to a space or a space to a line.' },
        { id: 'no', text: 'No' },
      ],
      answer: 'no',
      explanation: 'Line 2 to line 3 passes over space 2. A step must move to the very next position.',
    },
    classifyMove('l7p3', 6, 5, ['step'], true),
    {
      kind: 'choice', id: 'l7p4', prompt: 'Start in space 2 and move one step up. Where do you land?',
      options: [
        { id: 'l3', text: 'Line 3' },
        { id: 's3', text: 'Space 3', feedback: 'Space 3 is two positions up — that would pass over line 3.' },
        { id: 'l2', text: 'Line 2', feedback: 'Line 2 is one step down from space 2, not up.' },
      ],
      answer: 'l3',
      explanation: 'The next position above space 2 is line 3.',
    },
  ],
  challenge: [
    {
      kind: 'choice', id: 'l7c1', prompt: 'Is this a step?',
      figure: { kind: 'staff', notes: [4, 5], noteLabels: true, alt: 'Note 1 on line 3, note 2 in space 3.' },
      options: [
        { id: 'yes', text: 'Yes' },
        { id: 'no', text: 'No', feedback: 'Line 3 to space 3 is a move to the very next position: a step.' },
      ],
      answer: 'yes',
      explanation: 'Line 3 to space 3: line to the neighbouring space, a step.',
    },
    {
      kind: 'choice', id: 'l7c2', prompt: 'Is this a step?',
      figure: { kind: 'staff', notes: [1, 3], noteLabels: true, alt: 'Note 1 in space 1, note 2 in space 2.' },
      options: [
        { id: 'yes', text: 'Yes', feedback: 'Both are space notes, with line 2 between them. Space-to-space can never be a step.' },
        { id: 'no', text: 'No' },
      ],
      answer: 'no',
      explanation: 'Space 1 to space 2 passes over line 2, so it is not a step.',
    },
    classifyMove('l7c3', 7, 6, ['step'], true),
    {
      kind: 'choice', id: 'l7c4', prompt: 'Start on line 4 and move one step down. Where do you land?',
      options: [
        { id: 's4', text: 'Space 4', feedback: 'Space 4 is one step up from line 4.' },
        { id: 's3', text: 'Space 3' },
        { id: 'l3', text: 'Line 3', feedback: 'Line 3 is two positions down — you would pass over space 3.' },
      ],
      answer: 's3',
      explanation: 'Directly below line 4 is space 3.',
    },
    {
      kind: 'choice', id: 'l7c5', prompt: 'A step always moves between…',
      options: [
        { id: 'ls', text: 'A line and a space' },
        { id: 'll', text: 'Two lines', feedback: 'Two lines always have a space between them, so line-to-line passes over a position.' },
        { id: 'ss', text: 'Two spaces', feedback: 'Two spaces always have a line between them.' },
      ],
      answer: 'ls',
      explanation: 'Lines and spaces alternate, so the nearest neighbour of a line is a space and vice versa.',
    },
    {
      kind: 'choice', id: 'l7c6', prompt: 'How does this melody move?',
      figure: { kind: 'staff', notes: [8, 7, 6, 5], alt: 'Four notes from line 5 down to space 3.' },
      options: [
        { id: 'up', text: 'Up by steps', feedback: 'Each note is lower than the one before, so the melody is going down.' },
        { id: 'down', text: 'Down by steps' },
        { id: 'skips', text: 'Down by bigger jumps', feedback: 'Each move goes to the very next position (line to space to line), so these are steps.' },
      ],
      answer: 'down',
      explanation: 'Line 5 → space 4 → line 4 → space 3: each move is to the next position down, so the melody falls by steps.',
    },
  ],
};
