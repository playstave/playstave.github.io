/**
 * Installing Stave to the Home Screen.
 *
 * - Platform detection (pure, tested) decides which instructions to show first.
 *   iPhone browsers are not all the same: Safari, Chrome, Edge and Firefox on
 *   iOS put "Add to Home Screen" in different places, and in-app browsers
 *   (Instagram, Facebook, TikTok…) usually can't add to the Home Screen at all.
 * - The browser's own install prompt (Chrome, Edge, Samsung Internet) is
 *   captured as early as possible so the Install page can offer a real button.
 * - "Installed" is only reported when the browser says so (appinstalled event,
 *   or Stave running in standalone mode).
 */

export type DeviceKind = 'iphone' | 'ipad' | 'android' | 'desktop';
export type BrowserKind = 'safari' | 'chrome' | 'edge' | 'firefox' | 'samsung' | 'opera' | 'in-app' | 'other';

export interface Platform { device: DeviceKind; browser: BrowserKind }

/** Detect device and browser from the user agent (and touch points, for iPads that report as Macs). */
export function detectPlatform(ua: string, maxTouchPoints = 0): Platform {
  const isIPhone = /iPhone|iPod/.test(ua);
  const isIPad = /iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const device: DeviceKind = isIPhone ? 'iphone' : isIPad ? 'ipad' : isAndroid ? 'android' : 'desktop';

  let browser: BrowserKind = 'other';
  if (/FBAN|FBAV|Instagram|Line\/|TikTok|Snapchat|Twitter|LinkedInApp|MicroMessenger|GSA\//.test(ua) || (isAndroid && /; wv\)/.test(ua))) browser = 'in-app';
  else if (/EdgiOS|EdgA|Edg\//.test(ua)) browser = 'edge';
  else if (/CriOS/.test(ua)) browser = 'chrome';
  else if (/FxiOS|Firefox\//.test(ua)) browser = 'firefox';
  else if (/SamsungBrowser/.test(ua)) browser = 'samsung';
  else if (/OPR\/|OPiOS|OPT\//.test(ua)) browser = 'opera';
  else if (/Chrome\//.test(ua)) browser = 'chrome';
  else if (/Safari\//.test(ua) && /Version\//.test(ua)) browser = 'safari';
  return { device, browser };
}

/** True when Stave is running as an installed app (from the Home Screen / app icon). */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.matchMedia?.('(display-mode: minimal-ui)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Call once at start-up (main.tsx), before React renders. */
export function captureInstallPrompt() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // we show our own button on the Install page instead of a surprise banner
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    deferred = null;
    notify();
  });
}

export function installState() {
  return { canPrompt: !!deferred, installedNow: installed, standalone: isStandalone() };
}

export function onInstallChange(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** Show the browser's own install dialog. Resolves with what the student chose. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable';
  const e = deferred;
  deferred = null; // a prompt can only be used once
  notify();
  await e.prompt();
  const { outcome } = await e.userChoice;
  return outcome;
}

/** Register the service worker (production builds only, secure pages only). */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator) || !window.isSecureContext) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => { /* the app works without it */ });
  });
}
