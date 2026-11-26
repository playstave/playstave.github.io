import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAdConsent, isAdFreeRoute, levelFromPath, loadAdScript, makeLessonSwitchDetector, onAdConsentChange, readAdConfig, requestAd, showAdBreak, type AdConsent } from '../../lib/ads';
import styles from './Ads.module.css';

const config = readAdConfig();
const scriptOpts = { childDirected: config?.childDirected };

export function useAdConsent(): AdConsent {
  const [c, setC] = useState<AdConsent>(getAdConsent);
  useEffect(() => onAdConsentChange(() => setC(getAdConsent())), []);
  return c;
}

/** Ads can appear at all: configured (or a dev preview) and not switched off. */
export const adsAvailable = !!config || import.meta.env.DEV;

/**
 * Full-screen ad between lessons. Renders nothing; once the student has said
 * yes to ads it loads Google's script (so an ad is preloaded), then asks for an
 * ad break each time they move on to a different lesson. The break happens as
 * the next lesson opens, before it starts, so nothing is interrupted mid-play.
 */
export function LessonAdBreaks() {
  const { pathname } = useLocation();
  const consent = useAdConsent();
  const [isSwitch] = useState(makeLessonSwitchDetector);

  useEffect(() => {
    if (consent === 'yes' && config) loadAdScript(config.client, document, scriptOpts);
  }, [consent]);

  useEffect(() => {
    // Only route changes count; consent changing mid-lesson is not a lesson switch.
    if (isSwitch(pathname) && consent === 'yes' && config) showAdBreak(`level-${levelFromPath(pathname)}`);
  }, [pathname]);

  return null;
}

/**
 * One ad space at the bottom of a page, below the content. Renders nothing on
 * learning routes, when no ad unit is set up, or until the student says yes.
 */
export function AdSlot() {
  const { pathname } = useLocation();
  const consent = useAdConsent();
  const ins = useRef<HTMLModElement>(null);
  const show = consent === 'yes' && !isAdFreeRoute(pathname);

  useEffect(() => {
    if (!show || !config?.slot || !ins.current) return;
    loadAdScript(config.client, document, scriptOpts);
    try { requestAd(); } catch { /* blocked by an ad blocker: leave the space empty */ }
  }, [show, pathname]);

  if (!show) return null;
  if (!config?.slot) {
    if (!import.meta.env.DEV) return null;
    return (
      <aside className={styles.slot} aria-label="Advertisement">
        <span className={styles.label}>Advertisement</span>
        <div className={styles.devBox}>Ad space (development preview). Real ads appear here once an AdSense publisher ID and ad unit are set up.</div>
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
