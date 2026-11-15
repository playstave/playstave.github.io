import { EmptyState, PageHeader, Panel, ProgressBar, SectionTitle, Stat } from '../components/ui';
import { STARS_PER_LEVEL, TOTAL_LEVELS, WORLDS, worldForLevel } from '../data/curriculum';
import { useAppState } from '../state/AppState';
import styles from './Progress.module.css';

export function Progress() {
  const { progress, derived } = useAppState();
  const current = progress.currentLevel;
  const world = worldForLevel(Math.min(current, TOTAL_LEVELS));
  const { answered, correct } = progress.noteDrill;

  return (
    <>
      <PageHeader eyebrow="Your progress" title="Progress" lede={`World ${world.id}: ${world.name}`} />

      <dl className={styles.stats}>
        <Stat label="Levels completed" value={derived.levelsCompleted} sub={`of ${TOTAL_LEVELS}`} />
        <Stat label="Total stars" value={derived.totalStars} sub={`of ${TOTAL_LEVELS * STARS_PER_LEVEL}`} />
        <Stat label="Total XP" value={progress.xp} />
        <Stat label="Streak" value={derived.streak} sub={`${progress.practiceDays.length} practice day${progress.practiceDays.length === 1 ? '' : 's'} in total`} />
        <Stat label="Notes read" value={answered} sub={answered ? `${Math.round((correct / answered) * 100)}% correct` : 'In practice drills'} />
      </dl>

      <section aria-labelledby="by-world" className={styles.section}>
        <SectionTitle id="by-world">By world</SectionTitle>
        <ul className={styles.worlds}>
          {WORLDS.map((w) => {
            const span = w.lastLevel - w.firstLevel + 1;
            const done = Math.max(0, Math.min(span, current - w.firstLevel));
            return (
              <li key={w.id}>
                <span className={styles.wName}><span className={styles.dot} style={{ background: w.colorVar }} aria-hidden="true" />{w.id}. {w.name}</span>
                <ProgressBar value={done} max={span} label={`${w.name}: ${done} of ${span}`} color={w.colorVar} />
                <span className="num muted">{done}/{span}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.split}>
        <Panel aria-labelledby="strong">
          <SectionTitle id="strong">Strongest topics</SectionTitle>
          <EmptyState title="Nothing measured yet">Complete a few levels and your best topics will show here, based on your accuracy in each.</EmptyState>
        </Panel>
        <Panel aria-labelledby="review">
          <SectionTitle id="review">Worth reviewing</SectionTitle>
          <EmptyState title="Nothing to review">Topics where you make the most mistakes will appear here, with a link to replay the lesson.</EmptyState>
        </Panel>
      </div>
    </>
  );
}
