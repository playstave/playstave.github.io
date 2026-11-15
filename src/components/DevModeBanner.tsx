import { devToneEnabled } from '../audio/devTone';
import styles from './DevModeBanner.module.css';

/**
 * DEV ONLY. When the synthetic test sound is switched on, the microphone is NOT
 * used — the app "hears" a simulated player instead. That must never be
 * mistaken for real listening, so this banner sits on every page with an off switch.
 * Production builds never include it.
 */
export function DevModeBanner() {
  if (!import.meta.env.DEV || !devToneEnabled()) return null;
  const off = () => { try { localStorage.removeItem('stave:dev-test-tone'); } catch { /* ignore */ } location.reload(); };
  return (
    <div className={styles.banner} role="alert" data-dev-banner>
      <strong>Test mode:</strong> the microphone is not being used — a simulated player is “playing”, so notes will turn green on their own.
      <button type="button" onClick={off}>Turn off test mode</button>
    </div>
  );
}
