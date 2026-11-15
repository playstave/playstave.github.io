import { describe, expect, it } from 'vitest';
import { detectPlatform } from './install';

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.54 Mobile/15E148 Safari/604.1',
  iphoneFirefox: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15',
  iphoneEdge: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 EdgiOS/126.2592.56 Mobile/15E148 Safari/605.1.15',
  iphoneInstagram: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 337.0.3.23.54 (iPhone14,5; iOS 17_5; en_US)',
  ipadDesktopMode: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.71 Mobile Safari/537.36',
  androidSamsung: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  androidWebView: 'Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.71 Mobile Safari/537.36',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  winEdge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.56',
  winFirefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
};

describe('detectPlatform', () => {
  it.each([
    ['iphoneSafari', 0, 'iphone', 'safari'],
    ['iphoneChrome', 5, 'iphone', 'chrome'],
    ['iphoneFirefox', 5, 'iphone', 'firefox'],
    ['iphoneEdge', 5, 'iphone', 'edge'],
    ['iphoneInstagram', 5, 'iphone', 'in-app'],
    ['ipadDesktopMode', 5, 'ipad', 'safari'],
    ['ipadDesktopMode', 0, 'desktop', 'safari'], // a real Mac (no touch)
    ['androidChrome', 5, 'android', 'chrome'],
    ['androidSamsung', 5, 'android', 'samsung'],
    ['androidWebView', 5, 'android', 'in-app'],
    ['macChrome', 0, 'desktop', 'chrome'],
    ['winEdge', 0, 'desktop', 'edge'],
    ['winFirefox', 0, 'desktop', 'firefox'],
  ] as const)('%s (touch %i) → %s / %s', (key, touch, device, browser) => {
    expect(detectPlatform(UA[key], touch)).toEqual({ device, browser });
  });
});

import { afterEach, vi } from 'vitest';
import { isStandalone } from './install';

describe('isStandalone', () => {
  afterEach(() => vi.unstubAllGlobals());
  const stub = (standaloneMedia: boolean, iosStandalone?: boolean) => {
    vi.stubGlobal('window', { matchMedia: (q: string) => ({ matches: standaloneMedia && q.includes('standalone') }) });
    vi.stubGlobal('navigator', { standalone: iosStandalone });
  };
  it('is true when opened from an installed icon (display-mode: standalone)', () => { stub(true); expect(isStandalone()).toBe(true); });
  it('is true on iOS Home Screen apps (navigator.standalone)', () => { stub(false, true); expect(isStandalone()).toBe(true); });
  it('is false in a normal browser tab', () => { stub(false, false); expect(isStandalone()).toBe(false); });
});
