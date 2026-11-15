import { Link } from 'react-router-dom';
import { ButtonLink, EmptyState, Panel, ProgressBar, SectionTitle, Stat } from '../components/ui';
import { Notation } from '../components/Notation';
import { WeekStrip } from '../components/WeekStrip';
import { useAppState } from '../state/AppState';
import { greeting } from '../lib/dates';
import { STARS_PER_LEVEL, TOTAL_LEVELS, unitForLevel, worldForLevel } from '../data/curriculum';
import styles from './Home.module.css';

const STAFF_DEMO = [
  { key: 'e/4', duration: 'w' }, { key: 'g/4', duration: 'w' }, { key: 'b/4', duration: 'w' },
  { key: 'd/5', duration: 'w' }, { key: 'f/5', duration: 'w' },
];

export function Home() {
  const { progress, derived } = useAppState();
  const level = Math.min(progress.currentLevel, TOTAL_LEVELS);
  const world = worldForLevel(level);
  const unit = unitForLevel(level);
  const name = progress.displayName || 'musician';
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const isNew = derived.levelsCompleted === 0;

  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <p className="eyebrow">{today}</p>
        <h1 tabIndex={-1} data-page-title>{greeting()}, {name}.</h1>
      </header>

      {/* Up next */}
      <section className={styles.hero} aria-labelledby="up-next">
        <div className={styles.heroText}>
          <p className={styles.heroMeta}>
            <span className={styles.worldDot} style={{ background: world.colorVar }} aria-hidden="true" />
            World {world.id} · {world.name}
          </p>
          <h2 id="up-next" className={styles.heroTitle}>
            <span className={styles.heroLevel}>Level <span className="num">{level}</span></span>
            {unit.title}
          </h2>
          <p className={styles.heroOutcome}>{unit.outcome}</p>
          <div className={styles.heroActions}>
            <ButtonLink to={`/learn/world/${world.id}`} size="lg" iconAfter="arrow-right">
              {isNew ? 'Start learning' : 'Continue learning'}
            </ButtonLink>
            <ButtonLink to="/roadmap" variant="secondary" size="lg">View roadmap</ButtonLink>
          </div>
        </div>
        <div className={styles.heroArt}>
          <Notation
            clef="treble"
            notes={STAFF_DEMO}
            width={340}
            height={120}
            label="A treble staff with whole notes on each of the five lines: E, G, B, D, F."
          />
          <p className={styles.heroCaption}>The five lines of the treble staff, bottom to top: E G B D F.</p>
        </div>
      </section>

      {/* Journey overview */}
      <section aria-labelledby="journey" className={styles.journey}>
        <h2 id="journey" className="visually-hidden">Your journey</h2>
        <dl className={styles.stats}>
          <Stat label="Level" value={<>{level}<span className={styles.of}>/{TOTAL_LEVELS}</span></>} sub={`${derived.levelsCompleted} completed`} />
          <Stat label="Experience" value={progress.xp} sub="XP earned" />
          <Stat label="Stars" value={<>{derived.totalStars}<span className={styles.of}>/{TOTAL_LEVELS * STARS_PER_LEVEL}</span></>} sub="Up to 3 per level" />
          <Stat label="Streak" value={derived.streak} sub={derived.streak === 1 ? 'day' : 'days'} />
        </dl>
        <ProgressBar value={derived.levelsCompleted} max={TOTAL_LEVELS} label="Levels completed out of 500" />
      </section>

      <div className={styles.split}>
        {/* Daily practice */}
        <Panel aria-labelledby="daily">
          <SectionTitle id="daily" action={<Link className={styles.textLink} to="/practice">All practice</Link>}>Today’s practice</SectionTitle>
          <div className={styles.daily}>
            <div>
              <p className={styles.dailyTask}>Name five notes on the treble staff</p>
              <p className="muted">About two minutes. Finishing a set counts toward your streak.</p>
            </div>
            <span className={derived.practicedToday ? styles.badgeDone : styles.badgeTodo}>
              {derived.practicedToday ? 'Done today' : 'Not started'}
            </span>
          </div>
          <WeekStrip days={progress.practiceDays} />
          <div className={styles.panelAction}>
            <ButtonLink to="/practice" variant={derived.practicedToday ? 'secondary' : 'primary'}>
              {derived.practicedToday ? 'Practise again' : 'Start practice'}
            </ButtonLink>
          </div>
        </Panel>

        {/* Achievements */}
        <Panel aria-labelledby="recent-badges">
          <SectionTitle id="recent-badges" action={<Link className={styles.textLink} to="/achievements">All badges</Link>}>Recent achievements</SectionTitle>
          <EmptyState title="No badges yet">
            Your first badge, <em>First Lesson</em>, is awarded when you complete Level 1.
          </EmptyState>
        </Panel>
      </div>

      {/* Library */}
      <section aria-labelledby="from-library" className={styles.library}>
        <SectionTitle id="from-library" action={<Link className={styles.textLink} to="/library">Open the library</Link>}>From the library</SectionTitle>
        <Panel tone="sunk" className={styles.libraryPanel}>
          <div>
            <p className={styles.libraryLead}>Recommendations will match your level.</p>
            <p className="muted">The sheet music library is being catalogued with public-domain and openly licensed scores only. Recommendations appear here once it opens.</p>
          </div>
          <ButtonLink to="/library" variant="secondary" iconAfter="arrow-right">Visit the library</ButtonLink>
        </Panel>
      </section>
    </div>
  );
}
