/** Theory lessons 11–18: clefs, note names, note values, rests, time, accidentals, ledger lines, dots and ties. */
import type { Lesson } from './types';
import { beatsOf, fig, mc, nameNote } from './notation';

export const level11: Lesson = {
  level: 11,
  title: 'The Clefs of the String Family',
  objective: 'Recognise the treble, alto and bass clefs and know which one your instrument reads.',
  intro: [
    'The staff on its own does not say which notes the lines stand for. A **clef** at the start of the line fixes that.',
    'The string family uses three clefs. Violins read one, violas another, and cellos and double basses a third.',
  ],
  steps: [
    {
      title: 'Treble clef (violin)',
      body: ['The **treble clef** curls around **line 2**, and that line is **G** (the G above middle C). It is also called the **G clef**.', 'Violins read the treble clef. Cellos switch to it for very high passages.'],
      figure: fig('g/4:w', 'A treble clef with a note on line 2, which is G.', { clef: 'treble', width: 200 }),
    },
    {
      title: 'Alto clef (viola)',
      body: ['The **alto clef** looks like two Cs back to back. Its centre points at **line 3**, and that line is **middle C**. It is a **C clef**.', 'Violas read the alto clef almost all the time. Hardly any other instrument does, so it is the viola’s own clef.'],
      figure: fig('c/4:w', 'An alto clef with a note on line 3, which is middle C.', { clef: 'alto', width: 200 }),
    },
    {
      title: 'Bass clef (cello and double bass)',
      body: ['The **bass clef** has two dots, one on each side of **line 4**, and that line is **F** (the F below middle C). It is the **F clef**.', 'Cellos and double basses read the bass clef. The double bass **sounds one octave lower** than written, so its music fits on the staff.'],
      figure: fig('f/3:w', 'A bass clef with a note on line 4, which is F.', { clef: 'bass', width: 200 }),
      tip: 'The same spot on the staff is a different note in each clef, so always look at the clef first.',
    },
  ],
  practice: [
    mc('t11p1', 'Which clef does the viola read?', ['Alto clef', 'The viola reads the alto clef, a C clef whose middle line is middle C.'], [['Treble clef', 'The treble clef is the violin’s clef. Viola notes would need too many ledger lines below it.'], ['Bass clef', 'The bass clef is for cello and double bass.']]),
    mc('t11p2', 'The treble clef curls around one line. Which note does that line stand for?', ['G', 'The treble clef is the G clef: its curl wraps around line 2, which is G.'], [['C', 'C belongs to the alto clef, whose centre marks middle C.'], ['F', 'F belongs to the bass clef, whose two dots surround the F line.']]),
    mc('t11p3', 'Which clef is this?', ['Bass clef', 'The two dots either side of line 4 make this the bass (F) clef.'], [['Treble clef', 'A treble clef is a tall curl that wraps around line 2. This clef has two dots.'], ['Alto clef', 'An alto clef is shaped like a pair of Cs and is centred on line 3.']], fig('', 'A staff with a bass clef.', { clef: 'bass', width: 160 })),
    nameNote('t11p4', 'alto', 'c/4', 'This note is on the middle line of the alto clef. What is it?'),
  ],
  challenge: [
    mc('t11c1', 'Which instruments read the bass clef?', ['Cello and double bass', 'The two lowest string instruments, cello and double bass, read the bass clef.'], [['Violin and viola', 'Violin reads treble clef and viola reads alto clef.'], ['Only the double bass', 'The cello reads the bass clef too (and switches clef when it plays high).']]),
    mc('t11c2', 'The double bass sounds…', ['One octave lower than written', 'Double bass music is written an octave higher than it sounds, so it doesn’t need lots of ledger lines.'], [['Exactly as written', 'That is true of violin, viola and cello, but not the double bass.'], ['One octave higher than written', 'The other way round: it sounds lower, not higher.']]),
    mc('t11c3', 'Which clef is this?', ['Alto clef', 'This clef is centred on the middle line, which is middle C: the alto (C) clef.'], [['Bass clef', 'The bass clef has two dots around line 4.'], ['Treble clef', 'The treble clef curls around line 2.']], fig('', 'A staff with an alto clef.', { clef: 'alto', width: 160 })),
    nameNote('t11c4', 'treble', 'g/4', 'This note is on the line the treble clef curls around. What is it?'),
    nameNote('t11c5', 'bass', 'f/3', 'This note is on the line between the bass clef’s two dots. What is it?'),
    mc('t11c6', 'Why do we need different clefs?', ['So each instrument’s range fits on the five lines', 'Each clef moves the staff to suit an instrument’s range, so its music needs few ledger lines.'], [['Because each clef makes the music sound different', 'A clef doesn’t change the sound. It only tells you which notes the lines stand for.'], ['To show how fast to play', 'Speed is shown by the tempo marking, not the clef.']]),
  ],
};

export const level12: Lesson = {
  level: 12,
  title: 'Naming the Notes',
  objective: 'Name any note on the staff of your instrument’s clef using the letters A to G.',
  intro: [
    'Notes are named with just seven letters, **A B C D E F G**, used over and over. After G comes A again, one octave higher.',
    'Once you know a few landmark notes in your clef, you can work out any other by counting steps.',
  ],
  steps: [
    {
      title: 'The musical alphabet',
      body: ['Going up the staff, every step (line → space → line) is the next letter: …E F G A B C D E F G A…', 'Going down, read the alphabet backwards.'],
      figure: fig('c/4:q d/4:q e/4:q f/4:q g/4:q a/4:q b/4:q c/5:q', 'A treble staff with C D E F G A B C going up step by step.', { clef: 'treble', caption: 'Each step up is the next letter. After B comes C again.' }),
    },
    {
      title: 'Treble clef landmarks',
      body: ['Lines from the bottom: **E G B D F** (“Every Good Boy Deserves Fun”).', 'Spaces from the bottom spell **F A C E**.'],
      figure: fig('e/4:q g/4:q b/4:q d/5:q f/5:q', 'The five treble-clef line notes: E G B D F.', { clef: 'treble' }),
    },
    {
      title: 'Bass and alto clef landmarks',
      body: ['**Bass clef** lines: **G B D F A** (“Good Boys Do Fine Always”). Spaces: **A C E G** (“All Cows Eat Grass”).', '**Alto clef** lines: **F A C E G**. Spaces: **G B D F**. The middle line is middle C.'],
      figure: fig('g/2:q b/2:q d/3:q f/3:q a/3:q', 'The five bass-clef line notes: G B D F A.', { clef: 'bass' }),
    },
  ],
  practice: [
    mc('t12p1', 'Which letter comes after G in music?', ['A', 'The musical alphabet only uses A to G. After G it starts again at A, one octave higher.'], [['H', 'Music in English uses only A to G. There is no H.'], ['F', 'F comes before G. Going up, the letter after G is A.']]),
    nameNote('t12p2', 'treble', 'b/4'),
    nameNote('t12p3', 'bass', 'd/3'),
    nameNote('t12p4', 'alto', 'e/4'),
  ],
  challenge: [
    nameNote('t12c1', 'treble', 'f/5'),
    nameNote('t12c2', 'treble', 'a/4'),
    nameNote('t12c3', 'bass', 'a/2'),
    nameNote('t12c4', 'bass', 'e/3'),
    nameNote('t12c5', 'alto', 'g/3'),
    nameNote('t12c6', 'alto', 'd/4'),
    mc('t12c7', 'The spaces of the treble clef spell a word. Which one?', ['FACE', 'From the bottom, the treble-clef spaces are F, A, C, E.'], [['EGBDF', 'Those are the treble-clef LINES, not the spaces.'], ['ACEG', 'A C E G are the spaces of the BASS clef.']]),
  ],
};

export const level13: Lesson = {
  level: 13,
  title: 'Note Values',
  objective: 'Know how many beats whole, half, quarter, eighth and sixteenth notes last.',
  intro: [
    'Where a note sits shows its **pitch**. What it looks like shows how **long** it lasts.',
    'In most music the beat is a **quarter note**, and the other note values are worked out from it.',
  ],
  steps: [
    {
      title: 'Halving each time',
      body: ['**Whole note** (hollow, no stem) = 4 beats. **Half note** (hollow, with stem) = 2. **Quarter note** (filled, with stem) = 1.', 'An **eighth note** (one flag or beam) = ½ beat. A **sixteenth note** (two flags or beams) = ¼ beat.'],
      figure: fig('g/4:w g/4:h g/4:q g/4:8 g/4:16', 'A whole, half, quarter, eighth and sixteenth note.', { caption: '4 beats, 2, 1, ½, ¼.' }),
    },
    {
      title: 'Adding them up',
      body: ['Two halves make a whole. Two quarters make a half. Two eighths make a quarter. Four sixteenths make a quarter.', 'To check a bar, add up the beats of every note in it.'],
      figure: fig('g/4:h a/4:q b/4:8 c/5:8', 'A bar with a half note, a quarter and two eighths.', { caption: '2 + 1 + ½ + ½ = 4 beats.' }),
    },
  ],
  practice: [
    mc('t13p1', 'How many beats does a half note last (quarter note = 1 beat)?', ['2', 'A half note is half of a whole note (4 beats), so it lasts 2.'], [['1', 'One beat is a quarter note. A half note lasts twice as long.'], ['4', 'Four beats is a whole note.']]),
    mc('t13p2', 'Which note lasts half a beat?', ['Eighth note', 'An eighth note (one flag) is half a quarter note: ½ beat.'], [['Sixteenth note', 'A sixteenth (two flags) is a quarter of a beat.'], ['Quarter note', 'A quarter note lasts one whole beat.']]),
    mc('t13p3', 'How many eighth notes fit into one quarter note?', ['2', 'Each eighth is ½ beat, so two make one beat.'], [['4', 'Four SIXTEENTHS make a quarter note.'], ['8', 'Eight eighths would last 4 beats, a whole note.']]),
  ],
  challenge: [
    mc('t13c1', 'How many beats are in this bar?', [`${beatsOf('g/4:q a/4:q b/4:h')}`, 'Quarter (1) + quarter (1) + half (2) = 4 beats.'], [['3', 'Count the half note as 2 beats, not 1.'], ['5', 'A half note is 2 beats, not 3.']], fig('g/4:q a/4:q b/4:h', 'Quarter, quarter, half note.')),
    mc('t13c2', 'How many beats are in this bar?', [`${beatsOf('d/5:8 c/5:8 b/4:8 a/4:8 g/4:h')}`, 'Four eighths (½ each = 2 beats) + a half note (2 beats) = 4.'], [['6', 'Each eighth is only ½ beat, so four eighths make 2 beats, not 4.'], ['3', 'The half note is 2 beats on its own.']], fig('d/5:8 c/5:8 b/4:8 a/4:8 g/4:h', 'Four eighth notes and a half note.')),
    mc('t13c3', 'How many sixteenth notes last as long as a half note?', ['8', 'A half note is 2 beats, and each beat holds 4 sixteenths: 2 × 4 = 8.'], [['4', 'Four sixteenths last one beat, a quarter note.'], ['16', 'Sixteen sixteenths would fill a whole note (4 beats).']]),
    mc('t13c4', 'Which note is hollow and has a stem?', ['Half note', 'Hollow head + stem = half note.'], [['Whole note', 'A whole note is hollow but has NO stem.'], ['Quarter note', 'A quarter note has a filled-in head.']]),
    mc('t13c5', 'How many beats are in this bar?', [`${beatsOf('e/5:16 d/5:16 c/5:16 b/4:16 a/4:q g/4:h')}`, 'Four sixteenths (1 beat) + quarter (1) + half (2) = 4.'], [['5', 'Four sixteenths together only make 1 beat.'], ['7', 'A sixteenth is ¼ beat, not 1 beat.']], fig('e/5:16 d/5:16 c/5:16 b/4:16 a/4:q g/4:h', 'Four sixteenths, a quarter and a half note.')),
    mc('t13c6', 'A whole note lasts as long as how many quarter notes?', ['4', 'Whole = 4 beats = four quarter notes.'], [['2', 'Two quarters make a half note.'], ['8', 'Eight quarters would be two whole notes.']]),
  ],
};

export const level14: Lesson = {
  level: 14,
  title: 'Rests: Counting the Silence',
  objective: 'Recognise rests and know how long each silence lasts.',
  intro: [
    'Music is made of sounds and silences. Each note value has a matching **rest** that lasts exactly as long.',
    'During a rest you stop playing but keep counting. On a string instrument you often keep the bow ready on the string.',
  ],
  steps: [
    {
      title: 'Whole and half rests',
      body: ['Both are small blocks. The **whole rest hangs down** from line 4. The **half rest sits** on line 3, like a hat.', 'A whole rest also means a whole bar of silence, whatever the time signature.'],
      figure: fig('r:w r:h r:h', 'A whole rest, then two half rests.', { caption: 'Whole rest (hangs), half rests (sit).' }),
      tip: 'A half rest looks like a hat sitting on a head. A whole rest is heavier, so it hangs.',
    },
    {
      title: 'Quarter, eighth and sixteenth rests',
      body: ['The **quarter rest** is a squiggle, 1 beat. The **eighth rest** looks like a 7 with one flag, ½ beat. The **sixteenth rest** has two flags, ¼ beat.'],
      figure: fig('r:q r:8 r:16 r:16 g/4:h', 'Quarter rest, eighth rest, two sixteenth rests, then a half note.'),
    },
  ],
  practice: [
    mc('t14p1', 'Which rest hangs down from a line?', ['Whole rest', 'The whole rest hangs from line 4. The half rest sits on line 3.'], [['Half rest', 'The half rest SITS on line 3, like a hat.'], ['Quarter rest', 'The quarter rest is a squiggle, not a block.']]),
    mc('t14p2', 'How long does a quarter rest last?', ['1 beat', 'A quarter rest matches a quarter note: 1 beat.'], [['½ beat', 'Half a beat is an eighth rest.'], ['2 beats', 'Two beats is a half rest.']]),
    mc('t14p3', 'What should you do during a rest?', ['Stop playing but keep counting', 'Rests are silent beats. Keep counting so you come back in exactly on time.'], [['Stop counting until the next note', 'If you stop counting, you won’t know when to come back in.'], ['Play the note before more quietly', 'A rest is silence, not a quieter note.']]),
  ],
  challenge: [
    mc('t14c1', 'How many beats of silence are in this bar?', [`${beatsOf('r:q r:h')}`, 'Quarter rest (1) + half rest (2) = 3 beats of silence.'], [['2', 'Add the quarter rest’s beat too.'], ['4', 'A half rest is 2 beats, not 3.']], fig('g/4:q r:q r:h', 'A quarter note, a quarter rest and a half rest.')),
    mc('t14c2', 'This bar has a half note and two rests. How many beats does it fill?', [`${beatsOf('a/4:h r:q r:8 b/4:8')}`, 'Half note (2) + quarter rest (1) + eighth rest (½) + eighth note (½) = 4.'], [['3½', 'Don’t forget the last eighth note.'], ['5', 'The eighth rest is only ½ beat.']], fig('a/4:h r:q r:8 b/4:8', 'Half note, quarter rest, eighth rest, eighth note.')),
    mc('t14c3', 'Which rest has two flags?', ['Sixteenth rest', 'Two flags = sixteenth, just like a sixteenth note.'], [['Eighth rest', 'The eighth rest has ONE flag.'], ['Quarter rest', 'The quarter rest is a squiggle with no flags.']]),
    mc('t14c4', 'In 3/4 time, a whole rest means…', ['A whole bar of silence (3 beats)', 'A whole rest on its own in a bar means rest for the whole bar, in any time signature.'], [['Exactly 4 beats of silence', 'Only in 4/4. In any time signature, a whole rest alone fills the whole bar.'], ['2 beats of silence', 'That would be a half rest.']]),
    mc('t14c5', 'Which rest sits ON line 3?', ['Half rest', 'The half rest sits on line 3 like a hat.'], [['Whole rest', 'The whole rest hangs down from line 4.'], ['Eighth rest', 'The eighth rest is a small 7-shape, not a block.']]),
  ],
};

export const level15: Lesson = {
  level: 15,
  title: 'Time Signatures',
  objective: 'Read a time signature and tell how many beats are in each bar.',
  intro: [
    'At the start of a piece, after the clef, are two numbers stacked up: the **time signature**.',
    'It tells you how to count the music: how many beats are in each bar, and which note gets one beat.',
  ],
  steps: [
    {
      title: 'Top and bottom',
      body: ['The **top number** is how many beats are in each bar.', 'The **bottom number** says which note is one beat: **4** = quarter note, **2** = half note, **8** = eighth note.'],
      figure: fig('g/4:q a/4:q b/4:q', 'A bar of 3/4 with three quarter notes.', { time: '3/4', caption: '3/4: three quarter-note beats in every bar, as in a waltz.' }),
    },
    {
      title: 'Common time and cut time',
      body: ['**C** stands for **common time**, which is 4/4. A C with a line through it is **cut time**, 2/2: two half-note beats.', '2/4 marches, 3/4 waltzes and minuets, and 4/4 is the most common of all.'],
      figure: fig('d/5:h b/4:q g/4:q', 'A bar of 4/4.', { time: 'C', caption: 'C = 4/4.' }),
    },
  ],
  practice: [
    mc('t15p1', 'In 3/4 time, how many beats are in each bar?', ['3', 'The top number gives the beats per bar: 3.'], [['4', 'The 4 is the bottom number. It means the beat is a quarter note.'], ['7', 'Don’t add the two numbers. They mean different things.']]),
    mc('t15p2', 'What does the bottom 4 in a time signature mean?', ['The beat is a quarter note', 'A bottom 4 means quarter-note beats.'], [['There are 4 beats in a bar', 'The TOP number says how many beats.'], ['Play 4 times as fast', 'Time signatures don’t set the speed.']]),
    mc('t15p3', 'What does the C at the start of a piece mean?', ['Common time (4/4)', 'C means common time: four quarter-note beats.'], [['The key of C major', 'Keys are shown by sharps and flats, not by a C sign.'], ['Play cheerfully', 'C is a time signature, not a mood.']], fig('', 'A treble staff with a C time signature.', { time: 'C', width: 160 })),
  ],
  challenge: [
    mc('t15c1', 'Which time signature fits this bar?', ['3/4', 'Half note (2) + quarter (1) = 3 quarter-note beats.'], [['4/4', 'This bar adds up to 3 beats, not 4.'], ['2/4', 'The half note alone fills 2/4. With the quarter it is 3 beats.']], fig('b/4:h g/4:q', 'A half note and a quarter note.')),
    mc('t15c2', 'Which time signature fits this bar?', ['2/4', 'Four eighth notes = 2 quarter-note beats.'], [['4/4', 'Each eighth is half a beat, so four of them make 2 beats.'], ['3/4', 'Count again: ½ + ½ + ½ + ½ = 2.']], fig('g/4:8 a/4:8 b/4:8 c/5:8', 'Four eighth notes.')),
    mc('t15c3', 'In 2/2 (cut time), which note gets one beat?', ['Half note', 'The bottom 2 means a half note is one beat.'], [['Quarter note', 'That would be a bottom 4.'], ['Whole note', 'A whole note lasts two beats in cut time.']]),
    mc('t15c4', 'A waltz is usually in…', ['3/4', 'Waltzes and minuets have three beats in a bar: ONE-two-three.'], [['2/4', '2/4 is typical for marches.'], ['4/4', '4/4 is common, but a waltz’s swing comes from three beats.']]),
    mc('t15c5', 'This bar of 4/4 is missing one note at the end. Which note completes it?', ['A quarter note', 'Half (2) + quarter (1) = 3. One more beat is needed: a quarter note.'], [['A half note', 'That would make 5 beats, too many for 4/4.'], ['An eighth note', 'An eighth is only ½ beat, so the bar would still be short.']], fig('d/5:h c/5:q', 'A half note and a quarter note in 4/4.', { time: '4/4' })),
    mc('t15c6', 'In 6/8, which note gets one count?', ['Eighth note', 'The bottom 8 means eighth notes are counted. (Later you will feel them in two groups of three.)'], [['Quarter note', 'A quarter note would need a bottom 4.'], ['Sixteenth note', 'A sixteenth note would need a bottom 16.']]),
  ],
};

export const level16: Lesson = {
  level: 16,
  title: 'Sharps, Flats and Naturals',
  objective: 'Know what ♯, ♭ and ♮ do to a note and how long they last.',
  intro: [
    'The seven letter names don’t cover every note. Between most of them sits another note, a **half step** away.',
    'Accidentals let us write those in-between notes.',
  ],
  steps: [
    {
      title: 'Half steps',
      body: ['A **half step** is the smallest step in Western music, the distance to the very next note.', 'On your instrument, a half step usually means fingers placed **close together**. A whole step is a wider gap.'],
    },
    {
      title: 'The three signs',
      body: ['**♯ sharp** raises a note by a half step. **♭ flat** lowers it by a half step. **♮ natural** cancels a sharp or flat.', 'The sign goes *before* the note, on the same line or space.'],
      figure: fig('f/4:q f#/4:q b/4:q bb/4:q bn/4:q', 'F, F sharp, B, B flat, B natural.', { caption: 'F → F♯ (up a half step); B → B♭ (down) → B♮ (back).' }),
    },
    {
      title: 'How long an accidental lasts',
      body: ['An accidental lasts until the **end of the bar**, on that line or space. The next bar line cancels it.', 'So a second F in the same bar after an F♯ is still F♯, unless a ♮ appears.'],
    },
  ],
  practice: [
    mc('t16p1', 'What does a sharp (♯) do?', ['Raises the note by a half step', 'A sharp raises a note by one half step.'], [['Lowers the note by a half step', 'Lowering is what a flat does.'], ['Makes the note louder', 'Accidentals change pitch, not volume.']]),
    mc('t16p2', 'What does a natural (♮) do?', ['Cancels a sharp or flat', 'A natural returns the note to its plain letter name.'], [['Raises the note', 'Raising is the sharp’s job.'], ['Shortens the note', 'Accidentals don’t change rhythm.']]),
    mc('t16p3', 'Where is the accidental written?', ['Just before the note, on the same line or space', 'Accidentals sit in front of the note they change.'], [['Just after the note', 'They always come before, so you see them before you play.'], ['Above the staff', 'They sit on the same line or space as the note.']]),
  ],
  challenge: [
    mc('t16c1', 'In one bar you see F♯ and then, later in the same bar, a plain F with no sign. What do you play?', ['F♯ again', 'The sharp lasts until the bar line, so the second F is still F♯.'], [['F natural', 'Only a ♮ sign, or the next bar line, cancels the sharp.'], ['F♭', 'Nothing here lowers the note.']]),
    mc('t16c2', 'After a bar line, the same note appears with no sign. Is the sharp from the previous bar still there?', ['No, the bar line cancels it', 'Accidentals last only until the end of their bar (unless a tie carries the note across).'], [['Yes, it lasts for the whole line', 'Only key signatures last the whole piece. Accidentals end at the bar line.'], ['Only if it’s the same octave', 'Different octave or not, the bar line has cancelled it.']]),
    mc('t16c3', 'What is the highlighted note?', ['B♭', 'The flat sign before B lowers it by a half step: B♭.'], [['B', 'Look at the sign in front of it. It’s a flat.'], ['A♯', 'A♯ sounds the same, but this is written on the B line with a flat, so it is B♭.']], fig('*bb/4:w', 'A note on the middle line with a flat sign.', { width: 200 })),
    mc('t16c4', 'What is the highlighted note?', ['C♯', 'A sharp in front of C (space 3) makes C♯.'], [['C', 'There is a sharp sign in front of it.'], ['D♭', 'D♭ is the same pitch, but this note is written on the C space with a sharp.']], fig('*c#/5:w', 'A note in space 3 with a sharp sign.', { width: 200 })),
    mc('t16c5', 'On a string instrument, a half step usually means…', ['Fingers close together', 'Neighbouring fingers placed close together play a half step.'], [['Changing to another string', 'Changing string usually jumps much further than a half step.'], ['Lifting all fingers', 'That plays the open string, which could be any distance away.']]),
  ],
};

export const level17: Lesson = {
  level: 17,
  title: 'Ledger Lines',
  objective: 'Read notes above and below the staff on ledger lines.',
  intro: [
    'Five lines aren’t enough for an instrument’s whole range. When notes go higher or lower, short extra lines called **ledger lines** extend the staff.',
    'When you shift into higher positions, you will read ledger lines all the time.',
  ],
  steps: [
    {
      title: 'Keep counting',
      body: ['Ledger lines work just like staff lines: line, space, line, space. The musical alphabet carries on.', 'In the treble clef, the 1st ledger line **below** is **middle C**, and the 1st **above** is **A**.'],
      figure: fig('c/4:q a/5:q', 'Middle C on a ledger line below the treble staff, and A on a ledger line above.', { caption: 'Middle C (below) and A (above).' }),
    },
    {
      title: 'Open strings below the staff',
      body: ['The violin’s open **G** hangs just under two ledger lines below the treble staff.', 'The cello’s open **C** sits on the 2nd ledger line below the bass staff.'],
      figure: fig('g/3:w', 'Violin open G below the treble staff.', { clef: 'treble', width: 200 }),
    },
  ],
  practice: [
    nameNote('t17p1', 'treble', 'c/4'),
    nameNote('t17p2', 'treble', 'a/5'),
    mc('t17p3', 'What are ledger lines for?', ['Notes above or below the five-line staff', 'They extend the staff for notes too high or low to fit on it.'], [['Showing how loud to play', 'Dynamics show volume. Ledger lines show pitch.'], ['Marking the end of a bar', 'That is a bar line.']]),
  ],
  challenge: [
    nameNote('t17c1', 'treble', 'g/3'),
    nameNote('t17c2', 'treble', 'b/5'),
    nameNote('t17c3', 'treble', 'c/6'),
    nameNote('t17c4', 'bass', 'c/2'),
    nameNote('t17c5', 'bass', 'c/4'),
    nameNote('t17c6', 'alto', 'b/4'),
  ],
};

export const level18: Lesson = {
  level: 18,
  title: 'Dots and Ties',
  objective: 'Work out how long dotted and tied notes last.',
  intro: [
    'Sometimes a note needs to last for an amount that no single note shape gives. **Dots** and **ties** make longer values.',
    'You have played dotted rhythms in Ode to Joy and Auld Lang Syne. Now you will see exactly how they add up.',
  ],
  steps: [
    {
      title: 'A dot adds half',
      body: ['A dot after a note adds **half its value** again.', '**Dotted half** = 2 + 1 = 3 beats. **Dotted quarter** = 1 + ½ = 1½ beats. **Dotted eighth** = ½ + ¼ = ¾ beat.'],
      figure: fig('g/4:hd a/4:q', 'A dotted half note and a quarter note.', { caption: '3 + 1 = 4 beats.' }),
    },
    {
      title: 'A tie joins two notes',
      body: ['A **tie** is a curve joining two notes of the **same pitch**. Play them as one long note, adding both values.', 'A curve between **different** pitches is a **slur**, which you already know: separate notes in one bow.'],
      tip: 'Same pitch = tie (hold). Different pitches = slur (one bow).',
    },
  ],
  practice: [
    mc('t18p1', 'How many beats does a dotted half note last?', ['3', 'Half (2) + half of that (1) = 3 beats.'], [['2½', 'The dot adds half of 2, which is 1, not ½.'], ['4', 'Four beats is a whole note.']]),
    mc('t18p2', 'How many beats does a dotted quarter note last?', ['1½', 'Quarter (1) + half of that (½) = 1½.'], [['2', 'The dot adds half the note’s value, not the whole value again.'], ['1¼', 'Half of 1 is ½, not ¼.']]),
    mc('t18p3', 'A curve joins two notes of the SAME pitch. What is it?', ['A tie: hold one long note', 'A tie joins notes of the same pitch into one longer note.'], [['A slur: play both in one bow', 'A slur joins DIFFERENT pitches.'], ['A repeat sign', 'Repeat signs use dots and thick bar lines.']]),
  ],
  challenge: [
    mc('t18c1', 'A half note is tied to a quarter note of the same pitch. How long is the sound?', ['3 beats', '2 + 1 = 3 beats, played as one note.'], [['2 beats', 'With a tie you keep holding into the second note.'], ['Two separate notes, 2 and 1', 'A tie means you don’t play the second note again.']]),
    mc('t18c2', 'How many beats are in this bar?', [`${beatsOf('g/4:qd a/4:8 b/4:h')}`, 'Dotted quarter (1½) + eighth (½) + half (2) = 4.'], [['3½', 'The dotted quarter is 1½ beats, not 1.'], ['4½', 'The eighth note is only ½ beat.']], fig('g/4:qd a/4:8 b/4:h', 'Dotted quarter, eighth, half note.')),
    mc('t18c3', 'How long is a dotted eighth note?', ['¾ beat', 'Eighth (½) + half of that (¼) = ¾ beat.'], [['1 beat', 'That would be a quarter note.'], ['1½ beats', 'That is a dotted QUARTER.']]),
    mc('t18c4', 'Which time signature fits a bar holding one dotted half note?', ['3/4', 'A dotted half lasts 3 beats, filling a bar of 3/4.'], [['4/4', 'It is one beat short of 4/4.'], ['2/4', 'It lasts one beat too long for 2/4.']], fig('d/5:hd', 'A single dotted half note.')),
    mc('t18c5', 'A dotted quarter is usually followed by which note to complete two beats?', ['An eighth note', '1½ + ½ = 2 beats: the classic “long-short” dotted rhythm.'], [['A quarter note', '1½ + 1 = 2½ beats, too many.'], ['A sixteenth note', '1½ + ¼ = 1¾, not quite two beats.']]),
    mc('t18c6', 'How many beats are in this bar?', [`${beatsOf('e/5:8d d/5:16 c/5:q b/4:h')}`, 'Dotted eighth (¾) + sixteenth (¼) + quarter (1) + half (2) = 4.'], [['3¾', 'Don’t forget the sixteenth after the dotted eighth.'], ['4½', 'A dotted eighth is ¾ beat, not 1¼.']], fig('e/5:8d d/5:16 c/5:q b/4:h', 'Dotted eighth, sixteenth, quarter, half note.')),
  ],
};
