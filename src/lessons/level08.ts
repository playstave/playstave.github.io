import type { Lesson } from './types';
import { classifyMove } from './helpers';

export const level08: Lesson = {
  level: 8,
  title: 'Skips',
  objective: 'Recognise a skip — jumping over exactly one line or space — and tell it apart from a step.',
  intro: [
    'Melodies don’t only walk; sometimes they hop. The smallest hop on the staff is called a skip.',
    'Being able to see steps and skips instantly is the start of real sight-reading.',
  ],
  steps: [
    {
      title: 'What a skip is',
      body: [
        'A **skip** jumps over exactly one position: from a line to the next line, or from a space to the next space.',
        'The position in between is passed over, not played.',
      ],
      figure: { kind: 'staff', notes: [2, 4], noteLabels: true, arcs: [{ from: 0, label: 'skip' }], alt: 'Note 1 on line 2, note 2 on line 3, labelled skip.', caption: 'Line 2 to line 3 skips over space 2.' },
    },
    {
      title: 'Same type, every time',
      body: [
        'A skip **never changes type**: line to line, or space to space. A step always changes type.',
        'So the quick test is: different types → step. Same type, next one along → skip.',
      ],
      figure: { kind: 'staff', notes: [3, 5], noteLabels: true, arcs: [{ from: 0, label: 'skip' }], alt: 'Note 1 in space 2, note 2 in space 3, labelled skip.', caption: 'Space 2 to space 3 skips over line 3.' },
    },
    {
      title: 'Bigger than a skip: a leap',
      body: [
        'Any move larger than a skip is called a **leap**. Line 1 to line 4, for example, passes over several positions.',
        'For now it is enough to spot that a leap is bigger than a skip. Later you will measure leaps exactly as intervals.',
      ],
      figure: { kind: 'staff', notes: [0, 6], noteLabels: true, arcs: [{ from: 0, label: 'leap' }], alt: 'Note 1 on line 1, note 2 on line 4, labelled leap.', caption: 'Line 1 to line 4: a leap.' },
    },
  ],
  practice: [
    classifyMove('l8p1', 2, 4, ['step', 'skip']),
    classifyMove('l8p2', 3, 4, ['step', 'skip']),
    classifyMove('l8p3', 5, 3, ['skip'], true),
    {
      kind: 'choice', id: 'l8p4', prompt: 'Start on line 2 and skip up. Where do you land?',
      options: [
        { id: 's2', text: 'Space 2', feedback: 'Space 2 is one step up from line 2. A skip passes over that space.' },
        { id: 'l3', text: 'Line 3' },
        { id: 's3', text: 'Space 3', feedback: 'That is three positions up — further than a skip.' },
      ],
      answer: 'l3',
      explanation: 'Skipping up from line 2 passes over space 2 and lands on the next line, line 3.',
    },
  ],
  challenge: [
    classifyMove('l8c1', 1, 3, ['step', 'skip', 'leap']),
    classifyMove('l8c2', 6, 7, ['step', 'skip', 'leap']),
    classifyMove('l8c3', 8, 6, ['step', 'skip'], true),
    {
      kind: 'choice', id: 'l8c4', prompt: 'Start in space 1 and skip up. Where do you land?',
      options: [
        { id: 'l2', text: 'Line 2', feedback: 'Line 2 is a step up from space 1. A skip passes over it.' },
        { id: 's2', text: 'Space 2' },
        { id: 'l3', text: 'Line 3', feedback: 'That passes over two positions — further than a skip.' },
      ],
      answer: 's2',
      explanation: 'A skip from a space lands in the next space: space 1 → space 2, passing over line 2.',
    },
    classifyMove('l8c5', 0, 6, ['step', 'skip', 'leap']),
    {
      kind: 'choice', id: 'l8c6', prompt: 'How does this melody move?',
      figure: { kind: 'staff', notes: [0, 2, 4, 6], alt: 'Four line notes climbing from line 1 to line 4.' },
      options: [
        { id: 'steps', text: 'Up by steps', feedback: 'Every note is a line note. Line to line passes over a space each time — that is a skip, not a step.' },
        { id: 'skips', text: 'Up by skips' },
        { id: 'down', text: 'Down by skips', feedback: 'Each note is higher than the last, so the melody rises.' },
      ],
      answer: 'skips',
      explanation: 'Line 1 → line 2 → line 3 → line 4: each move passes over one space, so the melody climbs by skips.',
    },
  ],
};
