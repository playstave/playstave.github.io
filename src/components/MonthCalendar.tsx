import { useState } from 'react';
import { Icon } from './Icon';
import { dayKey } from '../lib/dates';
import styles from './MonthCalendar.module.css';

/** Month grid showing practised days. Weeks start on Monday. */
export function MonthCalendar({ days }: { days: string[] }) {
  const set = new Set(days);
  const now = new Date();
  const [cursor, setCursor] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (Date | null)[] = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1))];
  const title = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const practisedThisMonth = cells.filter((d) => d && set.has(dayKey(d))).length;
  const weekdayNames = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(undefined, { weekday: 'narrow' }));

  return (
    <div className={styles.cal}>
      <div className={styles.head}>
        <button type="button" className={styles.nav} onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month"><Icon name="chevron-left" size={18} /></button>
        <p className={styles.title} aria-live="polite">{title}</p>
        <button type="button" className={`${styles.nav} ${styles.flip}`} onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month" disabled={isCurrentMonth}><Icon name="chevron-left" size={18} /></button>
      </div>
      <table className={styles.grid}>
        <caption className="visually-hidden">{title}: practised on {practisedThisMonth} day{practisedThisMonth === 1 ? '' : 's'}</caption>
        <thead><tr>{weekdayNames.map((w, i) => <th key={i} scope="col" aria-hidden="true">{w}</th>)}</tr></thead>
        <tbody>
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) => (
            <tr key={r}>
              {cells.slice(r * 7, r * 7 + 7).concat(Array(Math.max(0, 7 - cells.slice(r * 7, r * 7 + 7).length)).fill(null)).map((d, c) => {
                if (!d) return <td key={c} />;
                const k = dayKey(d);
                const done = set.has(k);
                const today = k === dayKey(now);
                return (
                  <td key={c}>
                    <span className={`${styles.day} ${done ? styles.done : ''} ${today ? styles.today : ''}`} aria-label={`${d.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })}${done ? ', practised' : ''}${today ? ', today' : ''}`}>
                      {d.getDate()}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
