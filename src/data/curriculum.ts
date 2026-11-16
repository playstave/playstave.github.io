/**
 * Curriculum architecture for the 500-level journey.
 *
 * This file defines the *structure* of the course: six worlds, each divided
 * into units of ten levels. Lesson content is generated or authored per level
 * (course/), world by world. Nothing here pretends a lesson exists before it does.
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

// ---------------------------------------------------------------------------
// The course for violin, viola, cello and double bass. Each unit teaches a
// playing skill; theory levels appear at fixed random positions (course/map.ts).
// Skills the microphone can't judge (bowing, posture, tone, double stops) are
// taught and practised, but only pitch and rhythm are scored.
// ---------------------------------------------------------------------------

const world1Units: UnitSeed[] = [
  { title: 'First Sounds', outcome: 'Hold the instrument and bow, play every open string and the first three notes on the D string.',
    topics: ['Holding the instrument', 'Bow hold', 'Open strings', 'First fingers on D', 'Your first tune'] },
  { title: 'Counting in Time', outcome: 'Keep a steady beat in 3/4 and 4/4 and play the notes of the A string.',
    topics: ['3/4 and 4/4', 'Dotted half notes', 'Fingers on the A string', 'Counting rests'] },
  { title: 'The D Major Scale', outcome: 'Play the one-octave D major scale in tune, up and down.',
    topics: ['D major, one octave', 'Crossing from D to A', 'Scale rhythms', 'Listening for in-tune F♯ and C♯'] },
  { title: 'Eighth Notes', outcome: 'Play pairs of eighth notes evenly and count “1 and 2 and”.',
    topics: ['Eighth-note pairs', 'Counting “and”', 'Even bow strokes', 'Mixing quarters and eighths'] },
  { title: 'G Major', outcome: 'Play in G major using the next string down, with a natural C.',
    topics: ['The G major scale', 'Notes on the lower string', 'Natural C (low 2)', 'G major tunes'] },
  { title: 'Dotted Rhythms', outcome: 'Play dotted-quarter-and-eighth rhythms with the right lilt.',
    topics: ['Dotted quarter notes', 'Long–short patterns', 'Bow distribution', 'Dotted rhythms in 3/4'] },
  { title: 'A Major', outcome: 'Play in A major with a high G♯.',
    topics: ['A major scale', 'G♯ (high 3rd finger, or its equivalent)', 'Three sharps', 'A major melodies'] },
  { title: 'Low Fingers', outcome: 'Move between high and low finger patterns (C♯/C and F♯/F).',
    topics: ['Low 2nd finger', 'C major on your instrument', 'Switching patterns', 'Listening for half steps'] },
  { title: 'Melodies to Play', outcome: 'Play longer folk-style melodies with phrasing.',
    topics: ['Four-bar phrases', 'Question and answer', 'Breathing with the bow', 'Remembering a tune'] },
  { title: 'World 1 Finale', outcome: 'Perform longer pieces that use everything from World 1.',
    topics: ['Mixed keys', 'Mixed rhythms', 'Stamina', 'Level 100 performance'] },
];

const world2Units: UnitSeed[] = [
  { title: 'Slurs', outcome: 'Play two or more notes in one bow, smoothly.', topics: ['Two-note slurs', 'Bow speed', 'Slurred string crossings', 'Ties versus slurs'] },
  { title: 'Loud and Soft', outcome: 'Play piano, forte, crescendo and diminuendo.', topics: ['p and f', 'Crescendo and diminuendo', 'Bow weight and speed', 'Contact point'] },
  { title: 'All Four Strings in First Position', outcome: 'Read and play every first-position note on all four strings.', topics: ['Lowest string notes', 'Highest string notes', 'Range of first position', 'Landmark notes'] },
  { title: 'C Major and F Major', outcome: 'Play keys with flats, including B♭ (low first finger).', topics: ['Flats', 'B♭ and low 1', 'F major', 'C major'] },
  { title: 'Minor Keys', outcome: 'Play in D, A and E minor and hear the difference from major.', topics: ['Natural minor', 'Raised 7th (harmonic minor)', 'Minor tunes', 'Major vs. minor'] },
  { title: 'Sixteenth Notes', outcome: 'Play groups of four sixteenth notes evenly.', topics: ['Counting 1 e & a', 'Sixteenths on one string', 'Sixteenths across strings', 'Mixed rhythms'] },
  { title: 'Bow Strokes', outcome: 'Play staccato, hooked bowings and accents.', topics: ['Staccato', 'Hooked bowings', 'Accents', 'Martelé'] },
  { title: 'Two-Octave Scales Begin', outcome: 'Play a two-octave G major scale (or your instrument’s equivalent).', topics: ['Two-octave G major', 'Scale patterns', 'Arpeggios', 'Scale speed'] },
  { title: 'Playing With Others', outcome: 'Count long rests, follow cues and keep your place.', topics: ['Multi-bar rests', 'Cue notes', 'Keeping your place', 'Ensemble listening'] },
  { title: 'World 2 Finale', outcome: 'Perform pieces with slurs, dynamics and sixteenth notes.', topics: ['Mixed bowings', 'Dynamics in performance', 'Longer pieces', 'Level 200 performance'] },
];

const world3Units: UnitSeed[] = [
  { title: 'Third Position', outcome: 'Play in third position (fourth position on cello) on one string.', topics: ['Where third position is', 'Hand frame', 'Reading in third position', 'Checking with open strings'] },
  { title: 'Shifting', outcome: 'Shift smoothly between first and third position.', topics: ['Guide fingers', 'Light thumb', 'Shifting on one string', 'Shifts in tunes'] },
  { title: 'Position Reading', outcome: 'Read music in third position fluently.', topics: ['Third-position notes on all strings', 'Choosing positions', 'Fingering marks', 'Sight-reading'] },
  { title: 'Scales and Arpeggios', outcome: 'Play two-octave scales and arpeggios with shifts.', topics: ['Two-octave scales', 'Arpeggios', 'Shifting in scales', 'Intonation'] },
  { title: 'Vibrato', outcome: 'Develop a relaxed, even vibrato (taught; not scored).', topics: ['Vibrato motion', 'Slow and even', 'Vibrato on long notes', 'Vibrato and intonation'] },
  { title: 'Six-Eight Time', outcome: 'Play in 6/8 with a two-beat feel.', topics: ['6/8 counting', 'Dotted-quarter beats', 'Jigs and barcarolles', 'Bowing in 6/8'] },
  { title: 'Syncopation', outcome: 'Play off-beat rhythms with confidence.', topics: ['Off-beats', 'Ties across the beat', 'Syncopated patterns', 'Feeling the pulse'] },
  { title: 'Chromatic Notes', outcome: 'Play half-step passages and chromatic scales.', topics: ['Chromatic fingerings', 'Half steps', 'Chromatic scale', 'Accidentals in tunes'] },
  { title: 'Baroque Style', outcome: 'Play baroque-style pieces with clear, light bowing.', topics: ['Détaché', 'Terraced dynamics', 'Ornaments', 'Dance forms'] },
  { title: 'World 3 Finale', outcome: 'Perform pieces with shifting and vibrato.', topics: ['Shifting in performance', 'Expressive playing', 'Longer pieces', 'Level 300 performance'] },
];

const world4Units: UnitSeed[] = [
  { title: 'Second and Fourth Positions', outcome: 'Play in second and fourth positions.', topics: ['Second position', 'Fourth position', 'Half position', 'Choosing between positions'] },
  { title: 'Fifth Position and Higher', outcome: 'Play up to fifth position and beyond.', topics: ['Fifth position', 'Higher positions', 'Tone up high', 'Shifts of a fourth and more'] },
  { title: 'High Positions and Thumb Position', outcome: 'Play in the upper register (thumb position on cello and bass).', topics: ['Thumb position (cello, bass)', 'Upper positions (violin, viola)', 'Intonation up high', 'High-register melodies'] },
  { title: 'Off-the-String Bowing', outcome: 'Play spiccato and other bounced strokes.', topics: ['Spiccato', 'Sautillé', 'Controlled bounce', 'Fast détaché'] },
  { title: 'Three-Octave Scales', outcome: 'Play three-octave scales and arpeggios.', topics: ['Three-octave scales', 'Arpeggios across positions', 'Speed and evenness', 'Scale routines'] },
  { title: 'Harmonics', outcome: 'Play natural harmonics.', topics: ['Natural harmonics', 'Light finger', 'Harmonic notation', 'Harmonics in music'] },
  { title: 'Double Stops', outcome: 'Play two strings at once (taught; scored on the melody line only).', topics: ['Open-string double stops', 'Thirds and sixths', 'Bow balance', 'Tuning double stops'] },
  { title: 'Changing Tempo', outcome: 'Follow ritardando, accelerando and fermatas.', topics: ['Ritardando', 'Accelerando', 'Fermata', 'A tempo'] },
  { title: 'Classical Style', outcome: 'Play classical-era style: elegant, balanced and clear.', topics: ['Phrasing', 'Articulation', 'Balance', 'Classical forms'] },
  { title: 'World 4 Finale', outcome: 'Perform advanced pieces across the whole instrument.', topics: ['High positions', 'Bow strokes', 'Longer pieces', 'Level 400 performance'] },
];

const world5Units: UnitSeed[] = [
  { title: 'Fast Passagework', outcome: 'Play fast runs cleanly and in tune.', topics: ['Finger independence', 'Rhythmic practice', 'Speed building', 'Passages in context'] },
  { title: 'Chords and Multiple Stops', outcome: 'Play three- and four-note chords (taught; melody scored).', topics: ['Broken chords', 'Three-note chords', 'Four-note chords', 'Chord bowing'] },
  { title: 'Romantic Expression', outcome: 'Play with rubato, portamento and wide dynamics.', topics: ['Rubato', 'Portamento', 'Tone colour', 'Long lines'] },
  { title: 'Special Effects', outcome: 'Play left-hand pizzicato, ricochet and sul ponticello.', topics: ['Left-hand pizzicato', 'Ricochet', 'Sul ponticello', 'Col legno'] },
  { title: 'Orchestral Themes', outcome: 'Play famous orchestral themes (Grieg, Mozart, Dvořák, Haydn, Beethoven, Pachelbel) arranged for your instrument.', topics: ['In the Hall of the Mountain King', 'Morning Mood', 'Eine kleine Nachtmusik', 'New World Largo'] },
];

const world6Units: UnitSeed[] = [
  { title: 'Virtuoso Studies', outcome: 'Master demanding studies in the style of the great études.', topics: ['Velocity', 'Extreme shifts', 'Bow control', 'Endurance'] },
  { title: 'Baroque Masters', outcome: 'Play baroque masterworks: Petzold’s Minuet (Anna Magdalena Bach notebook) and Pachelbel’s Canon, with ornaments and sixteenth-note variations.', topics: ['Minuet in G', 'Canon in D', 'Ornaments and trills', 'Terraced dynamics'] },
  { title: 'Grand Themes', outcome: 'Play the great classical themes in concert style, at full speed.', topics: ['Beethoven', 'Mozart and Haydn', 'Grieg and Dvořák', 'Projection'] },
  { title: 'The Edge of the Instrument', outcome: 'Play at the extremes of range and speed.', topics: ['Highest positions', 'Fastest passages', 'Hardest bowings', 'Near-impossible studies'] },
  { title: 'The Four Seasons', outcome: 'Master the main theme of Vivaldi’s “Spring” from The Four Seasons (public domain), from slow to full concert speed.', topics: ['Vivaldi’s echo dynamics', 'Trills and bowings', 'Sixteenth-note variations', 'Level 500: the final performance'] },
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
  buildWorld(1, 'First Steps', 1,
    'From holding your instrument to playing tunes in D, G and A major in first position.', world1Units, 0),
  buildWorld(2, 'First Position Fluency', 101,
    'Slurs, dynamics, flats, minor keys and sixteenth notes across all four strings.', world2Units, 10),
  buildWorld(3, 'Shifting', 201,
    'Third position, shifting, vibrato, 6/8 and baroque style.', world3Units, 20),
  buildWorld(4, 'Upper Positions', 301,
    'High positions, spiccato, harmonics, double stops and classical style.', world4Units, 30),
  buildWorld(5, 'Advanced Technique', 401,
    'Fast passagework, chords, romantic expression and orchestral excerpts.', world5Units, 40),
  buildWorld(6, 'Virtuoso', 451,
    'Virtuoso studies, Bach, concertos — and Vivaldi’s The Four Seasons at Level 500.', world6Units, 45),
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
