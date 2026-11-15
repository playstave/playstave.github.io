/**
 * Step-by-step "Add to Home Screen" instructions, per device and browser.
 * Browsers move these menu items between versions, so each guide says what to
 * do if the option isn't where we show it.
 */
import type { ArtKind } from '../components/install/StepArt';
import type { BrowserKind, DeviceKind } from '../lib/install';

export interface GuideStep { text: string; art: ArtKind; alt: string }
export interface Guide { id: string; label: string; steps: GuideStep[]; note?: string; nativeButton?: boolean }

const OPEN_ICON: GuideStep = { text: 'Find the Stave icon on your Home Screen and tap it. Stave opens full screen, like any other app.', art: 'home-screen', alt: 'A Home Screen full of app icons with the Stave icon highlighted.' };

const IOS_SAFARI = (ipad: boolean): Guide => ({
  id: 'safari', label: 'Safari',
  steps: [
    { text: 'Open Stave in Safari.', art: 'open-browser', alt: 'Safari showing the Stave website, with the address bar highlighted.' },
    ipad
      ? { text: 'Tap the Share button — the square with an arrow pointing up, at the top right.', art: 'ipad-share', alt: 'An iPad browser toolbar with the Share button highlighted at the top right.' }
      : { text: 'Tap the Share button — the square with an arrow pointing up. It’s in the toolbar at the bottom (or the top, if your address bar is at the top).', art: 'safari-share', alt: 'The bottom toolbar of Safari with the Share button highlighted.' },
    { text: 'Scroll down the list and tap “Add to Home Screen”.', art: 'share-sheet', alt: 'The share list with the “Add to Home Screen” row highlighted.' },
    { text: 'Check the name says “Stave”, then tap “Add”.', art: 'ios-add', alt: 'The Add to Home Screen screen showing the Stave icon, with the Add button highlighted.' },
    OPEN_ICON,
  ],
  note: 'Don’t see “Add to Home Screen”? Scroll further down the share list, or tap “Edit Actions” at the bottom to add it.',
});

const IOS_OTHER = (name: string, share: GuideStep): Guide => ({
  id: name.toLowerCase(), label: name,
  steps: [
    { text: `Open Stave in ${name}.`, art: 'open-browser', alt: `${name} showing the Stave website.` },
    share,
    { text: 'Scroll down and tap “Add to Home Screen”.', art: 'share-sheet', alt: 'The share list with the “Add to Home Screen” row highlighted.' },
    { text: 'Tap “Add”.', art: 'ios-add', alt: 'The Add to Home Screen screen with the Add button highlighted.' },
    OPEN_ICON,
  ],
  note: `${name} can only add to the Home Screen on iOS 16.4 or newer. If you can’t find the option, open Stave in Safari and follow the Safari steps — that always works.`,
});

const IOS_IN_APP: Guide = {
  id: 'in-app', label: 'Inside another app',
  steps: [
    { text: 'You’re viewing Stave inside another app (like Instagram or a chat app). These can’t add to the Home Screen. Tap the menu (••• or the Share button) and choose “Open in browser” or “Open in Safari”.', art: 'in-app', alt: 'An in-app browser menu with “Open in browser” highlighted.' },
    { text: 'When Stave opens in Safari, choose the Safari tab above and follow those steps.', art: 'open-browser', alt: 'Safari showing the Stave website.' },
  ],
};

const ANDROID_CHROME: Guide = {
  id: 'chrome', label: 'Chrome', nativeButton: true,
  steps: [
    { text: 'Open Stave in Chrome.', art: 'open-browser', alt: 'Chrome showing the Stave website, with the address bar highlighted.' },
    { text: 'Tap the three-dot menu (⋮) at the top right.', art: 'android-menu', alt: 'Chrome’s top bar with the three-dot menu highlighted.' },
    { text: 'Tap “Install app” or “Add to Home screen” — the name depends on your phone.', art: 'android-menu-list', alt: 'Chrome’s menu with “Install app” highlighted.' },
    { text: 'Confirm by tapping “Install” (or “Add”).', art: 'android-confirm', alt: 'A dialog asking “Install Stave?” with the Install button highlighted.' },
    { ...OPEN_ICON, text: 'Open Stave from its new icon on your Home Screen or in your app list.' },
  ],
};

const ANDROID_SAMSUNG: Guide = {
  id: 'samsung', label: 'Samsung Internet', nativeButton: true,
  steps: [
    { text: 'Open Stave in Samsung Internet.', art: 'open-browser', alt: 'Samsung Internet showing the Stave website.' },
    { text: 'Tap the menu (three lines) in the bottom toolbar.', art: 'samsung-menu', alt: 'The bottom toolbar with the menu button highlighted.' },
    { text: 'Tap “Add page to”, then “Home screen” (some versions show “Install” instead).', art: 'android-menu-list', alt: 'The menu with the install option highlighted.' },
    { text: 'Confirm by tapping “Add” or “Install”.', art: 'android-confirm', alt: 'A confirmation dialog with the Install button highlighted.' },
    { ...OPEN_ICON, text: 'Open Stave from its new icon.' },
  ],
};

const ANDROID_FIREFOX: Guide = {
  id: 'firefox', label: 'Firefox',
  steps: [
    { text: 'Open Stave in Firefox.', art: 'open-browser', alt: 'Firefox showing the Stave website.' },
    { text: 'Tap the three-dot menu (⋮).', art: 'android-menu', alt: 'The browser’s menu button highlighted.' },
    { text: 'Tap “Add to Home screen” or “Install”.', art: 'android-menu-list', alt: 'The menu with the install option highlighted.' },
    { text: 'Confirm by tapping “Add”.', art: 'android-confirm', alt: 'A confirmation dialog with the Add button highlighted.' },
    { ...OPEN_ICON, text: 'Open Stave from its new icon.' },
  ],
};

const ANDROID_IN_APP: Guide = {
  id: 'in-app', label: 'Inside another app',
  steps: [
    { text: 'You’re viewing Stave inside another app. Tap its menu (⋮ or •••) and choose “Open in Chrome” or “Open in browser”.', art: 'in-app', alt: 'An in-app browser menu with “Open in browser” highlighted.' },
    { text: 'When Stave opens in Chrome, choose the Chrome tab above and follow those steps.', art: 'open-browser', alt: 'Chrome showing the Stave website.' },
  ],
};

const DESKTOP_CHROME: Guide = {
  id: 'chrome', label: 'Chrome or Edge', nativeButton: true,
  steps: [
    { text: 'Open Stave in Google Chrome or Microsoft Edge.', art: 'open-browser', alt: 'A browser showing the Stave website.' },
    { text: 'Click the install icon at the right end of the address bar (a small screen with a down arrow).', art: 'desktop-omnibox', alt: 'A browser window with the install icon in the address bar highlighted.' },
    { text: 'No icon? Open the browser menu (⋮ or •••) and choose “Install Stave…”. In Chrome it may be under “Cast, save and share”; in Edge under “Apps”.', art: 'desktop-menu', alt: 'A browser menu with “Install Stave…” highlighted.' },
    { text: 'Click “Install”. Stave opens in its own window, and you can pin it to your taskbar or Dock.', art: 'android-confirm', alt: 'An install confirmation with the Install button highlighted.' },
  ],
};

const DESKTOP_SAFARI: Guide = {
  id: 'safari', label: 'Safari (Mac)',
  steps: [
    { text: 'Open Stave in Safari (macOS Sonoma or newer).', art: 'open-browser', alt: 'Safari showing the Stave website.' },
    { text: 'In the menu bar choose File → “Add to Dock…”, then click “Add”.', art: 'mac-dock', alt: 'Safari’s File menu with “Add to Dock…” highlighted, and the Stave icon in the Dock.' },
    { text: 'Open Stave from its icon in the Dock or Launchpad.', art: 'home-screen', alt: 'App icons with Stave highlighted.' },
  ],
  note: 'Older macOS versions don’t have “Add to Dock”. Bookmark Stave instead, or use Chrome or Edge to install it.',
};

const DESKTOP_FIREFOX: Guide = {
  id: 'firefox', label: 'Firefox',
  steps: [
    { text: 'Firefox on computers can’t install websites as apps. You can still keep Stave one click away: press Ctrl+D (or ⌘+D on a Mac) to bookmark it, or drag the address onto your desktop to make a shortcut.', art: 'desktop-omnibox', alt: 'A browser address bar.' },
    { text: 'For a real app window, open Stave in Chrome or Edge and follow the “Chrome or Edge” steps.', art: 'desktop-menu', alt: 'A browser menu with “Install Stave…” highlighted.' },
  ],
};

export function guidesFor(device: DeviceKind): Guide[] {
  switch (device) {
    case 'iphone':
    case 'ipad': {
      const share: GuideStep = device === 'ipad'
        ? { text: 'Tap the Share button (square with an up arrow) at the top right of the address bar.', art: 'ipad-share', alt: 'The toolbar with the Share button highlighted.' }
        : { text: 'Tap the Share button (square with an up arrow) in the address bar.', art: 'address-share', alt: 'The address bar with the Share button highlighted.' };
      const menuShare: GuideStep = { text: 'Tap the menu (•••) at the bottom, then “Share”.', art: 'menu-dots-bottom', alt: 'The bottom toolbar with the ••• menu highlighted.' };
      return [IOS_SAFARI(device === 'ipad'), IOS_OTHER('Chrome', share), IOS_OTHER('Edge', menuShare), IOS_OTHER('Firefox', { ...menuShare, text: 'Tap the menu (three lines), then “Share”.' }), IOS_IN_APP];
    }
    case 'android':
      return [ANDROID_CHROME, ANDROID_SAMSUNG, ANDROID_FIREFOX, ANDROID_IN_APP];
    default:
      return [DESKTOP_CHROME, DESKTOP_SAFARI, DESKTOP_FIREFOX];
  }
}

/** Which guide to open first for the detected browser. */
export function defaultGuideId(device: DeviceKind, browser: BrowserKind): string {
  if (browser === 'in-app' && device !== 'desktop') return 'in-app';
  if (device === 'iphone' || device === 'ipad') return ['chrome', 'edge', 'firefox'].includes(browser) ? browser : 'safari';
  if (device === 'android') return browser === 'samsung' ? 'samsung' : browser === 'firefox' ? 'firefox' : 'chrome';
  return browser === 'safari' ? 'safari' : browser === 'firefox' ? 'firefox' : 'chrome';
}
