/**
 * Demo play-along exercises (all original to Stave) for the four string
 * instruments. Each is written once at violin pitch and moved down for the
 * lower instruments:
 *   viola  — same written pitches (its D and A strings match the violin's), alto clef
 *   cello  — one octave lower, bass clef
 *   bass   — same WRITTEN notes as the cello (the bass sounds an octave lower)
 * These prove the play-along engine; the full 500-level course comes later.
 */
import type { InstrumentId } from '../audio/notes';
import type { Backing, PlayExercise } from './exercise';

interface Template { slug: string; title: string; key: string; time: string; tempo: number; music: string; backing?: Backing; hint: string }

const TEMPLATES: Template[] = [
  {
    slug: 'open-d-a', title: 'Open strings: D and A', key: 'D', time: '4/4', tempo: 72,
    music: 'd/4:h d/4:h | a/4:h a/4:h | d/4:q a/4:q d/4:q a/4:q | d/4:w',
    backing: { chords: 'D', style: 'drone' },
    hint: 'Only open strings — no fingers. Use long, even bows and change bow on every note.',
  },
  {
    slug: 'first-steps', title: 'First steps up the D string', key: 'D', time: '4/4', tempo: 80,
    music: 'd/4:q e/4:q f#/4:q g/4:q | a/4:h a/4:h | g/4:q f#/4:q e/4:q f#/4:q | d/4:w',
    backing: { chords: 'D | D | G A | D', style: 'block' },
    hint: 'Fingers 1, 2 and 3 on the D string, then the open A. Listen for F♯ — keep 2nd finger close to 3rd.',
  },
  {
    slug: 'morning-walk', title: 'Morning Walk (Stave original)', key: 'D', time: '4/4', tempo: 92,
    music: 'd/4:q f#/4:q a/4:q f#/4:q | g/4:q e/4:q a/4:h | b/4:8 a/4:8 g/4:8 f#/4:8 e/4:q a/4:q | f#/4:q e/4:q d/4:h | d/4:q f#/4:q a/4:q d/5:q | c#/5:q b/4:q a/4:h | b/4:8 a/4:8 g/4:8 f#/4:8 e/4:q c#/4:q | d/4:w',
    backing: { chords: 'D | G A | G A | D | D | A | G A | D', style: 'pulse' },
    hint: 'Eighth notes in bars 3 and 7: keep the bow light and the fingers close to the string.',
  },
];

function shiftOctave(music: string, by: number): string {
  if (!by) return music;
  return music.replace(/([a-g](?:##|#|bb|b|n)?)\/(-?\d)/g, (_, p, o) => `${p}/${Number(o) + by}`);
}

const PLAN: { instrument: InstrumentId; clef: PlayExercise['clef']; octave: number }[] = [
  { instrument: 'violin', clef: 'treble', octave: 0 },
  { instrument: 'viola', clef: 'alto', octave: 0 },
  { instrument: 'cello', clef: 'bass', octave: -1 },
  { instrument: 'bass', clef: 'bass', octave: -1 },
];

export const DEMO_EXERCISES: PlayExercise[] = PLAN.flatMap((p) =>
  TEMPLATES.map((t) => ({
    id: `${p.instrument}-${t.slug}`, title: t.title, instrument: p.instrument, clef: p.clef,
    key: t.key, time: t.time, tempo: p.instrument === 'bass' ? Math.round(t.tempo * 0.85) : t.tempo,
    music: shiftOctave(t.music, p.octave),
    backing: t.backing, hint: t.hint,
  })),
);

export const getExercise = (id: string) => DEMO_EXERCISES.find((e) => e.id === id);
