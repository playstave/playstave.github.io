import { useEffect, useRef, useState } from 'react';
import type { Answer, Question } from '../../lessons/types';
import { posName, cap } from '../../lessons/staff';
import type { Feedback } from '../../lib/lessonEngine';
import { StaffDiagram } from '../StaffDiagram';
import { Button } from '../ui';
import { Icon } from '../Icon';
import styles from './Lesson.module.css';

interface Props {
  question: Question;
  feedback: Feedback | null;
  mode: 'practice' | 'challenge';
  onAnswer: (v: Answer) => void;
  onRetry: () => void;
  onContinue: () => void;
  continueLabel: string;
}

/** Feedback for a wrong tap on a locate question, naming where the student tapped. */
function locateFeedback(answer: number, chosen: number, reveal: boolean): string {
  const diff = chosen - answer;
  const where = diff > 0 ? 'lower' : 'higher';
  const target = cap(posName(answer));
  if (chosen === 8 - answer) return `You tapped ${posName(chosen)} — that is where it would be counting from the top. Count from the bottom.`;
  if (Math.abs(diff) === 1) {
    return reveal
      ? `You tapped ${posName(chosen)}, right next to it. ${target} is the position just ${diff > 0 ? 'below' : 'above'}.`
      : `You tapped ${posName(chosen)}, right next to it — a ${chosen % 2 === 0 ? 'line' : 'space'}. Check whether you need a line or a space.`;
  }
  if (diff % 2 === 0) {
    const k = Math.abs(diff) / 2;
    const unit = answer % 2 === 0 ? 'line' : 'space';
    return `You tapped ${posName(chosen)}. ${target} is ${k === 1 ? `one ${unit}` : `${k} ${unit}s`} ${where}.`;
  }
  return `You tapped ${posName(chosen)}. ${target} is ${Math.abs(diff)} positions ${where}, counting lines and spaces.`;
}

export function QuestionView({ question: q, feedback, mode, onAnswer, onRetry, onContinue, continueLabel }: Props) {
  const [selected, setSelected] = useState<Answer | null>(null);
  const promptRef = useRef<HTMLHeadingElement>(null);
  const actionRef = useRef<HTMLButtonElement>(null);

  // New question (or a retry): clear selection and announce the prompt.
  useEffect(() => { setSelected(null); promptRef.current?.focus(); }, [q.id]);
  useEffect(() => { if (!feedback) setSelected(null); }, [feedback]);
  useEffect(() => { if (feedback) actionRef.current?.focus(); }, [feedback]);

  const answered = !!feedback;
  const check = () => { if (selected !== null && !answered) onAnswer(selected); };

  // Keyboard: 1–9 choose an option; Enter checks or continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof HTMLElement ? e.target : document.body;
      if (t.closest('input, textarea, select, dialog')) return;
      if (q.kind === 'choice' && !answered && /^[1-9]$/.test(e.key)) {
        const opt = q.options[Number(e.key) - 1];
        if (opt) { e.preventDefault(); setSelected(opt.id); }
      }
      if (e.key === 'Enter' && !answered && selected !== null && !(t instanceof HTMLButtonElement)) { e.preventDefault(); check(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const wrongText = feedback && !feedback.correct
    ? q.kind === 'choice'
      ? q.options.find((o) => o.id === feedback.chosen)?.feedback
      : locateFeedback(q.answer, feedback.chosen as number, mode === 'challenge')
    : null;

  return (
    <div className={styles.question}>
      <h2 ref={promptRef} tabIndex={-1} className={styles.prompt}>{q.prompt}</h2>

      {q.kind === 'choice' && q.figure && (
        <div className={styles.figureBox}><StaffDiagram figure={q.figure} /></div>
      )}

      {q.kind === 'locate' && (
        <div className={styles.figureBox}>
          <StaffDiagram
            figure={{ alt: 'An empty staff. Choose a line or space.', numbers: q.numbers }}
            half={14}
            interactive={{
              picked: (selected as number | null),
              onPick: (p) => !answered && setSelected(p),
              // Practice hides the right answer after a wrong try so the retry is real.
              reveal: feedback ? { chosen: feedback.chosen as number, answer: feedback.correct || mode === 'challenge' ? q.answer : undefined } : null,
              disabled: answered,
            }}
          />
          {!answered && <p className={styles.hint}>{selected === null ? 'Tap a line or space, then check.' : `Selected: ${posName(selected as number)}.`}</p>}
        </div>
      )}

      {q.kind === 'choice' && (
        <div className={styles.options} role="radiogroup" aria-label="Answers">
          {q.options.map((o, i) => {
            const isSel = selected === o.id || feedback?.chosen === o.id;
            const state = answered
              ? o.id === q.answer && (feedback!.correct || mode === 'challenge') ? styles.optRight
                : feedback!.chosen === o.id ? styles.optWrong : styles.optDim
              : isSel ? styles.optSel : '';
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={isSel}
                disabled={answered}
                className={`${styles.option} ${state}`}
                onClick={() => setSelected(o.id)}
              >
                <span className={styles.optKey} aria-hidden="true">{i + 1}</span>
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.feedbackArea} aria-live="polite">
        {!answered && (
          <Button onClick={check} disabled={selected === null} size="lg" className={styles.wide}>Check</Button>
        )}
        {feedback && (
          <div className={feedback.correct ? styles.fbRight : styles.fbWrong}>
            <p className={styles.fbTitle}>
              <Icon name={feedback.correct ? 'check' : 'close'} size={18} />
              {feedback.correct ? 'Correct' : mode === 'practice' ? 'Not quite — try again' : 'Not quite'}
            </p>
            {wrongText && <p>{wrongText}</p>}
            {(feedback.correct || mode === 'challenge') && <p className={styles.explain}>{q.explanation}</p>}
            {!feedback.correct && mode === 'practice'
              ? <Button ref={actionRef} onClick={onRetry} variant="secondary" size="lg" className={styles.wide}>Try again</Button>
              : <Button ref={actionRef} onClick={onContinue} size="lg" iconAfter="arrow-right" className={styles.wide}>{continueLabel}</Button>}
          </div>
        )}
      </div>
    </div>
  );
}
