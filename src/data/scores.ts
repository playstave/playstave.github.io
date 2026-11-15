/**
 * The Stave sheet music catalogue.
 *
 * Every entry is either
 *   - a composition in the public domain (traditional, or a composer who died
 *     long ago), freshly engraved by Stave from the melody as commonly published, or
 *   - an original Stave composition.
 * All Stave engravings are dedicated to the public domain under CC0 1.0, so
 * they may be printed, copied and shared. Nothing here is scanned or copied
 * from a copyrighted edition. New entries must follow the same rule.
 */
import type { Licence, ScoreSource } from '../music/score';

const pd = (whoAndWhen: string): Licence => ({
  kind: 'public-domain',
  work: `Composition in the public domain (${whoAndWhen}).`,
  edition: 'Stave engraving, dedicated to the public domain under CC0 1.0. Free to print, copy and share.',
  downloadable: true,
});
const original: Licence = {
  kind: 'cc0',
  work: 'Original composition written for Stave, dedicated to the public domain under CC0 1.0.',
  edition: 'Stave engraving, CC0 1.0. Free to print, copy, perform and share.',
  downloadable: true,
};

export const SCORES: ScoreSource[] = [
  /* ---------------- Public-domain repertoire ---------------- */
  {
    id: 'ode-to-joy', title: 'Ode to Joy', composer: 'Ludwig van Beethoven (1770–1827)',
    source: 'Theme from the finale of Symphony No. 9 (1824), originally in D major. Melody as commonly published, set in G major for a single staff by Stave.',
    genre: 'Classical', difficulty: 'Easy', clef: 'treble', key: 'G', time: '4/4', tempo: 'Allegro moderato',
    description: 'Beethoven’s famous theme moves almost entirely by step — ideal for practising steady quarter notes and the dotted rhythm at the end of each phrase.',
    music: 'b/4:q b/4:q c/5:q d/5:q | d/5:q c/5:q b/4:q a/4:q | g/4:q g/4:q a/4:q b/4:q | b/4:qd a/4:8 a/4:h | b/4:q b/4:q c/5:q d/5:q | d/5:q c/5:q b/4:q a/4:q | g/4:q g/4:q a/4:q b/4:q | a/4:qd g/4:8 g/4:h | a/4:q a/4:q b/4:q g/4:q | a/4:q b/4:8 c/5:8 b/4:q g/4:q | a/4:q b/4:8 c/5:8 b/4:q a/4:q | g/4:q a/4:q d/4:h | b/4:q b/4:q c/5:q d/5:q | d/5:q c/5:q b/4:q a/4:q | g/4:q g/4:q a/4:q b/4:q | a/4:qd g/4:8 g/4:h',
    licence: pd('Beethoven died in 1827'),
  },
  {
    id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', composer: 'Traditional (French, 18th century)',
    source: 'The French melody “Ah! vous dirai-je, maman”, first published in 1761. Engraved by Stave.',
    genre: 'Traditional', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '4/4',
    description: 'Quarter and half notes in C major, with a skip of a fifth at the start. A first piece for almost every instrument.',
    music: 'c/4:q c/4:q g/4:q g/4:q | a/4:q a/4:q g/4:h | f/4:q f/4:q e/4:q e/4:q | d/4:q d/4:q c/4:h | g/4:q g/4:q f/4:q f/4:q | e/4:q e/4:q d/4:h | g/4:q g/4:q f/4:q f/4:q | e/4:q e/4:q d/4:h | c/4:q c/4:q g/4:q g/4:q | a/4:q a/4:q g/4:h | f/4:q f/4:q e/4:q e/4:q | d/4:q d/4:q c/4:h',
    licence: pd('traditional melody, published 1761'),
  },
  {
    id: 'frere-jacques', title: 'Frère Jacques', composer: 'Traditional (French)',
    source: 'Traditional French round, known from the 18th century. Set in F major by Stave.',
    genre: 'Folk', difficulty: 'Beginner', clef: 'treble', key: 'F', time: '4/4',
    description: 'A round in F major — your first B♭ in a key signature. Each two-bar phrase repeats, so it is easy to learn and to play as a round with friends.',
    music: 'f/4:q g/4:q a/4:q f/4:q | f/4:q g/4:q a/4:q f/4:q | a/4:q bb/4:q c/5:h | a/4:q bb/4:q c/5:h | c/5:8 d/5:8 c/5:8 bb/4:8 a/4:q f/4:q | c/5:8 d/5:8 c/5:8 bb/4:8 a/4:q f/4:q | f/4:q c/4:q f/4:h | f/4:q c/4:q f/4:h',
    licence: pd('traditional'),
  },
  {
    id: 'mary-lamb', title: 'Mary Had a Little Lamb', composer: 'Traditional (American, 19th century)',
    source: 'Nineteenth-century American melody to Sarah Josepha Hale’s 1830 poem. Engraved by Stave.',
    genre: 'Traditional', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '4/4',
    description: 'Only five notes, mostly steps, with repeated notes and a whole note to finish.',
    music: 'e/4:q d/4:q c/4:q d/4:q | e/4:q e/4:q e/4:h | d/4:q d/4:q d/4:h | e/4:q g/4:q g/4:h | e/4:q d/4:q c/4:q d/4:q | e/4:q e/4:q e/4:q e/4:q | d/4:q d/4:q e/4:q d/4:q | c/4:w',
    licence: pd('traditional, 19th century'),
  },
  {
    id: 'hot-cross-buns', title: 'Hot Cross Buns', composer: 'Traditional (English)',
    source: 'English street cry, printed from the 18th century. Engraved by Stave.',
    genre: 'Traditional', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '4/4',
    description: 'Three notes, and your first run of eighth notes in the third bar.',
    music: 'e/4:q d/4:q c/4:h | e/4:q d/4:q c/4:h | c/4:8 c/4:8 c/4:8 c/4:8 d/4:8 d/4:8 d/4:8 d/4:8 | e/4:q d/4:q c/4:h',
    licence: pd('traditional'),
  },
  {
    id: 'au-clair', title: 'Au clair de la lune', composer: 'Traditional (French, 18th century)',
    source: 'Traditional French song. Set in G major by Stave.',
    genre: 'Folk', difficulty: 'Beginner', clef: 'treble', key: 'G', time: '4/4',
    description: 'A gentle French song in G major with an F♯ in the middle section. Good for half notes and whole notes.',
    music: 'g/4:q g/4:q g/4:q a/4:q | b/4:h a/4:h | g/4:q b/4:q a/4:q a/4:q | g/4:w | g/4:q g/4:q g/4:q a/4:q | b/4:h a/4:h | g/4:q b/4:q a/4:q a/4:q | g/4:w | a/4:q a/4:q a/4:q a/4:q | e/4:h e/4:h | a/4:q g/4:q f#/4:q e/4:q | d/4:w | g/4:q g/4:q g/4:q a/4:q | b/4:h a/4:h | g/4:q b/4:q a/4:q a/4:q | g/4:w',
    licence: pd('traditional'),
  },
  {
    id: 'greensleeves', title: 'Greensleeves', composer: 'Traditional (English, 16th century)',
    source: 'English ballad tune, registered in 1580. Melody as commonly published, in A minor, engraved by Stave.',
    genre: 'Folk', difficulty: 'Intermediate', clef: 'treble', key: 'Am', time: '3/4', pickup: 1,
    description: 'A minor-key melody in 3/4 with a pickup note, dotted rhythms and the raised sixth and seventh (F♯, G♯) of melodic minor.',
    music: 'a/4:q | c/5:h d/5:q | e/5:qd f/5:8 e/5:q | d/5:h b/4:q | g/4:qd a/4:8 b/4:q | c/5:h a/4:q | a/4:qd g#/4:8 a/4:q | b/4:h g#/4:q | e/4:h a/4:q | c/5:h d/5:q | e/5:qd f/5:8 e/5:q | d/5:h b/4:q | g/4:qd a/4:8 b/4:q | c/5:qd b/4:8 a/4:q | g#/4:qd f#/4:8 g#/4:q | a/4:h',
    licence: pd('traditional, 16th century'),
  },
  {
    id: 'minuet-g', title: 'Minuet in G major', composer: 'Christian Petzold (1677–1733)',
    source: 'From the 1725 Notebook for Anna Magdalena Bach (BWV Anh. 114), long attributed to J. S. Bach. Right-hand melody engraved by Stave.',
    genre: 'Classical', difficulty: 'Intermediate', clef: 'treble', key: 'G', time: '3/4', tempo: 'Moderato',
    description: 'The famous Baroque minuet: flowing eighth notes, leaps of a fourth and fifth, and an F♯ that leads home to G.',
    music: 'd/5:q g/4:8 a/4:8 b/4:8 c/5:8 | d/5:q g/4:q g/4:q | e/5:q c/5:8 d/5:8 e/5:8 f#/5:8 | g/5:q g/4:q g/4:q | c/5:q d/5:8 c/5:8 b/4:8 a/4:8 | b/4:q c/5:8 b/4:8 a/4:8 g/4:8 | f#/4:q g/4:8 a/4:8 b/4:8 g/4:8 | a/4:hd | d/5:q g/4:8 a/4:8 b/4:8 c/5:8 | d/5:q g/4:q g/4:q | e/5:q c/5:8 d/5:8 e/5:8 f#/5:8 | g/5:q g/4:q g/4:q | c/5:q d/5:8 c/5:8 b/4:8 a/4:8 | b/4:q c/5:8 b/4:8 a/4:8 g/4:8 | a/4:q b/4:8 a/4:8 g/4:8 f#/4:8 | g/4:hd',
    licence: pd('Petzold died in 1733'),
  },
  {
    id: 'jingle-bells', title: 'Jingle Bells (chorus)', composer: 'James Lord Pierpont (1822–1893)',
    source: 'Published 1857 as “One Horse Open Sleigh”. Chorus melody engraved by Stave.',
    genre: 'Seasonal', difficulty: 'Easy', clef: 'treble', key: 'C', time: '4/4',
    description: 'Repeated notes, a dotted quarter–eighth rhythm and a cheerful leap up to G.',
    music: 'e/4:q e/4:q e/4:h | e/4:q e/4:q e/4:h | e/4:q g/4:q c/4:qd d/4:8 | e/4:w | f/4:q f/4:q f/4:qd f/4:8 | f/4:q e/4:q e/4:q e/4:8 e/4:8 | e/4:q d/4:q d/4:q e/4:q | d/4:h g/4:h | e/4:q e/4:q e/4:h | e/4:q e/4:q e/4:h | e/4:q g/4:q c/4:qd d/4:8 | e/4:w | f/4:q f/4:q f/4:qd f/4:8 | f/4:q e/4:q e/4:q e/4:8 e/4:8 | g/4:q g/4:q f/4:q d/4:q | c/4:w',
    licence: pd('Pierpont died in 1893; published 1857'),
  },
  {
    id: 'row-your-boat', title: 'Row, Row, Row Your Boat', composer: 'Traditional (English/American, 19th century)',
    source: 'Traditional round, first printed in 1852. Engraved by Stave.',
    genre: 'Traditional', difficulty: 'Easy', clef: 'treble', key: 'C', time: '6/8',
    description: 'Your first piece in compound time: count two dotted-quarter beats per bar, each split into three eighths.',
    music: 'c/4:qd c/4:qd | c/4:q d/4:8 e/4:qd | e/4:q d/4:8 e/4:q f/4:8 | g/4:hd | c/5:8 c/5:8 c/5:8 g/4:8 g/4:8 g/4:8 | e/4:8 e/4:8 e/4:8 c/4:8 c/4:8 c/4:8 | g/4:q f/4:8 e/4:q d/4:8 | c/4:hd',
    licence: pd('traditional, printed 1852'),
  },
  {
    id: 'london-bridge', title: 'London Bridge Is Falling Down', composer: 'Traditional (English)',
    source: 'Traditional English nursery song. Engraved by Stave.',
    genre: 'Traditional', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '4/4',
    description: 'A dotted rhythm at the start of each phrase and lots of stepwise movement.',
    music: 'g/4:qd a/4:8 g/4:q f/4:q | e/4:q f/4:q g/4:h | d/4:q e/4:q f/4:h | e/4:q f/4:q g/4:h | g/4:qd a/4:8 g/4:q f/4:q | e/4:q f/4:q g/4:h | d/4:h g/4:h | e/4:h c/4:h',
    licence: pd('traditional'),
  },
  {
    id: 'yankee-doodle', title: 'Yankee Doodle', composer: 'Traditional (American, 18th century)',
    source: 'Traditional melody from the 1700s. Set in G major by Stave.',
    genre: 'Folk', difficulty: 'Easy', clef: 'treble', key: 'G', time: '4/4',
    description: 'Busy quarter notes in G major, with the F♯ leading note and a leap down to D.',
    music: 'g/4:q g/4:q a/4:q b/4:q | g/4:q b/4:q a/4:q d/4:q | g/4:q g/4:q a/4:q b/4:q | g/4:h f#/4:h | g/4:q g/4:q a/4:q b/4:q | c/5:q b/4:q a/4:q g/4:q | f#/4:q d/4:q e/4:q f#/4:q | g/4:h g/4:h',
    licence: pd('traditional'),
  },
  {
    id: 'fur-elise', title: 'Für Elise (opening theme)', composer: 'Ludwig van Beethoven (1770–1827)',
    source: 'Bagatelle in A minor, WoO 59 (1810). The opening theme’s melody, combined onto one staff by Stave; the original splits the broken chords between the hands.',
    genre: 'Classical', difficulty: 'Advanced', clef: 'treble', key: 'Am', time: '3/8', pickup: 0.5, tempo: 'Poco moto',
    description: 'Sixteenth notes in 3/8, a pickup, rests inside the bar and the D♯/G♯ accidentals that give the theme its colour.',
    music: 'e/5:16 d#/5:16 | e/5:16 d#/5:16 e/5:16 b/4:16 d/5:16 c/5:16 | a/4:8 r:16 c/4:16 e/4:16 a/4:16 | b/4:8 r:16 e/4:16 g#/4:16 b/4:16 | c/5:8 r:16 e/4:16 e/5:16 d#/5:16 | e/5:16 d#/5:16 e/5:16 b/4:16 d/5:16 c/5:16 | a/4:8 r:16 c/4:16 e/4:16 a/4:16 | b/4:8 r:16 e/4:16 c/5:16 b/4:16 | a/4:q',
    licence: pd('Beethoven died in 1827'),
  },

  /* ---------------- Stave originals ---------------- */
  {
    id: 'first-steps', title: 'First Steps on the Staff', composer: 'Stave (original)',
    source: 'Written for Unit 1 of the Stave curriculum.',
    genre: 'Educational', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '4/4', tempo: 'Slowly',
    description: 'Whole and half notes walking up and down by step from middle C — matches Levels 7–9 (steps and melodic shape).',
    music: 'c/4:w | d/4:w | e/4:w | f/4:w | g/4:h f/4:h | e/4:h d/4:h | e/4:h d/4:h | c/4:w',
    licence: original,
  },
  {
    id: 'line-space-waltz', title: 'Line and Space Waltz', composer: 'Stave (original)',
    source: 'Written for Unit 1 of the Stave curriculum.',
    genre: 'Educational', difficulty: 'Beginner', clef: 'treble', key: 'C', time: '3/4',
    description: 'The first phrase uses only line notes (E G B D), the second only space notes (F A C E). Name each note before you play it.',
    music: 'e/4:hd | g/4:hd | b/4:h g/4:q | e/4:hd | f/4:hd | a/4:hd | c/5:h a/4:q | f/4:hd | e/4:h g/4:q | b/4:h d/5:q | c/5:h a/4:q | c/5:hd',
    licence: original,
  },
  {
    id: 'skipping-stones', title: 'Skipping Stones', composer: 'Stave (original)',
    source: 'Written for Level 8 (Skips).',
    genre: 'Educational', difficulty: 'Easy', clef: 'treble', key: 'G', time: '4/4',
    description: 'Almost every move is a skip — line to line or space to space. Spot the few steps.',
    music: 'g/4:q b/4:q d/5:h | c/5:q a/4:q f#/4:h | g/4:q b/4:q a/4:q c/5:q | b/4:h g/4:h | e/4:q g/4:q b/4:h | a/4:q f#/4:q d/4:h | e/4:q g/4:q f#/4:q a/4:q | g/4:w',
    licence: original,
  },
  {
    id: 'up-down-hill', title: 'Up and Down the Hill', composer: 'Stave (original)',
    source: 'Written for Level 9 (Reading Melodic Shape).',
    genre: 'Educational', difficulty: 'Easy', clef: 'treble', key: 'F', time: '4/4',
    description: 'Each phrase is an arch: climb by step, pause at the top, come back down. Watch for B♭ in the key signature.',
    music: 'f/4:q g/4:q a/4:q bb/4:q | c/5:h c/5:h | d/5:q c/5:q bb/4:q a/4:q | g/4:h c/5:h | a/4:q bb/4:q c/5:q d/5:q | c/5:h a/4:h | g/4:q a/4:q g/4:q e/4:q | f/4:w',
    licence: original,
  },
  {
    id: 'morning-march', title: 'Morning March', composer: 'Stave (original)',
    source: 'Stave original.',
    genre: 'Educational', difficulty: 'Intermediate', clef: 'treble', key: 'D', time: '2/4', tempo: 'March tempo',
    description: 'A bright march in D major with groups of eighth notes, two sharps in the key signature and a C♯ leading note.',
    music: 'd/4:8 f#/4:8 a/4:8 d/5:8 | a/4:q f#/4:q | g/4:8 b/4:8 a/4:8 g/4:8 | f#/4:q d/4:q | e/4:8 f#/4:8 g/4:8 a/4:8 | b/4:q a/4:q | g/4:8 e/4:8 c#/4:8 e/4:8 | d/4:h',
    licence: original,
  },
  {
    id: 'evening-song', title: 'Evening Song in A Minor', composer: 'Stave (original)',
    source: 'Stave original.',
    genre: 'Contemporary', difficulty: 'Intermediate', clef: 'treble', key: 'Am', time: '4/4', tempo: 'Andante',
    description: 'A lyrical minor-key melody with dotted rhythms and the G♯ of the harmonic minor scale.',
    music: 'a/4:q c/5:q e/5:qd d/5:8 | c/5:q b/4:q a/4:h | g/4:q a/4:q b/4:qd c/5:8 | d/5:h e/5:h | f/5:q e/5:q d/5:q c/5:q | b/4:q a/4:q g#/4:h | a/4:q b/4:q c/5:q b/4:8 a/4:8 | a/4:w',
    licence: original,
  },
  {
    id: 'gentle-rain', title: 'Gentle Rain', composer: 'Stave (original)',
    source: 'Stave original.',
    genre: 'Contemporary', difficulty: 'Intermediate', clef: 'treble', key: 'F', time: '6/8', tempo: 'Flowing',
    description: 'Rippling eighth notes in 6/8 with long dotted notes at the end of each phrase.',
    music: 'c/5:8 a/4:8 f/4:8 c/5:8 a/4:8 f/4:8 | g/4:q a/4:8 bb/4:qd | a/4:8 g/4:8 f/4:8 g/4:qd | c/4:hd | f/4:8 a/4:8 c/5:8 d/5:q c/5:8 | bb/4:8 a/4:8 g/4:8 a/4:qd | g/4:8 e/4:8 c/4:8 e/4:q g/4:8 | f/4:hd',
    licence: original,
  },
  {
    id: 'syncopation-study', title: 'Syncopation Study No. 1', composer: 'Stave (original)',
    source: 'Written for World 4 (Syncopation).',
    genre: 'Educational', difficulty: 'Advanced', clef: 'treble', key: 'G', time: '4/4', tempo: 'Swinging, but straight eighths',
    description: 'Eighth–quarter–eighth patterns put the accent between the beats. Count “1 & 2 & …” aloud.',
    music: 'g/4:8 b/4:q d/5:8 r:8 d/5:q b/4:8 | c/5:8 a/4:q f#/4:8 d/4:h | g/4:8 a/4:8 b/4:8 c/5:q b/4:8 a/4:q | b/4:8 d/5:q b/4:8 g/4:h | e/5:8 d/5:q c/5:8 r:8 b/4:q a/4:8 | g/4:8 f#/4:q e/4:8 d/4:h | e/4:8 g/4:q b/4:8 a/4:8 f#/4:q d/4:8 | g/4:w',
    licence: original,
  },
  {
    id: 'seven-eight', title: 'Seven-Eight Dance', composer: 'Stave (original)',
    source: 'Written for World 6 (Irregular Meters).',
    genre: 'Contemporary', difficulty: 'Expert', clef: 'treble', key: 'Dm', time: '7/8', tempo: 'Lively, grouped 2+2+3',
    description: 'Seven eighth notes per bar, grouped 2+2+3, with sixteenth-note turns and the C♯ of D harmonic minor.',
    music: 'd/5:8 a/4:8 d/5:8 a/4:8 f/5:8 e/5:8 d/5:8 | c#/5:8 a/4:8 e/5:8 a/4:8 g/5:8 f/5:8 e/5:8 | f/5:8 d/5:8 a/5:8 f/5:8 e/5:16 f/5:16 e/5:16 d/5:16 c#/5:8 | d/5:q a/4:q d/5:qd | bb/4:8 d/5:8 g/5:8 d/5:8 f/5:8 e/5:8 d/5:8 | a/4:8 c#/5:8 e/5:8 c#/5:8 g/5:8 f/5:8 e/5:8 | f/5:16 e/5:16 d/5:16 c#/5:16 d/5:8 a/4:8 bb/4:8 a/4:8 g/4:8 | f/4:8 a/4:8 d/5:q d/5:qd',
    licence: original,
  },
  {
    id: 'bass-clef-walk', title: 'Bass Clef Walk', composer: 'Stave (original)',
    source: 'Written for Unit 6 (Reading Bass Notes).',
    genre: 'Educational', difficulty: 'Beginner', clef: 'bass', key: 'C', time: '4/4',
    description: 'A stepwise walk around the bass staff from C3 — for cello, trombone, bassoon or piano left hand.',
    music: 'c/3:q d/3:q e/3:q f/3:q | g/3:h g/3:h | a/3:q g/3:q f/3:q e/3:q | d/3:w | e/3:q f/3:q g/3:q a/3:q | g/3:h e/3:h | d/3:q e/3:q d/3:q b/2:q | c/3:w',
    licence: original,
  },
  {
    id: 'low-road-lullaby', title: 'Low Road Lullaby', composer: 'Stave (original)',
    source: 'Stave original.',
    genre: 'Contemporary', difficulty: 'Easy', clef: 'bass', key: 'F', time: '3/4', tempo: 'Gently',
    description: 'A bass-clef lullaby in F major and 3/4, rising to middle C and settling back to F.',
    music: 'f/3:h a/3:q | c/4:h a/3:q | bb/3:q a/3:q g/3:q | f/3:hd | g/3:h bb/3:q | a/3:h f/3:q | g/3:q e/3:q c/3:q | f/3:hd',
    licence: original,
  },
  {
    id: 'alto-clef-sketch', title: 'Alto Clef Sketch', composer: 'Stave (original)',
    source: 'Written for World 5 (Alto and Tenor Clefs).',
    genre: 'Educational', difficulty: 'Easy', clef: 'alto', key: 'C', time: '4/4',
    description: 'Broken chords around middle C — which sits on the middle line in alto clef. For viola.',
    music: 'c/4:q e/4:q g/4:q e/4:q | f/4:h d/4:h | e/4:q g/4:q b/4:q g/4:q | c/5:h g/4:h | a/4:q f/4:q d/4:q f/4:q | g/4:h e/4:h | f/4:q d/4:q b/3:q d/4:q | c/4:w',
    licence: original,
  },
  {
    id: 'rhythm-study-1', title: 'Rhythm Study No. 1', composer: 'Stave (original)',
    source: 'Written for Unit 9 (Beat and Rhythm).',
    genre: 'Educational', difficulty: 'Beginner', clef: 'percussion', key: 'C', time: '4/4',
    description: 'Bass drum (bottom space) and snare (third space) alternating on the beat, with pairs of eighth notes.',
    music: 'f/4:q c/5:q f/4:q c/5:q | f/4:q c/5:q f/4:q c/5:q | f/4:q c/5:q f/4:8 f/4:8 c/5:q | f/4:q c/5:q f/4:q c/5:q | f/4:8 f/4:8 c/5:q f/4:q c/5:q | f/4:q c/5:q f/4:8 f/4:8 c/5:q | f/4:q c/5:q f/4:q c/5:8 c/5:8 | f/4:q r:q c/5:h',
    licence: original,
  },
  {
    id: 'rhythm-study-2', title: 'Rhythm Study No. 2', composer: 'Stave (original)',
    source: 'Written for Unit 8 (Rests).',
    genre: 'Educational', difficulty: 'Easy', clef: 'percussion', key: 'C', time: '4/4',
    description: 'Hi-hat eighths (x noteheads) with snare backbeats and rests to count through.',
    music: 'g/5/x2:8 g/5/x2:8 c/5:8 g/5/x2:8 g/5/x2:8 g/5/x2:8 c/5:8 g/5/x2:8 | g/5/x2:8 g/5/x2:8 c/5:8 g/5/x2:8 g/5/x2:8 g/5/x2:8 c/5:q | f/4:q r:q c/5:q r:q | f/4:8 f/4:8 r:q c/5:h | g/5/x2:8 g/5/x2:8 c/5:8 g/5/x2:8 g/5/x2:8 g/5/x2:8 c/5:8 g/5/x2:8 | f/4:8 g/5/x2:8 c/5:8 g/5/x2:8 f/4:8 f/4:8 c/5:q | r:q c/5:q r:q c/5:q | f/4:q c/5:q f/4:q r:q',
    licence: original,
  },
];

export const getScore = (id: string) => SCORES.find((s) => s.id === id);
