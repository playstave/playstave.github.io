import { useState, type FormEvent } from 'react';
import { useAccount } from '../state/AccountState';
import { BackendError, passwordProblem, usernameProblem } from '../lib/sync/backend';
import { Button, Notice } from './ui';
import { Icon } from './Icon';
import styles from './AccountPanel.module.css';

function SyncLine() {
  const { status, lastSyncedAt, statusDetail, syncNow } = useAccount();
  const when = lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : null;
  const text = status === 'syncing' ? 'Saving to your account…'
    : status === 'synced' ? `All progress saved to your account${when ? ` · ${when}` : ''}.`
    : status === 'offline' ? 'Offline — your progress is safe on this device and will sync when you’re back online.'
    : status === 'error' ? `Couldn’t sync: ${statusDetail ?? 'unknown error'}` : '';
  return (
    <p className={`${styles.sync} ${styles[status]}`} role="status" data-sync={status}>
      <span className={styles.dot} aria-hidden="true" /> {text}
      {(status === 'offline' || status === 'error') && <button type="button" className={styles.link} onClick={() => void syncNow()}>Try again</button>}
    </p>
  );
}

export function AccountPanel() {
  const a = useAccount();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [include, setInclude] = useState(true);
  const [error, setError] = useState('');
  const [fieldErr, setFieldErr] = useState<{ username?: string; password?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  if (!a.configured) {
    return (
      <Notice title="Accounts aren’t switched on for this copy of Stave">
        <p>Your progress is saved on this device. When accounts are set up, you’ll be able to sign in and keep your progress on any device.</p>
      </Notice>
    );
  }
  if (!a.ready) return <p className={styles.muted}>Checking your account…</p>;

  if (a.session) {
    return (
      <div className={styles.signedIn} data-account="signed-in">
        <p className={styles.who}><Icon name="profile" size={18} /> Signed in as <strong>@{a.session.username}</strong></p>
        <SyncLine />
        <div className={styles.row}>
          <Button variant="secondary" onClick={async () => { setBusy(true); try { await a.signOut(); } finally { setBusy(false); } }} disabled={busy}>Sign out</Button>
        </div>
        <p className={styles.muted}>Signing out removes your progress from this device (it stays in your account), so the next person starts fresh.</p>

        <details className={styles.danger}>
          <summary>Delete account</summary>
          {!confirmDelete ? (
            <div className={styles.dangerBody}>
              <p>This permanently deletes your account and all progress stored in it. It cannot be undone.</p>
              <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete my account…</Button>
            </div>
          ) : (
            <form className={styles.dangerBody} onSubmit={async (e) => {
              e.preventDefault();
              if (deleteText.trim().toLowerCase() !== a.session!.username) { setError('Type your username exactly to confirm.'); return; }
              setBusy(true); setError('');
              try { await a.deleteAccount(); } catch (err) { setError(err instanceof BackendError ? err.message : 'Could not delete the account.'); } finally { setBusy(false); }
            }}>
              <label htmlFor="del-confirm">Type <strong>{a.session.username}</strong> to confirm</label>
              <input id="del-confirm" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
              {error && <p className={styles.err} role="alert">{error}</p>}
              <div className={styles.row}>
                <Button type="submit" variant="danger" disabled={busy}>Permanently delete</Button>
                <Button variant="ghost" onClick={() => { setConfirmDelete(false); setDeleteText(''); setError(''); }}>Cancel</Button>
              </div>
            </form>
          )}
        </details>
      </div>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const fe: typeof fieldErr = {};
    if (mode === 'signup') {
      fe.username = usernameProblem(username) ?? undefined;
      fe.password = passwordProblem(password, username) ?? undefined;
      if (!fe.password && password !== confirm) fe.confirm = 'The passwords don’t match.';
    } else {
      if (!username.trim()) fe.username = 'Enter your username.';
      if (!password) fe.password = 'Enter your password.';
    }
    setFieldErr(fe);
    if (fe.username || fe.password || fe.confirm) return;
    setBusy(true);
    try {
      if (mode === 'signup') await a.signUp(username, password);
      else await a.signIn(username, password, include);
      setPassword(''); setConfirm('');
    } catch (err) {
      setError(err instanceof BackendError ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <div data-account="signed-out">
      <div className={styles.tabs} role="tablist" aria-label="Account">
        <button type="button" role="tab" aria-selected={mode === 'signin'} className={mode === 'signin' ? styles.tabOn : ''} onClick={() => { setMode('signin'); setError(''); setFieldErr({}); }}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? styles.tabOn : ''} onClick={() => { setMode('signup'); setError(''); setFieldErr({}); }}>Create account</button>
      </div>
      <form onSubmit={submit} className={styles.form} noValidate>
        {mode === 'signup' && (
          <p className={styles.muted}>No email needed. Choose a username that isn’t your real name. If you’re under 13, ask a parent or teacher before creating an account.</p>
        )}
        <label htmlFor="acc-username">Username</label>
        <input id="acc-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={20}
          aria-invalid={!!fieldErr.username} aria-describedby={fieldErr.username ? 'acc-username-err' : 'acc-username-help'}
          onBlur={async () => { if (mode === 'signup' && username) { const p = await a.checkUsername(username); setFieldErr((f) => ({ ...f, username: p ?? undefined })); } }} />
        {mode === 'signup' && !fieldErr.username && <p id="acc-username-help" className={styles.help}>3–20 letters, numbers or underscores.</p>}
        {fieldErr.username && <p id="acc-username-err" className={styles.err}>{fieldErr.username}</p>}

        <label htmlFor="acc-password">Password</label>
        <input id="acc-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} maxLength={72}
          aria-invalid={!!fieldErr.password} aria-describedby={fieldErr.password ? 'acc-password-err' : undefined} />
        {mode === 'signup' && !fieldErr.password && <p className={styles.help}>At least 8 characters. Write it down somewhere safe — there’s no email to reset it.</p>}
        {fieldErr.password && <p id="acc-password-err" className={styles.err}>{fieldErr.password}</p>}

        {mode === 'signup' && (
          <>
            <label htmlFor="acc-confirm">Repeat password</label>
            <input id="acc-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" maxLength={72} aria-invalid={!!fieldErr.confirm} />
            {fieldErr.confirm && <p className={styles.err}>{fieldErr.confirm}</p>}
          </>
        )}

        {mode === 'signin' && a.deviceHasProgress && (
          <label className={styles.check}>
            <input type="checkbox" checked={include} onChange={(e) => setInclude(e.target.checked)} />
            Add the progress on this device to my account
          </label>
        )}
        {mode === 'signup' && a.deviceHasProgress && <p className={styles.help}>Your progress on this device will be saved to the new account.</p>}

        {error && <p className={styles.err} role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Sign in'}</Button>
      </form>
    </div>
  );
}
