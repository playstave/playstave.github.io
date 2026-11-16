/**
 * Real songs for the course — all public domain (traditional, or by composers
 * who died long ago). Melodies are written in SCALE DEGREES so each song can be
 * arranged in any key and register for any instrument:
 *
 *   3:q        degree 3, quarter note        r:h     half rest
 *   5,:h       degree 5, an octave lower     1':q    degree 1, an octave higher
 *   #4:8       raised 4th                    b7:q    lowered 7th
 *   durations  w h q 8 16, with d for dotted (hd, qd, 8d)
 *
 * Minor-key songs count degrees in the natural minor (so 3 is the minor third;
 * #7 is the raised leading note). A pickup (anacrusis) is written as a first bar
 * that starts with rests.
 *
 * These melodies were written down by Stave from well-known tunes; the composers'
 * originals are public domain, and these arrangements are dedicated to the public
 * domain (CC0). A few longer classical themes are simplified and say so.
 */

export interface Song {
  id: string;
  title: string;
  /** Composer, or "Traditional" with origin. */
  by: string;
  /** Where it comes from and why it's public domain. */
  source: string;
  time: '4/4' | '3/4' | '2/4' | '6/8';
  mode: 'major' | 'minor';
  music: string;
  /** True when this is a simplified version of a longer classical theme. */
  simplified?: boolean;
}

export const SONGS: Song[] = [
  {
    id: 'hot-cross-buns', title: 'Hot Cross Buns', by: 'Traditional (English street cry)', source: 'Traditional melody, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: '3:q 2:q 1:h | 3:q 2:q 1:h | 1:8 1:8 1:8 1:8 2:8 2:8 2:8 2:8 | 3:q 2:q 1:h',
  },
  {
    id: 'au-clair', title: 'Au clair de la lune', by: 'Traditional (French)', source: 'French folk song, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: '1:q 1:q 1:q 2:q | 3:h 2:h | 1:q 3:q 2:q 2:q | 1:w | 1:q 1:q 1:q 2:q | 3:h 2:h | 1:q 3:q 2:q 2:q | 1:w | 2:q 2:q 2:q 2:q | 6,:h 6,:h | 2:q 1:q 7,:q 6,:q | 5,:w | 1:q 1:q 1:q 2:q | 3:h 2:h | 1:q 3:q 2:q 2:q | 1:w',
  },
  {
    id: 'mary', title: 'Mary Had a Little Lamb', by: 'Traditional (American)', source: 'American nursery song, 1830s; public domain.',
    time: '4/4', mode: 'major',
    music: '3:q 2:q 1:q 2:q | 3:q 3:q 3:h | 2:q 2:q 2:h | 3:q 5:q 5:h | 3:q 2:q 1:q 2:q | 3:q 3:q 3:q 3:q | 2:q 2:q 3:q 2:q | 1:w',
  },
  {
    id: 'lightly-row', title: 'Lightly Row', by: 'Traditional (German)', source: 'German folk song “Hänschen klein”, 19th century; public domain.',
    time: '4/4', mode: 'major',
    music: '5:q 3:q 3:h | 4:q 2:q 2:h | 1:q 2:q 3:q 4:q | 5:q 5:q 5:h | 5:q 3:q 3:q 3:q | 4:q 2:q 2:q 2:q | 1:q 3:q 5:q 5:q | 3:w | 2:q 2:q 2:q 2:q | 2:q 3:q 4:h | 3:q 3:q 3:q 3:q | 3:q 4:q 5:h | 5:q 3:q 3:q 3:q | 4:q 2:q 2:q 2:q | 1:q 3:q 5:q 5:q | 1:w',
  },
  {
    id: 'twinkle', title: 'Twinkle, Twinkle, Little Star', by: 'Traditional (French “Ah ! vous dirai-je, maman”)', source: 'French melody, 1761; public domain. Mozart wrote famous variations on it (K. 265).',
    time: '4/4', mode: 'major',
    music: '1:q 1:q 5:q 5:q | 6:q 6:q 5:h | 4:q 4:q 3:q 3:q | 2:q 2:q 1:h | 5:q 5:q 4:q 4:q | 3:q 3:q 2:h | 5:q 5:q 4:q 4:q | 3:q 3:q 2:h | 1:q 1:q 5:q 5:q | 6:q 6:q 5:h | 4:q 4:q 3:q 3:q | 2:q 2:q 1:h',
  },
  {
    id: 'frere-jacques', title: 'Frère Jacques', by: 'Traditional (French)', source: 'French round, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: '1:q 2:q 3:q 1:q | 1:q 2:q 3:q 1:q | 3:q 4:q 5:h | 3:q 4:q 5:h | 5:8 6:8 5:8 4:8 3:q 1:q | 5:8 6:8 5:8 4:8 3:q 1:q | 1:q 5,:q 1:h | 1:q 5,:q 1:h',
  },
  {
    id: 'london-bridge', title: 'London Bridge', by: 'Traditional (English)', source: 'English nursery song, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: '5:qd 6:8 5:q 4:q | 3:q 4:q 5:h | 2:q 3:q 4:h | 3:q 4:q 5:h | 5:qd 6:8 5:q 4:q | 3:q 4:q 5:h | 2:h 5:h | 3:q 1:q 1:h',
  },
  {
    id: 'old-macdonald', title: 'Old MacDonald Had a Farm', by: 'Traditional', source: 'Folk song, early 20th century from older tunes; public domain.',
    time: '4/4', mode: 'major',
    music: '1:q 1:q 1:q 5,:q | 6,:q 6,:q 5,:h | 3:q 3:q 2:q 2:q | 1:hd 5,:q | 1:q 1:q 1:q 5,:q | 6,:q 6,:q 5,:h | 3:q 3:q 2:q 2:q | 1:w',
  },
  {
    id: 'ode-to-joy', title: 'Ode to Joy', by: 'Ludwig van Beethoven (1770–1827)', source: 'Theme from Symphony No. 9 (1824); public domain.',
    time: '4/4', mode: 'major',
    music: '3:q 3:q 4:q 5:q | 5:q 4:q 3:q 2:q | 1:q 1:q 2:q 3:q | 3:qd 2:8 2:h | 3:q 3:q 4:q 5:q | 5:q 4:q 3:q 2:q | 1:q 1:q 2:q 3:q | 2:qd 1:8 1:h | 2:q 2:q 3:q 1:q | 2:q 3:8 4:8 3:q 1:q | 2:q 3:8 4:8 3:q 2:q | 1:q 2:q 5,:h | 3:q 3:q 4:q 5:q | 5:q 4:q 3:q 2:q | 1:q 1:q 2:q 3:q | 2:qd 1:8 1:h',
  },
  {
    id: 'jingle-bells', title: 'Jingle Bells', by: 'James Lord Pierpont (1822–1893)', source: 'Published 1857; public domain. (Chorus.)',
    time: '4/4', mode: 'major',
    music: '3:q 3:q 3:h | 3:q 3:q 3:h | 3:q 5:q 1:qd 2:8 | 3:w | 4:q 4:q 4:qd 4:8 | 4:q 3:q 3:q 3:8 3:8 | 3:q 2:q 2:q 3:q | 2:h 5:h | 3:q 3:q 3:h | 3:q 3:q 3:h | 3:q 5:q 1:qd 2:8 | 3:w | 4:q 4:q 4:q 4:q | 4:q 3:q 3:q 3:8 3:8 | 5:q 5:q 4:q 2:q | 1:w',
  },
  {
    id: 'yankee-doodle', title: 'Yankee Doodle', by: 'Traditional (American)', source: 'American song, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: '1:q 1:q 2:q 3:q | 1:q 3:q 2:q 5,:q | 1:q 1:q 2:q 3:q | 1:h 7,:h | 1:q 1:q 2:q 3:q | 4:q 3:q 2:q 1:q | 7,:q 5,:q 6,:q 7,:q | 1:h 1:h',
  },
  {
    id: 'saints', title: 'When the Saints Go Marching In', by: 'Traditional (American spiritual)', source: 'Traditional, late 19th century; public domain.',
    time: '4/4', mode: 'major',
    music: 'r:q 1:q 3:q 4:q | 5:w | r:q 1:q 3:q 4:q | 5:w | r:q 1:q 3:q 4:q | 5:h 3:h | 1:h 3:h | 2:w | r:q 3:q 3:q 2:q | 1:hd 1:q | 3:h 5:q 5:q | 5:q 4:hd | r:q 3:q 4:q 5:q | 3:h 1:h | 2:h 2:h | 1:w',
  },
  {
    id: 'amazing-grace', title: 'Amazing Grace', by: 'Traditional (tune “New Britain”)', source: 'American hymn tune, 1829; public domain.',
    time: '3/4', mode: 'major',
    music: 'r:h 5,:q | 1:h 3:8 1:8 | 3:h 2:q | 1:h 6,:q | 5,:h 5,:q | 1:h 3:8 1:8 | 3:h 2:q | 5:hd | 5:h 3:q | 5:h 3:8 1:8 | 3:h 2:q | 1:h 6,:q | 5,:h 5,:q | 1:h 3:8 1:8 | 3:h 2:q | 1:hd',
  },
  {
    id: 'auld-lang-syne', title: 'Auld Lang Syne', by: 'Traditional (Scottish)', source: 'Scottish melody, 18th century; public domain.',
    time: '4/4', mode: 'major',
    music: 'r:hd 5,:q | 1:qd 1:8 1:q 3:q | 2:qd 1:8 2:q 3:q | 1:qd 1:8 3:q 5:q | 6:hd 6:q | 5:qd 3:8 3:q 1:q | 2:qd 1:8 2:q 3:q | 1:qd 6,:8 6,:q 5,:q | 1:w',
  },
  {
    id: 'row-your-boat', title: 'Row, Row, Row Your Boat', by: 'Traditional', source: 'Round, 19th century; public domain.',
    time: '6/8', mode: 'major',
    music: '1:qd 1:qd | 1:q 2:8 3:qd | 3:q 2:8 3:q 4:8 | 5:hd | 1\':8 1\':8 1\':8 5:8 5:8 5:8 | 3:8 3:8 3:8 1:8 1:8 1:8 | 5:q 4:8 3:q 2:8 | 1:hd',
  },
  {
    id: 'minuet-g', title: 'Minuet in G', by: 'Christian Petzold (1677–1733)', source: 'From the Notebook for Anna Magdalena Bach (1725); public domain.',
    time: '3/4', mode: 'major',
    music: '5:q 1:8 2:8 3:8 4:8 | 5:q 1:q 1:q | 6:q 4:8 5:8 6:8 7:8 | 1\':q 1:q 1:q | 4:q 5:8 4:8 3:8 2:8 | 3:q 4:8 3:8 2:8 1:8 | 7,:q 1:8 2:8 3:8 1:8 | 2:hd | 5:q 1:8 2:8 3:8 4:8 | 5:q 1:q 1:q | 6:q 4:8 5:8 6:8 7:8 | 1\':q 1:q 1:q | 4:q 5:8 4:8 3:8 2:8 | 3:q 4:8 3:8 2:8 1:8 | 2:q 3:8 2:8 1:8 7,:8 | 1:hd',
  },
  {
    id: 'surprise', title: 'Surprise Symphony theme', by: 'Joseph Haydn (1732–1809)', source: 'Symphony No. 94, second movement (1791); public domain. Simplified.',
    time: '4/4', mode: 'major', simplified: true,
    music: '1:q 1:q 3:q 3:q | 5:q 5:q 3:h | 4:q 4:q 2:q 2:q | 7,:q 7,:q 5,:h | 1:q 1:q 3:q 3:q | 5:q 5:q 1\':h | 6:q 4:q 3:q 2:q | 1:w',
  },
  {
    id: 'nachtmusik', title: 'Eine kleine Nachtmusik (opening)', by: 'Wolfgang Amadeus Mozart (1756–1791)', source: 'Serenade K. 525 (1787); public domain. Opening theme, simplified.',
    time: '4/4', mode: 'major', simplified: true,
    music: '1:h 5,:q 1:q | 5,:q 1:q 3:q 5:q | 4:h 2:q 4:q | 2:q 4:q 7,:q 2:q | 5,:q 7,:q 2:q 4:q | 3:q 1:q 3:q 5:q | 1\':q 7:q 6:q 5:q | 4:q 3:q 2:q 1:q | 1:w',
  },
  {
    id: 'goin-home', title: 'Largo (“Goin’ Home”)', by: 'Antonín Dvořák (1841–1904)', source: 'Symphony No. 9 “From the New World”, second movement (1893); public domain. Simplified rhythm.',
    time: '4/4', mode: 'major', simplified: true,
    music: '3:qd 5:8 5:h | 3:qd 2:8 1:h | 2:q 3:q 5:q 3:q | 2:w | 3:qd 5:8 5:h | 3:qd 2:8 1:h | 2:q 3:q 2:q 1:q | 1:w',
  },
  {
    id: 'canon', title: 'Canon in D (melody)', by: 'Johann Pachelbel (1653–1706)', source: 'Canon and Gigue (c. 1700); public domain. The famous opening melody.',
    time: '4/4', mode: 'major',
    music: '3\':h 2\':h | 1\':h 7:h | 6:h 5:h | 6:h 7:h | 1\':q 7:q 6:q 5:q | 4:q 3:q 4:q 2:q | 1:q 3:q 5:q 4:q | 3:q 1:q 3:q 2:q | 1\':w',
  },
  {
    id: 'canon-bass', title: 'Canon in D (bass line)', by: 'Johann Pachelbel (1653–1706)', source: 'Canon and Gigue (c. 1700); public domain. The repeating bass line every cellist and bassist knows.',
    time: '4/4', mode: 'major',
    music: '1:h 5,:h | 6,:h 3,:h | 4,:h 1,:h | 4,:h 5,:h | 1:h 5,:h | 6,:h 3,:h | 4,:h 1,:h | 4,:h 5,:h | 1:w',
  },
  {
    id: 'greensleeves', title: 'Greensleeves', by: 'Traditional (English)', source: 'English ballad, 16th century; public domain.',
    time: '3/4', mode: 'minor',
    music: 'r:h 1:q | 3:h 4:q | 5:qd 6:8 5:q | 4:h 2:q | 7,:qd 1:8 2:q | 3:h 1:q | 1:qd #7,:8 1:q | 2:h #7,:q | 5,:h 1:q | 3:h 4:q | 5:qd 6:8 5:q | 4:h 2:q | 7,:qd 1:8 2:q | 3:qd 2:8 1:q | #7,:qd 6,:8 #7,:q | 1:hd',
  },
  {
    id: 'mountain-king', title: 'In the Hall of the Mountain King', by: 'Edvard Grieg (1843–1907)', source: 'Peer Gynt (1875); public domain. Main theme.',
    time: '4/4', mode: 'minor',
    music: '1:8 2:8 3:8 4:8 5:8 3:8 5:q | #4:8 2:8 #4:q 4:8 b2:8 4:q | 1:8 2:8 3:8 4:8 5:8 3:8 5:8 1\':8 | #7:8 5:8 3:8 5:8 #7:h | 1:8 2:8 3:8 4:8 5:8 3:8 5:q | #4:8 2:8 #4:q 4:8 b2:8 4:q | 1:8 2:8 3:8 4:8 5:8 3:8 5:8 1\':8 | #7:8 5:8 3:8 5:8 1\':h',
  },
  {
    id: 'morning-mood', title: 'Morning Mood', by: 'Edvard Grieg (1843–1907)', source: 'Peer Gynt (1875); public domain. Opening theme, simplified.',
    time: '6/8', mode: 'major', simplified: true,
    music: '5:8 3:8 2:8 1:8 2:8 3:8 | 5:8 3:8 2:8 1:8 2:8 3:8 | 2:8 3:8 5:8 3:8 5:8 6:8 | 3:8 6:8 5:8 3:8 2:q | 5:8 3:8 2:8 1:8 2:8 3:8 | 5:8 3:8 2:8 1:8 2:8 3:8 | 2:8 3:8 5:8 6:8 5:8 3:8 | 1:hd',
  },
  {
    id: 'spring', title: 'Spring (main theme)', by: 'Antonio Vivaldi (1678–1741)', source: 'The Four Seasons, “Spring”, first movement (1725); public domain. The opening ritornello theme, arranged by Stave — to be checked against a printed edition.',
    time: '4/4', mode: 'major', simplified: true,
    music: '1:8 3:8 3:8 3:8 2:16 1:16 5:qd | 5:8 4:16 3:16 3:8 3:8 3:8 2:16 1:16 5:q | 5:8 4:16 3:16 4:8 5:8 4:8 3:8 2:q | 7,:8 5,:8 1:h r:q | 1:8 3:8 3:8 3:8 2:16 1:16 5:qd | 5:8 4:16 3:16 3:8 3:8 3:8 2:16 1:16 5:q | 5:8 4:16 3:16 4:8 5:8 4:8 3:8 2:q | 7,:8 5,:8 1:h r:q',
  },
];

export const getSong = (id: string) => SONGS.find((s) => s.id === id);
