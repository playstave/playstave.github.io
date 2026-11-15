/**
 * Builders for recurring question shapes. Each one derives its picture, answer
 * and feedback from the same staff positions, and writes feedback that names
 * the specific mistake a student is likely to have made.
 */
import type { ChoiceOption, ChoiceQuestion, LocateQuestion, Pos } from './types';
import { cap, isLine, lineNumber, motion, posName, spaceNumber } from './staff';

const ordinal = (n: number) => ['first', 'second', 'third', 'fourth', 'fifth'][n - 1] ?? `${n}th`;

/** "Which line is highlighted?" with options Line 1–5. */
export function whichLine(id: string, p: Pos, prompt = 'Which line is highlighted?'): ChoiceQuestion {
  const n = lineNumber(p);
  return {
    kind: 'choice', id, prompt,
    figure: { kind: 'staff', highlight: [p], alt: 'A staff with one line highlighted.' },
    options: [1, 2, 3, 4, 5].map((k) => ({
      id: `line${k}`,
      text: `Line ${k}`,
      feedback: k === 6 - n
        ? `That would be right counting from the top. Lines are always counted from the bottom: the highlighted line is the ${ordinal(6 - k)} from the top, which makes it line ${n}.`
        : `Count again, starting with the bottom line as 1 and going up.`,
    })),
    answer: `line${n}`,
    explanation: `Counting up from the bottom line: ${Array.from({ length: n }, (_, i) => i + 1).join(', ')}. The highlighted line is line ${n}.`,
  };
}

/** "Which space is highlighted?" with options Space 1–4. */
export function whichSpace(id: string, p: Pos, prompt = 'Which space is highlighted?'): ChoiceQuestion {
  const n = spaceNumber(p);
  return {
    kind: 'choice', id, prompt,
    figure: { kind: 'staff', highlight: [p], alt: 'A staff with one space highlighted.' },
    options: [1, 2, 3, 4].map((k) => ({
      id: `space${k}`,
      text: `Space ${k}`,
      feedback: k === 5 - n
        ? `That is counting from the top. Spaces are counted from the bottom, so this is space ${n}.`
        : `Count the gaps from the bottom. The highlighted space lies between line ${n} and line ${n + 1}.`,
    })),
    answer: `space${n}`,
    explanation: `The highlighted space sits between line ${n} and line ${n + 1}, so it is space ${n}. Space n always lies just above line n.`,
  };
}

/** Line or space? Either a tinted band or a note head. */
export function lineOrSpace(id: string, p: Pos, show: 'highlight' | 'note'): ChoiceQuestion {
  const line = isLine(p);
  const noteText = line
    ? `The line passes straight through the middle of the note head, so this is a line note (on ${posName(p)}).`
    : `The note head sits between two lines and touches both, but no line passes through it, so this is a space note (in ${posName(p)}).`;
  const bandText = line ? `The highlight runs along one of the five lines.` : `The highlight fills the gap between two lines — a space.`;
  return {
    kind: 'choice', id,
    prompt: show === 'note' ? 'Is this note on a line or in a space?' : 'Is the highlighted part a line or a space?',
    figure: show === 'note'
      ? { kind: 'staff', notes: [p], alt: 'A staff with a single whole note.' }
      : { kind: 'staff', highlight: [p], alt: 'A staff with one part highlighted.' },
    options: [
      { id: 'line', text: show === 'note' ? 'On a line' : 'A line', feedback: show === 'note' ? 'Look closely: is there a line cutting through the note head? Here the lines only touch its top and bottom edges.' : 'A line is a thin stroke. This highlight is a whole gap between two lines.' },
      { id: 'space', text: show === 'note' ? 'In a space' : 'A space', feedback: show === 'note' ? 'If the note were in a space, no line would pass through it. Here a line runs through the middle of the head.' : 'A space is the gap between two lines. This highlight follows a line itself.' },
    ],
    answer: line ? 'line' : 'space',
    explanation: show === 'note' ? noteText : bandText,
  };
}

/** Name a note's exact position, with options built from the usual confusions. */
export function namePosition(id: string, p: Pos, prompt = 'Where is this note?'): ChoiceQuestion {
  const candidates = new Set<Pos>([p, 8 - p, p + 1 <= 8 ? p + 1 : p - 1, p - 1 >= 0 ? p - 1 : p + 2]);
  for (let extra = 0; candidates.size < 4; extra++) candidates.add((p + 3 + extra) % 9);
  const opts: ChoiceOption[] = [...candidates].slice(0, 4).sort((a, b) => a - b).map((c) => ({
    id: `pos${c}`,
    text: cap(posName(c)),
    feedback: c === 8 - p
      ? `${cap(posName(c))} is where the note would be if you counted from the top. Count from the bottom instead.`
      : Math.abs(c - p) === 1
        ? `${cap(posName(c))} is right next to it. Check first whether a line passes through the note head (line note) or not (space note), then count.`
        : `Start again: decide line or space, then count up from the bottom.`,
  }));
  return {
    kind: 'choice', id, prompt,
    figure: { kind: 'staff', notes: [p], alt: 'A staff with a single whole note.' },
    options: opts,
    answer: `pos${p}`,
    explanation: isLine(p)
      ? `A line runs through the note head, so it is a line note. Counting lines from the bottom, it is on ${posName(p)}.`
      : `No line passes through the head, so it is a space note. It sits between line ${spaceNumber(p)} and line ${spaceNumber(p) + 1}: ${posName(p)}.`,
  };
}

/** Tap a named line or space. */
export function locate(id: string, p: Pos, prompt?: string, numbers?: LocateQuestion['numbers']): LocateQuestion {
  return {
    kind: 'locate', id, answer: p, numbers,
    prompt: prompt ?? `Tap ${posName(p)}.`,
    explanation: isLine(p)
      ? `${cap(posName(p))}: count the lines up from the bottom — ${Array.from({ length: lineNumber(p) }, (_, i) => i + 1).join(', ')}.`
      : `${cap(posName(p))} is the gap between line ${spaceNumber(p)} and line ${spaceNumber(p) + 1}.`,
  };
}

/** Pick the highest/lowest of 2–3 labelled notes. */
export function pickNote(id: string, notes: Pos[], want: 'higher' | 'lower' | 'highest' | 'lowest'): ChoiceQuestion {
  const target = want === 'higher' || want === 'highest' ? Math.max(...notes) : Math.min(...notes);
  const idx = notes.indexOf(target);
  const up = want === 'higher' || want === 'highest';
  return {
    kind: 'choice', id,
    prompt: notes.length === 2 ? `Which note sounds ${want}?` : `Which note is the ${want}?`,
    figure: { kind: 'staff', notes, noteLabels: true, alt: `A staff with ${notes.length} numbered notes.` },
    options: notes.map((p, i) => ({
      id: `n${i + 1}`,
      text: `Note ${i + 1}`,
      feedback: `Note ${i + 1} is on ${posName(p)}. Note ${idx + 1} sits ${up ? 'higher' : 'lower'} on the staff (${posName(target)}), so it sounds ${up ? 'higher' : 'lower'}.`,
    })),
    answer: `n${idx + 1}`,
    explanation: `Note ${idx + 1} is on ${posName(target)}, ${up ? 'higher' : 'lower'} than the ${notes.length === 2 ? 'other note' : 'others'}. ${up ? 'Higher' : 'Lower'} on the staff means ${up ? 'higher' : 'lower'} in pitch.`,
  };
}

const motionWords = { repeat: 'a repeated note', step: 'a step', skip: 'a skip', leap: 'a leap' } as const;

/** Classify the move between two notes. */
export function classifyMove(id: string, a: Pos, b: Pos, choices: Array<'step' | 'skip' | 'repeat' | 'leap'>, withDirection = false): ChoiceQuestion {
  const m = motion(a, b);
  const dir = b > a ? 'up' : 'down';
  const key = (k: string) => (withDirection && k !== 'repeat' ? `${k}-${dir}` : k);
  const options: ChoiceOption[] = [];
  for (const c of choices) {
    if (withDirection && c !== 'repeat') {
      for (const d of ['up', 'down'] as const) options.push({ id: `${c}-${d}`, text: `${cap(c)} ${d}` });
    } else options.push({ id: c, text: c === 'repeat' ? 'Repeated note' : cap(c) });
  }
  const describe = `The first note is on ${posName(a)} and the second on ${posName(b)}`;
  const why = {
    repeat: 'both notes are in the same place, so the note repeats',
    step: `they are neighbours — one is on a line, the other in the very next space — so it is a step`,
    skip: `they are both ${isLine(a) ? 'line' : 'space'} notes with exactly one ${isLine(a) ? 'space' : 'line'} between them, so it is a skip`,
    leap: `the move covers more than a skip, so it is a leap`,
  }[m];
  for (const o of options) {
    const [kind, d] = o.id.split('-');
    if (o.id === key(m)) continue;
    o.feedback = kind === m && d && d !== dir
      ? `Right kind of move, wrong direction: the second note is ${dir === 'up' ? 'higher' : 'lower'}, so it moves ${dir}.`
      : `${describe}. ${cap(motionWords[kind as keyof typeof motionWords])} would ${kind === 'step' ? 'move to the very next line or space' : kind === 'skip' ? 'jump over exactly one line or space' : kind === 'repeat' ? 'stay in the same place' : 'jump further than a skip'}.`;
  }
  return {
    kind: 'choice', id,
    prompt: withDirection ? 'How does the melody move from note 1 to note 2?' : 'What kind of move is this, from note 1 to note 2?',
    figure: { kind: 'staff', notes: [a, b], noteLabels: true, alt: 'A staff with two numbered notes.' },
    options,
    answer: key(m),
    explanation: `${describe}: ${why}${withDirection && m !== 'repeat' ? `, moving ${dir}` : ''}.`,
  };
}
