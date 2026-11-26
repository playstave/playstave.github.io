/**
 * Advertising (Stage 7).
 *
 * Rules (product decisions, see README "Advertising"):
 * - OFF unless the owner configures a real Google AdSense publisher ID
 *   (VITE_ADSENSE_CLIENT). No fake ads (except Google's own test ads, which
 *   the owner can switch on for their device with ?adtest=on).
 * - Nothing is loaded from Google until the student chooses "Show ads".
 *   Choosing "No ads" means no ad script is ever loaded.
 * - Only NON-personalised ads are requested (requestNonPersonalizedAds = 1),
 *   because many Stave students are children.
 * - Between lessons: when a student moves on to a different level, Google may
 *   show one full-screen ad (H5 Games Ad Placement API, `adBreak` type "next").
 *   Google decides whether an ad is ready and caps how often they appear.
 * - Never in the middle of a lesson, play test, tuner, play-along, quiz or
 *   while reading a score: those routes get no banner ad.
 * - The banner ad at the bottom of browsing pages also needs an ad unit
 *   (VITE_ADSENSE_SLOT); without one, only the between-lesson ads run.
 */

export interface AdConfig {
  client: string;
  /** Display ad unit for the bottom-of-page banner; null = no banner. */
  slot: string | null;
  /** Tag ad requests for child-directed treatment (VITE_ADSENSE_CHILD_DIRECTED=1). */
  childDirected: boolean;
}

const CLIENT_RE = /^ca-pub-\d{10,20}$/;
const SLOT_RE = /^\d{6,12}$/;

export function readAdConfig(env: Record<string, string | undefined> = import.meta.env): AdConfig | null {
  const client = env.VITE_ADSENSE_CLIENT?.trim();
  if (!client || !CLIENT_RE.test(client)) return null;
  const slot = env.VITE_ADSENSE_SLOT?.trim();
  return { client, slot: slot && SLOT_RE.test(slot) ? slot : null, childDirected: env.VITE_ADSENSE_CHILD_DIRECTED?.trim() === '1' };
}

/** Routes where a banner ad would interrupt learning. */
const AD_FREE = [/^\/level\//, /^\/tuner/, /^\/play(\/|$)/, /^\/welcome/, /^\/library\/[^/]+/, /^\/practice\/daily/, /^\/install/, /^\/privacy/];
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

/* ---------- Test ads (owner only) ---------- */

const TEST_KEY = 'stave:ad-test';
/**
 * Google's test mode shows fake ads (no earnings, no policy risk), so the owner
 * can see the between-lesson ad before Google has approved anything. Open the
 * site once with ?adtest=on to turn it on for this device, ?adtest=off to stop.
 * Read once at startup, before any redirect can drop the query string.
 */
function captureAdTestFlag(): boolean {
  try {
    const q = new URLSearchParams(location.search).get('adtest');
    if (q === 'on') localStorage.setItem(TEST_KEY, 'on');
    if (q === 'off') localStorage.removeItem(TEST_KEY);
    return localStorage.getItem(TEST_KEY) === 'on';
  } catch { return false; }
}
const testMode = captureAdTestFlag();
export const isAdTestMode = () => testMode;

/* ---------- Google's script ---------- */

/** Minimum average gap between full-screen ads (a hint; Google may space them out more). */
export const AD_BREAK_GAP = '60s';

interface AdBreakPlacement {
  type: 'start' | 'pause' | 'next' | 'browse';
  name: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adBreakDone?: (info: { breakStatus: string }) => void;
}
type AdsQueue = unknown[] & { requestNonPersonalizedAds?: number };
declare global {
  interface Window {
    adsbygoogle?: AdsQueue;
    adBreak?: (o: AdBreakPlacement) => void;
    adConfig?: (o: Record<string, unknown>) => void;
  }
}

let loaded = false;
/**
 * Loads Google's ad script once. requestNonPersonalizedAds is set BEFORE any
 * ad request, as Google's documentation requires. Also sets up adBreak() and
 * adConfig() for the H5 Games Ad Placement API (between-lesson ads), exactly as
 * Google's snippet does: both simply push onto the adsbygoogle queue.
 */
export function loadAdScript(client: string, doc: Document = document, opts: { childDirected?: boolean; test?: boolean } = {}) {
  if (loaded || doc.querySelector('script[data-stave-ads]')) { loaded = true; return; }
  const q: AdsQueue = (window.adsbygoogle = window.adsbygoogle || []);
  q.requestNonPersonalizedAds = 1;
  const push = (o: object) => { (window.adsbygoogle = window.adsbygoogle || []).push(o); };
  window.adBreak = push;
  window.adConfig = push;
  const s = doc.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  s.dataset.staveAds = '1';
  s.dataset.adClient = client;
  s.dataset.adFrequencyHint = AD_BREAK_GAP;
  if (opts.test ?? testMode) s.dataset.adbreakTest = 'on';
  if (opts.childDirected) s.dataset.tagForChildDirectedTreatment = '1';
  doc.head.appendChild(s);
  // Fetch a full-screen ad in advance so it's ready the moment a lesson ends.
  push({ preloadAdBreaks: 'on', sound: 'on' });
  loaded = true;
}

/** Ask Google to fill one <ins class="adsbygoogle"> that is now in the page. */
export function requestAd() {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}

/**
 * A natural break between lessons: Google shows a full-screen ad here if one is
 * ready and enough time has passed since the last; otherwise nothing happens.
 * Never blocks the app: if the script is blocked, the call just queues.
 */
export function showAdBreak(name: string) {
  if (!loaded || typeof window.adBreak !== 'function') return;
  try { window.adBreak({ type: 'next', name }); } catch { /* ad blocker: carry on */ }
}

/* ---------- When is "between lessons"? ---------- */

/** "/level/12" → "12"; anything else → null. */
export const levelFromPath = (path: string) => /^\/level\/(\d+)/.exec(path)?.[1] ?? null;

/**
 * Returns a function to call on every route change. It answers true when the
 * student opens a different lesson from the last one they opened this visit
 * (straight from "Continue to Level N" or via the roadmap). Opening the very
 * first lesson, or the same lesson again, is not a switch.
 */
export function makeLessonSwitchDetector() {
  let last: string | null = null;
  return (path: string) => {
    const n = levelFromPath(path);
    if (!n) return false;
    const switched = last !== null && last !== n;
    last = n;
    return switched;
  };
}

/** For tests. */
export function _resetAdsForTest() { loaded = false; }
