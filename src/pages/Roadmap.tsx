import { Link } from 'react-router-dom';
import { Notice, PageHeader } from '../components/ui';
import { TOTAL_LEVELS, WORLDS } from '../data/curriculum';
import { useAppState } from '../state/AppState';
import styles from './Roadmap.module.css';

export function Roadmap() {
  const { progress } = useAppState();
  const current = progress.currentLevel;
  const pct = ((current - 1) / TOTAL_LEVELS) * 100;

  return (
    <>
      <PageHeader
        eyebrow="500 levels"
        title="Roadmap"
        lede={<>You are on <strong>Level {current}</strong>. Levels open one at a time, and completed levels can be replayed whenever you like.</>}
      />

      <section aria-labelledby="span" className={styles.timeline}>
        <h2 id="span" className="visually-hidden">The six worlds across 500 levels</h2>
        <div className={styles.track}>
          {WORLDS.map((w) => (
            <Link
              key={w.id}
              to={`/learn/world/${w.id}`}
              className={styles.segment}
              style={{ flexGrow: w.lastLevel - w.firstLevel + 1, ['--wc' as string]: w.colorVar }}
              aria-label={`World ${w.id}, ${w.name}, levels ${w.firstLevel} to ${w.lastLevel}`}
            >
              <span className={styles.segNum}>{w.id}</span>
            </Link>
          ))}
          <span className={styles.marker} style={{ left: `${pct}%` }} aria-hidden="true"><span>Lv {current}</span></span>
        </div>
        <div className={styles.scale} aria-hidden="true">
          {[1, 100, 200, 300, 400, 450, 500].map((n) => <span key={n} style={{ left: `${((n === 1 ? 0 : n) / TOTAL_LEVELS) * 100}%` }}>{n}</span>)}
        </div>
      </section>

      <div className={styles.notice}>
        <Notice title="The full winding path is under construction">
          <p>The interactive path with all 500 level nodes, checkpoints every 10 levels and milestone celebrations every 50 is being built next. Until then, browse each world’s syllabus below.</p>
        </Notice>
      </div>

      <ol className={styles.legend}>
        {WORLDS.map((w) => (
          <li key={w.id} style={{ ['--wc' as string]: w.colorVar }}>
            <Link to={`/learn/world/${w.id}`} className={styles.legendLink}>
              <span className={styles.swatch} aria-hidden="true" />
              <span className={styles.legendName}>{w.name}</span>
              <span className="num muted">{w.firstLevel}–{w.lastLevel}</span>
              <span className={styles.milestones}>
                Checkpoints at {Array.from({ length: (w.lastLevel - w.firstLevel + 1) / 10 }, (_, i) => w.firstLevel + i * 10 + 9).filter((n) => n % 50 !== 0).slice(0, 3).join(', ')}…
                {' '}· Milestone{[50, 100, 150, 200, 250, 300, 350, 400, 450, 500].filter((n) => n >= w.firstLevel && n <= w.lastLevel).length > 1 ? 's' : ''} at {[50, 100, 150, 200, 250, 300, 350, 400, 450, 500].filter((n) => n >= w.firstLevel && n <= w.lastLevel).join(' and ')}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
