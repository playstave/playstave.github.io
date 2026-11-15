import type { Lesson } from './types';
import { lineOrSpace } from './helpers';

export const level01: Lesson = {
  level: 1,
  title: 'Meet the Staff',
  objective: 'Recognise the staff and count its five lines and four spaces.',
  intro: [
    'Every piece of written music — a pop song, a hymn, a symphony — sits on the same foundation: five straight lines called the staff.',
    'In this lesson you will learn what the staff is, what its parts are called, and what it tells a musician before a single note is played.',
  ],
  steps: [
    {
      title: 'Five lines',
      body: [
        'The **staff** is a set of five horizontal lines, evenly spaced, running across the page.',
        'Musicians in Britain often call it a **stave**. Both words mean exactly the same thing.',
      ],
      figure: { kind: 'staff', alt: 'An empty five-line staff.', caption: 'An empty staff: five lines, nothing written on it yet.' },
    },
    {
      title: 'Four spaces',
      body: [
        'The gaps between the lines are called **spaces**. Five lines create four gaps, so every staff has **four spaces**.',
        'Notes can be written on a line or in a space. That gives nine places on the staff itself: 5 lines + 4 spaces.',
      ],
      figure: { kind: 'staff', highlight: [1, 3, 5, 7], alt: 'A staff with its four spaces tinted.', caption: 'The four spaces are tinted.' },
      tip: 'Five fingers, four gaps between them. Hold up a hand — it is a staff.',
    },
    {
      title: 'What the staff shows',
      body: [
        'The staff works like a graph. **Up and down** shows pitch: the higher a note sits, the higher it sounds.',
        '**Left to right** shows time. You read music the same way you read this sentence, one note after another.',
      ],
      figure: { kind: 'staff', notes: [0, 2, 4, 6, 8], alt: 'Five notes climbing from the bottom line to the top line.', caption: 'These notes climb the staff, so they get higher in sound as you read left to right.' },
    },
  ],
  practice: [
    {
      kind: 'choice', id: 'l1p1', prompt: 'How many lines does a staff have?',
      options: [
        { id: '3', text: '3', feedback: 'Count again — there are more. Picture a hand: one line for each finger.' },
        { id: '4', text: '4', feedback: 'Four is the number of spaces. There is one more line than spaces.' },
        { id: '5', text: '5' },
        { id: '6', text: '6', feedback: 'One too many. A standard staff has five lines.' },
      ],
      answer: '5',
      explanation: 'A staff always has five lines.',
    },
    {
      kind: 'choice', id: 'l1p2', prompt: 'How many spaces does a staff have?',
      figure: { kind: 'staff', alt: 'An empty five-line staff.' },
      options: [
        { id: '3', text: '3', feedback: 'Count the gaps between the lines, from bottom to top: there is one more.' },
        { id: '4', text: '4' },
        { id: '5', text: '5', feedback: 'Five is the number of lines. Five lines leave four gaps between them.' },
      ],
      answer: '4',
      explanation: 'Five lines create four gaps between them, so the staff has four spaces.',
    },
    lineOrSpace('l1p3', 3, 'highlight'),
    lineOrSpace('l1p4', 6, 'highlight'),
  ],
  challenge: [
    {
      kind: 'choice', id: 'l1c1', prompt: 'What is another name for the staff?',
      options: [
        { id: 'bar', text: 'A bar', feedback: 'A bar (or measure) is a short section of music marked off by vertical lines. You will meet bars in Unit 9.' },
        { id: 'stave', text: 'A stave' },
        { id: 'clef', text: 'A clef', feedback: 'A clef is a symbol written at the start of the staff to name its lines. That comes in Unit 3.' },
        { id: 'scale', text: 'A scale', feedback: 'A scale is a series of notes going up or down in order — not the five lines themselves.' },
      ],
      answer: 'stave',
      explanation: '"Staff" and "stave" are two names for the same five lines.',
    },
    {
      kind: 'choice', id: 'l1c2', prompt: 'What does a note’s height on the staff tell you?',
      options: [
        { id: 'pitch', text: 'How high or low it sounds' },
        { id: 'loud', text: 'How loud it is', feedback: 'Loudness is written with separate markings called dynamics (World 3). Height shows pitch.' },
        { id: 'long', text: 'How long it lasts', feedback: 'Length is shown by the shape of the note, not where it sits. Height shows pitch.' },
        { id: 'inst', text: 'Which instrument plays it', feedback: 'The staff itself doesn’t name an instrument. Height shows pitch.' },
      ],
      answer: 'pitch',
      explanation: 'Up and down on the staff is pitch: higher placement, higher sound.',
    },
    lineOrSpace('l1c3', 5, 'highlight'),
    {
      kind: 'choice', id: 'l1c4', prompt: 'In which direction do you read music on a staff?',
      options: [
        { id: 'ltr', text: 'Left to right' },
        { id: 'rtl', text: 'Right to left', feedback: 'Music is read like English text: starting at the left.' },
        { id: 'ttb', text: 'Top to bottom', feedback: 'Up and down shows pitch, not reading order. Time runs left to right.' },
      ],
      answer: 'ltr',
      explanation: 'Time runs left to right, so you read notes from left to right, like words.',
    },
    {
      kind: 'choice', id: 'l1c5', prompt: 'Counting every line and every space, how many places on the staff can hold a note?',
      options: [
        { id: '5', text: '5', feedback: 'That counts only the lines. Notes can sit in the spaces too.' },
        { id: '8', text: '8', feedback: 'Close — add the lines and spaces again: 5 + 4.' },
        { id: '9', text: '9' },
        { id: '10', text: '10', feedback: 'One too many: 5 lines + 4 spaces.' },
      ],
      answer: '9',
      explanation: '5 lines + 4 spaces = 9 places on the staff itself.',
    },
  ],
};
