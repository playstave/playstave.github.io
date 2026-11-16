/**
 * Advertising (Stage 7).
 *
 * Rules (product decisions, see README "Advertising"):
 * - OFF unless the owner configures a real Google AdSense publisher ID
 *   (VITE_ADSENSE_CLIENT) and ad unit (VITE_ADSENSE_SLOT). No fake ads.
 * - Nothing is loaded from Google until the student chooses "Show ads".
 *   Choosing "No ads" means no ad script is ever loaded.
 * - Only NON-personalised ads are requested (requestNonPersonalizedAds = 1),
 *   because many Stave students are children.
 * - Never during a lesson, play test, tuner, play-along, quiz or while reading
 *   a score: those routes get no ad at all.
 */

export interface AdConfig { client: string; slot: string }

const CLIENT_RE = /^ca-pub-\d{10,20}$/;
const SLOT_RE = /^\d{6,12}$/;

export function readAdConfig(env: Record<string, string | undefined> = import.meta.env): AdConfig | null {
  const client = env.VITE_ADSENSE_CLIENT?.trim();
  const slot = env.VITE_ADSENSE_SLOT?.trim();
  if (!client || !slot || !CLIENT_RE.test(client) || !SLOT_RE.test(slot)) return null;
  return { client, slot };
}

/** Routes where an ad would interrupt learning. */
const AD_FREE = [/^\/level\//, /^\/tuner/, /^\/play(\/|$)/, /^\/welcome/, /^\/library\/[^/]+/, /^\/practice\/daily/, /^\/install/];
export const isAdFreeRoute = (path: string) => AD_FREE.some((r) => r.test(path));

export type AdConsent = 'yes' | 'no' | null;
const KEY = 'stave:ad-consent';
const EVENT = 'stave:ad-consent';

export function getAdConsent(): AdConsent {
  try { const v = localStorage.getItem(KEY); return v === 'yes' || v === 'no' ? v : null; } catch { return null; }
}
export function setAdConsent(v: 'yes' | 'no' | null) {
  try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* private mode: choice lasts this visit */ }
  window.dispatchEvent(new Event(EVENT));
}
export function onAdConsentChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  window.addEventListener('storage', fn);
  return () => { window.removeEventListener(EVENT, fn); window.removeEventListener('storage', fn); };
}

type AdsQueue = unknown[] & { requestNonPersonalizedAds?: number };
declare global { interface Window { adsbygoogle?: AdsQueue } }

let loaded = false;
/**
 * Loads Google's ad script once. requestNonPersonalizedAds is set BEFORE any
 * ad request, as Google's documentation requires.
 */
export function loadAdScript(client: string, doc: Document = document) {
  if (loaded || doc.querySelector('script[data-stave-ads]')) { loaded = true; return; }
  const q: AdsQueue = (window.adsbygoogle = window.adsbygoogle || []);
  q.requestNonPersonalizedAds = 1;
  const s = doc.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  s.dataset.staveAds = '1';
  doc.head.appendChild(s);
  loaded = true;
}

/** Ask Google to fill one <ins class="adsbygoogle"> that is now in the page. */
export function requestAd() {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}

/** For tests. */
export function _resetAdsForTest() { loaded = false; }
