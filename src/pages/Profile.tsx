import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, PageHeader, Panel, SectionTitle, Stars, Stat } from '../components/ui';
import { levelInfo } from '../course';
import { AccountPanel } from '../components/AccountPanel';
import { useAppState } from '../state/AppState';
import { instrumentInfo } from '../data/students';
import styles from './Profile.module.css';

export function Profile() {
  const { progress, setDisplayName, derived } = useAppState();
  const [draft, setDraft] = useState(progress.displayName);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (v.length > 24) { setError('Use 24 characters or fewer.'); return; }
    if (v && !/^[\p{L}\p{N} _.'-]+$/u.test(v)) { setError('Use letters, numbers, spaces, and . _ \' - only.'); return; }
    setError('');
    setDisplayName(v);
    setDraft(v);
    setSaved(true);
  };

  const shown = progress.displayName || 'Musician';
  const initials = shown.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <PageHeader eyebrow="Student profile" title="Profile" />
      <div className={styles.top}>
        <div className={styles.avatar} aria-hidden="true">{initials}</div>
        <div>
          <p className={styles.name}>{shown}</p>
          <p className="muted">Level {Math.min(progress.currentLevel, 500)} · {progress.xp} XP · {derived.totalStars} stars</p>
          {progress.student && <p className="muted" data-profile-instrument>{instrumentInfo(progress.student.instrument).name} · <Link to="/settings#instrument-h">Change</Link></p>}
        </div>
      </div>

      <div className={styles.grid}>
        <Panel aria-labelledby="name-h">
          <SectionTitle id="name-h">Display name</SectionTitle>
          <form onSubmit={submit} className={styles.form} noValidate>
            <label htmlFor="display-name" className={styles.label}>What should Stave call you?</label>
            <p id="name-help" className={styles.help}>A nickname is perfect. Please don’t use your full real name.</p>
            <div className={styles.row}>
              <input
                id="display-name"
                className={styles.input}
                value={draft}
                maxLength={24}
                autoComplete="nickname"
                aria-describedby={`name-help${error ? ' name-err' : ''}`}
                aria-invalid={!!error}
                onChange={(e) => { setDraft(e.target.value); setSaved(false); }}
              />
              <Button type="submit">Save</Button>
            </div>
            {error && <p id="name-err" className={styles.err} role="alert">{error}</p>}
            {saved && !error && <p className={styles.ok} role="status">Saved.</p>}
          </form>
        </Panel>

        <Panel aria-labelledby="summary-h">
          <SectionTitle id="summary-h">Summary</SectionTitle>
          <dl className={styles.stats}>
            <Stat label="Levels" value={derived.levelsCompleted} />
            <Stat label="Stars" value={derived.totalStars} />
            <Stat label="Streak" value={derived.streak} />
          </dl>
        </Panel>

        <Panel aria-labelledby="saved-h">
          <SectionTitle id="saved-h">Saved sheet music</SectionTitle>
          <EmptyState title="No saved scores">Scores you favourite in the library will be listed here.</EmptyState>
        </Panel>

        <Panel aria-labelledby="history-h">
          <SectionTitle id="history-h">Learning history</SectionTitle>
          {progress.history.length ? (
            <ul className={styles.history}>
              {progress.history.slice(0, 12).map((h, i) => (
                <li key={`${h.at}-${i}`}>
                  <Link to={`/level/${h.level}`}>Level {h.level}{levelInfo(h.level, progress.student?.instrument ?? 'violin').title ? `: ${levelInfo(h.level, progress.student?.instrument ?? 'violin').title}` : ''}</Link>
                  <span className="muted">{new Date(h.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}{h.replay ? ' · replay' : ''}</span>
                  <span className={styles.hStars}><Stars earned={h.stars} size={13} /> {h.score}%</span>
                </li>
              ))}
            </ul>
          ) : <EmptyState title="No lessons yet">Each level you complete will appear here with its date, score and stars.</EmptyState>}
        </Panel>
      </div>

      <section className={styles.account} aria-labelledby="account-h">
        <SectionTitle id="account-h">Account</SectionTitle>
        <Panel><AccountPanel /></Panel>
      </section>
    </>
  );
}
