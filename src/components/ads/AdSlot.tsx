import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdConsent, isAdFreeRoute, loadAdScript, onAdConsentChange, readAdConfig, requestAd, type AdConsent } from '../../lib/ads';
import styles from './Ads.module.css';

const config = readAdConfig();

export function useAdConsent(): AdConsent {
  const [c, setC] = useState<AdConsent>(getAdConsent);
  useEffect(() => onAdConsentChange(() => setC(getAdConsent())), []);
  return c;
}

/** Ads can appear at all: configured (or a dev preview) and not switched off. */
export const adsAvailable = !!config || import.meta.env.DEV;

/**
 * One ad space at the bottom of a page, below the content. Renders nothing on
 * learning routes, when ads aren't set up, or until the student says yes.
 */
export function AdSlot() {
  const { pathname } = useLocation();
  const consent = useAdConsent();
  const ins = useRef<HTMLModElement>(null);
  const show = consent === 'yes' && !isAdFreeRoute(pathname);

  useEffect(() => {
    if (!show || !config || !ins.current) return;
    loadAdScript(config.client);
    try { requestAd(); } catch { /* blocked by an ad blocker: leave the space empty */ }
  }, [show, pathname]);

  if (!show) return null;
  if (!config) {
    if (!import.meta.env.DEV) return null;
    return (
      <aside className={styles.slot} aria-label="Advertisement">
        <span className={styles.label}>Advertisement</span>
        <div className={styles.devBox}>Ad space (development preview). Real ads appear here once an AdSense publisher ID is set up.</div>
      </aside>
    );
  }
  return (
    <aside className={styles.slot} aria-label="Advertisement" key={pathname}>
      <span className={styles.label}>Advertisement</span>
      <ins ref={ins} className={`adsbygoogle ${styles.ins}`} style={{ display: 'block' }}
        data-ad-client={config.client} data-ad-slot={config.slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}
