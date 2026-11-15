import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button, PageHeader, Segmented } from '../components/ui';
import { Notation } from '../components/Notation';
import { useAppState, type MotionPref, type NotationScale, type ThemePref } from '../state/AppState';
import styles from './Settings.module.css';

const PREVIEW = [{ key: 'c/4', duration: 'q' }, { key: 'e/4', duration: 'q' }, { key: 'g/4', duration: 'q' }, { key: 'c/5', duration: 'q' }];

export function Settings() {
  const { prefs, setPrefs, resetDevice } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const { hash } = useLocation();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    el?.scrollIntoView({ block: 'start' });
    el?.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
  }, [hash]);

  useEffect(() => { if (confirming) cancelRef.current?.focus(); }, [confirming]);

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" lede="Changes are saved automatically on this device." />

      <section className={styles.group} aria-labelledby="appearance">
        <h2 id="appearance" className={styles.groupTitle}>Appearance</h2>
        <div className={styles.row}>
          <div><p className={styles.rowTitle}>Theme</p><p className={styles.rowHelp}>System follows your device’s light or dark setting.</p></div>
          <Segmented<ThemePref> name="theme" label="Theme" value={prefs.theme} onChange={(v) => setPrefs({ theme: v })}
            options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </div>
        <div className={styles.row}>
          <div><p className={styles.rowTitle}>Notation size</p><p className={styles.rowHelp}>Make staves and notes larger in lessons and drills.</p></div>
          <Segmented<NotationScale> name="scale" label="Notation size" value={prefs.notationScale} onChange={(v) => setPrefs({ notationScale: v })}
            options={[{ value: 1, label: 'Standard' }, { value: 1.25, label: 'Large' }, { value: 1.5, label: 'Extra large' }]} />
        </div>
        <div className={styles.preview}>
          <Notation clef="treble" notes={PREVIEW} width={260} height={120} label="Preview: quarter notes C, E, G and C on a treble staff." />
        </div>
      </section>

      <section className={styles.group} aria-labelledby="accessibility">
        <h2 id="accessibility" className={styles.groupTitle}>Accessibility</h2>
        <div className={styles.row}>
          <div><p className={styles.rowTitle}>Motion</p><p className={styles.rowHelp}>Reduce turns off celebration animations and transitions. System follows your device setting.</p></div>
          <Segmented<MotionPref> name="motion" label="Motion" value={prefs.motion} onChange={(v) => setPrefs({ motion: v })}
            options={[{ value: 'system', label: 'System' }, { value: 'reduced', label: 'Reduce' }, { value: 'full', label: 'Full' }]} />
        </div>
      </section>

      <section className={styles.group} aria-labelledby="privacy-h" id="privacy">
        <h2 id="privacy-h" className={styles.groupTitle} tabIndex={-1}>Privacy &amp; data</h2>
        <div className={styles.prose}>
          <p>Stave is free and designed to be safe for young learners. Right now everything — your nickname, progress and preferences — is stored only in this browser. Nothing is sent to a server, and there is no tracking.</p>
          <p>When accounts and advertising arrive, this page will explain exactly what is stored and give you control over it. Ads will never interrupt a lesson or cover notation.</p>
        </div>
        <div className={styles.row}>
          <div><p className={styles.rowTitle}>Reset this device</p><p className={styles.rowHelp}>Erase your nickname, progress, practice history and settings from this browser.</p></div>
          {!confirming && <Button variant="danger" onClick={() => { setConfirming(true); setResetDone(false); }}>Reset…</Button>}
        </div>
        {confirming && (
          <div className={styles.confirm} role="alertdialog" aria-labelledby="confirm-t" aria-describedby="confirm-d">
            <p id="confirm-t" className={styles.rowTitle}>Erase everything on this device?</p>
            <p id="confirm-d" className={styles.rowHelp}>This cannot be undone.</p>
            <div className={styles.confirmActions}>
              <Button variant="danger" onClick={() => { resetDevice(); setConfirming(false); setResetDone(true); }}>Erase</Button>
              <Button ref={cancelRef} variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {resetDone && <p className={styles.ok} role="status">This device has been reset.</p>}
      </section>
    </>
  );
}
