import { NoteDrill } from '../components/NoteDrill';
import { MonthCalendar } from '../components/MonthCalendar';
import { PageHeader, Panel, SectionTitle } from '../components/ui';
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
        lede="Short, focused drills. Finish one set a day to build your streak. Missing a day never resets your progress, only the streak count."
      />
      <div className={styles.layout}>
        <Panel aria-labelledby="drill-title" className={styles.drillPanel}>
          <SectionTitle id="drill-title">Note identification</SectionTitle>
          <NoteDrill />
        </Panel>

        <aside className={styles.side} aria-label="Practice history">
          <Panel>
            <div className={styles.streakRow}>
              <Icon name="flame" size={28} className={derived.streak > 0 ? styles.flameOn : styles.flameOff} />
              <div>
                <p className={styles.streakNum}><span className="num">{derived.streak}</span>-day streak</p>
                <p className="muted">{derived.practicedToday ? 'Today is done.' : derived.streak > 0 ? 'Finish a set today to keep it going.' : 'Finish a set to start one.'}</p>
              </div>
            </div>
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
