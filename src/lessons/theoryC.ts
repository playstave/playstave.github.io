/** Theory lessons 28–36: tempo, expression, sixteenths, chromatics, ornaments, form, string terms, Vivaldi, final checkpoint. */
import type { Lesson } from './types';
import { beatsOf, countLabels, fig, intervalQ, keySigQ, mc, nameNote } from './notation';

export const level28: Lesson = {
  level: 28,
  title: 'Tempo Words',
  objective: 'Understand the Italian words for speed and for changing speed.',
  intro: [
    'Composers usually write the speed of a piece in **Italian**, the language music was printed in when these terms became standard.',
    'Some words set a speed. Others ask you to change it.',
  ],
  steps: [
    {
      title: 'From slow to fast',
      body: ['**Largo**: very slow and broad. **Adagio**: slow. **Andante**: at a walking pace. **Moderato**: moderate.', '**Allegro**: fast and lively. **Presto**: very fast.'],
      tip: 'Dvořák’s “Goin’ Home” theme is from a Largo. Vivaldi’s Spring opens Allegro.',
    },
    {
      title: 'Changing speed',
      body: ['**ritardando** (*rit.*) or **rallentando** (*rall.*): gradually slow down. **accelerando** (*accel.*): gradually speed up.', '**a tempo**: go back to the speed before. A **fermata** (𝄐) means hold the note longer than written.'],
    },
  ],
  practice: [
    mc('t28p1', 'What does Allegro mean?', ['Fast and lively', 'Allegro literally means cheerful, and it marks a quick, lively speed.'], [['Slow', 'Slow is Adagio (or Largo for very slow).'], ['At a walking pace', 'That is Andante.']]),
    mc('t28p2', 'What does rit. tell you to do?', ['Gradually slow down', 'Ritardando: hold back the tempo bit by bit.'], [['Suddenly stop', 'A rit. is gradual, not sudden.'], ['Get louder', 'Volume words are dynamics, such as crescendo.']]),
    mc('t28p3', 'Which is slowest?', ['Largo', 'Largo is very slow and broad.'], [['Andante', 'Andante is a walking pace, faster than Largo.'], ['Moderato', 'Moderato is moderate, much faster than Largo.']]),
  ],
  challenge: [
    mc('t28c1', 'After a rit., the music says “a tempo”. What do you do?', ['Return to the original speed', 'A tempo means back to the earlier speed.'], [['Keep slowing down', 'The rit. has ended. A tempo cancels it.'], ['Play twice as fast', 'It returns to the earlier speed, not double.']]),
    mc('t28c2', 'What does accelerando mean?', ['Gradually speed up', 'Think of a car’s accelerator.'], [['Gradually slow down', 'That is ritardando.'], ['Play with accents', 'Accents are articulation marks.']]),
    mc('t28c3', 'Put these in order from slowest to fastest.', ['Adagio, Andante, Allegro, Presto', 'Slow, walking pace, fast, very fast.'], [['Andante, Adagio, Presto, Allegro', 'Adagio is slower than Andante, and Presto faster than Allegro.'], ['Presto, Allegro, Andante, Adagio', 'That is fastest to slowest.']]),
    mc('t28c4', 'A fermata over a note means…', ['Hold it longer than its written value', 'Pause on the note. The performer or conductor decides how long.'], [['Play it very short', 'Short notes are marked staccato.'], ['Skip the note', 'A fermata never means skip.']]),
    mc('t28c5', 'What does Andante mean?', ['At a walking pace', 'From the Italian andare, to walk.'], [['Very fast', 'That is Presto.'], ['Very slow and broad', 'That is Largo.']]),
  ],
};

export const level29: Lesson = {
  level: 29,
  title: 'Dynamics and Articulation',
  objective: 'Read the signs for volume and for how each note is played.',
  intro: [
    'Dynamics tell you how **loud** to play. Articulations tell you how to **start, shape and end** each note.',
    'On a string instrument, both come mostly from the bow: its speed, weight and where it touches the string.',
  ],
  steps: [
    {
      title: 'Dynamics',
      body: ['**pp** pianissimo (very soft), **p** piano (soft), **mp** mezzo-piano, **mf** mezzo-forte, **f** forte (loud), **ff** fortissimo (very loud).', '**cresc.** or **<** (a hairpin opening out): get louder gradually. **dim.** or **>** (closing): get softer.'],
    },
    {
      title: 'Articulation',
      body: ['**Staccato** (a dot over or under the note): short and separated. **Accent** (>): a strong start. **Tenuto** (a short line): give the note its full length.', 'Careful: a little accent > sits on one note, while a long **decrescendo hairpin** stretches across many notes.'],
    },
  ],
  practice: [
    mc('t29p1', 'Which is louder?', ['mf', 'mf (mezzo-forte, medium loud) is louder than mp (mezzo-piano, medium soft).'], [['mp', 'mp is medium SOFT.']]),
    mc('t29p2', 'What does a dot above a note mean?', ['Staccato: short and separated', 'The dot asks for a short, detached note.'], [['Make it longer', 'A dot AFTER a note lengthens it. A dot above or below means staccato.'], ['Play it louder', 'Volume is shown with dynamics.']]),
    mc('t29p3', 'What does cresc. mean?', ['Get gradually louder', 'Crescendo: grow in volume.'], [['Get gradually softer', 'That is diminuendo (dim.) or decrescendo.'], ['Get faster', 'Speeding up is accelerando.']]),
  ],
  challenge: [
    mc('t29c1', 'Order these from softest to loudest.', ['pp, p, mf, ff', 'Very soft, soft, medium loud, very loud.'], [['p, pp, ff, mf', 'pp is softer than p, and ff is louder than mf.'], ['ff, mf, p, pp', 'That is loudest to softest.']]),
    mc('t29c2', 'A dash (short line) over a note is a…', ['Tenuto: hold it for its full value', 'Tenuto means held: full length, often slightly leaned on.'], [['Staccato', 'Staccato is a dot.'], ['Accent', 'An accent is a > sign.']]),
    mc('t29c3', 'What does sfz (sforzando) ask for?', ['A sudden, strong accent', 'Sforzando: a forced, sudden emphasis on one note.'], [['A gradual crescendo', 'A crescendo is gradual. Sforzando is sudden.'], ['Very soft playing', 'That is pp.']]),
    mc('t29c4', 'How do string players usually play louder?', ['More bow speed and weight, closer to the bridge', 'Faster, heavier bow strokes nearer the bridge make a louder sound.'], [['Press the left-hand fingers harder', 'Left-hand pressure doesn’t change the volume much. The bow makes the sound.'], ['Use more vibrato', 'Vibrato colours the sound but doesn’t make it much louder.']]),
    mc('t29c5', 'A long “>” hairpin under several notes means…', ['Gradually get softer', 'A closing hairpin is a decrescendo.'], [['Accent every note', 'An accent is a small > on a single note.'], ['Slow down', 'Slowing down is rit.']]),
    mc('t29c6', 'What does mp mean?', ['Medium soft', 'Mezzo-piano: moderately soft.'], [['Medium loud', 'That is mf, mezzo-forte.'], ['Very soft', 'That is pp.']]),
  ],
};

export const level30: Lesson = {
  level: 30,
  title: 'Sixteenth-Note Rhythms',
  objective: 'Count sixteenths as “1 e & a” and read common sixteenth patterns.',
  intro: [
    'Fast passagework is built from sixteenth notes. Counting them precisely is what keeps them even.',
    'Each beat splits into four: **1 e & a, 2 e & a…**',
  ],
  steps: [
    {
      title: 'Four to a beat',
      body: ['Four sixteenths fill one quarter-note beat. They are joined by **two beams**.', 'Say “1 e & a 2 e & a” evenly, like a ticking clock.'],
      figure: fig('g/4:16 a/4:16 b/4:16 c/5:16 d/5:16 c/5:16 b/4:16 a/4:16 g/4:h', 'Eight sixteenths and a half note.', { time: '4/4', caption: '1 e & a 2 e & a 3 (4)' }),
    },
    {
      title: 'Mixed patterns',
      body: ['**8 – 16 – 16** (“1 & a”) and **16 – 16 – 8** (“1 e &”) mix eighths and sixteenths within one beat.', 'The dotted eighth + sixteenth (“1 a”) gives a sharp, skipping rhythm.'],
      figure: fig('g/4:8 a/4:16 b/4:16 c/5:16 d/5:16 e/5:8 f#/5:8d g/5:16 g/5:h', 'Mixed eighth and sixteenth patterns.', { time: '4/4', caption: `Counts: ${countLabels('g/4:8 a/4:16 b/4:16 c/5:16 d/5:16 e/5:8 f#/5:8d g/5:16 g/5:h').join(' ')}` }),
    },
  ],
  practice: [
    mc('t30p1', 'How many sixteenth notes fill one quarter-note beat?', ['4', 'Each sixteenth is ¼ beat.'], [['2', 'Two EIGHTHS fill a beat.'], ['16', 'Sixteen sixteenths fill a whole note (4 beats).']]),
    mc('t30p2', 'How are sixteenths counted?', ['1 e & a', 'The beat, then “e”, “&”, “a”: four even parts.'], [['1 & 2 &', 'That counts eighth notes.'], ['1 2 3 4', 'That counts quarter notes.']]),
    mc('t30p3', 'How many beams join sixteenth notes?', ['2', 'Two beams (or two flags) = sixteenths.'], [['1', 'One beam = eighth notes.'], ['3', 'Three beams = thirty-second notes.']]),
  ],
  challenge: [
    mc('t30c1', 'On which count does note 3 start?', [countLabels('g/4:8 a/4:16 b/4:16 c/5:q d/5:h')[2], 'Eighth (1) + sixteenth (1&) → note 3 starts on “a” of 1.'], [['1&', 'That is note 2.'], ['2', 'The first three notes all fit inside beat 1.']], fig('g/4:8 a/4:16 b/4:16 c/5:q d/5:h', 'Eighth, two sixteenths, quarter, half.', { time: '4/4' })),
    mc('t30c2', 'On which count does note 2 start?', [countLabels('e/5:8d d/5:16 c/5:q b/4:h')[1], 'The dotted eighth lasts ¾ beat, so note 2 starts on the “a” of 1.'], [['1&', 'A dotted eighth is longer than an eighth: it carries on past the “&”.'], ['2', 'The dotted eighth plus sixteenth together fill beat 1.']], fig('e/5:8d d/5:16 c/5:q b/4:h', 'Dotted eighth, sixteenth, quarter, half.', { time: '4/4' })),
    mc('t30c3', 'How many beats are in this bar?', [`${beatsOf('g/4:16 a/4:16 b/4:16 c/5:16 d/5:8 d/5:8 g/4:h')}`, 'Four sixteenths (1) + two eighths (1) + half (2) = 4.'], [['8', 'Sixteenths and eighths are fractions of a beat, not whole beats.'], ['3', 'Count all four groups.']], fig('g/4:16 a/4:16 b/4:16 c/5:16 d/5:8 d/5:8 g/4:h', 'Four sixteenths, two eighths, half note.', { time: '4/4' })),
    mc('t30c4', 'On which count does note 4 start?', [countLabels('g/4:16 a/4:16 b/4:8 c/5:q d/5:h')[3], '16 + 16 + 8 = one beat, so note 4 starts on 2.'], [['1a', 'Note 3 is an eighth: it lasts from “&” to the end of the beat.'], ['2&', 'Note 4 starts exactly on the beat.']], fig('g/4:16 a/4:16 b/4:8 c/5:q d/5:h', 'Two sixteenths, an eighth, quarter, half.', { time: '4/4' })),
    mc('t30c5', 'How many sixteenths last as long as a dotted quarter?', ['6', 'A dotted quarter is 1½ beats = 6 quarter-beats.'], [['4', 'Four sixteenths make a plain quarter. The dot adds two more.'], ['3', 'Three sixteenths make a dotted eighth.']]),
  ],
};

export const level31: Lesson = {
  level: 31,
  title: 'Chromatic Notes and Enharmonics',
  objective: 'Know the chromatic scale and recognise notes with two names.',
  intro: [
    'The **chromatic scale** uses every half step: twelve different notes before the octave.',
    'Some notes have two names. F♯ and G♭ are played the same way on your instrument but written differently.',
  ],
  steps: [
    {
      title: 'Every half step',
      body: ['Going up, chromatic scales are usually written with **sharps**. Coming down, with **flats**.', 'Between E–F and B–C there is no black-key note, so those pairs are already a half step apart.'],
      figure: fig('c/4:8 c#/4:8 d/4:8 d#/4:8 e/4:8 f/4:8 f#/4:8 g/4:8', 'Chromatic scale from C going up with sharps.', { caption: 'C C♯ D D♯ E F F♯ G…' }),
    },
    {
      title: 'Enharmonic notes',
      body: ['Two names for one pitch are **enharmonic**: C♯ = D♭, F♯ = G♭, A♯ = B♭. Even E♯ = F and B♯ = C.', 'The name depends on the key: in D major it is F♯, in D♭ major it is G♭.'],
    },
  ],
  practice: [
    mc('t31p1', 'How many different notes are in a chromatic scale before the octave?', ['12', 'Twelve half steps make an octave.'], [['8', 'Eight notes (including the octave) is a major or minor scale.'], ['7', 'Seven is the number of letter names.']]),
    mc('t31p2', 'Which note is enharmonic with F♯?', ['G♭', 'F♯ and G♭ are the same pitch.'], [['F♭', 'F♭ is lower, the same pitch as E.'], ['G♯', 'G♯ is a whole step above F♯.']]),
    mc('t31p3', 'Which pair of natural notes has no note between them?', ['B and C', 'B to C is a half step, like E to F.'], [['C and D', 'C♯/D♭ lies between them.'], ['G and A', 'G♯/A♭ lies between them.']]),
  ],
  challenge: [
    mc('t31c1', 'What is another name for E♯?', ['F', 'E to F is a half step, so raising E by a half step lands on F.'], [['F♯', 'That would be two half steps above E.'], ['E♭', 'E♭ is lower than E, not higher.']]),
    mc('t31c2', 'B♭ is enharmonic with…', ['A♯', 'A♯ and B♭ are one pitch with two names.'], [['B♯', 'B♯ is the same as C.'], ['A♭', 'A♭ is a whole step below B♭.']]),
    mc('t31c3', 'A descending chromatic scale is usually written with…', ['Flats', 'Flats lead the ear downwards: B, B♭, A, A♭…'], [['Sharps', 'Sharps are used going up.'], ['Naturals only', 'A chromatic scale must include the in-between notes.']]),
    intervalQ('t31c4', 'c#/5', 'e/5'),
    mc('t31c5', 'In D major, the note between F and G is written…', ['F♯', 'D major’s key signature has F♯, so it is named F♯, not G♭.'], [['G♭', 'Same pitch, but D major uses sharps, so we write F♯.'], ['F♭', 'F♭ is below F.']]),
    mc('t31c6', 'How many half steps are in an octave?', ['12', 'Twelve half steps from a note to the note an octave above.'], [['8', 'An octave spans 8 letter names, but 12 half steps.'], ['7', 'There are 7 letter names, but 12 half steps.']]),
  ],
};

export const level32: Lesson = {
  level: 32,
  title: 'Ornaments',
  objective: 'Recognise trills, mordents, turns and grace notes.',
  intro: [
    'Baroque and classical composers decorated melodies with **ornaments**: quick extra notes around the written note.',
    'You have played trills in the Baroque Masters unit. Here are the signs behind them.',
  ],
  steps: [
    {
      title: 'Trill and mordent',
      body: ['**Trill** (*tr*): rapidly alternate the written note with the note **above**. In baroque music trills often start from the upper note.', '**Mordent**: one quick flick to the neighbouring note and straight back.'],
    },
    {
      title: 'Turn and grace notes',
      body: ['**Turn** (∽): note above, the note, note below, the note.', '**Grace notes** are tiny notes before the main note. A slashed one (*acciaccatura*) is crushed in very quickly. An unslashed one (*appoggiatura*) leans on the beat.'],
    },
  ],
  practice: [
    mc('t32p1', 'What does “tr” over a note mean?', ['Trill: alternate quickly with the note above', 'A trill is a rapid alternation with the upper neighbour.'], [['Tremolo: shake the bow on one note', 'Tremolo is shown with slashes through the stem, not “tr”.'], ['Play it with a triplet rhythm', 'Triplets are marked with a 3.']]),
    mc('t32p2', 'A turn goes…', ['Note above, the note, note below, the note', 'The turn wraps around the main note.'], [['Up the scale for an octave', 'A turn only uses the neighbours of one note.'], ['The note, then a rest', 'A turn adds notes. It doesn’t remove any.']]),
    mc('t32p3', 'A tiny note with a slash through its stem is…', ['An acciaccatura, crushed in very quickly', 'The slash means play it as fast as possible, just before the beat.'], [['An appoggiatura, leaning on the beat', 'An appoggiatura has no slash and takes real time.'], ['A note to leave out', 'Grace notes are always played.']]),
  ],
  challenge: [
    mc('t32c1', 'In baroque music, a trill often starts on…', ['The note above', 'Baroque trills commonly begin on the upper note, leaning on it.'], [['The note below', 'Trills alternate with the note ABOVE.'], ['A rest', 'Trills start straight away on a note.']]),
    mc('t32c2', 'What is a mordent?', ['A single quick alternation with a neighbour note', 'A mordent is like a very short trill: note, neighbour, note.'], [['A long held note', 'That would be a fermata or tenuto.'], ['A slide between two positions', 'That is a glissando or portamento.']]),
    mc('t32c3', 'Why did baroque players add ornaments?', ['To decorate and add expression', 'Ornaments add expression and sparkle, especially on long or repeated notes.'], [['To fill in for missing notes', 'Ornaments decorate notes that are already there.'], ['To tune the instrument', 'Tuning happens before playing.']]),
    mc('t32c4', 'A trill on D in D major alternates D with…', ['E', 'The note above D in D major is E.'], [['C♯', 'C♯ is the note BELOW D.'], ['F♯', 'F♯ is a 3rd above, too far for a trill.']]),
    mc('t32c5', 'An appoggiatura (grace note without a slash)…', ['Leans on the beat and takes time from the main note', 'Appoggiatura comes from appoggiare, to lean.'], [['Is crushed in before the beat', 'That is the acciaccatura, which has a slash.'], ['Is not played', 'Every grace note is played.']]),
  ],
};

export const level33: Lesson = {
  level: 33,
  title: 'Form and Repeats',
  objective: 'Read repeat signs and recognise binary, ternary, rondo and variation forms.',
  intro: [
    'Most pieces are built from sections that come back. Knowing the **form** helps you memorise music and shape a performance.',
    'Repeat signs save printing the same music twice.',
  ],
  steps: [
    {
      title: 'Repeat signs',
      body: ['**Repeat dots** (𝄇) send you back to the matching 𝄆 (or to the start). **1st and 2nd endings**: play the 1st ending, repeat, then skip to the 2nd.', '**D.C. al Fine**: go back to the start and stop at *Fine*. **D.S.**: go back to the sign 𝄋. **To Coda** (𝄌): jump to the coda.'],
    },
    {
      title: 'Common forms',
      body: ['**Binary (AB)**: two halves, often each repeated. The Minuet in G is binary. **Ternary (ABA)**: the opening returns after a contrasting middle.', '**Rondo (ABACA)**: a main theme that keeps returning. **Theme and variations**: one tune, changed each time, just as Stave’s levels vary each song.'],
    },
  ],
  practice: [
    mc('t33p1', 'What does D.C. al Fine mean?', ['Go back to the beginning and stop at Fine', 'Da Capo = from the head (start). Al Fine = to the end mark.'], [['Go back to the sign and play to the coda', 'That is D.S. al Coda.'], ['Play faster to the end', 'D.C. is a road map, not a tempo.']]),
    mc('t33p2', 'Which form is ABA?', ['Ternary', 'Three parts: A, a contrasting B, and A again.'], [['Binary', 'Binary is two parts: AB.'], ['Rondo', 'Rondo brings A back more often: ABACA.']]),
    mc('t33p3', 'With 1st and 2nd endings, the second time through you…', ['Skip the 1st ending and play the 2nd', 'The 1st ending is only played the first time.'], [['Play both endings', 'Only one ending is played each time through.'], ['Stop at the 1st ending', 'Carry on with the 2nd ending.']]),
  ],
  challenge: [
    mc('t33c1', 'What does D.S. stand for?', ['Dal Segno: from the sign', 'Go back to the 𝄋 sign.'], [['Da Capo: from the start', 'That is D.C.'], ['Diminuendo Subito: suddenly softer', 'D.S. is a road-map sign.']]),
    mc('t33c2', 'Which form is ABACA?', ['Rondo', 'A main theme returning between different episodes.'], [['Ternary', 'Ternary is ABA.'], ['Binary', 'Binary is AB.']]),
    mc('t33c3', 'What is a coda?', ['An ending section', 'Coda means tail: a section added to finish the piece.'], [['The first theme', 'The first theme is usually A.'], ['A repeat of the whole piece', 'A coda comes once, at the end.']]),
    mc('t33c4', 'Stave plays the same song in many levels, changed a little each time. That is like…', ['Theme and variations', 'One theme, varied: the oldest way to build a long piece from a short tune.'], [['Rondo', 'In a rondo, different episodes come between returns of the theme.'], ['Binary form', 'Binary form is two contrasting halves.']]),
    mc('t33c5', 'You reach a repeat sign at the end of bar 8, with no backward repeat earlier. Where do you go?', ['Back to the beginning', 'Without a 𝄆, the repeat goes back to the start.'], [['Back one bar', 'Repeats go back to a 𝄆 sign or to the start.'], ['To the end of the piece', 'A repeat sends you back, not forwards.']]),
  ],
};

export const level34: Lesson = {
  level: 34,
  title: 'The String Player’s Vocabulary',
  objective: 'Understand the special terms printed in string parts.',
  intro: [
    'String parts contain words and signs other musicians rarely see. Orchestra players read them at sight.',
    'You have used several of these already. Here they are with their real names.',
  ],
  steps: [
    {
      title: 'The bow',
      body: ['**⊓ down-bow** (from the frog), **V up-bow** (from the tip). **arco**: play with the bow (after pizzicato). **pizz.**: pluck.', '**legato**: smooth. **détaché**: separate bows, on the string. **martelé**: hammered, biting starts. **spiccato**: the bow bounces off the string.'],
    },
    {
      title: 'Colour',
      body: ['**sul ponticello**: near the bridge, a glassy sound. **sul tasto**: over the fingerboard, soft and airy. **col legno**: with the wood of the bow.', '**con sordino**: with the mute. **senza sordino**: without it. **divisi** (*div.*): players on one part split into two lines. A small **o** over a note means a harmonic (or open string).'],
    },
  ],
  practice: [
    mc('t34p1', 'What does ⊓ mean?', ['Down-bow', 'The ⊓ shape (like the frog of the bow) means down-bow.'], [['Up-bow', 'Up-bow is V.'], ['Pluck the string', 'Plucking is pizz.']]),
    mc('t34p2', 'After a pizzicato passage, which word tells you to use the bow again?', ['arco', 'Arco is Italian for bow.'], [['legato', 'Legato means smooth, not “bow again”.'], ['tutti', 'Tutti means everyone plays.']]),
    mc('t34p3', 'What does con sordino mean?', ['With the mute', 'Put the mute on the bridge for a veiled sound.'], [['Without the mute', 'That is senza sordino.'], ['Very loudly', 'Loudness is shown by dynamics.']]),
  ],
  challenge: [
    mc('t34c1', 'Sul ponticello asks you to bow…', ['Very close to the bridge', 'Ponticello = little bridge: a glassy, eerie sound.'], [['Over the fingerboard', 'That is sul tasto.'], ['With the wood of the bow', 'That is col legno.']]),
    mc('t34c2', 'Spiccato is a stroke where the bow…', ['Bounces off the string', 'Spiccato is controlled bouncing, usually in the lower half of the bow.'], [['Stays smoothly on the string', 'That is legato or détaché.'], ['Is not used at all', 'Plucking is pizzicato.']]),
    mc('t34c3', 'A small “o” above a note usually means…', ['A harmonic (or an open string)', 'The circle marks a natural harmonic, or asks for the open string.'], [['Play it very softly', 'Soft is p or pp.'], ['A whole-bar rest', 'Rests have their own signs.']]),
    mc('t34c4', '“div.” in a violin part means…', ['Split into two groups, each playing one line', 'Divisi: the section divides between the upper and lower notes.'], [['Play both notes as a double stop', 'Divisi means split between players. Double stops would say non div.'], ['Slow down', 'Slowing down is rit.']]),
    mc('t34c5', 'Martelé means…', ['Hammered: a biting start, then release', 'Martelé (hammered) strokes start with pressure, then release, with a gap between notes.'], [['Very smooth and connected', 'That is legato.'], ['Bouncing', 'That is spiccato.']]),
    mc('t34c6', 'Col legno means…', ['Play with the wood of the bow', 'Legno = wood: tap or draw with the stick for a dry, clicking sound.'], [['Play with the mute', 'That is con sordino.'], ['Play near the bridge', 'That is sul ponticello.']]),
  ],
};

export const level35: Lesson = {
  level: 35,
  title: 'Vivaldi and the Concerto',
  objective: 'Know the story behind The Four Seasons and how a baroque concerto is built.',
  intro: [
    'Your final level is the opening of **“Spring”** from **The Four Seasons** by **Antonio Vivaldi**. Knowing what the music is about will change how you play it.',
  ],
  steps: [
    {
      title: 'Antonio Vivaldi (1678–1741)',
      body: ['A Venetian violinist and composer, and a priest, nicknamed **“the Red Priest”** for his red hair.', 'He taught music at the **Ospedale della Pietà**, a Venice orphanage famous for its brilliant all-female orchestra.'],
    },
    {
      title: 'The Four Seasons',
      body: ['Four violin concertos, published in **1725**, one for each season. Each comes with a **sonnet** describing the scene.', '“Spring” opens in **E major**, Allegro: spring arrives, birds sing, streams murmur, then a thunderstorm passes.'],
    },
    {
      title: 'How a concerto works',
      body: ['A **concerto** sets a **soloist** against the **orchestra**. Baroque concertos usually have three movements: **fast – slow – fast**.', 'The full orchestra (**tutti**) plays a returning theme called the **ritornello**, and the soloist plays the episodes in between.'],
      tip: 'The echoes you played in Spring (loud, then soft) imitate the tutti and a smaller group answering.',
    },
  ],
  practice: [
    mc('t35p1', 'Vivaldi worked in which city?', ['Venice', 'Vivaldi was born in Venice and taught at the Ospedale della Pietà there.'], [['Vienna', 'Vienna was home to Haydn, Mozart and Beethoven. Vivaldi only went there at the very end of his life.'], ['London', 'London is linked with Handel, not Vivaldi.']]),
    mc('t35p2', 'What was Vivaldi’s nickname?', ['The Red Priest', 'He was a priest with red hair.'], [['The Father of the Symphony', 'That title is usually given to Haydn.'], ['The Venetian Organist', 'Vivaldi was famous as a violinist.']]),
    mc('t35p3', 'How many movements does a typical baroque concerto have?', ['Three: fast – slow – fast', 'Like each of the Four Seasons concertos.'], [['One', 'Concertos of this time usually had three movements.'], ['Four', 'Four movements is typical of a classical symphony.']]),
  ],
  challenge: [
    mc('t35c1', 'What is a ritornello?', ['A theme the full orchestra keeps returning to', 'Ritornello means “little return”.'], [['A slow movement', 'The slow movement is the middle one.'], ['A solo cadenza', 'A cadenza is a solo passage, often near the end of a movement.']]),
    mc('t35c2', 'In which key does “Spring” begin?', ['E major', 'Spring (Concerto No. 1) is in E major, which is why your Level 500 is in E.'], [['D major', 'Many beginner pieces are in D, but Spring is in E major.'], ['E minor', 'It is bright and major, matching the arrival of spring.']]),
    mc('t35c3', 'What came printed with each of the Four Seasons concertos?', ['A sonnet describing the scene', 'The poems say what the music depicts: birds, streams, storms.'], [['A painting', 'The music came with poems, not pictures.'], ['A dance step chart', 'They are concertos to listen to, not dances.']]),
    mc('t35c4', 'What does tutti mean?', ['Everyone plays', 'Tutti = all: the full orchestra.'], [['Solo', 'Solo is one player.'], ['Pluck the strings', 'That is pizzicato.']]),
    mc('t35c5', 'Where did Vivaldi teach music?', ['The Ospedale della Pietà', 'A Venetian orphanage whose girls’ orchestra was famous across Europe.'], [['The Paris Conservatoire', 'The Paris Conservatoire was founded in 1795, decades after Vivaldi died.'], ['St Thomas Church, Leipzig', 'That was J. S. Bach’s post.']]),
    mc('t35c6', 'Which event happens in the “Spring” sonnet?', ['A thunderstorm', 'After the birdsong and streams, thunder and lightning pass, then the birds sing again.'], [['A snowfall', 'Snow belongs to “Winter”.'], ['A harvest festival', 'The harvest festival is in “Autumn”.']]),
  ],
};

export const level36: Lesson = {
  level: 36,
  title: 'Final Checkpoint: The Complete Musician',
  objective: 'Show that you can read and understand everything the course has taught.',
  intro: [
    'This is the last theory level. It draws on every theory lesson: the staff, clefs, rhythm, keys, intervals, chords, expression and the string player’s vocabulary.',
    'Pass it, and you have the reading skills of a confident orchestral player.',
  ],
  steps: [
    {
      title: 'Read before you play',
      body: ['Clef → key signature → time signature → tempo → dynamics → anything unusual (ledger lines, accidentals, string terms).', 'Professionals do this in seconds at every rehearsal. Now you can too.'],
      figure: fig('e/5:8 g#/5:8 b/5:q e/5:h', 'A bar in E major, 4/4.', { keySig: 'E', time: '4/4', caption: 'E major, 4/4, like the opening of Spring.' }),
    },
    {
      title: 'Keep going',
      body: ['Theory is a map. You turn it into music by listening, playing with others and practising slowly.'],
    },
  ],
  practice: [
    nameNote('t36p1', 'treble', 'g/5'),
    keySigQ('t36p2', 'Eb'),
    intervalQ('t36p3', 'g/4', 'e/5'),
  ],
  challenge: [
    nameNote('t36c1', 'alto', 'f/4'),
    nameNote('t36c2', 'bass', 'g/3'),
    keySigQ('t36c3', 'E'),
    intervalQ('t36c4', 'c/4', 'f/4'),
    mc('t36c5', 'What is the relative minor of B♭ major?', ['G minor', 'The 6th note of B♭ major is G. Both have two flats.'], [['B♭ minor', 'B♭ minor (five flats) is the parallel minor.'], ['D minor', 'D minor goes with F major.']]),
    mc('t36c6', 'How many beats does this bar of 6/8 contain, counted as dotted quarters?', ['2', '6 eighths = two dotted-quarter beats.'], [['6', 'Six eighths, but felt as two beats.'], ['3', 'Three beats of two would be 3/4.']], fig('e/5:qd b/4:8 c#/5:8 d#/5:8', 'A bar of 6/8: dotted quarter, then four eighths.', { time: '6/8' })),
    mc('t36c7', 'Sul tasto, pizz., then arco. What do you do?', ['Bow over the fingerboard, then pluck, then bow again', 'Sul tasto = over the fingerboard. Pizz. = pluck. Arco = bow.'], [['Bow near the bridge, then bow, then pluck', 'Near the bridge is sul ponticello, and arco means bow, not pluck.'], ['Put on the mute, then take it off', 'Mutes are con / senza sordino.']]),
    mc('t36c8', 'Which chords are I, IV and V in G major?', ['G, C and D', 'Scale notes 1, 4 and 5 of G major.'], [['G, B and D', 'Those are the notes of the G triad.'], ['G, A and B', 'Those are scale notes 1, 2 and 3.']]),
    mc('t36c9', 'Order from slowest to fastest: Allegro, Largo, Andante.', ['Largo, Andante, Allegro', 'Very slow, walking pace, fast.'], [['Andante, Largo, Allegro', 'Largo is slower than Andante.'], ['Allegro, Andante, Largo', 'That is fastest to slowest.']]),
  ],
  passMark: 70,
};
