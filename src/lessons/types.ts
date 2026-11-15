/**
 * Lesson content schema.
 *
 * Staff positions are integers counted in steps from the bottom line:
 *   -1 = space below the staff, 0 = line 1, 1 = space 1, 2 = line 2, … 8 = line 5, 9 = space above.
 * Figures and answers share these numbers, so a question's picture can never
 * disagree with its answer key.
 */
export type Pos = number;

export interface StaffFigure {
  kind: 'staff';
  /** Whole-note heads, drawn left to right. */
  notes?: Pos[];
  /** Lines/spaces to tint (no note drawn). */
  highlight?: Pos[];
  /** Print line and/or space numbers beside the staff. */
  numbers?: 'lines' | 'spaces' | 'both';
  /** Print 1, 2, 3… under the notes so questions can refer to them. */
  noteLabels?: boolean;
  /** Arcs between consecutive notes, labelled (e.g. "step"). Index i joins note i and i+1. */
  arcs?: { from: number; label: string }[];
  /** Required text alternative. */
  alt: string;
  caption?: string;
}

export type Figure = StaffFigure;

export interface ChoiceOption {
  id: string;
  text: string;
  /** Shown when this (wrong) option is chosen: explains the specific mistake. */
  feedback?: string;
}

export interface ChoiceQuestion {
  kind: 'choice';
  id: string;
  prompt: string;
  figure?: Figure;
  options: ChoiceOption[];
  answer: string;
  /** Why the right answer is right. Always shown after answering. */
  explanation: string;
}

/** Tap a line or space on an empty staff. */
export interface LocateQuestion {
  kind: 'locate';
  id: string;
  prompt: string;
  answer: Pos;
  explanation: string;
  /** Show line/space numbers as a scaffold. */
  numbers?: 'lines' | 'spaces' | 'both';
}

export type Question = ChoiceQuestion | LocateQuestion;

export interface LessonStep {
  title: string;
  /** Paragraphs. `**bold**` is supported. */
  body: string[];
  figure?: Figure;
  tip?: string;
}

export interface Lesson {
  level: number;
  title: string;
  /** "You will be able to…" — one sentence. */
  objective: string;
  intro: string[];
  steps: LessonStep[];
  practice: Question[];
  challenge: Question[];
  /** Percentage needed to pass the challenge. Default 60; checkpoints use more. */
  passMark?: number;
}

export type Answer = string | number;
