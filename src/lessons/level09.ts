import type { Lesson } from './types';

export const level09: Lesson = {
  level: 9,
  title: 'Reading Melodic Shape',
  objective: 'Describe how a short melody moves: its direction, and whether it repeats, steps or skips.',
  intro: [
    'You can now describe a single move between two notes. Real melodies are chains of moves, and together they make a shape — musicians call it the contour.',
    'Reading the shape of a phrase before you read every note is one of the most useful habits a musician can have.',
  ],
  steps: [
    {
      title: 'One move at a time',
      body: [
        'Describe a melody by naming each move in turn: **repeat**, **step** or **skip**, and whether it goes **up** or **down**.',
        'The melody below goes: step up, step up, repeat, skip down.',
      ],
      figure: { kind: 'staff', notes: [2, 3, 4, 4, 2], arcs: [{ from: 0, label: 'step' }, { from: 1, label: 'step' }, { from: 2, label: 'repeat' }, { from: 3, label: 'skip' }], alt: 'Five notes: line 2, space 2, line 3, line 3, line 2.', caption: 'Step up, step up, repeat, skip down.' },
    },
    {
      title: 'The overall shape',
      body: [
        'Step back and look at the whole line. Does it **rise**, **fall**, rise then fall (an **arch**), or fall then rise (a **valley**)?',
        'The melody below rises to a peak and comes back down: an arch.',
      ],
      figure: { kind: 'staff', notes: [1, 3, 5, 3, 1], alt: 'Five notes rising from space 1 to space 3 and falling back.', caption: 'An arch: up to space 3, then back down.' },
    },
    {
      title: 'Repeated notes',
      body: [
        'When two notes in a row sit in exactly the same place, the melody **repeats** that pitch. It neither rises nor falls.',
        'Repeated notes are easy to spot: the heads line up at the same height.',
      ],
      figure: { kind: 'staff', notes: [5, 5, 5, 4], alt: 'Three notes in space 3, then one on line 3.', caption: 'Three repeated notes, then a step down.' },
    },
  ],
  practice: [
    {
      kind: 'choice', id: 'l9p1', prompt: 'What is the overall direction of this melody?',
      figure: { kind: 'staff', notes: [0, 1, 2, 3, 4], alt: 'Five notes from line 1 rising to line 3.' },
      options: [
        { id: 'up', text: 'Rising' },
        { id: 'down', text: 'Falling', feedback: 'Each note is higher than the one before it, so the line rises.' },
        { id: 'arch', text: 'An arch', feedback: 'An arch comes back down at the end. This melody keeps climbing.' },
      ],
      answer: 'up',
      explanation: 'From line 1 to line 3, every move goes up: a rising melody.',
    },
    {
      kind: 'choice', id: 'l9p2', prompt: 'How does note 2 relate to note 1?',
      figure: { kind: 'staff', notes: [6, 6], noteLabels: true, alt: 'Two notes, both on line 4.' },
      options: [
        { id: 'repeat', text: 'It repeats the same pitch' },
        { id: 'step', text: 'It moves by a step', feedback: 'A step moves to the next position. These two notes are in the same place.' },
        { id: 'up', text: 'It is higher', feedback: 'Both heads are at the same height, on line 4.' },
      ],
      answer: 'repeat',
      explanation: 'Both notes are on line 4, so the pitch repeats.',
    },
    {
      kind: 'choice', id: 'l9p3', prompt: 'What is the last move in this melody (note 3 to note 4)?',
      figure: { kind: 'staff', notes: [8, 7, 6, 4], noteLabels: true, alt: 'Four numbered notes: line 5, space 4, line 4, line 3.' },
      options: [
        { id: 'step-down', text: 'Step down', feedback: 'Line 4 to line 3 passes over space 3, so it is a skip, not a step.' },
        { id: 'skip-down', text: 'Skip down' },
        { id: 'skip-up', text: 'Skip up', feedback: 'Note 4 is lower than note 3, so it moves down.' },
      ],
      answer: 'skip-down',
      explanation: 'Note 3 is on line 4 and note 4 on line 3. Line to line, one space passed over, going down: a skip down.',
    },
    {
      kind: 'choice', id: 'l9p4', prompt: 'Which word describes this melody’s shape?',
      figure: { kind: 'staff', notes: [3, 4, 5, 4, 3], alt: 'Five notes: space 2, line 3, space 3, line 3, space 2.' },
      options: [
        { id: 'arch', text: 'Arch (up, then down)' },
        { id: 'valley', text: 'Valley (down, then up)', feedback: 'A valley dips down first. This melody climbs first, then returns.' },
        { id: 'flat', text: 'Flat (repeated notes)', feedback: 'The notes change position each time — none are repeated.' },
      ],
      answer: 'arch',
      explanation: 'It climbs by steps to space 3 and steps back down: an arch.',
    },
  ],
  challenge: [
    {
      kind: 'choice', id: 'l9c1', prompt: 'How does this melody move?',
      figure: { kind: 'staff', notes: [7, 6, 5, 4], alt: 'Four notes: space 4, line 4, space 3, line 3.' },
      options: [
        { id: 'down-steps', text: 'Down by steps' },
        { id: 'down-skips', text: 'Down by skips', feedback: 'Each move goes from a space to a line or a line to a space — always the next position. Those are steps.' },
        { id: 'up-steps', text: 'Up by steps', feedback: 'Each note is lower than the last, so it moves down.' },
      ],
      answer: 'down-steps',
      explanation: 'Space 4 → line 4 → space 3 → line 3: every move is to the next position down.',
    },
    {
      kind: 'choice', id: 'l9c2', prompt: 'Which describes this melody?',
      figure: { kind: 'staff', notes: [4, 4, 4], alt: 'Three notes, all on line 3.' },
      options: [
        { id: 'repeat', text: 'The same pitch repeated' },
        { id: 'steps', text: 'Small steps up', feedback: 'All three heads sit on the same line — the pitch doesn’t change.' },
        { id: 'arch', text: 'An arch', feedback: 'An arch rises and falls. These notes stay level.' },
      ],
      answer: 'repeat',
      explanation: 'All three notes are on line 3: one pitch, repeated.',
    },
    {
      kind: 'choice', id: 'l9c3', prompt: 'What is the first move, from note 1 to note 2?',
      figure: { kind: 'staff', notes: [2, 4, 3], noteLabels: true, alt: 'Three numbered notes: line 2, line 3, space 2.' },
      options: [
        { id: 'step-up', text: 'Step up', feedback: 'Line 2 to line 3 passes over space 2, so it is a skip.' },
        { id: 'skip-up', text: 'Skip up' },
        { id: 'skip-down', text: 'Skip down', feedback: 'Note 2 is higher than note 1.' },
      ],
      answer: 'skip-up',
      explanation: 'Line 2 to line 3: line to line, one space passed over, going up — a skip up.',
    },
    {
      kind: 'choice', id: 'l9c4', prompt: 'In the same melody, what is the move from note 2 to note 3?',
      figure: { kind: 'staff', notes: [2, 4, 3], noteLabels: true, alt: 'Three numbered notes: line 2, line 3, space 2.' },
      options: [
        { id: 'step-down', text: 'Step down' },
        { id: 'skip-down', text: 'Skip down', feedback: 'Line 3 to space 2 is a move to the very next position: a step.' },
        { id: 'step-up', text: 'Step up', feedback: 'Note 3 is lower than note 2.' },
      ],
      answer: 'step-down',
      explanation: 'Line 3 to space 2: line to the neighbouring space, going down — a step down.',
    },
    {
      kind: 'choice', id: 'l9c5', prompt: 'Which word describes this melody’s shape?',
      figure: { kind: 'staff', notes: [6, 4, 2, 4, 6], alt: 'Five notes: line 4, line 3, line 2, line 3, line 4.' },
      options: [
        { id: 'arch', text: 'Arch (up, then down)', feedback: 'An arch goes up first. This melody goes down first.' },
        { id: 'valley', text: 'Valley (down, then up)' },
        { id: 'falling', text: 'Falling', feedback: 'It does fall at first, but then climbs back to where it started.' },
      ],
      answer: 'valley',
      explanation: 'It skips down from line 4 to line 2 and skips back up to line 4: a valley.',
    },
    {
      kind: 'choice', id: 'l9c6', prompt: 'How does this melody move?',
      figure: { kind: 'staff', notes: [2, 3, 2, 3], alt: 'Four notes alternating between line 2 and space 2.' },
      options: [
        { id: 'alt', text: 'Steps, alternating up and down' },
        { id: 'skips', text: 'Skips, alternating up and down', feedback: 'Line 2 and space 2 are neighbours, so each move is a step.' },
        { id: 'rising', text: 'Rising by steps', feedback: 'It goes up, then back down, then up again — not steadily rising.' },
      ],
      answer: 'alt',
      explanation: 'Line 2 → space 2 → line 2 → space 2: a step up, a step down, a step up.',
    },
  ],
};
