/**
 * Playing levels: each one TEACHES something new (tutorial cards, with the
 * fingering on your own instrument), lets you TRY the new notes while Stave
 * listens, then TESTS you with a play-along.
 *
 * Written once, generated for each instrument: the same musical idea uses the
 * instrument's own strings, clef, register and fingers (e.g. F♯ on the D string
 * is 2nd finger on violin/viola, 3rd on cello, 4th on double bass).
 */
import { getInstrument, type InstrumentId } from '../audio/notes';
import { soundingShift, type Backing, type PlayExercise } from '../play/exercise';
import { describePlacement, placeNote } from './fingering';

export type CardShow =
  | { kind: 'fingerboard'; notes: number[]; highlight: number[] }
  | { kind: 'notation'; notes: { key: string; duration: string }[]; time?: string; key?: string }
  | { kind: 'parts' };

export interface TutorialCard {
  title: string;
  body: string[];
  show?: CardShow;
  /** Sounding pitches the student can hear (reference tones). */
  listen?: number[];
}

export interface PlayLevel {
  /** 1-based index among playing levels. */
  index: number;
  title: string;
  objective: string;
  /** New words and ideas in this level, for the "new in this level" chips. */
  newIdeas: string[];
  cards: TutorialCard[];
  /** Notes to try one at a time with the microphone before the test (sounding MIDI). */
  tryNotes: number[];
  exercise: PlayExercise;
}

/* ---------- instrument geometry ---------- */

interface Geo {
  inst: InstrumentId;
  name: string;
  noun: string;
  clef: PlayExercise['clef'];
  strings: { name: string; midi: number }[];
  /** Index of the D string (every instrument has one; it's the home string for the first lessons). */
  home: number;
  up: number;
  down: number;
  other: number;
}

const NOUN: Record<InstrumentId, string> = { violin: 'violin', viola: 'viola', cello: 'cello', bass: 'double bass' };

function geo(inst: InstrumentId): Geo {
  const i = getInstrument(inst)!;
  const home = i.strings.findIndex((s) => s.name === 'D');
  const up = home + 1;
  const down = home - 1;
  const other = [0, 1, 2, 3].find((k) => ![home, up, down].includes(k))!;
  return { inst, name: i.name, noun: NOUN[inst], clef: i.clef, strings: i.strings, home, up, down, other };
}

/* ---------- writing music ---------- */

const SHARP_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

/** Written key for a sounding MIDI note on this instrument (sharps spelling). */
function written(inst: InstrumentId, sounding: number): string {
  const m = sounding - soundingShift(inst);
  return `${SHARP_NAMES[((m % 12) + 12) % 12]}/${Math.floor(m / 12) - 1}`;
}

/** Bars of [soundingMidi | null (rest), duration] → library music text. */
function music(inst: InstrumentId, bars: [number | null, string][][]): string {
  return bars.map((bar) => bar.map(([m, d]) => `${m == null ? 'r' : written(inst, m)}:${d}`).join(' ')).join(' | ');
}

/* ---------- the levels ---------- */

type Def = (g: Geo) => Omit<PlayLevel, 'index' | 'exercise'> & {
  bars: [number | null, string][][]; tempo: number; time?: string; key?: string; backing?: Backing; hint: string;
};

function holdText(g: Geo): string[] {
  switch (g.inst) {
    case 'violin':
    case 'viola':
      return [`Rest the ${g.noun} on your left shoulder, with your jaw on the chin rest. The scroll points out to your left, roughly level with the floor.`,
        'Your left hand holds the neck lightly — thumb opposite your first finger, wrist straight, no squeezing.'];
    case 'cello':
      return ['Sit near the front of your chair, feet flat. Set the endpin so the top of the cello rests against your chest and the C-string peg is near your left ear.',
        'The cello leans gently against you; your knees lightly hold the sides.'];
    case 'bass':
      return ['Stand (or sit on a tall stool) with the bass leaning slightly back towards you. Adjust the endpin so your first finger reaches about eye level on the fingerboard.',
        'The bass balances against your body; your left hand stays free to move.'];
  }
}

const bowCard: TutorialCard = {
  title: 'Hold the bow',
  body: ['Bend your thumb and place its tip where the stick meets the frog. Let your fingers drape over the stick, relaxed and slightly apart, with your little finger curved on top (violin, viola) or resting on the side (cello, bass).',
    'Draw the bow straight across the string, halfway between the bridge and the end of the fingerboard. Long, even bows make the best sound.'],
};

const DEFS: Def[] = [
  // 1
  (g) => {
    const D = g.strings[g.home].midi;
    return {
      title: `Meet your ${g.noun}: the open D string`, objective: `Play the open D string with long, even bows.`,
      newIdeas: ['Parts of the instrument', 'Holding the instrument', 'Bow hold', 'Open string', 'Whole note = 4 beats'],
      cards: [
        { title: `The parts of your ${g.noun}`, body: [`From the top: the scroll, the pegs (for big tuning changes), the neck and fingerboard, the body with its two f-holes, the bridge holding the strings up, and the tailpiece with fine tuners for small changes.`, `Your ${g.noun} has four strings: ${g.strings.map((s) => s.name).join(', ')} — lowest to highest.`], show: { kind: 'parts' } },
        { title: `Holding the ${g.noun}`, body: holdText(g) },
        bowCard,
        { title: 'The open D string', body: ['An open string is played with no fingers pressing it down — just the bow.', `Counting from the lowest string, D is string number ${g.home + 1} on the ${g.noun}.`], show: { kind: 'fingerboard', notes: [D], highlight: [D] }, listen: [D] },
        { title: 'Whole notes', body: ['A whole note is an open oval. It lasts 4 beats: count “1, 2, 3, 4” and keep the bow moving the whole time.', 'Change bow direction (down-bow, up-bow) on each new note.'], show: { kind: 'notation', notes: [{ key: written(g.inst, D), duration: 'w' }], time: '4/4' } },
      ],
      tryNotes: [D],
      bars: [[[D, 'w']], [[D, 'w']], [[D, 'w']], [[D, 'w']]], tempo: 60,
      hint: 'Four whole notes on the open D string. Count 4 beats for each and keep the bow moving.',
    };
  },
  // 2
  (g) => {
    const U = g.strings[g.up].midi;
    const n = g.strings[g.up].name;
    return {
      title: `The open ${n} string`, objective: `Play the open ${n} string in half notes and whole notes.`,
      newIdeas: [`${n} string`, 'Half note = 2 beats'],
      cards: [
        { title: `Your ${n} string`, body: [`The ${n} string is the next string up from D — higher in pitch.`, 'Tilt your bow arm a little to reach it: the bow should touch only this one string.'], show: { kind: 'fingerboard', notes: [U], highlight: [U] }, listen: [U] },
        { title: 'Half notes', body: ['A half note is an open oval with a stem. It lasts 2 beats — half as long as a whole note.', 'Two half notes fill a bar of 4 beats.'], show: { kind: 'notation', notes: [{ key: written(g.inst, U), duration: 'h' }, { key: written(g.inst, U), duration: 'h' }], time: '4/4' } },
      ],
      tryNotes: [U],
      bars: [[[U, 'h'], [U, 'h']], [[U, 'w']], [[U, 'h'], [U, 'h']], [[U, 'w']]], tempo: 66,
      hint: `Half notes and whole notes on the open ${n} string. Change bow on each note.`,
    };
  },
  // 3
  (g) => {
    const D = g.strings[g.home].midi, U = g.strings[g.up].midi, n = g.strings[g.up].name;
    return {
      title: `Crossing between D and ${n}`, objective: 'Move cleanly from one string to the next.',
      newIdeas: ['String crossing', 'Quarter note = 1 beat'],
      cards: [
        { title: 'String crossings', body: ['To change strings, move your whole bow arm to a new level — like a door swinging on a hinge — rather than twisting your wrist.', 'Get ready for the new string just before the note starts.'], show: { kind: 'fingerboard', notes: [D, U], highlight: [D, U] }, listen: [D, U] },
        { title: 'Quarter notes', body: ['A quarter note is a filled-in oval with a stem. It lasts 1 beat, so four of them fill a bar.'], show: { kind: 'notation', notes: [D, U, D, U].map((m) => ({ key: written(g.inst, m), duration: 'q' })), time: '4/4' } },
      ],
      tryNotes: [D, U],
      bars: [[[D, 'h'], [U, 'h']], [[D, 'h'], [U, 'h']], [[D, 'q'], [U, 'q'], [D, 'q'], [U, 'q']], [[D, 'w']]], tempo: 72,
      backing: { chords: 'D', style: 'drone' },
      hint: `Cross between D and ${n}. Move the arm, not just the wrist, and listen to the drone underneath.`,
    };
  },
  // 4
  (g) => {
    const D = g.strings[g.home].midi, L = g.strings[g.down].midi, n = g.strings[g.down].name;
    return {
      title: `The open ${n} string, and rests`, objective: `Play the open ${n} string and keep counting through rests.`,
      newIdeas: [`${n} string`, 'Quarter rest'],
      cards: [
        { title: `Your ${n} string`, body: [`The ${n} string is the next string down from D — deeper in pitch. Lift your bow arm a little higher to reach it.`], show: { kind: 'fingerboard', notes: [L], highlight: [L] }, listen: [L] },
        { title: 'Rests', body: ['A rest is a beat of silence. Stop the bow on the string and keep counting — the music hasn’t stopped, you’re just waiting.', 'A quarter rest (𝄽) lasts 1 beat.'], show: { kind: 'notation', notes: [{ key: written(g.inst, L), duration: 'q' }, { key: 'r', duration: 'qr' }, { key: written(g.inst, L), duration: 'q' }, { key: 'r', duration: 'qr' }], time: '4/4' } },
      ],
      tryNotes: [L],
      bars: [[[L, 'h'], [L, 'h']], [[L, 'q'], [null, 'q'], [L, 'q'], [null, 'q']], [[D, 'h'], [L, 'h']], [[L, 'w']]], tempo: 72,
      hint: `Open ${n} string with rests. Stop the bow during each rest, but keep counting.`,
    };
  },
  // 5
  (g) => {
    const s = g.strings.map((x) => x.midi);
    return {
      title: 'All four open strings', objective: 'Play every open string, low to high and back.',
      newIdeas: [`${g.strings[g.other].name} string`, 'Open-string scale'],
      cards: [
        { title: 'The last open string', body: [`Your fourth string is ${g.strings[g.other].name}. Now you know them all: ${g.strings.map((x) => x.name).join(' – ')}.`], show: { kind: 'fingerboard', notes: s, highlight: [s[g.other]] }, listen: s },
      ],
      tryNotes: [s[g.other]],
      bars: [[[s[0], 'h'], [s[1], 'h']], [[s[2], 'h'], [s[3], 'h']], [[s[3], 'h'], [s[2], 'h']], [[s[1], 'h'], [s[0], 'h']]], tempo: 72,
      hint: 'All four open strings, up and back down. Plan each string crossing.',
    };
  },
  // 6
  (g) => {
    const D = g.strings[g.home].midi, E = D + 2;
    const p = placeNote(g.inst, E)!;
    return {
      title: 'Your first finger: E', objective: 'Press the 1st finger on the D string to play E.',
      newIdeas: ['Finger numbers', 'E on the D string'],
      cards: [
        { title: 'Finger numbers', body: ['Your left-hand fingers are numbered 1 (index) to 4 (little finger). The thumb has no number — it stays behind the neck.'] },
        { title: 'E: 1st finger on the D string', body: [`Place your 1st finger on the D string a whole step from the nut (${describePlacement(p)}). Press with the fingertip, curved, not flat.`, 'Many teachers mark this spot with a thin tape — use one if you have it.'], show: { kind: 'fingerboard', notes: [D, E], highlight: [E] }, listen: [D, E] },
      ],
      tryNotes: [E],
      bars: [[[D, 'h'], [E, 'h']], [[E, 'h'], [D, 'h']], [[D, 'q'], [E, 'q'], [D, 'q'], [E, 'q']], [[D, 'w']]], tempo: 72,
      backing: { chords: 'D | A | D A | D', style: 'block' },
      hint: 'D and E: lift and drop the 1st finger cleanly, keeping it close to the string.',
    };
  },
  // 7
  (g) => {
    const D = g.strings[g.home].midi, E = D + 2, Fs = D + 4;
    const p = placeNote(g.inst, Fs)!;
    return {
      title: 'F♯ and the key of D major', objective: 'Add F♯ and play D–E–F♯ in tune.',
      newIdeas: ['Sharp ♯', 'Key signature', `F♯ (${['', '1st', '2nd', '3rd', '4th'][p.finger]} finger)`],
      cards: [
        { title: 'Sharps and the key signature', body: ['A sharp (♯) raises a note by a half step. In D major, every F and C is sharp.', 'Instead of writing ♯ every time, the music shows them once at the start of each line: the key signature.'], show: { kind: 'notation', notes: [{ key: written(g.inst, D), duration: 'q' }, { key: written(g.inst, E), duration: 'q' }, { key: written(g.inst, Fs), duration: 'h' }], time: '4/4', key: 'D' } },
        { title: `F♯ on your ${g.noun}`, body: [`Play F♯ with the ${describePlacement(p)}.`, g.inst === 'cello' ? 'On the cello each finger covers a half step, so F♯ is your 3rd finger — leave the 2nd finger relaxed in between.' : g.inst === 'bass' ? 'On the double bass, F♯ is played with the 4th finger (with the 3rd finger helping beside it) — bassists use 1, 2 and 4 in the low positions.' : 'Keep the 2nd finger close to the 3rd finger’s spot (“high 2”). F♯ should sound bright, a major third above D.'], show: { kind: 'fingerboard', notes: [D, E, Fs], highlight: [Fs] }, listen: [D, E, Fs] },
      ],
      tryNotes: [Fs],
      bars: [[[D, 'q'], [E, 'q'], [Fs, 'h']], [[Fs, 'q'], [E, 'q'], [D, 'h']], [[D, 'q'], [E, 'q'], [Fs, 'q'], [E, 'q']], [[D, 'w']]], tempo: 76, key: 'D',
      backing: { chords: 'D | D | D A | D', style: 'block' },
      hint: 'D, E and F♯. Listen hard to the F♯ — it is the note most often played flat.',
    };
  },
  // 8
  (g) => {
    const D = g.strings[g.home].midi, E = D + 2, Fs = D + 4, G = D + 5;
    const p = placeNote(g.inst, G)!;
    return {
      title: 'G and your first tune', objective: 'Play a four-note tune on D, E, F♯ and G.',
      newIdeas: [`G (${describePlacement(p)})`, 'Step-wise melody'],
      cards: [
        { title: `G on your ${g.noun}`, body: [p.finger === 0 ? `On the double bass, G is your open G string — the next string over. No finger needed, just a quick string crossing.` : `G is the ${describePlacement(p)}. Keep the other fingers down behind it if you can — it helps your hand stay in place.`], show: { kind: 'fingerboard', notes: [D, E, Fs, G], highlight: [G] }, listen: [D, E, Fs, G] },
        { title: 'Steps', body: ['When notes move to the very next line or space, they move by step. Your first tune moves almost only by step.'], show: { kind: 'notation', notes: [D, E, Fs, G].map((m) => ({ key: written(g.inst, m), duration: 'q' })), time: '4/4', key: 'D' } },
      ],
      tryNotes: [G],
      bars: [[[D, 'q'], [E, 'q'], [Fs, 'q'], [G, 'q']], [[G, 'q'], [Fs, 'q'], [E, 'q'], [D, 'q']], [[D, 'q'], [Fs, 'q'], [E, 'q'], [G, 'q']], [[Fs, 'q'], [E, 'q'], [D, 'h']]], tempo: 80, key: 'D',
      backing: { chords: 'D | D | D A | A D', style: 'block' },
      hint: 'Your first tune. Keep the fingers close to the string between notes.',
    };
  },
  // 9 (Level 10: checkpoint)
  (g) => {
    const D = g.strings[g.home].midi, E = D + 2, Fs = D + 4, G = D + 5, A = D + 7;
    const pa = placeNote(g.inst, A)!;
    return {
      title: 'Checkpoint: Morning Steps', objective: 'Review everything so far in one longer piece.',
      newIdeas: ['Checkpoint review', `A (${describePlacement(pa)})`],
      cards: [
        { title: 'Checkpoint', body: ['This piece uses every note you’ve learned, plus A. It is longer than before — that’s how checkpoints work.', pa.finger === 0 ? 'A is your open A string.' : `On your ${g.noun}, A is the ${describePlacement(pa)}.`], show: { kind: 'fingerboard', notes: [D, E, Fs, G, A], highlight: [A] }, listen: [D, E, Fs, G, A] },
      ],
      tryNotes: [A],
      bars: [
        [[D, 'q'], [E, 'q'], [Fs, 'q'], [G, 'q']], [[A, 'h'], [A, 'h']], [[G, 'q'], [Fs, 'q'], [E, 'q'], [Fs, 'q']], [[D, 'w']],
        [[D, 'q'], [Fs, 'q'], [A, 'q'], [Fs, 'q']], [[G, 'q'], [E, 'q'], [A, 'h']], [[G, 'q'], [Fs, 'q'], [E, 'q'], [E, 'q']], [[D, 'w']],
      ], tempo: 80, key: 'D',
      backing: { chords: 'D | A | G A | D | D | G A | A | D', style: 'block' },
      hint: 'Eight bars using D, E, F♯, G and A. Take the slower speed first if you like.',
    };
  },
  // 10 (Level 11)
  (g) => {
    const D = g.strings[g.home].midi, E = D + 2, Fs = D + 4, G = D + 5, A = D + 7;
    return {
      title: 'Three beats in a bar: a waltz', objective: 'Play in 3/4 time with dotted half notes.',
      newIdeas: ['3/4 time', 'Dotted half note = 3 beats', 'Waltz'],
      cards: [
        { title: 'Time signatures', body: ['The two numbers at the start are the time signature. The top number is how many beats in each bar.', '3/4 means three beats per bar — the feel of a waltz: ONE two three, ONE two three.'] },
        { title: 'Dotted half notes', body: ['A dot after a note makes it half as long again. A half note (2 beats) with a dot lasts 3 beats — a whole bar in 3/4.'], show: { kind: 'notation', notes: [{ key: written(g.inst, D), duration: 'hd' }], time: '3/4', key: 'D' } },
      ],
      tryNotes: [],
      bars: [[[D, 'hd']], [[Fs, 'hd']], [[A, 'hd']], [[A, 'q'], [G, 'q'], [Fs, 'q']], [[E, 'hd']], [[G, 'q'], [Fs, 'q'], [E, 'q']], [[D, 'hd']], [[D, 'hd']]], tempo: 92, time: '3/4', key: 'D',
      backing: { chords: 'D | D | D | D | A | A | D | D', style: 'pulse' },
      hint: 'A waltz in 3/4. Feel the strong first beat of each bar.',
    };
  },
];

export const PLAY_LEVEL_COUNT = DEFS.length;

/** The Nth playing level for an instrument, or undefined if not written yet. */
export function getPlayLevel(inst: InstrumentId, index: number): PlayLevel | undefined {
  const def = DEFS[index - 1];
  if (!def) return undefined;
  const g = geo(inst);
  const d = def(g);
  const exercise: PlayExercise = {
    id: `${inst}-p${index}`, title: d.title, instrument: inst, clef: g.clef,
    key: d.key ?? 'D', time: d.time ?? '4/4', tempo: inst === 'bass' ? Math.round(d.tempo * 0.9) : d.tempo,
    music: music(inst, d.bars), backing: d.backing, hint: d.hint,
  };
  return { index, title: d.title, objective: d.objective, newIdeas: d.newIdeas, cards: d.cards, tryNotes: d.tryNotes, exercise };
}

export const writtenKey = written;
