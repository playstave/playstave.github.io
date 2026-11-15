import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PageHeader, ProgressBar } from '../components/ui';
import { WORLDS } from '../data/curriculum';
import { useAppState } from '../state/AppState';
import styles from './Learn.module.css';

export function Learn() {
  const { progress } = useAppState();
  const current = progress.currentLevel;

  return (
    <>
      <PageHeader
        eyebrow="Curriculum"
        title="Learn"
        lede="Six worlds, fifty units, five hundred levels. Each level teaches one new idea, and each unit ends with a checkpoint."
      />
      <ol className={styles.worlds}>
        {WORLDS.map((w) => {
          const span = w.lastLevel - w.firstLevel + 1;
          const done = Math.max(0, Math.min(span, current - w.firstLevel));
          const unlocked = current >= w.firstLevel;
          const isCurrent = unlocked && current <= w.lastLevel;
          return (
            <li key={w.id} className={styles.world} style={{ ['--wc' as string]: w.colorVar }}>
              <Link to={`/learn/world/${w.id}`} className={styles.worldLink}>
                <span className={styles.worldNum} aria-hidden="true">{w.id}</span>
                <span className={styles.worldBody}>
                  <span className={styles.worldTop}>
                    <span className="eyebrow">World {w.id} · Levels {w.firstLevel}–{w.lastLevel}</span>
                    {isCurrent && <span className={styles.current}>You are here</span>}
                    {!unlocked && <span className={styles.locked}><Icon name="lock" size={14} /> Opens at Level {w.firstLevel}</span>}
                  </span>
                  <span className={styles.worldName}>{w.name}</span>
                  <span className={styles.worldSummary}>{w.summary}</span>
                  <span className={styles.worldFoot}>
                    <span className={styles.bar}><ProgressBar value={done} max={span} label={`${w.name}: ${done} of ${span} levels completed`} color={w.colorVar} /></span>
                    <span className="num muted">{done}/{span}</span>
                    <span className={styles.units}>{w.units.length} units</span>
                  </span>
                </span>
                <Icon name="arrow-right" className={styles.chev} />
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
