import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Notation } from './Notation';
import { Button } from './ui';
import { Icon } from './Icon';
import { LETTERS, TREBLE_RANGE, type StaffNote } from '../data/trebleNotes';
import { useAppState } from '../state/AppState';
import styles from './NoteDrill.module.css';

const SET_SIZE = 5;

function pickNote(prev?: StaffNote): StaffNote {
  let n: StaffNote;
  do { n = TREBLE_RANGE[Math.floor(Math.random() * TREBLE_RANGE.length)]; } while (prev && n.key === prev.key);
  return n;
}

type Answer = { note: StaffNote; chosen: string; correct: boolean };

/**
 * Note identification: a treble-clef note is shown, the student names it.
 * Every answer gets an explanation of where the note sits on the staff.
 * Finishing a set of five marks today as a practice day.
 */
export function NoteDrill() {
  const { recordNoteAnswer, markPracticedToday } = useAppState();
  const [note, setNote] = useState<StaffNote>(() => pickNote());
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [pending, setPending] = useState<Answer | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const finished = answers.length === SET_SIZE;

  const notes = useMemo(() => [{ key: note.key, duration: 'w' }], [note]);

  const choose = useCallback((letter: string) => {
    if (pending || finished) return;
    const a = { note, chosen: letter, correct: letter === note.letter };
    setPending(a);
    recordNoteAnswer(a.correct);
  }, [pending, finished, note, recordNoteAnswer]);

  const next = useCallback(() => {
    if (!pending) return;
    const all = [...answers, pending];
    setAnswers(all);
    setPending(null);
    if (all.length === SET_SIZE) markPracticedToday();
    else setNote((n) => pickNote(n));
  }, [answers, pending, markPracticedToday]);

  const restart = () => { setAnswers([]); setPending(null); setNote((n) => pickNote(n)); };

  // Move focus to "Next" after answering, so keyboard users can continue with Enter.
  useEffect(() => { if (pending) nextRef.current?.focus(); }, [pending]);

  // Letter keys answer; Enter advances.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target instanceof HTMLElement ? e.target : document.body;
      if (t.closest('input, textarea, select, [contenteditable]')) return;
      const k = e.key.toUpperCase();
      if ((LETTERS as readonly string[]).includes(k)) { e.preventDefault(); choose(k); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choose]);

  if (finished) {
    const score = answers.filter((a) => a.correct).length;
    return (
      <div className={styles.summary}>
        <p className="eyebrow">Set complete</p>
        <p className={styles.score}><span className="num">{score}</span><span className={styles.outOf}>/{SET_SIZE}</span></p>
        <p className="muted">{score === SET_SIZE ? 'Every note correct.' : score >= 3 ? 'Good reading. Review the ones you missed below.' : 'Keep at it — landmark notes (Middle C, treble G) make the rest easier.'} Today now counts toward your streak.</p>
        <ol className={styles.review}>
          {answers.map((a, i) => (
            <li key={i} className={a.correct ? styles.ok : styles.miss}>
              <Icon name={a.correct ? 'check' : 'close'} size={16} />
              <span><strong>{a.note.letter}</strong> {a.note.where}{!a.correct && <> — you answered {a.chosen}</>}</span>
            </li>
          ))}
        </ol>
        <Button onClick={restart}>Practise another set</Button>
      </div>
    );
  }

  return (
    <div className={styles.drill}>
      <div className={styles.progressRow}>
        <span className="eyebrow">Note {answers.length + 1} of {SET_SIZE}</span>
        <ol className={styles.pips} aria-hidden="true">
          {Array.from({ length: SET_SIZE }, (_, i) => {
            const a = answers[i];
            return <li key={i} className={a ? (a.correct ? styles.pipOk : styles.pipMiss) : i === answers.length ? styles.pipNow : ''} />;
          })}
        </ol>
      </div>

      <div className={styles.stage}>
        <Notation clef="treble" notes={notes} width={180} height={130} scale={1.8} label={`A whole note on the treble staff. ${pending ? `It is ${note.letter}.` : 'Which note is it?'}`} />
      </div>

      <p className={styles.prompt} id="drill-prompt">Which note is this?</p>
      <div className={styles.letters} role="group" aria-labelledby="drill-prompt">
        {LETTERS.map((l) => {
          const state = pending ? (l === note.letter ? styles.right : l === pending.chosen ? styles.wrong : styles.dim) : '';
          return (
            <button key={l} type="button" className={`${styles.letter} ${state}`} onClick={() => choose(l)} disabled={!!pending} aria-keyshortcuts={l}>
              {l}
            </button>
          );
        })}
      </div>

      <div className={styles.feedback} aria-live="polite">
        {pending && (
          <div className={pending.correct ? styles.fbOk : styles.fbMiss}>
            <p className={styles.fbTitle}>{pending.correct ? `Correct — ${note.letter}.` : `Not quite. This is ${note.letter}.`}</p>
            <p>It sits {note.where}.{!pending.correct && ` ${pending.chosen} would be ${describeOffset(pending.chosen, note.letter)}.`}</p>
            <Button ref={nextRef} onClick={next} iconAfter="arrow-right" className={styles.nextBtn}>
              {answers.length + 1 === SET_SIZE ? 'See results' : 'Next note'}
            </Button>
          </div>
        )}
        {!pending && <p className={styles.hint}>Tip: press a letter key (A–G) to answer.</p>}
      </div>
    </div>
  );
}

/** Describe the nearest position of a wrong letter relative to the right one. */
function describeOffset(chosen: string, correct: string): string {
  const order = 'CDEFGAB';
  let d = order.indexOf(chosen) - order.indexOf(correct);
  if (d > 3) d -= 7;
  if (d < -3) d += 7;
  const steps = Math.abs(d);
  return `${steps} step${steps === 1 ? '' : 's'} ${d > 0 ? 'higher' : 'lower'} on the staff`;
}
