import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { ButtonLink, Notice, PageHeader } from '../components/ui';
import { getWorld, WORLDS } from '../data/curriculum';
import { useAppState } from '../state/AppState';
import { NotFound } from './NotFound';
import styles from './WorldDetail.module.css';

export function WorldDetail() {
  const { worldId } = useParams();
  const world = getWorld(Number(worldId));
  const { progress } = useAppState();
  if (!world) return <NotFound />;

  const current = progress.currentLevel;
  const prev = WORLDS.find((w) => w.id === world.id - 1);
  const next = WORLDS.find((w) => w.id === world.id + 1);

  return (
    <div style={{ ['--wc' as string]: world.colorVar }}>
      <Link to="/learn" className={styles.back}><Icon name="chevron-left" size={18} /> All worlds</Link>
      <PageHeader
        eyebrow={`World ${world.id} · Levels ${world.firstLevel}–${world.lastLevel}`}
        title={world.name}
        lede={world.summary}
      />

      <div className={styles.notice}>
        <Notice title="Lessons are being written level by level">
          <p>This is the full syllabus for the world. Interactive lessons open in order on the roadmap, starting with Levels 1–10.</p>
        </Notice>
      </div>

      <ol className={styles.units}>
        {world.units.map((u) => {
          const status = current > u.lastLevel ? 'done' : current >= u.firstLevel ? 'current' : 'locked';
          return (
            <li key={u.id} className={`${styles.unit} ${styles[status]}`}>
              <div className={styles.unitHead}>
                <span className={styles.unitNo}>Unit {u.id}</span>
                <span className={styles.unitLevels}>Levels {u.firstLevel}–{u.lastLevel}</span>
                <span className={styles.status}>
                  {status === 'current' && 'In progress'}
                  {status === 'done' && <><Icon name="check" size={14} /> Complete</>}
                  {status === 'locked' && <><Icon name="lock" size={14} /> Locked</>}
                </span>
              </div>
              <h2 className={styles.unitTitle}>{u.title}</h2>
              <p className={styles.outcome}>{u.outcome}</p>
              <ul className={styles.topics} aria-label={`Topics in ${u.title}`}>
                {u.topics.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>

      <nav className={styles.pager} aria-label="Other worlds">
        {prev ? <ButtonLink to={`/learn/world/${prev.id}`} variant="secondary" icon="chevron-left">World {prev.id}: {prev.name}</ButtonLink> : <span />}
        {next && <ButtonLink to={`/learn/world/${next.id}`} variant="secondary" iconAfter="arrow-right">World {next.id}: {next.name}</ButtonLink>}
      </nav>
    </div>
  );
}
