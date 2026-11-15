import type { Lesson } from './types';
import { pickNote } from './helpers';

export const level06: Lesson = {
  level: 6,
  title: 'Higher and Lower',
  objective: 'Compare notes by their height on the staff and say which sounds higher or lower.',
  intro: [
    'So far the staff has been a map of places. Now you will hear what those places mean.',
    'Pitch is how high or low a sound is. A whistle is high; a bass drum is low. The staff shows pitch by height.',
  ],
  steps: [
    {
      title: 'Higher on the staff, higher in pitch',
      body: [
        'A note placed **higher** on the staff sounds **higher**. A note placed **lower** sounds **lower**.',
        'Every move up the staff, even to the very next space, raises the pitch.',
      ],
      figure: { kind: 'staff', notes: [1, 6], noteLabels: true, alt: 'Note 1 in space 1, note 2 on line 4.', caption: 'Note 2 is higher on the staff, so it sounds higher than note 1.' },
    },
    {
      title: 'Same place, same pitch',
      body: [
        'Two notes in exactly the same position have the **same pitch**. Musicians call this a repeated note.',
        'Pitch is not loudness or length — a note can be high and quiet, or low and long.',
      ],
      figure: { kind: 'staff', notes: [5, 5], noteLabels: true, alt: 'Two notes both in space 3.', caption: 'Both notes are in space 3: same pitch.' },
    },
    {
      title: 'Comparing several notes',
      body: [
        'To find the highest note in a group, scan for the one sitting highest on the staff. For the lowest, find the one nearest the bottom.',
        'Comparing heights is something your eye can do in a fraction of a second, even before you can name the notes.',
      ],
      figure: { kind: 'staff', notes: [3, 7, 0], noteLabels: true, alt: 'Three numbered notes: space 2, space 4, line 1.', caption: 'Note 2 is the highest; note 3 is the lowest.' },
    },
  ],
  practice: [
    pickNote('l6p1', [2, 6], 'higher'),
    pickNote('l6p2', [7, 3], 'lower'),
    {
      kind: 'choice', id: 'l6p3', prompt: 'Compare these two notes.',
      figure: { kind: 'staff', notes: [4, 4], noteLabels: true, alt: 'Two notes, both on line 3.' },
      options: [
        { id: 'first', text: 'Note 1 is higher', feedback: 'Look again: both heads are cut by the same line.' },
        { id: 'second', text: 'Note 2 is higher', feedback: 'Look again: both heads are cut by the same line.' },
        { id: 'same', text: 'They have the same pitch' },
      ],
      answer: 'same',
      explanation: 'Both notes are on line 3, the same position, so they have the same pitch.',
    },
    {
      kind: 'choice', id: 'l6p4', prompt: 'A melody moves from a note on line 1 to a note on line 5. What happens to the sound?',
      options: [
        { id: 'higher', text: 'It gets higher' },
        { id: 'lower', text: 'It gets lower', feedback: 'Line 5 is the top line. Moving up the staff raises the pitch.' },
        { id: 'louder', text: 'It gets louder', feedback: 'Height on the staff changes pitch, not volume.' },
      ],
      answer: 'higher',
      explanation: 'Line 5 is above line 1, so the melody climbs in pitch.',
    },
  ],
  challenge: [
    pickNote('l6c1', [5, 1], 'higher'),
    pickNote('l6c2', [4, 1, 6], 'lowest'),
    pickNote('l6c3', [3, 7, 5], 'highest'),
    {
      kind: 'choice', id: 'l6c4', prompt: 'A note sits higher on the staff than another. That means it is…',
      options: [
        { id: 'pitch', text: 'Higher in pitch' },
        { id: 'loud', text: 'Louder', feedback: 'Loudness has its own markings (dynamics). Height means pitch.' },
        { id: 'long', text: 'Longer', feedback: 'Length is shown by the note’s shape, not its height.' },
        { id: 'fast', text: 'Faster', feedback: 'Speed (tempo) is marked separately. Height means pitch.' },
      ],
      answer: 'pitch',
      explanation: 'Height on the staff shows pitch only.',
    },
    pickNote('l6c5', [8, 0], 'lower'),
    {
      kind: 'choice', id: 'l6c6', prompt: 'Which pair of notes has the same pitch?',
      figure: { kind: 'staff', notes: [2, 6, 3, 6], noteLabels: true, alt: 'Four numbered notes.' },
      options: [
        { id: '12', text: 'Notes 1 and 2', feedback: 'Note 1 is on line 2; note 2 is on line 4.' },
        { id: '24', text: 'Notes 2 and 4' },
        { id: '13', text: 'Notes 1 and 3', feedback: 'Close neighbours, but note 1 is on line 2 and note 3 is in space 2.' },
      ],
      answer: '24',
      explanation: 'Notes 2 and 4 are both on line 4 — same position, same pitch.',
    },
  ],
};
