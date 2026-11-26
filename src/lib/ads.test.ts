import { beforeEach, describe, expect, it } from 'vitest';
import { _resetAdsForTest, AD_BREAK_GAP, getAdConsent, isAdFreeRoute, levelFromPath, loadAdScript, makeLessonSwitchDetector, readAdConfig, setAdConsent, showAdBreak } from './ads';

describe('ads configuration', () => {
  it('is off unless a real publisher ID is set', () => {
    expect(readAdConfig({})).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-XXXXXXXX', VITE_ADSENSE_SLOT: '123' })).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_SLOT: '9876543210' })).toBeNull();
  });
  it('runs between-lesson ads with just the publisher ID; the banner also needs a valid ad unit', () => {
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-1234567890123456' })).toEqual({ client: 'ca-pub-1234567890123456', slot: null, childDirected: false });
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-1234567890123456', VITE_ADSENSE_SLOT: '123' })?.slot).toBeNull();
    expect(readAdConfig({ VITE_ADSENSE_CLIENT: 'ca-pub-1234567890123456', VITE_ADSENSE_SLOT: '9876543210', VITE_ADSENSE_CHILD_DIRECTED: '1' }))
      .toEqual({ client: 'ca-pub-1234567890123456', slot: '9876543210', childDirected: true });
  });
});

describe('between lessons', () => {
  it('reads the level from a lesson route only', () => {
    expect(levelFromPath('/level/12')).toBe('12');
    expect(levelFromPath('/level/12/extra')).toBe('12');
    expect(levelFromPath('/roadmap')).toBeNull();
    expect(levelFromPath('/library/level/3')).toBeNull();
  });
  it('counts moving on to a different lesson, not the first one or the same one again', () => {
    const isSwitch = makeLessonSwitchDetector();
    expect(isSwitch('/')).toBe(false);
    expect(isSwitch('/level/5')).toBe(false); // first lesson this visit
    expect(isSwitch('/level/5')).toBe(false); // same lesson
    expect(isSwitch('/level/6')).toBe(true); // "Continue to Level 6"
    expect(isSwitch('/roadmap')).toBe(false);
    expect(isSwitch('/level/6')).toBe(false); // back to the same lesson via the roadmap
    expect(isSwitch('/level/9')).toBe(true); // a different one via the roadmap
  });
});

describe('ad-free routes', () => {
  it('never shows ads during learning', () => {
    for (const p of ['/level/1', '/level/500', '/tuner', '/play', '/play/scale-d', '/welcome', '/library/ode-to-joy', '/practice/daily', '/install', '/privacy']) expect(isAdFreeRoute(p), p).toBe(true);
  });
  it('allows ads on browsing pages', () => {
    for (const p of ['/', '/learn', '/learn/world/2', '/roadmap', '/library', '/practice', '/progress', '/achievements', '/profile', '/settings']) expect(isAdFreeRoute(p), p).toBe(false);
  });
});

// Minimal browser stand-ins (the test runner has no DOM).
const store = new Map<string, string>();
const head: Record<string, unknown>[] = [];
const g = globalThis as Record<string, unknown>;
g.localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };
g.window = g; g.dispatchEvent = () => true;
const doc = {
  head: { appendChild: (el: Record<string, unknown>) => void head.push(el) },
  createElement: () => ({ dataset: {} as Record<string, string> }) as Record<string, unknown>,
  querySelector: () => (head.length ? head[0] : null),
} as unknown as Document;

describe('consent', () => {
  beforeEach(() => { store.clear(); head.length = 0; _resetAdsForTest(); delete (g as { adsbygoogle?: unknown }).adsbygoogle; });
  it('starts unanswered and remembers the choice', () => {
    expect(getAdConsent()).toBeNull();
    setAdConsent('yes'); expect(getAdConsent()).toBe('yes');
    setAdConsent('no'); expect(getAdConsent()).toBe('no');
    setAdConsent(null); expect(getAdConsent()).toBeNull();
  });
  it('loads Google’s script once, asking for non-personalised ads first', () => {
    loadAdScript('ca-pub-1234567890123456', doc);
    loadAdScript('ca-pub-1234567890123456', doc);
    expect(head).toHaveLength(1);
    expect(head[0].src).toBe('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456');
    expect(head[0].async).toBe(true);
    expect(window.adsbygoogle?.requestNonPersonalizedAds).toBe(1);
  });
  it('sets up Google’s ad break API, preloads an ad and hints at the gap between ads', () => {
    loadAdScript('ca-pub-1234567890123456', doc);
    const ds = head[0].dataset as Record<string, string>;
    expect(ds.adFrequencyHint).toBe(AD_BREAK_GAP);
    expect(ds.adbreakTest).toBeUndefined();
    expect(ds.tagForChildDirectedTreatment).toBeUndefined();
    expect(typeof window.adBreak).toBe('function');
    expect(typeof window.adConfig).toBe('function');
    expect([...(window.adsbygoogle ?? [])]).toEqual([{ preloadAdBreaks: 'on', sound: 'on' }]);
  });
  it('can switch on test ads and child-directed treatment', () => {
    loadAdScript('ca-pub-1234567890123456', doc, { test: true, childDirected: true });
    const ds = head[0].dataset as Record<string, string>;
    expect(ds.adbreakTest).toBe('on');
    expect(ds.tagForChildDirectedTreatment).toBe('1');
  });
  it('asks for a "next" ad break only once the script is loaded', () => {
    delete (g as { adBreak?: unknown }).adBreak;
    showAdBreak('level-6');
    expect(window.adsbygoogle).toBeUndefined();
    loadAdScript('ca-pub-1234567890123456', doc);
    showAdBreak('level-6');
    const q = [...(window.adsbygoogle ?? [])];
    expect(q[q.length - 1]).toEqual({ type: 'next', name: 'level-6' });
  });
});
