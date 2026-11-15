import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { PageHeader, ProgressBar } from '../components/ui';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import { measure } from '../lib/achievements';
import { useAppState } from '../state/AppState';
import styles from './Achievements.module.css';

const CATEGORIES: Achievement['category'][] = ['Journey', 'Skill', 'Habit', 'Library'];

export function Achievements() {
  const { progress } = useAppState();
  const earned = Object.keys(progress.achievements).length;
  return (
    <>
      <PageHeader
        eyebrow={`${earned} of ${ACHIEVEMENTS.length} earned`}
        title="Achievements"
        lede="Badges are earned automatically from what you actually do. Each one shows exactly what it takes, and how close you are."
      />
      {CATEGORIES.map((cat) => {
        const list = ACHIEVEMENTS.filter((a) => a.category === cat);
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`} className={styles.group}>
            <h2 id={`cat-${cat}`} className={styles.groupTitle}>{cat}</h2>
            <ul className={styles.grid}>
              {list.map((a) => {
                const at = progress.achievements[a.id];
                const m = measure(a.id, progress);
                return (
                  <li key={a.id} className={`${styles.item} ${at ? styles.earned : ''}`} data-badge={a.id} data-earned={at ? 'yes' : 'no'}>
                    <Badge a={a} unlocked={!!at} />
                    <div className={styles.body}>
                      <p className={styles.title}>{a.title}</p>
                      <p className={styles.criteria}>{a.criteria}</p>
                      {at ? (
                        <p className={`${styles.state} ${styles.stateOn}`}><Icon name="check" size={13} /> Earned {new Date(at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      ) : m.target > 1 ? (
                        <div className={styles.measure}>
                          <ProgressBar value={m.current} max={m.target} label={`${a.title}: ${m.current} of ${m.target}`} />
                          <span className="num">{m.current}/{m.target}</span>
                        </div>
                      ) : (
                        <p className={styles.state}><Icon name="lock" size={13} /> Not yet earned · {a.tier}</p>
                      )}
                      {a.id === 'sheet-explorer' && !at && <p className={styles.note}>Available when the sheet music library opens.</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}
