import { useLocation } from 'react-router-dom';
import { isAdFreeRoute, setAdConsent } from '../../lib/ads';
import { adsAvailable, useAdConsent } from './AdSlot';
import { Button } from '../ui';
import styles from './Ads.module.css';

/** Asked once, in plain words, never on a lesson page. Nothing loads before a yes. */
export function AdConsentBanner() {
  const consent = useAdConsent();
  const { pathname } = useLocation();
  if (!adsAvailable || consent !== null || isAdFreeRoute(pathname)) return null;
  return (
    <section className={styles.banner} aria-labelledby="ad-consent-t" role="region">
      <div>
        <p id="ad-consent-t" className={styles.bannerTitle}>Stave is free because of ads</p>
        <p className={styles.bannerText}>
          If you say yes, Google may show a full-screen ad when you move on to a new lesson, and a small ad at the bottom of some pages. Never in the middle of a lesson, play test or the tuner.
          Ads are not personalised, but Google may use cookies to limit repeats and stop fraud. You can change this in Settings.
        </p>
      </div>
      <div className={styles.bannerActions}>
        <Button onClick={() => setAdConsent('yes')}>Show ads</Button>
        <Button variant="secondary" onClick={() => setAdConsent('no')}>No ads</Button>
      </div>
    </section>
  );
}
