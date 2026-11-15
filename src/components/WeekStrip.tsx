import { addDays, dayKey } from '../lib/dates';
import styles from './WeekStrip.module.css';

/** The last seven days, oldest first, marking days with a finished practice set. */
export function WeekStrip({ days }: { days: string[] }) {
  const set = new Set(days);
  const today = new Date();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const doneCount = week.filter((d) => set.has(dayKey(d))).length;
  return (
    <div>
      <ol className={styles.strip} aria-label={`Practice in the last seven days: ${doneCount} of 7 days`}>
        {week.map((d) => {
          const k = dayKey(d);
          const done = set.has(k);
          const isToday = k === dayKey(today);
          const dayName = d.toLocaleDateString(undefined, { weekday: 'short' });
          return (
            <li key={k} className={styles.day} aria-label={`${d.toLocaleDateString(undefined, { weekday: 'long' })}${isToday ? ' (today)' : ''}: ${done ? 'practised' : 'no practice'}`}>
              <span className={`${styles.dot} ${done ? styles.done : ''} ${isToday ? styles.today : ''}`} aria-hidden="true" />
              <span className={styles.label} aria-hidden="true">{dayName.slice(0, 2)}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
