import type { Lesson } from './types';
import { classifyMove, lineOrSpace, locate, namePosition, pickNote, whichLine, whichSpace } from './helpers';

export const level10: Lesson = {
  level: 10,
  title: 'Checkpoint: The Staff',
  objective: 'Show that you can use everything from Unit 1: lines, spaces, positions, pitch, steps and skips.',
  intro: [
    'This is the checkpoint for Unit 1. It brings together everything from the last nine levels.',
    'The challenge is a little longer and needs 70% to pass. Take your time — there is no clock.',
  ],
  steps: [
    {
      title: 'Recap: the staff',
      body: [
        'Five **lines** and four **spaces**, both counted **from the bottom**. Space n sits directly above line n.',
        'A **line note** has a line through its middle; a **space note** sits between two lines.',
      ],
      figure: { kind: 'staff', numbers: 'both', notes: [4, 5], noteLabels: true, alt: 'A numbered staff with a line note on line 3 and a space note in space 3.', caption: 'Note 1: line 3. Note 2: space 3.' },
    },
    {
      title: 'Recap: movement',
      body: [
        '**Higher** on the staff = **higher** pitch. Same position = same pitch (a repeat).',
        'A **step** changes type (line ↔ space). A **skip** keeps the type and passes over one position. Anything bigger is a **leap**.',
      ],
      figure: { kind: 'staff', notes: [2, 3, 5, 5], arcs: [{ from: 0, label: 'step' }, { from: 1, label: 'skip' }, { from: 2, label: 'repeat' }], alt: 'Notes on line 2, space 2, space 3, space 3, labelled step, skip, repeat.', caption: 'Step, skip, repeat.' },
    },
  ],
  practice: [
    whichSpace('l10p1', 3, 'Warm-up: which space is highlighted?'),
    classifyMove('l10p2', 4, 6, ['step', 'skip']),
    pickNote('l10p3', [6, 2, 4], 'highest'),
  ],
  challenge: [
    {
      kind: 'choice', id: 'l10c1', prompt: 'How many lines and spaces does a staff have?',
      options: [
        { id: '54', text: '5 lines, 4 spaces' },
        { id: '45', text: '4 lines, 5 spaces', feedback: 'Reversed: five lines create four spaces between them.' },
        { id: '55', text: '5 lines, 5 spaces', feedback: 'Spaces only exist between lines, so there is one fewer space than lines.' },
      ],
      answer: '54',
      explanation: 'Five lines, and four spaces between them.',
    },
    whichLine('l10c2', 6),
    locate('l10c3', 3, 'Tap space 2.'),
    lineOrSpace('l10c4', 7, 'note'),
    namePosition('l10c5', 2),
    pickNote('l10c6', [5, 2, 7], 'lowest'),
    classifyMove('l10c7', 3, 5, ['step', 'skip', 'leap']),
    {
      kind: 'choice', id: 'l10c8', prompt: 'How does this melody move?',
      figure: { kind: 'staff', notes: [1, 2, 3, 5, 7], alt: 'Five notes: space 1, line 2, space 2, space 3, space 4.' },
      options: [
        { id: 'steps-skips', text: 'Up by steps, then up by skips' },
        { id: 'skips-steps', text: 'Up by skips, then up by steps', feedback: 'Check the first moves: space 1 → line 2 → space 2 change type each time, so they are steps.' },
        { id: 'steps', text: 'Up by steps all the way', feedback: 'The last moves are space to space (space 2 → 3 → 4), which are skips.' },
      ],
      answer: 'steps-skips',
      explanation: 'Space 1 → line 2 → space 2 are steps; space 2 → space 3 → space 4 are skips. All moves go up.',
    },
  ],
  passMark: 70,
};
