import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/ui';
import { ACHIEVEMENTS, type Achievement } from '../data/achievements';
import styles from './Achievements.module.css';

const CATEGORIES: Achievement['category'][] = ['Journey', 'Skill', 'Habit', 'Library'];

export function Achievements() {
  // Unlock logic arrives with the gamification stage; no badge can be earned yet.
  const unlocked = new Set<string>();
  return (
    <>
      <PageHeader
        eyebrow={`${unlocked.size} of ${ACHIEVEMENTS.length} earned`}
        title="Achievements"
        lede="Badges mark real milestones in your reading. Each one shows exactly what it takes to earn it."
      />
      {CATEGORIES.map((cat) => {
        const list = ACHIEVEMENTS.filter((a) => a.category === cat);
        return (
          <section key={cat} aria-labelledby={`cat-${cat}`} className={styles.group}>
            <h2 id={`cat-${cat}`} className={styles.groupTitle}>{cat}</h2>
            <ul className={styles.grid}>
              {list.map((a) => {
                const on = unlocked.has(a.id);
                return (
                  <li key={a.id} className={styles.item}>
                    <Badge a={a} unlocked={on} />
                    <div>
                      <p className={styles.title}>{a.title}</p>
                      <p className={styles.criteria}>{a.criteria}</p>
                      <p className={styles.state}>{on ? 'Earned' : <><Icon name="lock" size={13} /> Locked · {a.tier}</>}</p>
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
