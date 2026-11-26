import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, ButtonLink, PageHeader, Segmented } from '../components/ui';
import { Icon } from '../components/Icon';
import { isStandalone } from '../lib/install';
import { Notation } from '../components/Notation';
import { useAppState, type MotionPref, type NotationScale, type ThemePref } from '../state/AppState';
import { useAccount } from '../state/AccountState';
import { EXPERIENCE_OPTIONS, INSTRUMENT_INFO } from '../data/students';
import type { Experience, StudentInstrument } from '../state/progress';
import { setAdConsent } from '../lib/ads';
import { adsAvailable, useAdConsent } from '../components/ads/AdSlot';
import styles from './Settings.module.css';

const PREVIEW = [{ key: 'c/4', duration: 'q' }, { key: 'e/4', duration: 'q' }, { key: 'g/4', duration: 'q' }, { key: 'c/5', duration: 'q' }];

export function Settings() {
  const { prefs, setPrefs, resetDevice, progress, setStudent } = useAppState();
  const student = progress.student;
  const standalone = isStandalone();
  const account = useAccount();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const adConsent = useAdConsent();
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

      <section className={styles.group} aria-labelledby="instrument-title" id="instrument-h">
        <h2 id="instrument-title" className={styles.groupTitle} tabIndex={-1}>Your instrument</h2>
        {student ? (
          <>
            <div className={styles.row}>
              <div><p className={styles.rowTitle}>Instrument</p><p className={styles.rowHelp}>Stave shows play-along pieces, the tuner and lessons for this instrument only. Your levels, XP and badges stay as they are when you switch.</p></div>
              <Segmented<StudentInstrument> name="student-instrument" label="Instrument" value={student.instrument}
                onChange={(v) => setStudent({ instrument: v, experience: student.experience })}
                options={INSTRUMENT_INFO.map((i) => ({ value: i.id, label: i.name }))} />
            </div>
            <div className={styles.row}>
              <div><p className={styles.rowTitle}>Experience</p><p className={styles.rowHelp}>Changes the suggestions on Home; brand-new players start play-alongs at the slower speed.</p></div>
              <Segmented<Experience> name="student-experience" label="Experience" value={student.experience}
                onChange={(v) => setStudent({ instrument: student.instrument, experience: v })}
                options={EXPERIENCE_OPTIONS.map((o) => ({ value: o.id, label: o.label.replace('I’m ', '').replace('I can ', '').replace('I’ve ', '') }))} />
            </div>
          </>
        ) : (
          <p className={styles.rowHelp}>You haven’t chosen an instrument yet. <Link to="/welcome">Answer the welcome questions</Link>.</p>
        )}
      </section>

      <section className={styles.group} aria-labelledby="install-title" id="install-h">
        <h2 id="install-title" className={styles.groupTitle} tabIndex={-1}>Install Stave</h2>
        <div className={styles.row}>
          <div className={styles.installRow}>
            <span className={styles.installIcon} aria-hidden="true"><Icon name="phone" size={22} /></span>
            <div><p className={styles.rowTitle}>{standalone ? 'Stave is installed on this device' : 'Add Stave to your Home Screen'}</p>
              <p className={styles.rowHelp}>{standalone ? 'You’re using Stave from its app icon.' : 'Open Stave like a regular app on iPhone, iPad, Android or your computer. Free, no app store.'}</p></div>
          </div>
          <ButtonLink to="/install" variant="secondary" icon="phone">{standalone ? 'Installation help' : 'How to install'}</ButtonLink>
        </div>
      </section>

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
          <p>Stave is free and designed to be safe for young learners. Without an account, your nickname, progress and preferences are stored only in this browser.</p>
          <p>If you create an account, we store only your username, a securely hashed password, and your learning progress (levels, stars, XP, badges, practice days, favourite scores and collections). We never ask for your email, age or real name. Only you can read your data; you can delete your account and everything in it from your Profile at any time.</p>
          <p><strong>Ads.</strong> Stave is free because of advertising. Nothing from an ad company loads unless you choose “Show ads”. Then Google may show a full-screen ad (which can be a video) when you move on to a new lesson, and one small ad at the bottom of some pages. Never in the middle of a lesson, play test, the tuner, the play-along, a quiz or while you read a score. We only ask for non-personalised ads (not based on what you do elsewhere), though Google may use cookies to limit how often you see an ad and to stop fraud. Stave itself has no tracking. Full details: <Link to="/privacy">Privacy policy</Link>.</p>
        </div>
        {adsAvailable && (
          <div className={styles.row}>
            <div>
              <p className={styles.rowTitle}>Ads</p>
              <p className={styles.rowHelp}>{adConsent === 'yes' ? 'Showing non-personalised ads between lessons and at the bottom of some pages.' : adConsent === 'no' ? 'No ads: nothing from an ad company is loaded.' : 'You haven’t chosen yet.'}</p>
            </div>
            <Segmented<'yes' | 'no'> name="ad-consent" label="Ads" value={adConsent ?? ('' as 'yes')} onChange={(v) => setAdConsent(v)}
              options={[{ value: 'yes', label: 'Show ads' }, { value: 'no', label: 'No ads' }]} />
          </div>
        )}
        <div className={styles.row}>
          <div><p className={styles.rowTitle}>Reset this device</p><p className={styles.rowHelp}>Erase your nickname, progress, practice history and settings from this browser.</p></div>
          {!confirming && <Button variant="danger" onClick={() => { setConfirming(true); setResetDone(false); }}>Reset…</Button>}
        </div>
        {confirming && (
          <div className={styles.confirm} role="alertdialog" aria-labelledby="confirm-t" aria-describedby="confirm-d">
            <p id="confirm-t" className={styles.rowTitle}>Erase everything on this device?</p>
            <p id="confirm-d" className={styles.rowHelp}>{account.session ? 'You will be signed out first. Progress saved in your account is not affected.' : 'This cannot be undone.'}</p>
            <div className={styles.confirmActions}>
              <Button variant="danger" onClick={async () => { if (account.session) await account.signOut(); resetDevice(); setConfirming(false); setResetDone(true); }}>Erase</Button>
              <Button ref={cancelRef} variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          </div>
        )}
        {resetDone && <p className={styles.ok} role="status">This device has been reset.</p>}
      </section>
    </>
  );
}
