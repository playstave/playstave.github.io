import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { QuestionView } from '../components/lesson/QuestionView';
import { Button, ButtonLink, EmptyState, PageHeader, Panel } from '../components/ui';
import { Icon } from '../components/Icon';
import { dailyQuestions, DAILY_SIZE } from '../lib/daily';
import { dayKey } from '../lib/dates';
import { XP } from '../lib/xp';
import type { Outcome } from '../lib/rewards';
import { getLesson } from '../lessons';
import type { Answer } from '../lessons/types';
import { useAppState } from '../state/AppState';
import styles from './DailyChallenge.module.css';

export function DailyChallenge() {
  const { progress, completeDaily } = useAppState();
  const today = dayKey();
  const questions = useMemo(() => dailyQuestions(today, progress.completedLevels), [today, progress.completedLevels]);
  const doneToday = !!progress.awarded[`daily:${today}`];
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [fb, setFb] = useState<{ correct: boolean; chosen: Answer } | null>(null);
  const [results, setResults] = useState<{ level: number; correct: boolean }[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const header = (
    <PageHeader eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })} title="Daily challenge"
      lede={`${DAILY_SIZE} questions drawn from levels you have completed, favouring the ones you found hardest. A new set every day.`} />
  );

  if (!questions.length) {
    return (
      <>
        {header}
        <Panel><EmptyState title="Your daily review starts after Level 1" action={<ButtonLink to={`/level/${Math.min(progress.currentLevel, 500)}`} iconAfter="arrow-right">Go to Level {Math.min(progress.currentLevel, 500)}</ButtonLink>}>
          The daily challenge reviews lessons you have already finished. Complete your first lesson and come back.
        </EmptyState></Panel>
      </>
    );
  }

  const finished = results.length === questions.length;

  if (!started) {
    return (
      <>
        {header}
        <Panel className={styles.start}>
          {doneToday && progress.lastDaily?.day === today ? (
            <p className={styles.done}><Icon name="check" size={18} /> Done today: {progress.lastDaily.correct} of {progress.lastDaily.total} correct. You can practise it again — XP is awarded once a day.</p>
          ) : (
            <p className={styles.reward}>Finish all {questions.length} questions to earn <strong>{XP.dailyChallenge} XP</strong> and count today toward your streak. Every finish counts, whatever your score.</p>
          )}
          <p className="muted">Reviewing: {[...new Set(questions.map((q) => q.level))].sort((a, b) => a - b).map((n) => `Level ${n}`).join(', ')}.</p>
          <Button size="lg" iconAfter="arrow-right" onClick={() => setStarted(true)}>{doneToday ? 'Practise again' : 'Start today’s challenge'}</Button>
        </Panel>
      </>
    );
  }

  if (finished) {
    const correct = results.filter((r) => r.correct).length;
    const weak = [...new Set(results.filter((r) => !r.correct).map((r) => r.level))];
    return (
      <>
        {header}
        <Panel className={styles.summary} data-daily-result>
          <p className={styles.score}><span className="num">{correct}</span>/{results.length}</p>
          <p>{correct === results.length ? 'A perfect review.' : 'Review finished — that is what matters.'} {outcome && outcome.xpGained > 0 ? `+${outcome.xpGained} XP.` : 'Today’s XP was already earned.'}</p>
          {weak.length > 0 && (
            <div className={styles.weak}>
              <p className={styles.weakTitle}>Worth another look:</p>
              <ul>{weak.map((n) => <li key={n}><Link to={`/level/${n}`}>Level {n}: {getLesson(n)?.title}</Link></li>)}</ul>
            </div>
          )}
          <div className={styles.actions}>
            <ButtonLink to="/practice" variant="secondary">Back to practice</ButtonLink>
            <ButtonLink to={`/level/${Math.min(progress.currentLevel, 500)}`}>Continue learning</ButtonLink>
          </div>
        </Panel>
      </>
    );
  }

  const cur = questions[i];
  return (
    <>
      {header}
      <div className={styles.runner}>
        <div className={styles.meta}>
          <span className="eyebrow">Question {i + 1} of {questions.length} · from Level {cur.level}</span>
          <ol className={styles.pips} aria-hidden="true">
            {questions.map((_, k) => <li key={k} className={k < results.length ? (results[k].correct ? styles.ok : styles.miss) : k === i ? styles.now : ''} />)}
          </ol>
        </div>
        <QuestionView
          key={cur.question.id}
          question={cur.question}
          feedback={fb}
          mode="challenge"
          onAnswer={(v) => { if (fb) return; const correct = cur.question.answer === v; setFb({ correct, chosen: v }); }}
          onRetry={() => {}}
          onContinue={() => {
            const next = [...results, { level: cur.level, correct: !!fb?.correct }];
            setResults(next);
            setFb(null);
            if (next.length === questions.length) setOutcome(completeDaily(next.filter((r) => r.correct).length, next.length));
            else setI(i + 1);
          }}
          continueLabel={i === questions.length - 1 ? 'Finish' : 'Next question'}
        />
      </div>
    </>
  );
}
