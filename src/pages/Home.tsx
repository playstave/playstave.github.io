import { Link } from 'react-router-dom';
import { ButtonLink, EmptyState, Panel, ProgressBar, SectionTitle, Stat } from '../components/ui';
import { Notation } from '../components/Notation';
import { WeekStrip } from '../components/WeekStrip';
import { useAppState } from '../state/AppState';
import { dayKey } from '../lib/dates';
import { XP } from '../lib/xp';
import { ACHIEVEMENTS } from '../data/achievements';
import { Badge } from '../components/Badge';
import { ScoreCard } from '../components/library/ScoreCard';
import { SCORES } from '../data/scores';
import type { Difficulty } from '../music/score';
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
  const dailyDone = !!progress.awarded[`daily:${dayKey()}`];
  // Recommend scores at the student's level, unopened ones first.
  const levelsFor: Record<number, Difficulty[]> = { 1: ['Beginner', 'Easy'], 2: ['Easy', 'Intermediate'], 3: ['Intermediate'], 4: ['Intermediate', 'Advanced'], 5: ['Advanced', 'Expert'], 6: ['Expert', 'Advanced'] };
  const wanted = levelsFor[world.id];
  const recommended = SCORES.filter((sc) => wanted.includes(sc.difficulty))
    .sort((a, b) => Number(progress.openedScores.includes(a.id)) - Number(progress.openedScores.includes(b.id)) || wanted.indexOf(a.difficulty) - wanted.indexOf(b.difficulty) || a.title.localeCompare(b.title))
    .slice(0, 3);
  const recent = ACHIEVEMENTS.filter((a) => progress.achievements[a.id])
    .map((a) => ({ a, at: progress.achievements[a.id] }))
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 3);

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
            <ButtonLink to={`/level/${level}`} size="lg" iconAfter="arrow-right">
              {isNew ? 'Start learning' : 'Continue learning'}
            </ButtonLink>
            <ButtonLink to={`/roadmap#level-${level}`} variant="secondary" size="lg">View roadmap</ButtonLink>
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
          <p className={styles.heroCaption}>The five lines of the treble staff, bottom to top: <span className={styles.nowrap}>E G B D F</span>.</p>
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
              <p className={styles.dailyTask}>{derived.levelsCompleted ? 'Daily challenge: 5 review questions' : `Complete Level ${level}`}</p>
              <p className="muted">
                {derived.levelsCompleted
                  ? `Drawn from levels you have finished · +${XP.dailyChallenge} XP once a day.`
                  : 'Your daily review unlocks after your first lesson. Any finished lesson counts toward your streak.'}
              </p>
            </div>
            <span className={dailyDone ? styles.badgeDone : styles.badgeTodo}>{dailyDone ? 'Done today' : 'Not started'}</span>
          </div>
          <WeekStrip days={progress.practiceDays} />
          <p className={styles.streakLine}>
            {derived.practicedToday ? `Today counts — ${derived.streak}-day streak.`
              : derived.restDayUsed ? 'Yesterday was a rest day. Practise today to keep your streak.'
              : derived.streak > 0 ? `${derived.streak}-day streak. Practise today to add to it.`
              : derived.bestStreak > 0 ? `Start a new streak today — your best is ${derived.bestStreak} days.`
              : 'Practise on any day to start a streak. One rest day in between never breaks it.'}
          </p>
          <div className={styles.panelAction}>
            {derived.levelsCompleted
              ? <ButtonLink to="/practice/daily" variant={dailyDone ? 'secondary' : 'primary'}>{dailyDone ? 'Practise again' : 'Start daily challenge'}</ButtonLink>
              : <ButtonLink to={`/level/${level}`}>Start Level {level}</ButtonLink>}
          </div>
        </Panel>

        {/* Achievements */}
        <Panel aria-labelledby="recent-badges">
          <SectionTitle id="recent-badges" action={<Link className={styles.textLink} to="/achievements">All badges</Link>}>Recent achievements</SectionTitle>
          {recent.length ? (
            <ul className={styles.recent}>
              {recent.map(({ a, at }) => (
                <li key={a.id}><Badge a={a} unlocked /><div><p className={styles.recentTitle}>{a.title}</p><p className="muted">{new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {a.criteria}</p></div></li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No badges yet">
              Your first badge, <em>First Lesson</em>, is awarded when you complete Level 1.
            </EmptyState>
          )}
        </Panel>
      </div>

      {/* Library */}
      <section aria-labelledby="from-library" className={styles.library}>
        <SectionTitle id="from-library" action={<Link className={styles.textLink} to="/library">Open the library</Link>}>From the library</SectionTitle>
        <div className={styles.recoGrid}>
          {recommended.map((sc) => <ScoreCard key={sc.id} score={sc} />)}
        </div>
      </section>
    </div>
  );
}
