/**
 * Curriculum architecture for the 500-level journey.
 *
 * This file defines the *structure* of the course: six worlds, each divided
 * into units of ten levels. Individual lesson content (introduction, lesson,
 * guided practice, challenge) is authored separately per level, starting with
 * Levels 1–10 in Stage 3. Nothing here pretends a lesson exists before it does.
 */

export type WorldId = 1 | 2 | 3 | 4 | 5 | 6;

export interface Unit {
  /** Unit number within the whole course, 1-based. */
  id: number;
  title: string;
  firstLevel: number;
  lastLevel: number;
  /** What the student will be able to do by the end of the unit. */
  outcome: string;
  topics: string[];
}

export interface World {
  id: WorldId;
  name: string;
  firstLevel: number;
  lastLevel: number;
  summary: string;
  /** CSS custom property holding the world's pigment. */
  colorVar: string;
  units: Unit[];
}

type UnitSeed = Omit<Unit, 'id' | 'firstLevel' | 'lastLevel'>;

const world1Units: UnitSeed[] = [
  {
    title: 'The Staff',
    outcome: 'Find and name every line and space of the five-line staff.',
    topics: ['Five lines, four spaces', 'Counting from the bottom', 'Line notes and space notes', 'Higher and lower on the staff', 'Steps and skips'],
  },
  {
    title: 'The Musical Alphabet',
    outcome: 'Recite the seven letter names forwards and backwards from any starting letter.',
    topics: ['A to G and repeat', 'Moving up and down', 'Octaves: same letter, higher pitch', 'Letters on the keyboard'],
  },
  {
    title: 'The Treble Clef',
    outcome: 'Recognise the treble clef and explain why it is called the G clef.',
    topics: ['Drawing the treble clef', 'The G line', 'Which instruments read treble', 'Middle C below the staff'],
  },
  {
    title: 'Reading Treble Notes',
    outcome: 'Name any note on the treble staff, including the first ledger lines.',
    topics: ['Line notes E G B D F', 'Space notes F A C E', 'Landmark notes', 'Ledger lines above and below'],
  },
  {
    title: 'The Bass Clef',
    outcome: 'Recognise the bass clef and explain why it is called the F clef.',
    topics: ['Drawing the bass clef', 'The F line', 'Which instruments read bass', 'Middle C above the staff'],
  },
  {
    title: 'Reading Bass Notes',
    outcome: 'Name any note on the bass staff and connect it to the grand staff.',
    topics: ['Line notes G B D F A', 'Space notes A C E G', 'The grand staff', 'Crossing between clefs'],
  },
  {
    title: 'Note Durations',
    outcome: 'Identify whole, half, quarter, eighth, and sixteenth notes and their relative lengths.',
    topics: ['Note heads, stems, flags', 'Whole and half notes', 'Quarter notes', 'Eighths, sixteenths, and beams', 'Dotted notes'],
  },
  {
    title: 'Rests',
    outcome: 'Match every common rest to the note value it replaces.',
    topics: ['Whole and half rests', 'Quarter rests', 'Eighth and sixteenth rests', 'Counting silence'],
  },
  {
    title: 'Beat and Rhythm',
    outcome: 'Count and clap simple rhythms against a steady pulse.',
    topics: ['Pulse and beat', 'Bar lines and measures', 'Counting aloud', 'Ties'],
  },
  {
    title: 'Simple Time Signatures',
    outcome: 'Read 2/4, 3/4 and 4/4 and fill a measure with the correct total duration.',
    topics: ['What the two numbers mean', '4/4 and common time', '3/4 and waltz feel', '2/4 and marches', 'World 1 checkpoint exam'],
  },
];

const world2Units: UnitSeed[] = [
  { title: 'Sharps, Flats and Naturals', outcome: 'Read and apply accidentals within a measure.', topics: ['Half steps and whole steps', 'Sharps', 'Flats', 'Naturals', 'Accidentals and the bar line'] },
  { title: 'The Major Scale', outcome: 'Build any major scale from the whole/half-step pattern.', topics: ['W W H W W W H', 'C major', 'G and F major', 'Scale degrees'] },
  { title: 'Major Key Signatures', outcome: 'Identify major keys up to four sharps and four flats.', topics: ['Order of sharps', 'Order of flats', 'Finding the key from the signature', 'The circle of fifths'] },
  { title: 'Minor Scales', outcome: 'Build natural, harmonic and melodic minor scales.', topics: ['Natural minor', 'Harmonic minor', 'Melodic minor', 'Comparing major and minor'] },
  { title: 'Relative and Parallel Keys', outcome: 'Find the relative minor of any major key.', topics: ['Relative minor', 'Parallel minor', 'Minor key signatures'] },
  { title: 'Intervals I', outcome: 'Name intervals by number from a 2nd to an octave.', topics: ['Counting letter names', 'Steps vs. leaps', 'Unisons and octaves'] },
  { title: 'Intervals II', outcome: 'Classify intervals as major, minor, perfect, augmented or diminished.', topics: ['Interval quality', 'Perfect intervals', 'Major and minor 2nds, 3rds, 6ths, 7ths'] },
  { title: 'Melodic Patterns', outcome: 'Recognise sequences, repetition and contour in a melody.', topics: ['Repetition', 'Sequence', 'Contour', 'Scale and chord-tone patterns'] },
  { title: 'Compound Rhythm', outcome: 'Count in 6/8, 9/8 and 12/8 with dotted-quarter beats.', topics: ['Simple vs. compound', '6/8', '9/8 and 12/8', 'Beaming in compound time'] },
  { title: 'More Time Signatures', outcome: 'Read cut time, 3/8, 2/2 and changing meters.', topics: ['Cut time', '3/8 and 2/2', 'Pickup measures', 'World 2 checkpoint exam'] },
];

const world3Units: UnitSeed[] = [
  { title: 'Triads', outcome: 'Stack thirds to build triads on any note.', topics: ['Root, third, fifth', 'Stacking thirds', 'Triads in C major'] },
  { title: 'Major and Minor Chords', outcome: 'Tell major and minor triads apart by sight and by structure.', topics: ['Major triads', 'Minor triads', 'Chord symbols'] },
  { title: 'Diminished and Augmented', outcome: 'Identify all four triad qualities.', topics: ['Diminished triads', 'Augmented triads', 'Quality by intervals'] },
  { title: 'Chord Inversions', outcome: 'Name root position, first and second inversion.', topics: ['Root position', 'First inversion', 'Second inversion', 'Figured bass basics'] },
  { title: 'Harmony in a Key', outcome: 'Label diatonic chords with Roman numerals.', topics: ['Roman numerals', 'Primary chords I IV V', 'Minor-key harmony'] },
  { title: 'Phrases and Cadences', outcome: 'Locate phrase endings and name the cadence.', topics: ['Phrases', 'Authentic cadence', 'Half cadence', 'Plagal and deceptive'] },
  { title: 'Dynamics', outcome: 'Read dynamic markings from pp to ff, including hairpins.', topics: ['p, mp, mf, f', 'pp and ff', 'Crescendo and diminuendo', 'Accents in context'] },
  { title: 'Articulation', outcome: 'Interpret staccato, legato, tenuto, accent and marcato.', topics: ['Slurs and legato', 'Staccato', 'Tenuto and accent', 'Marcato and fermata'] },
  { title: 'Tempo Markings', outcome: 'Order Italian tempo terms and read metronome marks.', topics: ['Largo to Presto', 'Metronome marks', 'Ritardando and accelerando', 'A tempo'] },
  { title: 'Musical Expression', outcome: 'Combine dynamics, articulation and tempo to interpret a passage.', topics: ['Expression terms', 'Character words', 'Reading a full passage', 'World 3 checkpoint exam'] },
];

const world4Units: UnitSeed[] = [
  { title: 'Advanced Notation', outcome: 'Read repeats, codas, first/second endings and octave signs.', topics: ['Repeat signs', 'D.C. and D.S.', 'Coda', '8va and 8vb'] },
  { title: 'Complex Rhythms', outcome: 'Count dotted and double-dotted rhythms and 32nd notes.', topics: ['Double dots', '32nd notes', 'Mixed subdivisions'] },
  { title: 'Syncopation', outcome: 'Recognise and count off-beat accents and ties across the beat.', topics: ['Off-beats', 'Ties across beats', 'Syncopated patterns'] },
  { title: 'Triplets and Tuplets', outcome: 'Count triplets, duplets and quintuplets in context.', topics: ['Eighth-note triplets', 'Quarter-note triplets', 'Duplets in compound time', 'Quintuplets'] },
  { title: 'Compound Meter in Depth', outcome: 'Read dense rhythms in compound meters fluently.', topics: ['Subdividing 6/8', 'Hemiola', 'Compound syncopation'] },
  { title: 'Advanced Intervals', outcome: 'Identify compound and enharmonic intervals.', topics: ['Compound intervals', 'Enharmonic equivalents', 'Interval inversion'] },
  { title: 'Seventh Chords', outcome: 'Build and name the five common seventh-chord qualities.', topics: ['Dominant 7th', 'Major and minor 7th', 'Half-diminished', 'Fully diminished'] },
  { title: 'Chord Progressions', outcome: 'Analyse common progressions with Roman numerals.', topics: ['ii–V–I', 'Circle progressions', 'Secondary dominants'] },
  { title: 'Sight-Reading Strategy', outcome: 'Scan, chunk and read an unfamiliar 8-bar passage.', topics: ['Scanning before playing', 'Reading in patterns', 'Keeping the pulse'] },
  { title: 'Interpretation', outcome: 'Make and justify interpretive choices from a score.', topics: ['Style periods', 'Phrasing decisions', 'World 4 checkpoint exam'] },
];

const world5Units: UnitSeed[] = [
  { title: 'Remote Key Signatures', outcome: 'Read keys with five to seven sharps or flats.', topics: ['B, F♯ and C♯ major', 'D♭, G♭ and C♭ major', 'Enharmonic keys'] },
  { title: 'Dense Rhythm', outcome: 'Read mixed tuplets, rests and ties at speed.', topics: ['Nested subdivisions', 'Rests inside tuplets', 'Reading rhythm in chunks'] },
  { title: 'Chromatic Harmony', outcome: 'Identify borrowed chords, Neapolitan and augmented sixths.', topics: ['Modal mixture', 'Neapolitan sixth', 'Augmented sixth chords'] },
  { title: 'Challenging Melodic Passages', outcome: 'Sight-read wide leaps and chromatic lines.', topics: ['Wide leaps', 'Chromatic lines', 'Alto and tenor clefs'] },
  { title: 'Fast Recognition', outcome: 'Name notes, intervals and chords under time pressure.', topics: ['Timed note naming', 'Timed intervals', 'World 5 checkpoint exam'] },
];

const world6Units: UnitSeed[] = [
  { title: 'Irregular Meters', outcome: 'Read 5/8, 7/8, 11/8 and additive groupings.', topics: ['5/8 and 7/8', 'Additive meter', 'Changing meters bar to bar'] },
  { title: 'Polyrhythm and Precision', outcome: 'Read 3-against-2, 4-against-3 and metric modulation.', topics: ['3:2 and 4:3', 'Metric modulation', 'Precision timing'] },
  { title: 'Extended Harmony', outcome: 'Analyse extended chords, modulation and pivot chords.', topics: ['9ths, 11ths, 13ths', 'Pivot-chord modulation', 'Chromatic modulation'] },
  { title: 'Advanced Score Reading', outcome: 'Read multi-staff and transposing-instrument parts.', topics: ['Transposing instruments', 'Open score', 'Multiple clefs at once'] },
  { title: 'Mastery Examinations', outcome: 'Pass comprehensive exams across every skill in the course.', topics: ['Sight-reading exam', 'Harmony exam', 'Rhythm exam', 'Final mastery exam'] },
];

function buildWorld(
  id: WorldId,
  name: string,
  firstLevel: number,
  summary: string,
  seeds: UnitSeed[],
  unitOffset: number,
): World {
  const units = seeds.map((seed, i) => ({
    ...seed,
    id: unitOffset + i + 1,
    firstLevel: firstLevel + i * 10,
    lastLevel: firstLevel + i * 10 + 9,
  }));
  return {
    id,
    name,
    firstLevel,
    lastLevel: units[units.length - 1].lastLevel,
    summary,
    colorVar: `var(--world-${id})`,
    units,
  };
}

export const WORLDS: World[] = [
  buildWorld(1, 'Beginner Musician', 1,
    'From a blank staff to reading notes in both clefs and counting simple rhythms.', world1Units, 0),
  buildWorld(2, 'Developing Musician', 101,
    'Scales, key signatures, accidentals and intervals — the grammar of tonal music.', world2Units, 10),
  buildWorld(3, 'Musical Explorer', 201,
    'Chords, harmony and the markings that turn notes into expressive music.', world3Units, 20),
  buildWorld(4, 'Advanced Musician', 301,
    'Syncopation, tuplets, seventh chords and the strategy behind sight-reading.', world4Units, 30),
  buildWorld(5, 'Expert Musician', 401,
    'Remote keys, chromatic harmony and recognising complex notation at speed.', world5Units, 40),
  buildWorld(6, 'Master Musician', 451,
    'Irregular meters, polyrhythm, extended harmony and the final mastery exams.', world6Units, 45),
];

export const TOTAL_LEVELS = 500;
export const STARS_PER_LEVEL = 3;

export function worldForLevel(level: number): World {
  const w = WORLDS.find((w) => level >= w.firstLevel && level <= w.lastLevel);
  if (!w) throw new RangeError(`Level ${level} is outside 1–${TOTAL_LEVELS}`);
  return w;
}

export function unitForLevel(level: number): Unit {
  const unit = worldForLevel(level).units.find((u) => level >= u.firstLevel && level <= u.lastLevel);
  if (!unit) throw new RangeError(`No unit for level ${level}`);
  return unit;
}

export function getWorld(id: number): World | undefined {
  return WORLDS.find((w) => w.id === id);
}
