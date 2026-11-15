/**
 * Copy and recommendations that depend on the student's instrument and
 * experience (the personalised experience after the welcome questions).
 */
import type { Experience, StudentInstrument } from '../state/progress';

export interface InstrumentInfo {
  id: StudentInstrument;
  name: string;
  /** Lower-case for sentences: "your violin". */
  noun: string;
  blurb: string;
  /** Relative size for the picture (violin = 1). */
  size: number;
  clef: string;
  strings: string;
}

export const INSTRUMENT_INFO: InstrumentInfo[] = [
  { id: 'violin', name: 'Violin', noun: 'violin', size: 1, clef: 'Treble clef', strings: 'G D A E',
    blurb: 'The smallest and highest. Held under the chin; sings the melody in an orchestra.' },
  { id: 'viola', name: 'Viola', noun: 'viola', size: 1.15, clef: 'Alto clef', strings: 'C G D A',
    blurb: 'A little bigger and deeper than the violin, with a warm, dark sound.' },
  { id: 'cello', name: 'Cello', noun: 'cello', size: 1.75, clef: 'Bass clef', strings: 'C G D A',
    blurb: 'Played sitting down, resting on the floor. A rich voice from low bass to soaring melody.' },
  { id: 'bass', name: 'Double bass', noun: 'double bass', size: 2.4, clef: 'Bass clef', strings: 'E A D G',
    blurb: 'The biggest and lowest. Played standing or on a tall stool; the foundation of the orchestra.' },
];

export const instrumentInfo = (id: StudentInstrument) => INSTRUMENT_INFO.find((i) => i.id === id)!;

export const EXPERIENCE_OPTIONS: { id: Experience; label: string; desc: string }[] = [
  { id: 'new', label: 'I’m brand new', desc: 'Never played, or only tried it once or twice.' },
  { id: 'some', label: 'I can play a little', desc: 'I know a few notes and can play simple tunes.' },
  { id: 'experienced', label: 'I’ve played for a while', desc: 'Lessons or orchestra for a year or more.' },
];

export interface PlanStep { title: string; desc: string; to: string; cta: string }

/** The first steps shown after the welcome questions and on Home until done. */
export function startPlan(inst: StudentInstrument, exp: Experience): PlanStep[] {
  const n = instrumentInfo(inst).noun;
  const tune: PlanStep = { title: `Tune your ${n}`, desc: 'In tune strings make every exercise easier — the tuner listens and shows you which way to turn.', to: '/tuner', cta: 'Open the tuner' };
  if (exp === 'new') return [
    tune,
    { title: `Meet your ${n}`, desc: 'Level 1 shows you how to hold it and the bow, then you play your first open string while Stave listens.', to: '/level/1', cta: 'Start Level 1' },
    { title: 'Play your first open strings', desc: `Play along with “Open strings: D and A” at the slower speed — Stave marks each note green when it’s right.`, to: `/play/${inst}-open-d-a`, cta: 'Play along' },
  ];
  if (exp === 'some') return [
    tune,
    { title: 'Warm up with the first finger steps', desc: 'A short play-along on the D string — see how many notes you can turn green.', to: `/play/${inst}-first-steps`, cta: 'Play along' },
    { title: 'Start the journey', desc: 'The early levels will feel quick — they make sure nothing is missing before things get harder.', to: '/level/1', cta: 'Start Level 1' },
  ];
  return [
    tune,
    { title: 'Try Morning Walk at full speed', desc: 'Eighth notes and string crossings — aim for three stars.', to: `/play/${inst}-morning-walk`, cta: 'Play along' },
    { title: 'Start the journey', desc: 'Early levels go fast for experienced players; the challenge builds all the way to Level 500.', to: '/level/1', cta: 'Start Level 1' },
  ];
}
