import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Level } from '../../data/levels';
import { TOTAL_LEVELS } from '../../data/curriculum';
import type { PlayLevel, TutorialCard } from '../../course/playLevels';
import { writtenKey } from '../../course/playLevels';
import { explain, type NoteResult, type Summary } from '../../play/assess';
import { buildTimeline } from '../../play/exercise';
import type { Outcome } from '../../lib/rewards';
import { useAppState } from '../../state/AppState';
import { useListener } from '../../audio/useListener';
import { getInstrument, midiToHz } from '../../audio/notes';
import { Button, ButtonLink, Stars } from '../ui';
import { Icon } from '../Icon';
import { Fingerboard } from '../Fingerboard';
import { Notation } from '../Notation';
import { InstrumentPicture } from '../InstrumentPicture';
import { PlayAlongPlayer } from '../play/PlayAlongPlayer';
import { TryNote } from './TryNote';
import styles from './Lesson.module.css';

type Phase = 'intro' | 'learn' | 'try' | 'test' | 'result';
const SEGMENTS: { label: string; phases: Phase[] }[] = [
  { label: 'Learn', phases: ['intro', 'learn'] },
  { label: 'Try it', phases: ['try'] },
  { label: 'Play test', phases: ['test', 'result'] },
];
const SIZE = { violin: 1, viola: 1.15, cello: 1.75, bass: 2.4 } as const;

/** A playing level: tutorial cards → try the new notes → play-along test (≥50% green passes). */
export function PlayLessonPlayer({ lesson, level }: { lesson: PlayLevel; level: Level }) {
  const inst = lesson.exercise.instrument;
  const { progress, completeLevel } = useAppState();
  const navigate = useNavigate();
  const best = progress.completedLevels[level.n];
  const [phase, setPhase] = useState<Phase>('intro');
  const [card, setCard] = useState(0);
  const [tryIdx, setTryIdx] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [results, setResults] = useState<NoteResult[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const tones = useListener({ minHz: 30, maxHz: 4000 });

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
    headRef.current?.focus({ preventScroll: true });
  }, [phase, card, tryIdx]);

  const afterLearn = () => { if (lesson.tryNotes.length) { setTryIdx(0); setPhase('try'); } else setPhase('test'); };

  const finishTest = (s: Summary, rs: NoteResult[]) => {
    setSummary(s);
    setResults(rs);
    setOutcome(null);
    if (s.stars >= 1) {
      try { setOutcome(completeLevel(level.n, s.stars, s.percent)); } catch (e) { console.error(e); }
    }
    setPhase('result');
  };

  const playSequence = async (notes: number[]) => { for (const m of notes) await tones.playTone(midiToHz(m)); };

  const segIndex = SEGMENTS.findIndex((g) => g.phases.includes(phase));
  const within = phase === 'learn' ? (card + 1) / lesson.cards.length : phase === 'try' ? tryIdx / Math.max(1, lesson.tryNotes.length) : phase === 'result' ? 1 : 0;
  const nextN = level.n + 1;
  const completion = outcome?.completion ?? null;

  let body: ReactNode = null;
  if (phase === 'intro') {
    body = (
      <div className={styles.screen} data-play-lesson-intro>
        <p className="eyebrow">{getInstrument(inst)!.name} · playing lesson{level.isCheckpoint ? ' · Checkpoint' : ''}</p>
        <h2 className={styles.title} tabIndex={-1} ref={headRef}>{lesson.title}</h2>
        <p className={styles.objective}><strong>You will be able to:</strong> {lesson.objective}</p>
        <p className={styles.newLabel}>New in this level</p>
        <ul className={styles.chips}>{lesson.newIdeas.map((t) => <li key={t}>{t}</li>)}</ul>
        <ul className={styles.plan}>
          <li><span>1</span>Learn · {lesson.cards.length} short {lesson.cards.length === 1 ? 'page' : 'pages'}</li>
          {lesson.tryNotes.length > 0 && <li><span>2</span>Try it · play the new {lesson.tryNotes.length === 1 ? 'note' : 'notes'} while Stave listens</li>}
          <li><span>{lesson.tryNotes.length ? 3 : 2}</span>Play test · play along; half the notes green to pass</li>
        </ul>
        {best && <p className={styles.best}>Your best: <Stars earned={best.stars} /> {best.bestScore}% — replaying keeps your best result.</p>}
        <Button size="lg" iconAfter="arrow-right" onClick={() => { setCard(0); setPhase('learn'); }} className={styles.wide} data-lesson-begin>{best ? 'Play again' : 'Begin'}</Button>
      </div>
    );
  } else if (phase === 'learn') {
    const c = lesson.cards[card];
    body = (
      <div className={styles.screen} data-card={card}>
        <p className="eyebrow">Learn · page {card + 1} of {lesson.cards.length}</p>
        <h2 className={styles.stepTitle} tabIndex={-1} ref={headRef}>{c.title}</h2>
        {c.body.map((p, i) => <p key={i} className={styles.para}>{p}</p>)}
        <CardVisual card={c} inst={inst} />
        {c.listen && c.listen.length > 0 && (
          <Button variant="secondary" icon="speaker" onClick={() => playSequence(c.listen!)} disabled={tones.toneHz != null} data-listen>
            {tones.toneHz != null ? 'Playing…' : c.listen.length === 1 ? 'Hear the note' : 'Hear the notes'}
          </Button>
        )}
        <div className={styles.nav}>
          <Button variant="secondary" icon="chevron-left" onClick={() => (card === 0 ? setPhase('intro') : setCard(card - 1))}>Back</Button>
          <Button iconAfter="arrow-right" onClick={() => (card === lesson.cards.length - 1 ? afterLearn() : setCard(card + 1))} data-card-next>
            {card === lesson.cards.length - 1 ? (lesson.tryNotes.length ? 'Try it' : 'Go to the play test') : 'Next'}
          </Button>
        </div>
      </div>
    );
  } else if (phase === 'try') {
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">Try it · note {tryIdx + 1} of {lesson.tryNotes.length}</p>
        <h2 className={styles.stepTitle} tabIndex={-1} ref={headRef}>Play this note</h2>
        <TryNote key={tryIdx} instrument={inst} midi={lesson.tryNotes[tryIdx]} last={tryIdx === lesson.tryNotes.length - 1}
          onDone={() => (tryIdx === lesson.tryNotes.length - 1 ? setPhase('test') : setTryIdx(tryIdx + 1))} />
      </div>
    );
  } else if (phase === 'test') {
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">Play test</p>
        <h2 className={styles.stepTitle} tabIndex={-1} ref={headRef}>Play along</h2>
        <p className={styles.para}>Half the notes green (one star) passes the level. Use the slower speed if you like — it still counts.</p>
        <PlayAlongPlayer exercise={lesson.exercise} onFinish={finishTest} />
      </div>
    );
  } else if (phase === 'result' && summary) {
    const passed = summary.stars >= 1;
    body = (
      <div className={`${styles.screen} ${styles.result}`} data-result={passed ? 'pass' : 'fail'}>
        <h2 className={styles.title} tabIndex={-1} ref={headRef}>{passed ? (summary.stars === 3 ? 'Wonderful playing!' : 'Level complete') : 'Not quite yet'}</h2>
        <div className={styles.bigStars} role="img" aria-label={`${summary.stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < summary.stars ? styles.bigStarOn : styles.bigStarOff} style={{ animationDelay: `${200 + i * 260}ms` }}>
              <Icon name="star" size={48} filled={i < summary.stars} />
            </span>
          ))}
        </div>
        <p className={styles.scoreLine}><span className="num">{summary.correct}</span> of {summary.total} notes green · <span className="num">{summary.percent}%</span></p>
        <RedNotes lesson={lesson} results={results} />
        {passed ? (
          <>
            {completion?.unlockedNext && nextN <= TOTAL_LEVELS && <p className={styles.unlocked}><Icon name="check" size={16} /> Level {nextN} is now unlocked.</p>}
            {completion?.replay && <p className={styles.small}>{completion.improved ? 'New best result saved.' : `Your best (${best?.stars ?? summary.stars}★, ${best?.bestScore ?? summary.percent}%) is kept.`}</p>}
            {outcome && <p className={styles.xpLine}>{outcome.xpGained > 0 ? `+${outcome.xpGained} XP` : 'No new XP — this result was already rewarded.'}</p>}
            <div className={styles.resultActions}>
              {nextN <= TOTAL_LEVELS && <ButtonLink to={`/level/${nextN}`} size="lg" iconAfter="arrow-right" data-next-level>Continue to Level {nextN}</ButtonLink>}
              <Button variant="secondary" size="lg" onClick={() => setPhase('test')}>Play it again</Button>
              <ButtonLink to={`/roadmap#level-${level.n}`} variant="ghost">Back to roadmap</ButtonLink>
            </div>
          </>
        ) : (
          <>
            <p className={styles.para}>You need at least half the notes green to pass. Try the slower speed, check the fingering, and have another go — nothing is lost.</p>
            <div className={styles.resultActions}>
              <Button size="lg" onClick={() => setPhase('test')}>Try the play test again</Button>
              <Button variant="secondary" size="lg" onClick={() => { setCard(0); setPhase('learn'); }}>Review the lesson</Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.player} style={{ ['--wc' as string]: level.world.colorVar }} data-play-lesson={lesson.exercise.id} data-phase={phase}>
      <div ref={topRef} className={styles.top}>
        <button type="button" className={styles.exit} onClick={() => navigate(`/roadmap#level-${level.n}`)} aria-label="Exit lesson"><Icon name="close" /></button>
        <h1 className={styles.heading} tabIndex={-1} data-page-title>Level {level.n}: {lesson.title}</h1>
      </div>
      <ol className={styles.segments} aria-label="Lesson progress">
        {SEGMENTS.filter((g) => g.label !== 'Try it' || lesson.tryNotes.length).map((g) => {
          const i = SEGMENTS.indexOf(g);
          return (
            <li key={g.label} className={i < segIndex ? styles.segDone : i === segIndex ? styles.segNow : ''} aria-current={i === segIndex ? 'step' : undefined}>
              <span className={styles.segBar}><span style={{ width: `${i < segIndex ? 100 : i === segIndex ? Math.round(within * 100) : 0}%` }} /></span>
              <span className={styles.segLabel}>{g.label}</span>
            </li>
          );
        })}
      </ol>
      {body}
    </div>
  );
}

/** The notes that weren't green, with a kind tip for each. */
function RedNotes({ lesson, results }: { lesson: PlayLevel; results: NoteResult[] }) {
  const tl = buildTimeline(lesson.exercise);
  const reds = results.filter((r) => r.verdict !== 'correct' && !tl.notes[r.index].rest);
  if (!reds.length) return null;
  const pretty = (key: string) => { const [p, o] = key.split('/'); return `${p[0].toUpperCase()}${p.slice(1).replace('#', '♯')}${o}`; };
  return (
    <div className={styles.review} data-red-notes>
      <p className={styles.newLabel}>Notes to work on</p>
      <ul className={styles.redList}>
        {reds.map((r) => <li key={r.index}><span className={styles.redBar}>Bar {tl.notes[r.index].measure + 1}</span> {explain(r, pretty(tl.notes[r.index].key))}</li>)}
      </ul>
    </div>
  );
}

function CardVisual({ card, inst }: { card: TutorialCard; inst: PlayLevel['exercise']['instrument'] }) {
  const s = card.show;
  if (!s) return null;
  const clef = getInstrument(inst)!.clef;
  if (s.kind === 'fingerboard') return <div className={styles.figureBox}><Fingerboard instrument={inst} notes={s.notes} highlight={s.highlight} /></div>;
  if (s.kind === 'parts') return <div className={styles.figureBox}><InstrumentPicture size={SIZE[inst]} label={`A ${getInstrument(inst)!.name.toLowerCase()}`} /></div>;
  return (
    <div className={styles.figureBox}>
      <Notation clef={clef} notes={s.notes} timeSignature={s.time} keySignature={s.key} width={Math.max(220, 90 + s.notes.length * 60)} height={130}
        label={`Music: ${s.notes.map((n) => (n.key === 'r' ? 'rest' : n.key.replace('/', ''))).join(', ')}`} />
    </div>
  );
}

export { writtenKey };
