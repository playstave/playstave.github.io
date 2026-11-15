import { Fragment, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import type { Lesson } from '../../lessons/types';
import type { Level } from '../../data/levels';
import { TOTAL_LEVELS } from '../../data/curriculum';
import { currentQuestion, initialState, reducer, score, thresholds, type Phase } from '../../lib/lessonEngine';
import type { Outcome } from '../../lib/rewards';
import { useAppState } from '../../state/AppState';
import { StaffDiagram } from '../StaffDiagram';
import { QuestionView } from './QuestionView';
import { Button, ButtonLink, Stars } from '../ui';
import { Icon } from '../Icon';
import styles from './Lesson.module.css';

/** Minimal **bold** support for lesson copy. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>))}</>;
}

const SEGMENTS: { label: string; phases: Phase[] }[] = [
  { label: 'Learn', phases: ['intro', 'lesson'] },
  { label: 'Practice', phases: ['practice'] },
  { label: 'Challenge', phases: ['briefing', 'challenge', 'result'] },
];

export function LessonPlayer({ lesson, level }: { lesson: Lesson; level: Level }) {
  const [s, dispatch] = useReducer(reducer(lesson), initialState);
  const { progress, completeLevel } = useAppState();
  const navigate = useNavigate();
  const best = progress.completedLevels[level.n];
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const completion = outcome?.completion ?? null;
  const recorded = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const result = s.phase === 'result' ? score(lesson, s.results) : null;

  // Save a pass exactly once per attempt.
  useEffect(() => {
    if (s.phase !== 'result') { recorded.current = false; return; }
    if (!result?.passed || recorded.current) return;
    recorded.current = true;
    try { setOutcome(completeLevel(level.n, result.stars, result.percent)); } catch (e) { console.error(e); }
  }, [s.phase, result, completeLevel, level.n]);

  useEffect(() => { if (s.phase !== 'result') setOutcome(null); }, [s.phase]);

  // Keep the active content in view when moving between screens, and move focus
  // to the new screen's heading (question screens focus their own prompt).
  const headRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' });
    headRef.current?.focus({ preventScroll: true });
  }, [s.phase, s.step, s.q]);

  // Leaving mid-lesson asks first; nothing from an unfinished attempt is saved.
  const inProgress = s.phase !== 'intro' && s.phase !== 'result';
  const blocker = useBlocker(({ currentLocation, nextLocation }) => inProgress && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (!inProgress) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [inProgress]);

  const segIndex = SEGMENTS.findIndex((g) => g.phases.includes(s.phase));
  const within = s.phase === 'lesson' ? (s.step + 1) / lesson.steps.length
    : s.phase === 'practice' ? (s.q + (s.feedback?.correct ? 1 : 0)) / lesson.practice.length
    : s.phase === 'challenge' ? (s.q + (s.feedback ? 1 : 0)) / lesson.challenge.length
    : s.phase === 'result' ? 1 : 0;

  const q = currentQuestion(lesson, s);
  const t = thresholds(lesson);
  const nextN = level.n + 1;

  let body: ReactNode = null;
  if (s.phase === 'intro') {
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">Unit {level.unit.id}: {level.unit.title} · Level {level.indexInUnit} of 10{level.isCheckpoint ? ' · Checkpoint' : ''}</p>
        <h2 className={styles.title}>{lesson.title}</h2>
        <p className={styles.objective}><strong>You will be able to:</strong> {lesson.objective}</p>
        {lesson.intro.map((p, i) => <p key={i} className={styles.para}><Rich text={p} /></p>)}
        <ul className={styles.plan}>
          <li><span>1</span>Lesson · {lesson.steps.length} short pages</li>
          <li><span>2</span>Guided practice · {lesson.practice.length} questions with hints</li>
          <li><span>3</span>Challenge · {lesson.challenge.length} questions for stars</li>
        </ul>
        {best && <p className={styles.best}>Your best: <Stars earned={best.stars} /> {best.bestScore}% — replaying keeps your best result.</p>}
        <Button size="lg" iconAfter="arrow-right" onClick={() => dispatch({ type: 'begin' })} className={styles.wide}>{best ? 'Practice again' : 'Begin lesson'}</Button>
      </div>
    );
  } else if (s.phase === 'lesson') {
    const step = lesson.steps[s.step];
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">Lesson · page {s.step + 1} of {lesson.steps.length}</p>
        <h2 className={styles.stepTitle} tabIndex={-1} ref={headRef}>{step.title}</h2>
        {step.body.map((p, i) => <p key={i} className={styles.para}><Rich text={p} /></p>)}
        {step.figure && <div className={styles.figureBox}><StaffDiagram figure={step.figure} /></div>}
        {step.tip && <p className={styles.tip}><strong>Tip</strong> {step.tip}</p>}
        <div className={styles.nav}>
          <Button variant="secondary" icon="chevron-left" onClick={() => dispatch({ type: 'back' })}>Back</Button>
          <Button iconAfter="arrow-right" onClick={() => dispatch({ type: 'next' })}>{s.step === lesson.steps.length - 1 ? 'Start practice' : 'Next'}</Button>
        </div>
      </div>
    );
  } else if ((s.phase === 'practice' || s.phase === 'challenge') && q) {
    const list = s.phase === 'practice' ? lesson.practice : lesson.challenge;
    const last = s.q === list.length - 1;
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">{s.phase === 'practice' ? 'Guided practice' : 'Challenge'} · question {s.q + 1} of {list.length}</p>
        <QuestionView
          key={`${s.phase}-${q.id}`}
          question={q}
          feedback={s.feedback}
          mode={s.phase}
          onAnswer={(v) => dispatch({ type: 'answer', value: v })}
          onRetry={() => dispatch({ type: 'retry' })}
          onContinue={() => dispatch({ type: 'next' })}
          continueLabel={last ? (s.phase === 'practice' ? 'On to the challenge' : 'See results') : 'Continue'}
        />
      </div>
    );
  } else if (s.phase === 'briefing') {
    body = (
      <div className={styles.screen}>
        <p className="eyebrow">Challenge</p>
        <h2 className={styles.stepTitle} tabIndex={-1} ref={headRef}>Ready for the challenge?</h2>
        <p className={styles.para}>{t.total} questions, one try each. After each answer you will see whether it was right and why.</p>
        <table className={styles.starTable}>
          <caption className="visually-hidden">How to earn stars</caption>
          <tbody>
            <tr><td><Stars earned={1} /></td><td>Pass: {t.pass} or more correct</td></tr>
            <tr><td><Stars earned={2} /></td><td>{t.two} or more correct</td></tr>
            <tr><td><Stars earned={3} /></td><td>All {t.three} correct</td></tr>
          </tbody>
        </table>
        <p className={styles.small}>If you don’t pass, you can retry straight away. Nothing is lost.</p>
        <Button size="lg" iconAfter="arrow-right" onClick={() => dispatch({ type: 'startChallenge' })} className={styles.wide}>Start the challenge</Button>
      </div>
    );
  } else if (s.phase === 'result' && result) {
    const missed = s.results.map((r, i) => ({ r, q: lesson.challenge[i] })).filter((x) => !x.r.correct);
    body = (
      <div className={`${styles.screen} ${styles.result}`} data-result={result.passed ? 'pass' : 'fail'}>
        <h2 className={styles.title} tabIndex={-1} ref={headRef}>
          {result.passed ? (result.stars === 3 ? 'Perfect!' : 'Level complete') : 'Not quite yet'}
        </h2>
        <div className={styles.bigStars} role="img" aria-label={`${result.stars} of 3 stars`}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={i < result.stars ? styles.bigStarOn : styles.bigStarOff} style={{ animationDelay: `${200 + i * 260}ms` }}>
              <Icon name="star" size={48} filled={i < result.stars} />
            </span>
          ))}
        </div>
        <p className={styles.scoreLine}><span className="num">{result.correct}</span> of {result.total} correct · <span className="num">{result.percent}%</span></p>

        {result.passed ? (
          <>
            {completion?.unlockedNext && nextN <= TOTAL_LEVELS && <p className={styles.unlocked}><Icon name="check" size={16} /> Level {nextN} is now unlocked.</p>}
            {completion?.replay && <p className={styles.small}>{completion.improved ? 'New best result saved.' : `Your best (${best?.stars ?? result.stars}★, ${best?.bestScore ?? result.percent}%) is kept.`}</p>}
            {outcome && <p className={styles.xpLine}>{outcome.xpGained > 0 ? `+${outcome.xpGained} XP` : 'No new XP — this result was already rewarded.'}</p>}
            {!completion && <p className={styles.small}>Saving…</p>}
            <div className={styles.resultActions}>
              {nextN <= TOTAL_LEVELS && <ButtonLink to={`/level/${nextN}`} size="lg" iconAfter="arrow-right">Continue to Level {nextN}</ButtonLink>}
              <ButtonLink to={`/roadmap#level-${level.n}`} variant="secondary" size="lg">Back to roadmap</ButtonLink>
              <Button variant="ghost" onClick={() => dispatch({ type: 'restart' })}>Practice again</Button>
            </div>
          </>
        ) : (
          <>
            <p className={styles.para}>You need {t.pass} correct to pass. Review what tripped you up, then try the challenge again — nothing has been lost.</p>
            {missed.length > 0 && (
              <ol className={styles.review} aria-label="Questions to review">
                {missed.map(({ q: mq }) => (
                  <li key={mq.id}><p className={styles.reviewQ}>{mq.prompt}</p><p>{mq.explanation}</p></li>
                ))}
              </ol>
            )}
            <div className={styles.resultActions}>
              <Button size="lg" onClick={() => dispatch({ type: 'retakeChallenge' })}>Try the challenge again</Button>
              <Button variant="secondary" size="lg" onClick={() => dispatch({ type: 'reviewLesson' })}>Review the lesson</Button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.player} style={{ ['--wc' as string]: level.world.colorVar }}>
      <div ref={topRef} className={styles.top}>
        <button type="button" className={styles.exit} onClick={() => navigate(`/roadmap#level-${level.n}`)} aria-label="Exit lesson">
          <Icon name="close" />
        </button>
        <h1 className={styles.heading} tabIndex={-1} data-page-title>Level {level.n}: {lesson.title}</h1>
      </div>
      <ol className={styles.segments} aria-label="Lesson progress">
        {SEGMENTS.map((g, i) => (
          <li key={g.label} className={i < segIndex ? styles.segDone : i === segIndex ? styles.segNow : ''} aria-current={i === segIndex ? 'step' : undefined}>
            <span className={styles.segBar}><span style={{ width: `${i < segIndex ? 100 : i === segIndex ? Math.round(within * 100) : 0}%` }} /></span>
            <span className={styles.segLabel}>{g.label}</span>
          </li>
        ))}
      </ol>

      {body}

      {blocker.state === 'blocked' && (
        <div className={styles.leaveBackdrop}>
          <div className={styles.leave} role="alertdialog" aria-modal="true" aria-labelledby="leave-t" aria-describedby="leave-d">
            <p id="leave-t" className={styles.leaveTitle}>Leave this lesson?</p>
            <p id="leave-d" className={styles.small}>You are partway through. Progress in this attempt won’t be saved; your earlier results are safe.</p>
            <div className={styles.leaveActions}>
              <Button variant="secondary" onClick={() => blocker.reset()} autoFocus>Keep going</Button>
              <Button variant="danger" onClick={() => blocker.proceed()}>Leave</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
