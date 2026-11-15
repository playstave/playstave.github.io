import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, type Toast } from '../state/AppState';
import { Icon } from './Icon';
import styles from './Toasts.module.css';

function Item({ t, onClose }: { t: Toast; onClose: () => void }) {
  useEffect(() => { const id = setTimeout(onClose, 7000); return () => clearTimeout(id); }, [onClose]);
  return (
    <li className={`${styles.toast} ${styles[t.kind]}`}>
      <Icon name={t.kind === 'badge' ? 'achievements' : t.kind === 'streak' ? 'flame' : 'star'} size={20} className={styles.icon} />
      <div className={styles.text}>
        <p className={styles.title}>{t.title}</p>
        {t.body && <p className={styles.body}>{t.body}</p>}
        {t.link && <Link to={t.link} className={styles.link} onClick={onClose}>View</Link>}
      </div>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Dismiss notification"><Icon name="close" size={16} /></button>
    </li>
  );
}

/** Announcements for XP, streak bonuses and badges earned outside lessons. */
export function Toasts() {
  const { toasts, dismissToast } = useAppState();
  return (
    <ol className={styles.stack} role="status" aria-live="polite" aria-label="Notifications">
      {toasts.map((t) => <Item key={t.id} t={t} onClose={() => dismissToast(t.id)} />)}
    </ol>
  );
}
