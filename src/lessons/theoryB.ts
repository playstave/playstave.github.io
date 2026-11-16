/** Theory lessons 19–27: scales, compound time, key signatures, counting, intervals, minor keys, chords. */
import type { Lesson } from './types';
import { beatsOf, countLabels, fig, intervalQ, keySigQ, mc, nameNote } from './notation';

export const level19: Lesson = {
  level: 19,
  title: 'How a Major Scale Is Built',
  objective: 'Know the whole- and half-step pattern of every major scale.',
  intro: [
    'You have played major scales in D, G, A and more. Each one sounds “major” because it follows the same pattern of steps.',
    'Learn the pattern and you can build a major scale from any note.',
  ],
  steps: [
    {
      title: 'Whole steps and half steps',
      body: ['A **whole step** is two half steps. In a major scale the steps go:', '**whole – whole – half – whole – whole – whole – half**'],
      figure: fig('d/4:q e/4:q f#/4:q g/4:q a/4:q b/4:q c#/5:q d/5:q', 'The D major scale: D E F sharp G A B C sharp D.', { caption: 'D major: the half steps come between notes 3–4 (F♯–G) and 7–8 (C♯–D).' }),
    },
    {
      title: 'Where the half steps fall',
      body: ['The half steps always fall between **notes 3 and 4** and between **notes 7 and 8**.', 'On your instrument, those are the places where two fingers sit **close together**.'],
      tip: 'Sharps or flats get added to make the steps fit the pattern. That is where key signatures come from.',
    },
  ],
  practice: [
    mc('t19p1', 'What is the step pattern of a major scale?', ['W W H W W W H', 'Whole, whole, half, whole, whole, whole, half.'], [['W H W W H W W', 'That is the natural MINOR pattern.'], ['W W W H W W H', 'Close, but the first half step comes after only two whole steps.']]),
    mc('t19p2', 'Between which notes of a major scale are the half steps?', ['3–4 and 7–8', 'Half steps fall between the 3rd and 4th notes and between the 7th and 8th.'], [['2–3 and 6–7', 'Those are whole steps in a major scale (in natural minor, 2–3 is a half step).'], ['4–5 and 8–9', 'A scale has only 8 notes, and 4–5 is a whole step.']]),
    mc('t19p3', 'How many half steps make a whole step?', ['2', 'A whole step is two half steps.'], [['1', 'One half step is a half step.'], ['4', 'Four half steps make a major 3rd.']]),
  ],
  challenge: [
    mc('t19c1', 'G major starts G A B C D E F… Which note comes next?', ['F♯', 'Notes 7–8 (F to G) must be a half step, so F is raised to F♯.'], [['F', 'F to G is a whole step, but notes 7–8 must be a half step.'], ['F♭', 'Lowering F would make the gap to G even bigger.']]),
    mc('t19c2', 'In D major, which notes are a half step apart?', ['F♯–G and C♯–D', 'Notes 3–4 (F♯–G) and 7–8 (C♯–D).'], [['D–E and A–B', 'Those are whole steps.'], ['E–F♯ and B–C♯', 'Those are whole steps (notes 2–3 and 6–7).']]),
    mc('t19c3', 'Which major scale has no sharps or flats?', ['C major', 'C D E F G A B C already fits the pattern: E–F and B–C are natural half steps.'], [['A major', 'A major needs three sharps.'], ['F major', 'F major needs B♭.']]),
    mc('t19c4', 'F major goes F G A … Which note is the 4th?', ['B♭', 'Notes 3–4 must be a half step. A to B is a whole step, so B is lowered to B♭.'], [['B', 'A to B is a whole step, but notes 3–4 must be a half step.'], ['C', 'C is the 5th note, not the 4th.']]),
    mc('t19c5', 'Which pairs of natural notes (no sharps or flats) are only a half step apart?', ['E–F and B–C', 'These two pairs have no note between them, which is why C major needs no accidentals.'], [['C–D and F–G', 'Each of these has a sharp/flat between them: a whole step.'], ['A–B and D–E', 'These are whole steps.']]),
  ],
};

export const level20: Lesson = {
  level: 20,
  title: 'Compound Time: 6/8',
  objective: 'Feel 6/8 in two beats, each split into three.',
  intro: [
    'Row, Row, Row Your Boat and Grieg’s Morning Mood are in **6/8**. They lilt and sway rather than march.',
    'That lilt comes from **compound time**: each beat divides into three, not two.',
  ],
  steps: [
    {
      title: 'Two big beats',
      body: ['6/8 has six eighth notes in a bar, grouped **3 + 3**. You feel **two** beats: ONE-two-three FOUR-five-six.', 'Each big beat is a **dotted quarter** long.'],
      figure: fig('g/4:8 a/4:8 b/4:8 c/5:8 b/4:8 a/4:8', 'A bar of 6/8 with six eighth notes in two groups of three.', { time: '6/8', caption: 'Two groups of three: two beats.' }),
    },
    {
      title: '3/4 is not 6/8',
      body: ['Both have six eighths, but 3/4 groups them **2 + 2 + 2** (three beats). 6/8 groups them **3 + 3** (two beats).', 'Other compound times: **9/8** (three beats of three) and **12/8** (four beats of three).'],
      figure: fig('g/4:8 a/4:8 b/4:8 c/5:8 b/4:8 a/4:8', 'A bar of 3/4 with six eighth notes in three pairs.', { time: '3/4', caption: '3/4: three pairs, three beats.' }),
    },
  ],
  practice: [
    mc('t20p1', 'How many main beats do you feel in a bar of 6/8?', ['2', 'Six eighths grouped 3 + 3 make two big beats.'], [['6', 'There are six eighth notes, but they group into two beats of three.'], ['3', 'Three beats of two is 3/4. 6/8 is two beats of three.']]),
    mc('t20p2', 'In 6/8, how long is one main beat?', ['A dotted quarter', 'Three eighths = a dotted quarter.'], [['A quarter', 'A quarter is only two eighths, but 6/8 beats hold three.'], ['A half note', 'A half note is four eighths.']]),
    mc('t20p3', 'How many big beats does 12/8 have?', ['4', '12 eighths ÷ 3 = four beats of three.'], [['12', 'Twelve eighths, grouped in threes: four beats.'], ['6', 'Grouping in pairs would be a simple time signature like 6/4.']]),
  ],
  challenge: [
    mc('t20c1', 'Which songs from the course are in 6/8?', ['Row Your Boat and Morning Mood', 'Both sway in two beats of three.'], [['Ode to Joy and Jingle Bells', 'These are in 4/4.'], ['Minuet in G and Amazing Grace', 'These are in 3/4.']]),
    mc('t20c2', 'Which time signature has three beats, each split into three?', ['9/8', '9/8 = three dotted-quarter beats.'], [['3/4', '3/4 beats split into two eighths each.'], ['6/8', '6/8 has TWO beats of three.']]),
    mc('t20c3', 'Is this bar 3/4 or 6/8?', ['6/8', 'The eighths are beamed in groups of three: two beats of three.'], [['3/4', 'In 3/4 they would be beamed in pairs.'], ['It could be either', 'The beaming in threes shows it is 6/8.']], fig('d/5:8 c/5:8 b/4:8 a/4:8 g/4:8 f#/4:8', 'Six eighth notes beamed 3 + 3.', { time: '6/8' })),
    mc('t20c4', 'In 6/8, a dotted half note lasts…', ['A whole bar', 'A dotted half = 6 eighths, the whole bar.'], [['Half a bar', 'Half a bar of 6/8 is a dotted quarter.'], ['Three bars', 'It is exactly 6 eighths, one bar.']]),
    mc('t20c5', 'Why does 6/8 feel like it sways?', ['Each beat divides into three', 'Three-way subdivisions give the lilting, rocking feel.'], [['It is always slow', '6/8 can be quick or slow. The feel comes from the threes.'], ['It has six strong beats', 'It has two strong beats, not six.']]),
  ],
};

export const level21: Lesson = {
  level: 21,
  title: 'Key Signatures with Sharps',
  objective: 'Read sharp key signatures and name their major keys.',
  intro: [
    'Writing F♯ every time in D major would be tiring. A **key signature** at the start of each line says once which notes are always sharp.',
    'Sharps in a key signature always appear in the same order.',
  ],
  steps: [
    {
      title: 'The order of sharps',
      body: ['**F C G D A E B**: “**F**ather **C**harles **G**oes **D**own **A**nd **E**nds **B**attle.”', 'A key with 2 sharps has F♯ and C♯. One with 3 sharps adds G♯, and so on.'],
      figure: fig('', 'A treble staff with the key signature of E major: F sharp, C sharp, G sharp, D sharp.', { keySig: 'E', width: 220, caption: 'Four sharps: F♯ C♯ G♯ D♯.' }),
    },
    {
      title: 'Finding the key',
      body: ['Look at the **last sharp** and go **up one half step**. That note names the major key.', 'Last sharp C♯ → D major. Last sharp G♯ → A major.'],
      figure: fig('', 'A treble staff with two sharps.', { keySig: 'D', width: 200, caption: 'Last sharp C♯ → up a half step → D major.' }),
    },
  ],
  practice: [
    mc('t21p1', 'What is the order of sharps?', ['F C G D A E B', 'Father Charles Goes Down And Ends Battle.'], [['B E A D G C F', 'That is the order of FLATS, the reverse.'], ['C D E F G A B', 'That is just the alphabet from C.']]),
    keySigQ('t21p2', 'G'),
    keySigQ('t21p3', 'A'),
  ],
  challenge: [
    keySigQ('t21c1', 'D'),
    keySigQ('t21c2', 'E'),
    keySigQ('t21c3', 'B'),
    keySigQ('t21c4', 'A', 'bass'),
    mc('t21c5', 'A key signature has three sharps. Which are they?', ['F♯, C♯, G♯', 'The first three in the order F C G D A E B.'], [['F♯, G♯, A♯', 'Sharps follow F C G D…, not the alphabet.'], ['C♯, D♯, E♯', 'The order always starts with F♯.']]),
    mc('t21c6', 'How long does a key signature last?', ['The whole piece (until a new key signature)', 'Unlike an accidental, a key signature applies on every line, in every octave.'], [['Until the end of the bar', 'That is how an accidental works.'], ['Only for the first line', 'It is repeated on every line and lasts the whole piece.']]),
  ],
};

export const level22: Lesson = {
  level: 22,
  title: 'Counting Eighths and Syncopation',
  objective: 'Count “1 & 2 &” and spot notes that start off the beat.',
  intro: [
    'When eighth notes appear, saying **“and”** between the beats keeps you exact: 1 & 2 & 3 & 4 &.',
    'When a strong note falls on an “&” instead of a beat, the music is **syncopated**. That bouncy feel is what you met in the Syncopation unit.',
  ],
  steps: [
    {
      title: 'On the beat and off the beat',
      body: ['Numbers (1, 2, 3, 4) are **on** the beat. Each “&” is exactly halfway between, **off** the beat.'],
      figure: fig('g/4:8 a/4:8 b/4:8 c/5:8 d/5:8 c/5:8 b/4:8 a/4:8', 'Eight eighth notes.', { time: '4/4', caption: '1 & 2 & 3 & 4 &' }),
    },
    {
      title: 'Syncopation',
      body: ['In **8 – q – 8**, the quarter note starts on the “&” of 1 and carries over beat 2. The accent shifts off the beat.', 'Counting out loud is the surest way to place a syncopated note.'],
      figure: fig('g/4:8 a/4:q g/4:8 b/4:h', 'Eighth, quarter, eighth, half: a syncopated rhythm.', { time: '4/4', caption: `Counts: ${countLabels('g/4:8 a/4:q g/4:8 b/4:h').join('  ')}` }),
    },
  ],
  practice: [
    mc('t22p1', 'In “1 & 2 &”, where is the “&”?', ['Halfway between the beats', 'The “&” splits the beat into two equal eighths.'], [['On the beat', 'The numbers are on the beat. The “&” comes between them.'], ['At the end of the bar', 'There is an “&” after every beat.']]),
    mc('t22p2', 'What is syncopation?', ['Stressing notes that fall off the beat', 'Syncopation puts the emphasis on weak parts of the beat, like the “&”.'], [['Playing faster', 'Syncopation is about where the accent falls, not speed.'], ['Playing two notes at once', 'That is a double stop.']]),
    mc('t22p3', `In this bar, on which count does note 2 start?`, [countLabels('g/4:8 a/4:q g/4:8 b/4:h')[1], 'Note 1 is an eighth on 1, so note 2 starts on the “&” of 1.'], [['2', 'Note 1 is only an eighth note, so note 2 starts halfway through beat 1.'], ['1', 'Note 1 starts on 1. Note 2 starts after it.']], fig('g/4:8 a/4:q g/4:8 b/4:h', 'Eighth, quarter, eighth, half.', { time: '4/4' })),
  ],
  challenge: [
    mc('t22c1', 'In this bar, on which count does the half note start?', [countLabels('d/5:q c/5:8 b/4:8 a/4:h')[3], 'Quarter (1) + two eighths (2, 2&) → the half note starts on 3.'], [['2&', 'That is where the second eighth starts. The half note comes after it.'], ['4', 'Add the beats up: 1 + ½ + ½ = 2, so the half note begins on beat 3.']], fig('d/5:q c/5:8 b/4:8 a/4:h', 'Quarter, two eighths, half note.', { time: '4/4' })),
    mc('t22c2', 'In this bar, on which count does the 3rd note start?', [countLabels('g/4:8 b/4:8 d/5:q d/5:q d/5:q')[2], 'Two eighths fill beat 1 (1, 1&), so note 3 starts on 2.'], [['1&', 'That is note 2.'], ['3', 'The two eighths only take one beat together.']], fig('g/4:8 b/4:8 d/5:q d/5:q d/5:q', 'Two eighths, then three quarters.', { time: '4/4' })),
    mc('t22c3', 'Which of these rhythms is syncopated?', ['Eighth – quarter – eighth', 'The quarter starts on the “&” and holds through the next beat: syncopated.'], [['Four quarter notes', 'Every note starts on a beat: no syncopation.'], ['Two half notes', 'Both start on strong beats (1 and 3).']]),
    mc('t22c4', 'How many beats does this bar contain?', [`${beatsOf('g/4:8 a/4:q a/4:q a/4:q g/4:8')}`, '½ + 1 + 1 + 1 + ½ = 4.'], [['5', 'The first and last notes are eighths, ½ beat each.'], ['3½', 'Count all three quarter notes.']], fig('g/4:8 a/4:q a/4:q a/4:q g/4:8', 'Eighth, three quarters, eighth.', { time: '4/4' })),
    mc('t22c5', 'In this syncopated bar, on which count does the last note start?', [countLabels('g/4:8 a/4:q a/4:q a/4:q g/4:8')[4], 'The three quarters start on 1&, 2& and 3&, so the last eighth begins on 4&.'], [['4', 'Each quarter starts on an “&”, so everything after is shifted by half a beat.'], ['3&', 'That is where the last QUARTER note starts.']], fig('g/4:8 a/4:q a/4:q a/4:q g/4:8', 'Eighth, three quarters, eighth.', { time: '4/4' })),
  ],
};

export const level23: Lesson = {
  level: 23,
  title: 'Key Signatures with Flats',
  objective: 'Read flat key signatures and name their major keys.',
  intro: [
    'Some keys use flats instead of sharps. F, B♭, E♭ and A♭ major are common in orchestral music.',
    'Flats also come in a fixed order, the exact reverse of the sharps.',
  ],
  steps: [
    {
      title: 'The order of flats',
      body: ['**B E A D G C F**: “**B**attle **E**nds **A**nd **D**own **G**oes **C**harles’ **F**ather.” It is the order of sharps backwards.'],
      figure: fig('', 'A treble staff with the key signature of A flat major.', { keySig: 'Ab', width: 220, caption: 'Four flats: B♭ E♭ A♭ D♭.' }),
    },
    {
      title: 'Finding the key',
      body: ['The **second-to-last flat** names the key: B♭ E♭ A♭ → **E♭ major**.', 'One flat (B♭) is the exception to learn by heart: **F major**.'],
      figure: fig('', 'A treble staff with two flats.', { keySig: 'Bb', width: 200, caption: 'B♭ E♭: the second-to-last flat is B♭ → B♭ major.' }),
    },
  ],
  practice: [
    mc('t23p1', 'What is the order of flats?', ['B E A D G C F', 'Battle Ends And Down Goes Charles’ Father, the sharps reversed.'], [['F C G D A E B', 'That is the order of SHARPS.'], ['A B C D E F G', 'Flats don’t follow the alphabet.']]),
    keySigQ('t23p2', 'F'),
    keySigQ('t23p3', 'Bb'),
  ],
  challenge: [
    keySigQ('t23c1', 'Eb'),
    keySigQ('t23c2', 'Ab'),
    keySigQ('t23c3', 'Db'),
    keySigQ('t23c4', 'Eb', 'alto'),
    mc('t23c5', 'Which notes are flat in E♭ major?', ['B♭, E♭, A♭', 'E♭ major has three flats: the first three in the order B E A D G C F.'], [['E♭, F♭, G♭', 'Flats follow B E A…, not the alphabet.'], ['B♭ and E♭ only', 'Two flats is B♭ major. E♭ major adds A♭.']]),
    mc('t23c6', 'One flat in the key signature means…', ['F major (or D minor)', 'One flat, B♭, is F major, or its relative minor, D minor.'], [['B♭ major', 'B♭ major has two flats.'], ['C major', 'C major has no sharps or flats.']]),
  ],
};

export const level24: Lesson = {
  level: 24,
  title: 'Checkpoint: Reading Rhythm and Keys',
  objective: 'Combine clefs, note names, note values, time signatures and key signatures.',
  intro: [
    'This checkpoint brings together everything since the staff lessons: clefs, note names, rhythm, accidentals and key signatures.',
    'Take your time. Read the clef and key signature first, every time.',
  ],
  steps: [
    {
      title: 'A reading routine',
      body: ['Before playing any new piece, check four things: **clef**, **key signature**, **time signature**, **tempo**.', 'Then scan for accidentals, ledger lines and tricky rhythms.'],
      figure: fig('d/5:q c#/5:8 b/4:8 a/4:h', 'A bar in D major, 4/4.', { keySig: 'D', time: '4/4', caption: 'Treble clef, D major (two sharps), 4/4.' }),
    },
    {
      title: 'Same idea, every clef',
      body: ['The rules are identical in every clef. Only the landmark notes change.'],
    },
  ],
  practice: [
    nameNote('t24p1', 'treble', 'e/5'),
    keySigQ('t24p2', 'E'),
    mc('t24p3', 'How many beats does a dotted half note get in 3/4?', ['3', '2 + 1 = 3, a full bar of 3/4.'], [['2', 'The dot adds another beat.'], ['4', 'Dotted half = 3 beats.']]),
  ],
  challenge: [
    nameNote('t24c1', 'bass', 'b/2'),
    nameNote('t24c2', 'alto', 'a/3'),
    nameNote('t24c3', 'treble', 'd/4'),
    keySigQ('t24c4', 'Ab'),
    keySigQ('t24c5', 'B', 'bass'),
    mc('t24c6', 'Which time signature fits this bar?', ['4/4', 'Dotted quarter (1½) + eighth (½) + half (2) = 4 beats.'], [['3/4', 'Count the dotted quarter as 1½.'], ['6/8', 'This bar adds up to four quarter-note beats, not two dotted-quarter beats.']], fig('g/4:qd a/4:8 b/4:h', 'Dotted quarter, eighth, half note.')),
    mc('t24c7', 'In 6/8, how many dotted-quarter beats are in each bar?', ['2', 'Six eighths in two groups of three.'], [['3', 'That would be 9/8.'], ['6', 'Six eighths, but only two main beats.']]),
    mc('t24c8', 'An F♯ appears early in a bar. A later F in the same bar has no sign. Play…', ['F♯', 'The accidental lasts to the bar line.'], [['F natural', 'Only a natural sign or the bar line cancels it.'], ['It depends on the clef', 'The rule is the same in every clef.']]),
  ],
  passMark: 70,
};

export const level25: Lesson = {
  level: 25,
  title: 'Intervals',
  objective: 'Name the interval between two notes by counting letter names.',
  intro: [
    'An **interval** is the distance between two notes. Musicians name intervals by number: 2nd, 3rd, 4th, 5th, and so on up to the octave.',
    'Your open strings are tuned in fixed intervals, so you already hear intervals every time you tune.',
  ],
  steps: [
    {
      title: 'Count the letters',
      body: ['Count every letter from the lower note to the upper note, **including both**.', 'D up to A: D E F G A = 5 letters = a **5th**. Sharps and flats don’t change the number.'],
      figure: fig('d/4:h a/4:h', 'D and A: a fifth.', { caption: 'D–E–F–G–A: a 5th.' }),
    },
    {
      title: 'Your open strings',
      body: ['Violin, viola and cello strings are tuned a **5th** apart (violin G D A E; viola and cello C G D A).', 'The double bass is tuned in **4ths** (E A D G), so the hand can reach more notes without shifting.'],
      figure: fig('g/3:q d/4:q a/4:q e/5:q', 'Violin open strings G D A E.', { caption: 'Violin: G – D – A – E, each a 5th apart.' }),
    },
  ],
  practice: [
    intervalQ('t25p1', 'c/4', 'e/4'),
    intervalQ('t25p2', 'g/4', 'd/5'),
    mc('t25p3', 'The double bass strings are tuned a… apart.', ['4th', 'E A D G: each string is a 4th above the last.'], [['5th', 'Violin, viola and cello are tuned in 5ths. The bass is different.'], ['3rd', 'No string instrument in the orchestra is tuned in 3rds.']]),
  ],
  challenge: [
    intervalQ('t25c1', 'd/4', 'g/4'),
    intervalQ('t25c2', 'a/4', 'a/5'),
    intervalQ('t25c3', 'e/4', 'c/5'),
    intervalQ('t25c4', 'c/3', 'b/3', 'bass'),
    intervalQ('t25c5', 'f/4', 'g/4'),
    mc('t25c6', 'Does F to C♯ count as the same interval number as F to C?', ['Yes, both are 5ths', 'The number comes from the letters (F G A B C), so sharps and flats don’t change it. They change the interval’s quality.'], [['No, C♯ makes it a 6th', 'The letter is still C, so it is still a 5th.'], ['No, C♯ makes it a 4th', 'Raising the top note can’t make the number smaller.']]),
  ],
};

export const level26: Lesson = {
  level: 26,
  title: 'Major and Minor Keys',
  objective: 'Find the relative minor of a major key and recognise the minor scale.',
  intro: [
    'Greensleeves and In the Hall of the Mountain King sound darker than Twinkle. They are in **minor** keys.',
    'Every major key has a **relative minor** that shares its key signature.',
  ],
  steps: [
    {
      title: 'The relative minor',
      body: ['The relative minor starts on the **6th note** of the major scale. Another way to find it: go down 3 half steps from the major key note.', 'C major → **A minor**. G major → **E minor**. D major → **B minor**.'],
      figure: fig('a/4:q b/4:q c/5:q d/5:q e/5:q f/5:q g/5:q a/5:q', 'The A natural minor scale.', { caption: 'A natural minor: same notes as C major, starting on A.' }),
    },
    {
      title: 'The minor pattern',
      body: ['**Natural minor**: W H W W H W W. The half steps fall between notes **2–3** and **5–6**.', '**Harmonic minor** raises the 7th note, giving a strong pull back to the key note. In A minor that note is G♯.'],
    },
  ],
  practice: [
    mc('t26p1', 'What is the relative minor of C major?', ['A minor', 'The 6th note of C major is A, and both keys have no sharps or flats.'], [['C minor', 'C minor is the PARALLEL minor (same starting note). It has three flats.'], ['E minor', 'E minor is the relative minor of G major.']]),
    mc('t26p2', 'What do a major key and its relative minor share?', ['The same key signature', 'Relative keys use the same notes, so the same sharps or flats.'], [['The same first note', 'Keys with the same first note are parallel keys, like C major and C minor.'], ['Nothing at all', 'They share every note of the scale.']]),
    mc('t26p3', 'What is the step pattern of the natural minor scale?', ['W H W W H W W', 'Whole, half, whole, whole, half, whole, whole.'], [['W W H W W W H', 'That is the MAJOR scale pattern.'], ['H W W H W W W', 'The minor scale starts with a whole step.']]),
  ],
  challenge: [
    mc('t26c1', 'What is the relative minor of D major?', ['B minor', 'The 6th note of D major is B. Both keys have two sharps.'], [['D minor', 'That is the parallel minor, with one flat.'], ['F♯ minor', 'F♯ minor is the relative minor of A major.']]),
    mc('t26c2', 'What is the relative major of E minor?', ['G major', 'Count up 3 half steps from E: F, F♯, G. Both have one sharp (F♯).'], [['E major', 'E major has four sharps. That is the parallel major.'], ['C major', 'C major goes with A minor.']]),
    mc('t26c3', 'Which minor key shares the key signature of F major (one flat)?', ['D minor', 'The 6th note of F major is D.'], [['F minor', 'F minor has four flats.'], ['G minor', 'G minor has two flats, sharing B♭ major’s signature.']]),
    mc('t26c4', 'In A harmonic minor, which note is raised?', ['G (to G♯)', 'Harmonic minor raises the 7th note: G becomes G♯.'], [['F (to F♯)', 'Raising the 6th as well belongs to the melodic minor going up.'], ['C (to C♯)', 'Raising the 3rd would make the scale major.']]),
    keySigQ('t26c5', 'G'),
    mc('t26c6', 'Which course song is in a minor key?', ['Greensleeves', 'Greensleeves is a minor-key melody.'], [['Twinkle, Twinkle', 'Twinkle is major.'], ['Jingle Bells', 'Jingle Bells is major.']]),
  ],
};

export const level27: Lesson = {
  level: 27,
  title: 'Chords and Arpeggios',
  objective: 'Build a triad and recognise the I, IV and V chords of a key.',
  intro: [
    'The backing tracks under your pieces are built from **chords**. The simplest chord is a **triad**: three notes stacked in 3rds.',
    'An **arpeggio** is a chord played one note at a time, which you have practised since Unit 3.',
  ],
  steps: [
    {
      title: 'Root, 3rd, 5th',
      body: ['Start on any note (the **root**), skip one letter for the **3rd**, skip another for the **5th**.', 'D major triad: **D – F♯ – A**. G major triad: **G – B – D**.'],
      figure: fig('d/4:q f#/4:q a/4:q d/5:q', 'The D major arpeggio: D F sharp A D.', { caption: 'D major arpeggio: root, 3rd, 5th, octave.' }),
    },
    {
      title: 'I, IV and V',
      body: ['Number the scale notes 1–7 (in Roman numerals). The chords on notes **I**, **IV** and **V** are the most important in any key.', 'In D major: **I = D**, **IV = G**, **V = A**. Many folk songs need only these three chords.'],
      tip: 'Stave’s backing tracks use exactly these I, IV and V chords.',
    },
  ],
  practice: [
    mc('t27p1', 'Which notes make a G major triad?', ['G – B – D', 'Root G, skip A to B (3rd), skip C to D (5th).'], [['G – A – B', 'Those are steps. A triad skips every other letter.'], ['G – C – E', 'G C E is a C major triad with G at the bottom.']]),
    mc('t27p2', 'What is an arpeggio?', ['A chord played one note at a time', 'Arpeggio comes from the Italian for “harp-like”: chord notes in turn.'], [['A fast scale', 'A scale moves by steps. An arpeggio skips through chord notes.'], ['Two notes played together', 'That is a double stop.']]),
    mc('t27p3', 'In D major, which chord is V?', ['A major', 'Count up five notes: D E F♯ G A. V = A.'], [['G major', 'G is IV, the 4th note.'], ['B minor', 'B is the 6th note.']]),
  ],
  challenge: [
    mc('t27c1', 'Which notes make an A major triad?', ['A – C♯ – E', 'A, skip to C (the 3rd, sharpened for major), skip to E.'], [['A – C – E', 'That is A MINOR. Major needs C♯.'], ['A – B – C♯', 'Those are steps, not 3rds.']]),
    mc('t27c2', 'In G major, which chord is IV?', ['C major', 'G A B C: the 4th note is C.'], [['D major', 'D is V in G major.'], ['E minor', 'E is the 6th note.']]),
    intervalQ('t27c3', 'd/4', 'a/4'),
    mc('t27c4', 'What interval is between the root and the 3rd of a triad?', ['A 3rd', 'By definition: root, then a 3rd above it.'], [['A 2nd', 'A 2nd is a step. Triads skip.'], ['A 5th', 'The 5th is the top note of the triad.']]),
    mc('t27c5', 'Which chord is this?', ['C major', 'C – E – G: root C, 3rd E, 5th G.'], [['E minor', 'E minor is E G B.'], ['A minor', 'A minor is A C E.']], fig('c/5:q e/5:q g/5:q', 'Notes C, E and G.')),
    mc('t27c6', 'In A major, the I, IV and V chords are…', ['A, D and E', 'Notes 1, 4 and 5 of A major: A, D, E.'], [['A, C♯ and E', 'Those are the notes of the A chord itself.'], ['A, B and C♯', 'Those are scale notes 1, 2 and 3.']]),
  ],
};
