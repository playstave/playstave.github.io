import { NoteDrill } from '../components/NoteDrill';
import { MonthCalendar } from '../components/MonthCalendar';
import { ButtonLink, PageHeader, Panel, SectionTitle } from '../components/ui';
import { dayKey } from '../lib/dates';
import { XP } from '../lib/xp';
import { Icon } from '../components/Icon';
import { useAppState } from '../state/AppState';
import styles from './Practice.module.css';

const UPCOMING = [
  { title: 'Rhythm recognition', desc: 'Read a measure and identify its note values.' },
  { title: 'Clef recognition', desc: 'Tell treble, bass, alto and tenor clefs apart.' },
  { title: 'Key signatures', desc: 'Name the major or minor key from its signature.' },
  { title: 'Sight-reading', desc: 'Read a short passage and identify notes and patterns.' },
];

export function Practice() {
  const { progress, derived } = useAppState();
  const { answered, correct } = progress.noteDrill;
  const accuracy = answered ? Math.round((correct / answered) * 100) : null;

  return (
    <>
      <PageHeader
        eyebrow="Daily practice"
        title="Practice"
        lede="Short, focused practice. Any finished lesson, daily challenge or practice set counts as a practice day."
      />
      <Panel className={styles.daily} aria-labelledby="daily-h">
        <div>
          <p className="eyebrow">Today</p>
          <h2 id="daily-h" className={styles.dailyTitle}>Daily challenge</h2>
          <p className="muted">
            {progress.awarded[`daily:${dayKey()}`]
              ? `Done today${progress.lastDaily?.day === dayKey() ? ` — ${progress.lastDaily.correct} of ${progress.lastDaily.total} correct` : ''}. A new set arrives tomorrow.`
              : derived.levelsCompleted === 0
                ? 'Starts after you complete Level 1: five review questions from levels you have finished.'
                : `Five review questions from levels you have finished · +${XP.dailyChallenge} XP once a day.`}
          </p>
        </div>
        <ButtonLink to="/practice/daily" variant={progress.awarded[`daily:${dayKey()}`] ? 'secondary' : 'primary'} iconAfter="arrow-right">
          {progress.awarded[`daily:${dayKey()}`] ? 'Practise again' : 'Open'}
        </ButtonLink>
      </Panel>
      <div className={styles.layout}>
        <Panel aria-labelledby="drill-title" className={styles.drillPanel}>
          <SectionTitle id="drill-title">Note identification</SectionTitle>
          <p className={styles.drillNote}>Treble clef note names (taught in Unit 4 — a preview for now). First finished set each day: +{XP.practiceSet} XP.</p>
          <NoteDrill />
        </Panel>

        <aside className={styles.side} aria-label="Practice history">
          <Panel>
            <div className={styles.streakRow}>
              <Icon name="flame" size={28} className={derived.streak > 0 ? styles.flameOn : styles.flameOff} />
              <div>
                <p className={styles.streakNum}><span className="num">{derived.streak}</span>-day streak</p>
                <p className="muted">
                  {derived.practicedToday ? 'Today counts. Nice work.'
                    : derived.restDayUsed ? 'Yesterday was a rest day — practise today to keep your streak.'
                    : derived.streak > 0 ? 'Practise today to add to it.'
                    : derived.bestStreak > 0 ? `Start a new streak today. Your best is ${derived.bestStreak} days.`
                    : 'Finish any lesson or practice to start one.'}
                </p>
              </div>
            </div>
            <p className={styles.streakRule}>Best: <strong className="num">{derived.bestStreak}</strong> days. One rest day between practice days never breaks a streak.</p>
            <MonthCalendar days={progress.practiceDays} />
            <p className={styles.accuracy}>
              Note reading accuracy: {accuracy === null ? <span className="muted">no answers yet</span> : <strong className="num">{accuracy}% <span className="muted">({correct}/{answered})</span></strong>}
            </p>
          </Panel>
        </aside>
      </div>

      <section aria-labelledby="more-drills" className={styles.more}>
        <SectionTitle id="more-drills">More drills</SectionTitle>
        <p className="muted" style={{ marginBottom: 'var(--space-4)' }}>These open as their lessons are added to the curriculum.</p>
        <ul className={styles.upcoming}>
          {UPCOMING.map((u) => (
            <li key={u.title}>
              <Icon name="lock" size={16} />
              <div><p className={styles.upTitle}>{u.title}</p><p className="muted">{u.desc}</p></div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
