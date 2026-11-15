import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../Icon';
import { isStandalone } from '../../lib/install';
import { readJSON, writeJSON } from '../../lib/storage';
import styles from './InstallHint.module.css';

/** A quiet, dismissible pointer to the install guide. Hidden once Stave runs as an installed app. */
export function InstallHint() {
  const [hidden, setHidden] = useState(() => isStandalone() || readJSON<boolean>('install-hint-dismissed', false));
  if (hidden) return null;
  return (
    <aside className={styles.hint} aria-label="Install Stave" data-install-hint>
      <span className={styles.icon} aria-hidden="true"><Icon name="phone" size={18} /></span>
      <p>Open Stave like an app — <Link to="/install">add it to your Home Screen</Link>.</p>
      <button type="button" className={styles.close} aria-label="Hide this tip" onClick={() => { writeJSON('install-hint-dismissed', true); setHidden(true); }}>
        <Icon name="close" size={16} />
      </button>
    </aside>
  );
}
